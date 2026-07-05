import { ChatConversation } from '@/components/chat/ChatConversation'
import { ChatFooter } from '@/components/chat/ChatFooter'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatShell } from '@/components/chat/ChatShell'
import { ChatWelcome } from '@/components/chat/ChatWelcome'
import { useChat } from '@/hooks/useChat'

export function ChatWidget() {
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
            />
          )}
        </div>
      </div>
    </ChatShell>
  )
}
