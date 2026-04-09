export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Icon size={20} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs">{description}</p>}
    </div>
  )
}
