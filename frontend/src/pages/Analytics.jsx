import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Brain, Users, FileText, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import StatCard from '../components/ui/StatCard'

const CHART_COLORS = [
  '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe',
  '#4f46e5', '#7c3aed', '#8b5cf6', '#a78bfa',
  '#3b82f6', '#60a5fa'
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-medium text-gray-800">{payload[0].payload.skill}</p>
      <p className="text-gray-500">{payload[0].value} employees</p>
    </div>
  )
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={data?.totalEmployees ?? 0} icon={Users} color="indigo" />
        <StatCard label="Resumes Processed" value={data?.totalResumes ?? 0} icon={FileText} color="blue" />
        <StatCard label="Skills Detected" value={data?.totalSkills ?? 0} icon={Brain} color="purple" />
      </div>

      {/* Insight */}
      {data?.insight && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 rounded-xl px-5 py-4 flex items-start gap-3">
          <TrendingUp size={18} className="text-brand-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-brand-700">Team Insight</p>
            <p className="text-sm text-brand-600 mt-0.5">{data.insight}</p>
          </div>
        </div>
      )}

      {/* Skill distribution chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Skill Distribution</h3>
        {data?.skillDistribution?.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.skillDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="skill"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.skillDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No skill data yet. Upload some resumes to see analytics.
          </div>
        )}
      </div>

      {/* Skill table */}
      {data?.skillDistribution?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Skill Breakdown</h3>
          <div className="space-y-2">
            {data.skillDistribution.map(({ skill, count }, i) => {
              const max = data.skillDistribution[0].count
              const pct = Math.round((count / max) * 100)
              return (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-4 text-right">{i + 1}</span>
                  <span className="text-sm text-gray-700 w-32 truncate">{skill}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
