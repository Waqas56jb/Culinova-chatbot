import { useCallback, useEffect, useRef, useState } from 'react'
import { createVoiceSession } from '@/services/voiceApi'

export type VoiceTranscriptEntry = {
  role: 'user' | 'assistant'
  content: string
}

type ChatVoiceOverlayProps = {
  onClose: (transcript: VoiceTranscriptEntry[]) => void
}

type VoiceState = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'denied' | 'error'

const STATUS_TEXT: Record<VoiceState, string> = {
  connecting: 'Connecting',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  muted: 'Microphone muted',
  denied: 'Microphone access needed',
  error: 'Connection issue',
}

const HINT_TEXT: Record<VoiceState, string> = {
  connecting: 'Setting up a secure voice line.',
  listening: 'Speak naturally, in any language.',
  thinking: 'Preparing your answer.',
  speaking: 'You can interrupt anytime, just start talking.',
  muted: 'Unmute to continue the conversation.',
  denied: 'Allow microphone access in your browser, then tap retry.',
  error: 'Tap retry to reconnect.',
}

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof AudioContext !== 'undefined') return AudioContext
  const legacy = (window as unknown as { webkitAudioContext?: typeof AudioContext })
    .webkitAudioContext
  return legacy ?? null
}

export function ChatVoiceOverlay({ onClose }: ChatVoiceOverlayProps) {
  const [state, setState] = useState<VoiceState>('connecting')
  const [caption, setCaption] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [attempt, setAttempt] = useState(0)

  const stageRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef(0)
  const transcriptRef = useRef<VoiceTranscriptEntry[]>([])
  const stateRef = useRef(state)
  stateRef.current = state

  const endSession = useCallback(() => {
    onClose(transcriptRef.current)
  }, [onClose])

  const setVisualLevel = useCallback((level: number) => {
    stageRef.current?.style.setProperty('--voice-level', level.toFixed(3))
  }, [])

  /** iOS/Safari unlock: resume audio output on any tap inside the overlay. */
  const unlockAudio = useCallback(() => {
    audioCtxRef.current?.resume().catch(() => undefined)
    audioRef.current?.play().catch(() => undefined)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fail = (detail: string, denied = false) => {
      if (cancelled) return
      setErrorDetail(detail)
      setState(denied ? 'denied' : 'error')
    }

    function pushTranscript(role: VoiceTranscriptEntry['role'], content: string) {
      const text = content.trim()
      if (!text) return
      transcriptRef.current = [...transcriptRef.current, { role, content: text }]
    }

    function handleRealtimeEvent(event: { type?: string; delta?: string; transcript?: string }) {
      switch (event.type) {
        case 'input_audio_buffer.speech_started':
          if (stateRef.current !== 'muted') setState('listening')
          setCaption('')
          break
        case 'input_audio_buffer.speech_stopped':
        case 'response.created':
          if (stateRef.current !== 'muted') setState('thinking')
          break
        case 'output_audio_buffer.started':
          if (stateRef.current !== 'muted') setState('speaking')
          break
        case 'response.output_audio_transcript.delta':
        case 'response.audio_transcript.delta':
          if (event.delta) setCaption((prev) => (prev + event.delta).slice(-220))
          break
        // Caller's speech, transcribed
        case 'conversation.item.input_audio_transcription.completed':
        case 'conversation.item.audio_transcription.completed':
          if (event.transcript) pushTranscript('user', event.transcript)
          break
        // Assistant's full spoken reply
        case 'response.output_audio_transcript.done':
        case 'response.audio_transcript.done':
          if (event.transcript) pushTranscript('assistant', event.transcript)
          break
        case 'output_audio_buffer.stopped':
        case 'response.done':
          if (stateRef.current === 'speaking' || stateRef.current === 'thinking') {
            setState('listening')
          }
          break
        default:
          break
      }
    }

    function attachAnalysers(micStream: MediaStream, remoteStream: MediaStream | undefined) {
      const Ctor = getAudioContextCtor()
      if (!Ctor) return

      const ctx = new Ctor()
      audioCtxRef.current = ctx
      ctx.resume().catch(() => undefined)

      const makeAnalyser = (stream: MediaStream) => {
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.7
        ctx.createMediaStreamSource(stream).connect(analyser)
        return analyser
      }

      const micAnalyser = makeAnalyser(micStream)
      const remoteAnalyser = remoteStream ? makeAnalyser(remoteStream) : null
      const data = new Uint8Array(micAnalyser.fftSize)
      let smooth = 0

      const rms = (analyser: AnalyserNode) => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        return Math.sqrt(sum / data.length)
      }

      const tick = () => {
        const current = stateRef.current
        let level = 0

        if (current === 'speaking' && remoteAnalyser) {
          level = Math.min(1, rms(remoteAnalyser) * 4.5)
        } else if (current === 'listening') {
          level = Math.min(1, rms(micAnalyser) * 4.5)
        }

        smooth += (level - smooth) * (level > smooth ? 0.4 : 0.06)
        setVisualLevel(smooth)
        rafRef.current = requestAnimationFrame(tick)
      }

      tick()
    }

    async function start() {
      setState('connecting')
      setCaption('')
      setErrorDetail('')

      if (!navigator.mediaDevices?.getUserMedia) {
        fail(
          window.isSecureContext
            ? 'This browser does not support microphone access.'
            : 'Microphone needs a secure connection (HTTPS). Open this page over HTTPS.',
        )
        return
      }

      if (typeof RTCPeerConnection === 'undefined') {
        fail('This browser does not support real-time calls (WebRTC).')
        return
      }

      let micStream: MediaStream
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch (error) {
        const name = error instanceof DOMException ? error.name : ''
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          fail('Microphone permission was blocked.', true)
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          fail('No microphone was found on this device.', true)
        } else {
          fail('Could not access the microphone.')
        }
        return
      }

      if (cancelled) {
        micStream.getTracks().forEach((track) => track.stop())
        return
      }
      micStreamRef.current = micStream

      let grant: Awaited<ReturnType<typeof createVoiceSession>>
      try {
        grant = await createVoiceSession()
      } catch {
        fail('Could not reach the Culinova voice server. Check that the backend is running.')
        return
      }
      if (cancelled) return

      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        })
        pcRef.current = pc

        pc.ontrack = (event) => {
          const [remoteStream] = event.streams
          if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream
            audioRef.current.play().catch(() => undefined)
          }
          attachAnalysers(micStream, remoteStream)
        }

        pc.addTrack(micStream.getAudioTracks()[0], micStream)

        const channel = pc.createDataChannel('oai-events')
        channel.onmessage = (event) => {
          try {
            handleRealtimeEvent(
              JSON.parse(event.data) as { type?: string; delta?: string; transcript?: string },
            )
          } catch {
            /* ignore malformed events */
          }
        }

        // Agent speaks first so the caller knows the line is live
        channel.onopen = () => {
          if (cancelled) return
          channel.send(
            JSON.stringify({
              type: 'response.create',
              response: {
                instructions:
                  'Greet the caller now in one short, warm sentence: introduce yourself as the Culinova assistant and ask how you can help with their kitchen or laundry project. Use English unless the caller has already spoken another language.',
              },
            }),
          )
        }

        pc.onconnectionstatechange = () => {
          if (cancelled) return
          if (pc.connectionState === 'failed') {
            fail('The voice connection dropped. Check your internet and retry.')
          }
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const sdpResponse = await fetch(
          `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(grant.model)}`,
          {
            method: 'POST',
            body: offer.sdp,
            headers: {
              Authorization: `Bearer ${grant.clientSecret}`,
              'Content-Type': 'application/sdp',
            },
          },
        )

        if (!sdpResponse.ok) {
          fail(`Voice service refused the call (status ${sdpResponse.status}).`)
          return
        }

        const answer = { type: 'answer' as const, sdp: await sdpResponse.text() }
        await pc.setRemoteDescription(answer)

        if (!cancelled) setState('listening')
      } catch {
        fail('Could not establish the voice call. Check your internet and retry.')
      }
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      pcRef.current?.close()
      pcRef.current = null
      micStreamRef.current?.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
      audioCtxRef.current?.close().catch(() => undefined)
      audioCtxRef.current = null
    }
  }, [attempt, setVisualLevel])

  const isMuted = state === 'muted'
  const canRetry = state === 'denied' || state === 'error'

  const toggleMute = () => {
    const stream = micStreamRef.current
    if (!stream) return
    const nextMuted = !isMuted
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setState(nextMuted ? 'muted' : 'listening')
  }

  const orbState =
    state === 'speaking' ? 'speaking' : state === 'thinking' ? 'connecting' : state

  return (
    // Tap-anywhere audio unlock for iOS/Safari autoplay policies
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div className="chat-voice" role="dialog" aria-label="Voice assistant" onClick={unlockAudio}>
      <audio ref={audioRef} autoPlay hidden />

      <header className="chat-voice__top">
        <span className="chat-voice__badge">Culinova Voice</span>
      </header>

      <div className="chat-voice__stage" ref={stageRef}>
        <div className="chat-voice__glow" aria-hidden="true" />

        <div className={`voice-orb voice-orb--${orbState}`}>
          <span className="voice-orb__ring" aria-hidden="true" />
          <span className="voice-orb__ripple" aria-hidden="true" />
          <span className="voice-orb__ripple voice-orb__ripple--late" aria-hidden="true" />
          <span className="voice-orb__core" aria-hidden="true" />
          <span className="voice-orb__sheen" aria-hidden="true" />
        </div>

        <div className="chat-voice__caption">
          <p className="chat-voice__status">
            {STATUS_TEXT[state]}
            {(state === 'connecting' || state === 'listening' || state === 'thinking') && (
              <span className="chat-voice__dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            )}
          </p>
          <p className="chat-voice__hint">{caption || errorDetail || HINT_TEXT[state]}</p>
        </div>

        {canRetry && (
          <button
            type="button"
            className="chat-voice__retry"
            onClick={() => setAttempt((prev) => prev + 1)}
          >
            Retry
          </button>
        )}
      </div>

      <div className="chat-voice__controls">
        <button
          type="button"
          className={`chat-voice__btn${isMuted ? ' chat-voice__btn--muted' : ''}`}
          onClick={toggleMute}
          disabled={state === 'denied' || state === 'connecting' || state === 'error'}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={isMuted}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 15.5a3.25 3.25 0 0 0 3.25-3.25v-6a3.25 3.25 0 0 0-6.5 0v6A3.25 3.25 0 0 0 12 15.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 11.5a6.5 6.5 0 0 1-13 0M12 18v3M9.25 21h5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {isMuted && (
              <path
                d="M4.5 4.5l15 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>

        <button
          type="button"
          className="chat-voice__btn chat-voice__btn--end"
          onClick={endSession}
          aria-label="End voice session"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
