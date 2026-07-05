import { useState } from 'react'
import { ChatConversation } from '@/components/chat/ChatConversation'
import { ChatFooter } from '@/components/chat/ChatFooter'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatShell } from '@/components/chat/ChatShell'
import { ChatVoiceOverlay } from '@/components/chat/ChatVoiceOverlay'
import { ChatWelcome } from '@/components/chat/ChatWelcome'
import { useChat } from '@/hooks/useChat'

export function ChatWidget() {
  const [voiceOpen, setVoiceOpen] = useState(false)
  const {
    phase,
    messages,
    isTyping,
    inputValue,
    setInputValue,
    startConversation,
    resetChat,
    sendMessage,
    sendQuickAction,
    importVoiceTranscript,
  } = useChat()

  return (
    <ChatShell>
      <div className="chat-widget">
        <ChatHeader onClose={resetChat} />

        <div className="chat-widget__body">
          {phase === 'welcome' ? (
            <div className="chat-welcome-screen">
              <ChatWelcome onStart={startConversation} />
              <ChatFooter />
            </div>
          ) : (
            <ChatConversation
              messages={messages}
              isTyping={isTyping}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={sendMessage}
              onQuickAction={sendQuickAction}
              onVoiceStart={() => setVoiceOpen(true)}
            />
          )}
        </div>

        {voiceOpen && (
          <ChatVoiceOverlay
            onClose={(transcript) => {
              setVoiceOpen(false)
              importVoiceTranscript(transcript)
            }}
          />
        )}
      </div>
    </ChatShell>
  )
}
