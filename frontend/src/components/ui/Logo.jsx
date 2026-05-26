/**
 * SynapseForce brand logo — used in Sidebar, Login, Register.
 * size="sm"  → sidebar (compact)
 * size="md"  → auth pages (centered)
 */
export default function Logo({ size = 'md' }) {
  const isSmall = size === 'sm'

  return (
    <div className={`flex items-center gap-${isSmall ? '2.5' : '3'}`}>
      {/* Icon mark */}
      <div className={`relative shrink-0 ${isSmall ? 'w-8 h-8' : 'w-10 h-10'}`}>
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 opacity-20 blur-sm scale-110" />
        {/* Main icon container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg">
          {/* SF monogram as SVG — clean, startup-style */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={isSmall ? 'w-4 h-4' : 'w-5 h-5'}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Neural network / synapse nodes */}
            <circle cx="12" cy="5" r="2" fill="white" fillOpacity="0.95" />
            <circle cx="5" cy="14" r="1.5" fill="white" fillOpacity="0.7" />
            <circle cx="19" cy="14" r="1.5" fill="white" fillOpacity="0.7" />
            <circle cx="8.5" cy="20" r="1.5" fill="white" fillOpacity="0.6" />
            <circle cx="15.5" cy="20" r="1.5" fill="white" fillOpacity="0.6" />
            {/* Connecting lines */}
            <line x1="12" y1="7" x2="5" y2="12.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
            <line x1="12" y1="7" x2="19" y2="12.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
            <line x1="5" y1="15.5" x2="8.5" y2="18.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
            <line x1="19" y1="15.5" x2="15.5" y2="18.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
            <line x1="6.5" y1="14" x2="17.5" y2="14" stroke="white" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
            {/* Center pulse dot */}
            <circle cx="12" cy="14" r="1" fill="white" fillOpacity="0.9" />
            <line x1="12" y1="7" x2="12" y2="13" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight text-gray-900 dark:text-white ${isSmall ? 'text-sm' : 'text-lg'}`}>
          Synapse<span className="text-brand-500">Force</span>
        </span>
        {!isSmall && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-0.5">
            Workforce Intelligence
          </span>
        )}
        {isSmall && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-0.5">
            Workforce AI
          </span>
        )}
      </div>
    </div>
  )
}
