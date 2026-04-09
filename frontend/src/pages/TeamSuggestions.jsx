import { useState } from 'react'
import { Search, Star, Users, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import SkillBadge from '../components/ui/SkillBadge'
import EmptyState from '../components/ui/EmptyState'

function MemberCard({ member, rank }) {
  const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600']
  const rankLabel = ['1st', '2nd', '3rd']

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
          {member.fullName.charAt(0)}
        </div>
        {rank < 3 && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${rankColors[rank]} flex items-center justify-center text-white text-[9px] font-bold`}>
            {rank + 1}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{member.fullName}</p>
          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            Score: {member.score}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{member.email}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {member.matchedSkills.map(skill => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeamSuggestions() {
  const [skillInput, setSkillInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!skillInput.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.get('/team/suggest', { params: { skills: skillInput } })
      setResult(data)
    } catch (err) {
      setError('Failed to fetch suggestions. Make sure employees have uploaded resumes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Find the Right Team</h3>
        <p className="text-xs text-gray-500 mb-4">Enter required skills separated by commas</p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            className="input flex-1"
            placeholder="e.g. Java, Spring Boot, SQL, Docker"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
          />
          <button type="submit" className="btn-primary flex items-center gap-2 whitespace-nowrap" disabled={loading}>
            <Search size={14} />
            {loading ? 'Searching...' : 'Find Team'}
          </button>
        </form>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Required skills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Looking for:</span>
            {result.requiredSkills.map(s => (
              <span key={s} className="badge bg-brand-100 text-brand-700">{s}</span>
            ))}
          </div>

          {/* Best team */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-yellow-500" />
              <h3 className="text-sm font-semibold text-gray-900">Best Team</h3>
              <span className="text-xs text-gray-400">Top {result.bestTeam.length} matches</span>
            </div>
            {result.bestTeam.length === 0 ? (
              <EmptyState icon={Users} title="No matches found" description="Try different skills or upload more resumes." />
            ) : (
              <div className="space-y-3">
                {result.bestTeam.map((member, i) => (
                  <MemberCard key={member.userId} member={member} rank={i} />
                ))}
              </div>
            )}
          </div>

          {/* Optional members */}
          {result.optionalMembers.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <ChevronRight size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Optional Members</h3>
                <span className="text-xs text-gray-400">Additional candidates</span>
              </div>
              <div className="space-y-3">
                {result.optionalMembers.map((member, i) => (
                  <MemberCard key={member.userId} member={member} rank={i + 3} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <EmptyState
          icon={Users}
          title="No results yet"
          description="Enter required skills above to find the best team members."
        />
      )}
    </div>
  )
}
