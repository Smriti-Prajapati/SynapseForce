import { useEffect, useState } from 'react'
import { Users, FileText, Brain, Briefcase, TrendingUp, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import StatCard from '../components/ui/StatCard'
import SkillBadge from '../components/ui/SkillBadge'

// HR dashboard
function AdminDashboard({ overview }) {
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    api.get('/projects').then(res => setRecentProjects(res.data.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={overview?.totalEmployees ?? 0} icon={Users} color="indigo" />
        <StatCard label="Active Projects" value={overview?.activeProjects ?? 0} icon={Clock} color="green" />
        <StatCard label="Total Projects" value={overview?.totalProjects ?? 0} icon={Briefcase} color="blue" />
        <StatCard label="Skills Detected" value={overview?.totalSkills ?? 0} icon={Brain} color="purple" />
      </div>

      {overview?.insight && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-4 flex items-start gap-3">
          <TrendingUp size={16} className="text-brand-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-brand-700">Team Insight</p>
            <p className="text-sm text-brand-600 mt-0.5">{overview.insight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Projects</h3>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.teamMembers?.length ?? 0} members assigned</p>
                  </div>
                  <span className={`badge shrink-0 ${
                    p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    p.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top skills */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Skills in Team</h3>
          {overview?.skillDistribution?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {overview.skillDistribution.map(({ skill, count }) => (
                <SkillBadge key={skill} skill={skill} strength={count} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Upload resumes to detect skills.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Employee dashboard — projects + skills only
function UserDashboard({ user }) {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.get('/users/me').then(res => setProfile(res.data)).catch(() => {})
    api.get(`/projects/my/${user.userId}`).then(res => setProjects(res.data)).catch(() => {})
  }, [user.userId])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="My Skills" value={profile?.skills?.length ?? 0} icon={Brain} color="indigo" />
        <StatCard label="Assigned Projects" value={projects.length} icon={Briefcase} color="blue" />
        <StatCard
          label="Top Skill"
          value={profile?.skills?.sort((a, b) => b.strengthLevel - a.strengthLevel)[0]?.skillName ?? '—'}
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Skills</h3>
          {profile?.skills?.length > 0 ? (
            <div className="space-y-2">
              {profile.skills.sort((a, b) => b.strengthLevel - a.strengthLevel).slice(0, 6).map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-32 truncate">{s.skillName}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${s.strengthLevel * 10}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{s.strengthLevel}/10</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No skills yet. Ask HR to upload your resume.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Projects</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400">You haven't been assigned to any projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <span className={`badge ${
                      p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      p.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{p.status.replace('_', ' ')}</span>
                  </div>
                  {p.description && <p className="text-xs text-gray-400 mt-1">{p.description}</p>}
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
    api.get('/analytics/overview')
      .then(res => setOverview(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {user?.role === 'ADMIN'
            ? "Here's your workforce overview for today."
            : "Here's your personal workspace."}
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
