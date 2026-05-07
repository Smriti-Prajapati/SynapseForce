import { useEffect, useState } from 'react'
import { Users, Search, ChevronDown, ChevronUp, Briefcase } from 'lucide-react'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

function EmployeeRow({ employee, projectCounts }) {
  const [expanded, setExpanded] = useState(false)
  const [skills, setSkills] = useState(null)
  const [loadingSkills, setLoadingSkills] = useState(false)
  const projectCount = projectCounts[employee.id] ?? 0

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false)
      return
    }
    // Load skills only once
    if (!skills) {
      setLoadingSkills(true)
      try {
        const { data } = await api.get(`/users/${employee.id}/skills`)
        setSkills(Array.isArray(data) ? data : [])
      } catch {
        setSkills([])
      } finally {
        setLoadingSkills(false)
      }
    }
    setExpanded(true)
  }

  const getStrengthColor = (level) => {
    if (level >= 8) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (level >= 5) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  }

  return (
    <>
      <tr
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        onClick={handleToggle}
      >
        {/* Employee info */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0">
              {employee.fullName?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.fullName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{employee.email}</p>
            </div>
          </div>
        </td>

        {/* Top skills */}
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {employee.topSkills?.length > 0
              ? employee.topSkills.map(s => (
                  <span key={s} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {s}
                  </span>
                ))
              : <span className="text-xs text-gray-400 dark:text-gray-500">No skills yet</span>
            }
          </div>
        </td>

        {/* Skill count */}
        <td className="py-3 px-4 text-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {employee.skillCount ?? 0}
          </span>
        </td>

        {/* Project count */}
        <td className="py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Briefcase size={12} className="text-brand-400" />
            <span className={`text-sm font-medium ${
              projectCount > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {projectCount}
            </span>
          </div>
        </td>

        {/* Expand toggle */}
        <td className="py-3 px-4 text-right">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={e => { e.stopPropagation(); handleToggle() }}
          >
            {loadingSkills
              ? <div className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />
              : expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            }
          </button>
        </td>
      </tr>

      {/* Expanded skill detail */}
      {expanded && (
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={5} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skills */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Skills
                </p>
                {skills && skills.length > 0 ? (
                  <div className="space-y-1.5">
                    {skills
                      .sort((a, b) => (b.strengthLevel ?? 0) - (a.strengthLevel ?? 0))
                      .map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-700 dark:text-gray-300 w-28 truncate">
                            {s.skillName ?? 'Unknown'}
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                (s.strengthLevel ?? 0) >= 8 ? 'bg-green-500' :
                                (s.strengthLevel ?? 0) >= 5 ? 'bg-brand-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${(s.strengthLevel ?? 0) * 10}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">
                            {s.strengthLevel ?? 0}/10
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No skills detected yet</p>
                )}
              </div>

              {/* Project summary */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Projects Assigned
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${
                  projectCount > 0
                    ? 'bg-brand-50 dark:bg-brand-600/10'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Briefcase size={14} className={projectCount > 0 ? 'text-brand-500' : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${
                    projectCount > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                  }`}>
                    {projectCount} project{projectCount !== 1 ? 's' : ''}
                  </span>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/projects'),
    ])
      .then(([usersRes, projectsRes]) => {
        setEmployees(usersRes.data)
        setFiltered(usersRes.data)

        // Count projects per user
        const counts = {}
        projectsRes.data.forEach(project => {
          project.teamMembers?.forEach(member => {
            counts[member.id] = (counts[member.id] ?? 0) + 1
          })
        })
        setProjectCounts(counts)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      employees.filter(e =>
        e.fullName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.topSkills?.some(s => s.toLowerCase().includes(q))
      )
    )
  }, [search, employees])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Employee Directory</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {employees.length} employees · click a row to expand skills and projects
          </p>
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
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Skills</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Projects</th>
                <th className="py-3 px-4 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(e => (
                <EmployeeRow key={e.id} employee={e} projectCounts={projectCounts} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
