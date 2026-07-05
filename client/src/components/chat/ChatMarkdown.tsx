import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

type ChatMarkdownProps = {
  content: string
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  const components: Components = {
    p: ({ children }) => <p className="chat-md__p">{children}</p>,
    strong: ({ children }) => <strong className="chat-md__strong">{children}</strong>,
    em: ({ children }) => <em className="chat-md__em">{children}</em>,
    a: ({ href, children }) => (
      <a className="chat-md__link" href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="chat-md__ul">{children}</ul>,
    ol: ({ children }) => <ol className="chat-md__ol">{children}</ol>,
    li: ({ children }) => <li className="chat-md__li">{children}</li>,
    h3: ({ children }) => <h3 className="chat-md__title">{children}</h3>,
    h4: ({ children }) => <h4 className="chat-md__subtitle">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="chat-md__quote">{children}</blockquote>,
    code: ({ children }) => <code className="chat-md__code">{children}</code>,
    hr: () => null,
  }

  return (
    <div className="chat-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
