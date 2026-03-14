import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { streamChat } from '../hooks/useOllama'
import { EmptyModelState } from './EmptyModelState'
import type { ChatMessage } from '../hooks/useOllama'

export function ChatView() {
  const { activeModel, setView } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!activeModel) {
    return <EmptyModelState onNavigateToModels={() => setView('models')} />
  }

  const handleSubmit = async () => {
    if (!input.trim() || streaming) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setError(null)
    setStreaming(true)

    // Add placeholder assistant message
    const assistantIndex = updatedMessages.length
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      await streamChat(activeModel, updatedMessages, (chunk) => {
        setMessages(prev => {
          const next = [...prev]
          next[assistantIndex] = {
            role: 'assistant',
            content: next[assistantIndex].content + chunk,
          }
          return next
        })
      })
    } catch {
      setError('Response interrupted — model may have unloaded. Try again.')
      setMessages(prev => prev.slice(0, -1)) // remove empty assistant message
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-600 text-sm mt-12">
            Start a conversation with {activeModel}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">
                AI
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-gray-800 dark:text-gray-200 rounded-br-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-sm'
              }`}
            >
              {msg.content}
              {msg.role === 'assistant' && streaming && i === messages.length - 1 && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="mx-auto max-w-md p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex gap-2 items-center bg-white dark:bg-gray-950">
        <button
          onClick={() => { setMessages([]); setError(null) }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          New chat
        </button>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
          }}
          placeholder={`Message ${activeModel}...`}
          rows={1}
          disabled={streaming}
          className="flex-1 resize-none bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || streaming}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
