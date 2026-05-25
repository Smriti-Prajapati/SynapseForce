import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell, LogOut, Search, Sun, Moon, Check, X, Users, Briefcase, Brain } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

// ─── Global Search ────────────────────────────────────────────────────────────
function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults(null); setOpen(false); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const q = query.toLowerCase()
        const [usersRes, projectsRes] = await Promise.all([
          isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
          api.get('/projects'),
        ])

        const matchedEmployees = usersRes.data
          .filter(u =>
            u.fullName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.topSkills?.some(s => s.toLowerCase().includes(q))
          )
          .slice(0, 4)

        const matchedProjects = projectsRes.data
          .filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.requiredSkills?.toLowerCase().includes(q)
          )
          .slice(0, 4)

        setResults({ employees: matchedEmployees, projects: matchedProjects })
        setOpen(true)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, isAdmin])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (path) => {
    setQuery('')
    setOpen(false)
    navigate(path)
  }

  const total = (results?.employees?.length ?? 0) + (results?.projects?.length ?? 0)

  return (
    <div className="relative hidden md:block" ref={wrapRef}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        placeholder="Search employees, projects, skills..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
        className="pl-8 pr-8 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-56 transition-all focus:w-72"
      />
      {query && (
        <button onClick={() => { setQuery(''); setOpen(false) }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={13} />
        </button>
      )}

      {/* Results dropdown */}
      {open && (
        <div className="absolute top-10 left-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Searching...</span>
            </div>
          ) : total === 0 ? (
            <div className="py-8 text-center">
              <Search size={20} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No results for "{query}"</p>
            </div>
          ) : (
            <div className="py-1">
              {/* Employees */}
              {results.employees.length > 0 && (
                <>
                  <div className="px-3 py-1.5 flex items-center gap-1.5">
                    <Users size={11} className="text-gray-400" />
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Employees</span>
                  </div>
                  {results.employees.map(e => (
                    <button key={e.id} onClick={() => handleSelect('/employees')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0">
                        {e.fullName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{e.fullName}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{e.email}</p>
                      </div>
                      <span className={`badge shrink-0 text-[10px] ${
                        e.availability === 'AVAILABLE' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        e.availability === 'BUSY' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>{e.availability?.replace('_', ' ') ?? 'AVAILABLE'}</span>
                    </button>
                  ))}
                </>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <>
                  {results.employees.length > 0 && <div className="border-t border-gray-100 dark:border-gray-800 my-1" />}
                  <div className="px-3 py-1.5 flex items-center gap-1.5">
                    <Briefcase size={11} className="text-gray-400" />
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Projects</span>
                  </div>
                  {results.projects.map(p => (
                    <button key={p.id} onClick={() => handleSelect('/projects')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center shrink-0">
                        <Briefcase size={13} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{p.requiredSkills}</p>
                      </div>
                      <span className={`badge shrink-0 text-[10px] ${
                        p.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        p.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>{p.status?.replace('_', ' ')}</span>
                    </button>
                  ))}
                </>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2">
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{total} result{total !== 1 ? 's' : ''} for "{query}"</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Notification Dropdown ────────────────────────────────────────────────────
function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (e) { console.error(e) }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e) { console.error(e) }
  }

  const timeAgo = (iso) => {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px]">
              {notifications.filter(n => !n.read).length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button onClick={e => { e.stopPropagation(); markAllRead() }}
              className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              <Check size={11} /> All read
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onClose() }}
            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400 dark:text-gray-500">No notifications yet</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">You'll be notified when assigned to projects or tasks</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={e => { e.stopPropagation(); if (!n.read) markRead(n.id) }}
              className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800/60 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                !n.read ? 'bg-brand-50/60 dark:bg-brand-900/10' : ''
              }`}>
              <div className="flex items-start gap-2.5">
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
                <div className={!n.read ? '' : 'ml-4'}>
                  <p className={`text-xs leading-relaxed ${!n.read ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
export default function Topbar({ title }) {
  const { logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const bellRef = useRef()

  useEffect(() => {
    const fetchCount = () => {
      api.get('/notifications/unread-count')
        .then(res => setUnreadCount(res.data?.count ?? 0))
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h1>

      <div className="flex items-center gap-1.5">
        <GlobalSearch />

        <button onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button type="button"
            onClick={e => { e.stopPropagation(); setShowNotifs(v => !v) }}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1">
          <LogOut size={15} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
