import { useEffect, useState } from 'react'
import { Users, FileText, Brain, Briefcase, TrendingUp, Clock, AlertTriangle, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import StatCard from '../components/ui/StatCard'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function AdminDashboard({ overview }) {
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    api.get('/projects').then(res => setRecentProjects(res.data.slice(0, 4))).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={overview?.totalEmployees ?? 0} icon={Users} color="indigo" />
        <StatCard label="Active Projects" value={overview?.activeProjects ?? 0} icon={Clock} color="blue" />
        <StatCard label="Skills Detected" value={overview?.totalSkills ?? 0} icon={Brain} color="purple" />
        <StatCard label="Overdue Projects" value={overview?.overdueProjects ?? 0} icon={AlertTriangle} color="green"
          trend={overview?.overdueProjects > 0 ? 'Needs attention' : 'All on track'} />
      </div>

      {overview?.insight && (
        <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl px-5 py-4 flex items-start gap-3">
          <TrendingUp size={16} className="text-brand-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Team Insight</p>
            <p className="text-sm text-brand-600 dark:text-brand-400 mt-0.5">{overview.insight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Projects</h3>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No projects yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentProjects.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                      {p.overdue && <span className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] shrink-0">Overdue</span>}
                    </div>
                    <span className={`badge shrink-0 text-[10px] ${
                      p.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      p.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>{p.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div className={`h-1 rounded-full ${p.progressPercent === 100 ? 'bg-green-500' : p.progressPercent >= 50 ? 'bg-brand-500' : 'bg-amber-500'}`}
                        style={{ width: `${p.progressPercent}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{p.progressPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </div>
          {overview?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {overview.recentActivity.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-[10px] font-semibold shrink-0 mt-0.5">
                    {a.actorName.charAt(0)}
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

      {/* Skill gap alert */}
      {overview?.missingSkills?.length > 0 && (
        <div className="card border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Skill Gap Detected</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 mb-2">
                These skills are needed by active projects but missing from your team:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {overview.missingSkills.map(s => (
                  <span key={s} className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserDashboard({ user }) {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    // Always fetch fresh — skills may have changed after resume upload
    api.get('/users/me').then(res => setProfile(res.data)).catch(() => {})
    api.get(`/projects/my/${user.userId}`).then(res => setProjects(res.data)).catch(() => {})
  }, [user.userId])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="My Skills" value={profile?.skills?.length ?? 0} icon={Brain} color="indigo" />
        <StatCard label="Assigned Projects" value={projects.length} icon={Briefcase} color="blue" />
        <StatCard label="Performance Score" value={`${profile?.performanceScore ?? 0}/100`} icon={TrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">My Skills</h3>
          {profile?.skills?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {profile.skills.sort((a, b) => b.strengthLevel - a.strengthLevel).map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-32 truncate">{s.skillName}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${s.strengthLevel * 10}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{s.strengthLevel}/10</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">Upload your resume to detect skills.</p>}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">My Projects</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400">No projects assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                    <span className={`badge text-[10px] ${
                      p.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      p.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>{p.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div className="h-1 rounded-full bg-brand-500" style={{ width: `${p.progressPercent}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">{p.progressPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/analytics/overview').then(res => setOverview(res.data)).catch(console.error).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user?.role])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {user?.role === 'ADMIN' ? "Here's your workforce overview." : "Here's your workspace."}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : user?.role === 'ADMIN' ? (
        <AdminDashboard overview={overview} />
      ) : (
        <UserDashboard user={user} />
      )}
    </div>
  )
}
