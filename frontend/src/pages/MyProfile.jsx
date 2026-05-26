import { useEffect, useState, useRef } from 'react'
import { Briefcase, Star, Upload, FileText, CheckCircle, Brain } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

function ProgressUpdateModal({ project, onClose, onUpdated }) {
  const [percent, setPercent] = useState(project.progressPercent ?? 0)
  const [note, setNote] = useState(project.progressNote ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.patch(`/projects/${project.id}/progress`, {
        progressPercent: percent,
        progressNote: note,
      })
      onUpdated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Update Progress</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{project.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</label>
              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{percent}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={percent}
              onChange={e => setPercent(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Progress Note</label>
            <textarea className="input resize-none" rows={3}
              placeholder="What has been completed? What's next?"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          {error && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MyProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [activeProject, setActiveProject] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    Promise.all([
      api.get('/users/me'),
      api.get(`/projects/my/${user.userId}`),
      api.get('/resume/my'),
    ])
      .then(([p, proj, res]) => {
        setProfile(p.data)
        setProjects(proj.data)
        setResumes(res.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.userId])

  const handleUpload = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files[0]
    if (!file) return
    setUploading(true)
    setUploadMsg(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadMsg({ type: 'success', text: 'Resume uploaded. Skills extracted successfully.' })
      fileRef.current.value = ''
      const [p, res] = await Promise.all([api.get('/users/me'), api.get('/resume/my')])
      setProfile(p.data)
      setResumes(res.data)
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  const handleProgressUpdated = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const topSkill = profile?.skills?.reduce((a, b) =>
    (a.strengthLevel ?? 0) > (b.strengthLevel ?? 0) ? a : b, {})

  return (
    <div className="space-y-6">
      {/* Profile header — full width */}
      <div className="card">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-2xl font-bold shrink-0">
            {profile?.fullName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile?.fullName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400">Employee</span>
              <select
                className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                value={profile?.availability ?? 'AVAILABLE'}
                onChange={async (e) => {
                  const newStatus = e.target.value
                  setProfile(p => ({ ...p, availability: newStatus }))
                  try {
                    await api.patch(`/users/${profile.id}/availability?status=${newStatus}`)
                  } catch {
                    setProfile(p => ({ ...p, availability: profile.availability }))
                  }
                }}
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{profile?.skills?.length ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Skills</p>
            </div>
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{projects.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Projects</p>
            </div>
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resumes.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Resumes</p>
            </div>
            {topSkill?.skillName && (
              <>
                <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star size={13} className="text-yellow-500" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{topSkill.skillName}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top Skill</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Skills */}          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Detected Skills
                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                  {profile?.skills?.length ?? 0} found
                </span>
              </h3>
            </div>
            {profile?.skills?.length > 0 ? (
              <div className="space-y-2.5">
                {profile.skills
                  .sort((a, b) => b.strengthLevel - a.strengthLevel)
                  .map(skill => (
                    <div key={skill.id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-36 truncate">{skill.skillName}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-brand-500 transition-all"
                          style={{ width: `${skill.strengthLevel * 10}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">
                        {skill.strengthLevel}/10
                      </span>
                      {skill.endorsed && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">
                          Endorsed
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Upload your resume below to auto-detect your skills.
              </p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Resume upload */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Upload size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upload Resume</h3>
            </div>
            <form onSubmit={handleUpload} className="flex items-center gap-3 flex-wrap">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="input flex-1 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand-50 dark:file:bg-brand-600/10 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-100"
                required
              />
              <button type="submit" className="btn-primary flex items-center gap-2 whitespace-nowrap" disabled={uploading}>
                <Upload size={14} />
                {uploading ? 'Processing...' : 'Upload & Extract Skills'}
              </button>
            </form>
            {uploadMsg && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${
                uploadMsg.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
              }`}>
                {uploadMsg.text}
              </div>
            )}
            {resumes.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Uploaded Resumes</p>
                {resumes.map(r => (
                  <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{r.fileName}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned projects */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">My Projects</h3>
            </div>
            {projects.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No projects assigned"
                description="You'll appear here once HR assigns you to a project."
              />
            ) : (
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>
                        )}
                      </div>
                      <span className={`badge shrink-0 ${
                        p.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        p.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{p.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${
                          p.progressPercent === 100 ? 'bg-green-500' :
                          p.progressPercent >= 50 ? 'bg-brand-500' : 'bg-amber-500'
                        }`} style={{ width: `${p.progressPercent}%` }} />
                      </div>
                    </div>
                    {p.progressNote && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">"{p.progressNote}"</p>
                    )}
                    {p.status !== 'COMPLETED' ? (
                      <button onClick={() => setActiveProject(p)} className="btn-secondary text-xs py-1.5 px-3">
                        Update Progress
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle size={13} /> Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {activeProject && (
        <ProgressUpdateModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onUpdated={handleProgressUpdated}
        />
      )}
    </div>
  )
}
