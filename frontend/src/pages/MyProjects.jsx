import { useEffect, useState } from 'react'
import { Briefcase, CheckCircle, Calendar, AlertTriangle, TrendingUp, Users, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

function ProgressModal({ project, onClose, onSaved }) {
  const [percent, setPercent] = useState(project.progressPercent ?? 0)
  const [note, setNote] = useState(project.progressNote ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const { data } = await api.patch(`/projects/${project.id}/progress`, {
        progressPercent: percent,
        progressNote: note,
      })
      onSaved(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Update Progress</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{project.name}</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</label>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{percent}%</span>
            </div>
            <input type="range" min="0" max="100" step="5"
              value={percent} onChange={e => setPercent(Number(e.target.value))}
              className="w-full accent-brand-600" />
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full transition-all ${
                percent === 100 ? 'bg-green-500' : percent >= 50 ? 'bg-brand-500' : 'bg-amber-500'
              }`} style={{ width: `${percent}%` }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Progress Note</label>
            <textarea className="input resize-none" rows={3}
              placeholder="What's been done? What's next?"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          {error && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, onUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const progress = project.progressPercent ?? 0

  const statusColor = {
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    IN_PROGRESS: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    OPEN: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  }

  return (
    <>
      <div className="card flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.name}</h4>
            {project.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{project.description}</p>
            )}
          </div>
          <span className={`badge shrink-0 ${statusColor[project.status] ?? statusColor.OPEN}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Required skills */}
        {project.requiredSkills && (
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1.5">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {project.requiredSkills.split(',').map(s => (
                <span key={s} className="badge bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Deadline */}
        {project.deadline && (
          <div className={`flex items-center gap-1.5 text-xs ${
            project.overdue ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {project.overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
            <span>{project.overdue ? 'Overdue · ' : 'Due '}
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Progress */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <TrendingUp size={11} /> Progress
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${
                progress === 100 ? 'text-green-500' : progress >= 50 ? 'text-brand-500' : 'text-amber-500'
              }`}>{progress}%</span>
              {project.status !== 'COMPLETED' && (
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  <Pencil size={10} /> Edit
                </button>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-brand-500' : 'bg-amber-500'
            }`} style={{ width: `${progress}%` }} />
          </div>
          {project.progressNote && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 italic mt-1.5">
              "{project.progressNote}"
            </p>
          )}
        </div>

        {/* Team members */}
        {project.teamMembers?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
              <Users size={11} /> Team Members
            </p>
            <div className="flex flex-wrap gap-2">
              {project.teamMembers.map(m => (
                <div key={m.id} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-2.5 py-1 border border-gray-100 dark:border-gray-700">
                  <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-[10px] font-semibold">
                    {m.fullName?.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{m.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {project.status === 'COMPLETED' && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 pt-1 border-t border-gray-100 dark:border-gray-800">
            <CheckCircle size={13} /> Project completed
          </div>
        )}
      </div>

      {showModal && (
        <ProgressModal
          project={project}
          onClose={() => setShowModal(false)}
          onSaved={(updated) => { onUpdated(updated); setShowModal(false) }}
        />
      )}
    </>
  )
}

export default function MyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get(`/projects/my/${user.userId}`)
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.userId])

  const handleUpdated = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  const displayed = filter === 'ALL' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">My Projects</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={filter === 'ALL' ? 'No projects assigned' : `No ${filter.replace('_', ' ').toLowerCase()} projects`}
          description={filter === 'ALL' ? 'HR will assign you to projects based on your skills.' : 'Try a different filter.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(p => (
            <ProjectCard key={p.id} project={p} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  )
}
