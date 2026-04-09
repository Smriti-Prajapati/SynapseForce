export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        {trend && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{trend}</p>}
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  )
}
