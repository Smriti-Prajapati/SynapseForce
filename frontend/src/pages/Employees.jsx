import { useEffect, useState } from 'react'
import { Users, Search, ChevronDown, ChevronUp, Briefcase, Star } from 'lucide-react'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

const AVAILABILITY = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  BUSY:      { label: 'Busy',      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  ON_LEAVE:  { label: 'On Leave',  color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
}

function ScoreBar({ score }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{score}</span>
    </div>
  )
}

function EmployeeRow({ employee, projectCounts }) {
  const [expanded, setExpanded] = useState(false)
  const [skills, setSkills] = useState(null)
  const [loadingSkills, setLoadingSkills] = useState(false)
  const projectCount = projectCounts[employee.id] ?? 0
  const avail = AVAILABILITY[employee.availability] ?? AVAILABILITY.AVAILABLE

  const handleToggle = async () => {
    if (expanded) { setExpanded(false); return }
    if (!skills) {
      setLoadingSkills(true)
      try {
        const { data } = await api.get(`/users/${employee.id}/skills`)
        setSkills(Array.isArray(data) ? data : [])
      } catch { setSkills([]) }
      finally { setLoadingSkills(false) }
    }
    setExpanded(true)
  }

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={handleToggle}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0">
                {employee.fullName?.charAt(0) ?? '?'}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                employee.availability === 'AVAILABLE' ? 'bg-green-500' :
                employee.availability === 'BUSY' ? 'bg-amber-500' : 'bg-red-400'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.fullName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{employee.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`badge ${avail.color}`}>{avail.label}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {employee.topSkills?.length > 0
              ? employee.topSkills.map(s => <span key={s} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{s}</span>)
              : <span className="text-xs text-gray-400">—</span>}
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{employee.skillCount ?? 0}</span>
        </td>
        <td className="py-3 px-4">
          <ScoreBar score={employee.performanceScore ?? 0} />
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Briefcase size={12} className="text-brand-400" />
            <span className={`text-sm font-medium ${projectCount > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>{projectCount}</span>
          </div>
        </td>
        <td className="py-3 px-4 text-right">
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            {loadingSkills
              ? <div className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />
              : expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Skills</p>
                {skills?.length > 0 ? (
                  <div className="space-y-2">
                    {skills.sort((a, b) => b.strengthLevel - a.strengthLevel).map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 dark:text-gray-300 w-28 truncate">{s.skillName}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${s.strengthLevel >= 8 ? 'bg-green-500' : s.strengthLevel >= 5 ? 'bg-brand-500' : 'bg-amber-500'}`}
                            style={{ width: `${s.strengthLevel * 10}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{s.strengthLevel}/10</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">No skills detected yet</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Performance Score</span>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.performanceScore ?? 0}/100</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Projects Assigned</span>
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{projectCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Availability</span>
                    <span className={`badge ${avail.color}`}>{avail.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [projectCounts, setProjectCounts] = useState({})
  const [search, setSearch] = useState('')
  const [filterAvail, setFilterAvail] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/projects')])
      .then(([usersRes, projectsRes]) => {
        setEmployees(usersRes.data)
        setFiltered(usersRes.data)
        const counts = {}
        projectsRes.data.forEach(p => p.teamMembers?.forEach(m => { counts[m.id] = (counts[m.id] ?? 0) + 1 }))
        setProjectCounts(counts)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(employees.filter(e =>
      (filterAvail === 'ALL' || e.availability === filterAvail) &&
      (e.fullName?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) ||
       e.topSkills?.some(s => s.toLowerCase().includes(q)))
    ))
  }, [search, filterAvail, employees])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Employee Directory</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{employees.length} employees · click a row to expand</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'AVAILABLE', 'BUSY', 'ON_LEAVE'].map(f => (
            <button key={f} onClick={() => setFilterAvail(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterAvail === f ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {f.replace('_', ' ')}
            </button>
          ))}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="input pl-8 w-44"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Try a different search or filter." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Top Skills</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Skills</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Performance</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Projects</th>
                <th className="py-3 px-4 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(e => <EmployeeRow key={e.id} employee={e} projectCounts={projectCounts} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
