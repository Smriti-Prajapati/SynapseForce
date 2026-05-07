import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

function ChatWindow({ otherId, otherName, currentUserId, onNewMessage }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef()
  const inputRef = useRef()

  const myId = Number(currentUserId)

  const loadMessages = () => {
    api.get(`/messages/conversation/${otherId}`)
      .then(res => {
        setMessages(res.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('messages fetch failed:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    setMessages([])
    setLoading(true)
    loadMessages()
    const interval = setInterval(loadMessages, 4000)
    return () => clearInterval(interval)
  }, [otherId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    try {
      const { data } = await api.post(`/messages/send/${otherId}`, { content })
      setMessages(prev => [...prev, data])
      onNewMessage?.()
    } catch (err) {
      setText(content) // restore on failure
      console.error(err)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  // Group by date
  const grouped = messages.reduce((acc, msg) => {
    const d = formatDate(msg.sentAt)
    if (!acc[d]) acc[d] = []
    acc[d].push(msg)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold">
            {otherName?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{otherName}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </p>
          </div>
        </div>
        <button onClick={loadMessages} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/50 dark:bg-gray-950/30">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <MessageSquare size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium px-2 bg-gray-50 dark:bg-gray-950 rounded-full border border-gray-200 dark:border-gray-800">
                  {date}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>

              {msgs.map((msg, i) => {
                const isMe = Number(msg.senderId) === myId
                const showName = !isMe && (i === 0 || Number(msgs[i-1]?.senderId) !== Number(msg.senderId))
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1.5`}>
                    <div className={`max-w-[70%]`}>
                      {showName && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-sm ml-auto'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700 shadow-sm'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-gray-400 dark:text-gray-500'}`}>
                          {formatTime(msg.sentAt)}
                          {isMe && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            className="input flex-1 rounded-full px-4"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  )
}

// HR Inbox
function AdminMessages({ currentUserId }) {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const loadConversations = () => {
    api.get('/messages/conversations')
      .then(res => {
        setConversations(res.data || [])
        setFetchError(null)
        setLoadingConvs(false)
      })
      .catch(err => {
        const status = err.response?.status
        if (status === 401) {
          setFetchError('Session expired — please log out and log back in.')
        } else {
          setFetchError(`Failed to load messages (${status || 'network error'})`)
        }
        setLoadingConvs(false)
      })
  }

  useEffect(() => {
    loadConversations()
    const interval = setInterval(loadConversations, 4000)
    return () => clearInterval(interval)
  }, [])

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selected) {
      setSelected(conversations[0])
    }
  }, [conversations])

  return (
    <div className="card p-0 overflow-hidden flex" style={{ height: 'calc(100vh - 11rem)' }}>
      {/* Left sidebar — conversation list */}
      <div className="w-72 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Inbox</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fetchError ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-red-500 dark:text-red-400">{fetchError}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No messages yet</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">Employees will appear here when they message you</p>
            </div>
          ) : (
            conversations.map(c => (
              <button
                key={c.userId}
                onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left border-b border-gray-50 dark:border-gray-800/50 ${
                  selected?.userId === c.userId
                    ? 'bg-brand-50 dark:bg-brand-600/10 border-l-2 border-l-brand-500'
                    : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-semibold">
                    {c.fullName.charAt(0)}
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${c.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                    {c.fullName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right — chat window */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <ChatWindow
            otherId={selected.userId}
            otherName={selected.fullName}
            currentUserId={currentUserId}
            onNewMessage={loadConversations}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose an employee from the left to view and reply to their messages."
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Employee — chat with HR
function EmployeeMessages({ currentUserId }) {
  const [admin, setAdmin] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get('/messages/admin')
      .then(res => setAdmin(res.data))
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <div className="card text-center py-12">
      <p className="text-sm text-red-500">Could not connect to HR. Please try again later.</p>
    </div>
  )

  if (!admin) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 11rem)' }}>
      <ChatWindow otherId={admin.id} otherName={`${admin.fullName} (HR)`} currentUserId={currentUserId} />
    </div>
  )
}

export default function Messages() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {isAdmin ? 'Employee Messages' : 'Message HR'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {isAdmin
            ? 'View and reply to employee messages'
            : 'Send a message to HR — they will respond here'}
        </p>
      </div>

      {isAdmin
        ? <AdminMessages currentUserId={user.userId} />
        : <EmployeeMessages currentUserId={user.userId} />
      }
    </div>
  )
}
