/** True when the chat app is loaded inside the site embed iframe (`?embed=1`). */
export function isEmbedMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('embed') === '1'
}

/** Ask the parent embed script to close the floating panel. */
export function requestEmbedClose(): void {
  if (typeof window === 'undefined' || window.parent === window) return
  window.parent.postMessage({ type: 'culinova-chat:close' }, '*')
}
