import { useEffect, useState } from 'react'
import { Shield, Users, Briefcase, TrendingUp, Activity, Brain, Star, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function HRProfile() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/projects'),
      api.get('/users'),
    ])
      .then(([ov, proj, emp]) => {
        setOverview(ov.data)
        setProjects(proj.data)
        setEmployees(emp.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
  const overdueProjects = projects.filter(p => p.overdue).length
  const availableEmployees = employees.filter(e => e.availability === 'AVAILABLE').length

  return (
    <div className="space-y-6">

      {/* Profile header */}
      <div className="card">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-2xl font-bold shrink-0">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</h2>
              <span className="badge bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <Shield size={10} /> HR Admin
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Managing {employees.length} employees across {projects.length} projects
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{employees.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Employees</p>
            </div>
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{projects.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Projects</p>
            </div>
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedProjects}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Completed</p>
            </div>
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <p className={`text-2xl font-bold ${overdueProjects > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {overdueProjects}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Workforce overview */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Workforce Overview</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Available', value: availableEmployees, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' },
                { label: 'Busy', value: employees.filter(e => e.availability === 'BUSY').length, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' },
                { label: 'On Leave', value: employees.filter(e => e.availability === 'ON_LEAVE').length, color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl border p-3 text-center ${color}`}>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs mt-0.5 opacity-80">{label}</p>
                </div>
              ))}
            </div>

            {/* Top performers */}
            {employees.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Top Performers</p>
                <div className="space-y-2">
                  {[...employees]
                    .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
                    .slice(0, 4)
                    .map((emp, i) => (
                      <div key={emp.id} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0">
                          {emp.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{emp.fullName}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${
                              (emp.performanceScore ?? 0) >= 70 ? 'bg-green-500' :
                              (emp.performanceScore ?? 0) >= 40 ? 'bg-brand-500' : 'bg-amber-500'
                            }`} style={{ width: `${emp.performanceScore ?? 0}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-6 text-right">
                            {emp.performanceScore ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Skill gap alert */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Skill Gap Summary</h3>
            </div>
            {overview?.missingSkills?.length > 0 ? (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Skills needed by active projects but not covered by your team:
                </p>
                <div className="flex flex-wrap gap-2">
                  {overview.missingSkills.map(s => (
                    <span key={s} className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle size={10} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={14} />
                <p className="text-sm font-medium">No skill gaps — team is well-covered</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Project status breakdown */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Project Status</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Open', value: projects.filter(p => p.status === 'OPEN').length, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800' },
                { label: 'In Progress', value: activeProjects, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' },
                { label: 'Completed', value: completedProjects, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl border p-3 text-center ${color}`}>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs mt-0.5 opacity-80">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent projects */}
            <div className="space-y-2">
              {projects.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                      {p.overdue && (
                        <span className="badge bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-[10px] shrink-0">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div className={`h-1 rounded-full ${
                          p.progressPercent === 100 ? 'bg-green-500' :
                          p.progressPercent >= 50 ? 'bg-brand-500' : 'bg-amber-500'
                        }`} style={{ width: `${p.progressPercent}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{p.progressPercent}%</span>
                    </div>
                  </div>
                  <span className={`badge shrink-0 text-[10px] ${
                    p.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    p.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>{p.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            </div>
            {overview?.recentActivity?.length > 0 ? (
              <div className="space-y-3">
                {overview.recentActivity.slice(0, 6).map(a => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-[10px] font-semibold shrink-0 mt-0.5">
                      {a.actorName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{a.action}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(a.occurredAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
