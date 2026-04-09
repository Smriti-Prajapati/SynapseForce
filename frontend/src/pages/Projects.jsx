import { useEffect, useState } from 'react'
import { Plus, Briefcase, Trash2, CheckCircle, Clock, Circle, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle },
}

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', requiredSkills: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/projects', form)
      onCreated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Create New Project</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Team will be auto-assigned based on required skills</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
            <input className="input" placeholder="e.g. E-Commerce Platform"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Brief description..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills</label>
            <input className="input" placeholder="e.g. Java, Spring Boot, Docker, SQL"
              value={form.requiredSkills} onChange={e => setForm(f => ({ ...f, requiredSkills: e.target.value }))} required />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Comma-separated. Team will be auto-matched.</p>
          </div>
          {error && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Assign Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProjectCard({ project, onStatusChange, onDelete }) {
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.OPEN
  const StatusIcon = status.icon
  const progress = project.progressPercent ?? 0

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{project.name}</h4>
          {project.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>
        <span className={`badge ${status.color} shrink-0 flex items-center gap-1`}>
          <StatusIcon size={10} />
          {status.label}
        </span>
      </div>

      {/* Required skills */}
      <div className="flex flex-wrap gap-1.5">
        {project.requiredSkills.split(',').map(s => (
          <span key={s} className="badge bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400">
            {s.trim()}
          </span>
        ))}
      </div>

      {/* Progress bar — HR can see employee-reported progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span className="flex items-center gap-1">
            <TrendingUp size={11} />
            Team Progress
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-green-500' :
              progress >= 50 ? 'bg-brand-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {project.progressNote && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1.5">
            "{project.progressNote}"
          </p>
        )}
        {project.progressUpdatedAt && (
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
            Last updated {new Date(project.progressUpdatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Team members */}
      {project.teamMembers?.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Assigned Team</p>
          <div className="flex flex-wrap gap-2">
            {project.teamMembers.map(m => (
              <div key={m.id} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-[10px] font-semibold">
                  {m.fullName.charAt(0)}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{m.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No matching team members found</p>
      )}

      {/* HR actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <select
          className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
          value={project.status}
          onChange={e => onStatusChange(project.id, e.target.value)}
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Mark as Completed</option>
        </select>
        <button
          onClick={() => onDelete(project.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => { loadProjects() }, [])

  const loadProjects = () => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await api.patch(`/projects/${id}/status?status=${status}`)
      setProjects(prev => prev.map(p => p.id === id ? data : p))
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await api.delete(`/projects/${id}`)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const displayed = filter === 'ALL' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create projects, track team progress, mark completions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 ml-2">
            <Plus size={14} />
            New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState icon={Briefcase} title="No projects" description="Create your first project to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(p => (
            <ProjectCard key={p.id} project={p} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  )
}
