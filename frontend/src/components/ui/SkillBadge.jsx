export default function SkillBadge({ skill, strength }) {
  const getColor = (level) => {
    if (level >= 8) return 'bg-green-100 text-green-700'
    if (level >= 5) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <span className={`badge ${getColor(strength)}`}>
      {skill}
      {strength && <span className="ml-1 opacity-60">·{strength}</span>}
    </span>
  )
}
