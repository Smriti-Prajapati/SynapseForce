import { useEffect, useState } from 'react'
import { FileText, Search, ExternalLink, Eye } from 'lucide-react'
import api from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

function ResumePreviewModal({ resume, onClose }) {
  const isPdf = resume.contentType === 'application/pdf'
  const [blobUrl, setBlobUrl] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    // Fetch with JWT so the 403 doesn't happen
    api.get(`/resume/${resume.id}/file`, { responseType: 'blob' })
      .then(res => {
        const url = URL.createObjectURL(res.data)
        setBlobUrl(url)
      })
      .catch(() => setLoadError(true))

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [resume.id])

  const handleOpenNewTab = () => {
    if (blobUrl) window.open(blobUrl, '_blank')
  }

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = resume.fileName
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-brand-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{resume.fileName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{resume.userFullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewTab}
              disabled={!blobUrl}
              className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 disabled:opacity-40"
            >
              <ExternalLink size={13} />
              Open in new tab
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 text-lg leading-none transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden rounded-b-2xl bg-gray-50 dark:bg-gray-950">
          {loadError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <p className="text-sm text-red-500">Failed to load file.</p>
            </div>
          ) : !blobUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              className="w-full h-full"
              title={resume.fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-600/10 flex items-center justify-center">
                <FileText size={28} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{resume.fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This file type cannot be previewed inline.
                </p>
              </div>
              <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
                <ExternalLink size={14} />
                Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Resumes() {
  const [resumes, setResumes] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/resume/all')
      .then(res => { setResumes(res.data); setFiltered(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(resumes.filter(r =>
      r.fileName?.toLowerCase().includes(q) ||
      r.userFullName?.toLowerCase().includes(q)
    ))
  }, [search, resumes])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Employee Resumes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} submitted · click a row to preview
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or file..."
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
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            description="Employees can upload their resumes from their profile page."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">File</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Submitted</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(r => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {r.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold shrink-0">
                        {r.userFullName?.charAt(0)}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{r.userFullName ?? '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {r.contentType?.split('/')[1]?.toUpperCase() ?? 'FILE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                    {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    }) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-brand-500 flex items-center gap-1 justify-end transition-colors">
                      <Eye size={13} />
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <ResumePreviewModal resume={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
