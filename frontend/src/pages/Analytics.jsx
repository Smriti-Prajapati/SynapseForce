import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { Brain, Users, FileText, TrendingUp, Clock, AlertTriangle, Activity, Zap } from 'lucide-react'
import api from '../lib/api'
import StatCard from '../components/ui/StatCard'

const COLORS = ['#6366f1','#818cf8','#a5b4fc','#4f46e5','#7c3aed','#8b5cf6','#3b82f6','#60a5fa','#34d399','#f59e0b']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow px-3 py-2 text-xs">
      <p className="font-medium text-gray-800 dark:text-gray-200">{payload[0].payload.skill}</p>
      <p className="text-gray-500 dark:text-gray-400">{payload[0].value} employees</p>
    </div>
  )
}

const CATEGORY_COLORS = { PROJECT: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400', RESUME: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', TASK: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', USER: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/overview')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={data?.totalEmployees ?? 0} icon={Users} color="indigo" />
        <StatCard label="Active Projects" value={data?.activeProjects ?? 0} icon={Clock} color="blue" />
        <StatCard label="Skills Detected" value={data?.totalSkills ?? 0} icon={Brain} color="purple" />
        <StatCard label="Overdue Projects" value={data?.overdueProjects ?? 0} icon={AlertTriangle} color="green"
          trend={data?.overdueProjects > 0 ? 'Needs attention' : 'All on track'} />
      </div>

      {/* Insight */}
      {data?.insight && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-900/20 dark:to-indigo-900/20 border border-brand-100 dark:border-brand-800 rounded-xl px-5 py-4 flex items-start gap-3">
          <Zap size={16} className="text-brand-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Team Insight</p>
            <p className="text-sm text-brand-600 dark:text-brand-400 mt-0.5">{data.insight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill distribution bar chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">Skill Distribution</h3>
          {data?.skillDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.skillDistribution} margin={{ left: -20 }}>
                <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {data.skillDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No skill data yet</p>
          )}
        </div>

        {/* Skill gap */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Skill Gap Analysis</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Skills needed by active projects but missing from your team</p>
          {data?.missingSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map(s => (
                <span key={s} className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={10} /> {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium">No skill gaps detected — team is well-covered</p>
            </div>
          )}

          {/* Skill breakdown table */}
          {data?.skillDistribution?.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Top Skills</p>
              {data.skillDistribution.slice(0, 6).map(({ skill, count }, i) => {
                const max = data.skillDistribution[0].count
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4 text-right">{i+1}</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 w-28 truncate">{skill}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${Math.round(count/max*100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Activity feed */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        </div>
        {data?.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {data.recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0 mt-0.5">
                  {a.actorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{a.action}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(a.occurredAt)}</p>
                </div>
                <span className={`badge shrink-0 text-[10px] ${CATEGORY_COLORS[a.category] || 'bg-gray-100 text-gray-500'}`}>
                  {a.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No activity yet</p>
        )}
      </div>
    </div>
  )
}
