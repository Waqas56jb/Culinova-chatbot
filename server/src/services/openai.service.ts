import { OpenAI } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { env } from '../config/env.js'
import { buildChatSystemPrompt } from '../prompts/system.prompt.js'
import type { ChatMessageInput } from '../types/chat.js'

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

const SYSTEM_PROMPT = buildChatSystemPrompt()

function toOpenAiMessages(messages: ChatMessageInput[]): ChatCompletionMessageParam[] {
  const history = messages.slice(-20).map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }))

  return [{ role: 'system', content: SYSTEM_PROMPT }, ...history]
}

export async function generateAssistantReply(messages: ChatMessageInput[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: toOpenAiMessages(messages),
    temperature: env.OPENAI_TEMPERATURE,
    max_tokens: env.OPENAI_MAX_TOKENS,
    presence_penalty: 0.1,
    frequency_penalty: 0.2,
  })

  const content = completion.choices[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('OpenAI returned an empty response')
  }

  return content
}

export async function* streamAssistantReply(
  messages: ChatMessageInput[],
): AsyncGenerator<string, void, undefined> {
  const stream = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: toOpenAiMessages(messages),
    temperature: env.OPENAI_TEMPERATURE,
    max_tokens: env.OPENAI_MAX_TOKENS,
    presence_penalty: 0.1,
    frequency_penalty: 0.2,
    stream: true,
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
