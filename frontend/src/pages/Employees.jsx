import { useEffect, useState } from 'react'
import { Users, Search, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../lib/api'
import SkillBadge from '../components/ui/SkillBadge'
import EmptyState from '../components/ui/EmptyState'

function EmployeeRow({ employee }) {
  const [expanded, setExpanded] = useState(false)
  const [skills, setSkills] = useState(null)

  const loadSkills = async () => {
    if (skills) { setExpanded(e => !e); return }
    const { data } = await api.get(`/users/${employee.id}/skills`)
    setSkills(data)
    setExpanded(true)
  }

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={loadSkills}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0">
              {employee.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.fullName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{employee.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {employee.topSkills?.map(s => (
              <span key={s} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{s}</span>
            ))}
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">{employee.skillCount}</span>
        </td>
        <td className="py-3 px-4 text-right">
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>

      {expanded && skills && (
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={4} className="px-4 py-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">All Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => <SkillBadge key={s.id} skill={s.skillName} strength={s.strengthLevel} />)}
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
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users')
      .then(res => { setEmployees(res.data); setFiltered(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(employees.filter(e =>
      e.fullName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.topSkills?.some(s => s.toLowerCase().includes(q))
    ))
  }, [search, employees])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Employee Directory</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{employees.length} employees · click a row to expand skills</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            className="input pl-8 w-56"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Try a different search term." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Top Skills</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Total Skills</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(e => <EmployeeRow key={e.id} employee={e} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
