import { CHAT_CONFIG } from '@/constants/chatConfig'

export function ChatFooter() {
  return <footer className="chat-footer">{CHAT_CONFIG.footerText}</footer>
}
