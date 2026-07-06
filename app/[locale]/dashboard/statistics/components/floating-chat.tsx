'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageSquare, X, Send, Loader2, AlertCircle } from 'lucide-react'
import { useCurrentLocale } from '@/locales/client'
import { useUserStore } from '@/store/user-store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function getMessageContent(msg: { content?: string; parts?: { type: string; text?: string }[] }): string {
  if (msg.content) return msg.content
  if (msg.parts) {
    const text = msg.parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
    if (text) return text
  }
  return ''
}

export function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const locale = useCurrentLocale()
  const user = useUserStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: () => ({
        username: user?.username ?? '',
        locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    }),
    onFinish: () => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    },
  })

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 200)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || status === 'streaming') return
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
    setInput('')
  }

  const isBusy = status === 'streaming' || status === 'submitted'

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open AI Chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[90vw] max-w-[570px] flex-col rounded-xl border bg-card shadow-2xl" style={{ height: 'min(80vh, 780px)' }}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Mentor Chat</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !error && (
          <p className="text-sm text-muted-foreground text-center pt-8">
            Ask me anything about your trading performance — I can analyze your trades, patterns, and help you improve.
          </p>
        )}
        {messages.map((m) => {
          const content = getMessageContent(m as { content?: string; parts?: { type: string; text?: string }[] })
          if (!content) return null
          const isUser = m.role === 'user'
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground/90'
                }`}
              >
                {isUser ? (
                  content
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_p]:leading-relaxed [&_strong]:text-foreground [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:my-1 [&_ul]:pl-4 [&_li]:my-0.5 [&_code]:bg-muted-foreground/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_hr]:border-muted-foreground/20 [&_hr]:my-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {isBusy && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-muted px-3.5 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Chat error</span>
              <p className="mt-0.5 text-destructive/80">
                {(error instanceof Error ? error.message : typeof error === 'object' && error !== null
                  ? (error as Record<string, unknown>).message as string ?? ''
                  : '') || 'Connection issue. Please try your question again.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your trading..."
          className="flex-1 rounded-lg bg-muted px-3.5 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
          disabled={isBusy}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
