import type { ChatConfig, QuickAction } from '@/types'

export const CHAT_CONFIG: ChatConfig = {
  assistantName: 'Culinova Assistant',
  assistantRole: 'ENGINEERING ADVISOR',
  welcomeTitle: 'Professional Kitchen & Laundry',
  welcomeDescription:
    'Engineering solutions across Saudi Arabia. Ask about services, projects, or book a consultation.',
  startButtonLabel: 'Start Conversation',
  initialMessage:
    'Hello! I am your Culinova Assistant. How may I help you with kitchen or laundry engineering today?',
  inputPlaceholder: 'Write your message...',
  footerText: 'Powered by Culinova · Assistant available 24/7',
  privacyLabel: 'Private',
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'services',
    label: 'Explore Our Services',
    emoji: '🏗️',
    prompt: 'What services does Culinova offer?',
  },
  {
    id: 'process',
    label: 'How We Deliver Projects',
    emoji: '📋',
    prompt: 'How does your project delivery process work?',
  },
  {
    id: 'consultation',
    label: 'Book a Consultation',
    emoji: '📞',
    prompt: 'How can I book a consultation or contact your team?',
  },
]
