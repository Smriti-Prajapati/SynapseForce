/**
 * SynapseForce brand logo
 * Recreates the SF monogram with circuit dots + blue gradient
 * size="sm"  → sidebar (icon + compact wordmark)
 * size="md"  → auth pages (icon + full wordmark + tagline)
 * size="icon" → icon only
 */
export default function Logo({ size = 'md' }) {
  const sm = size === 'sm'
  const iconOnly = size === 'icon'

  const icon = (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={sm ? 'w-9 h-9' : 'w-14 h-14'}
    >
      <defs>
        <linearGradient id="sfGrad" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sfGrad2" x1="40" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* ── S shape ── */}
      {/* Top bar of S */}
      <path
        d="M18 18 L38 18 C44 18 48 22 48 27 C48 32 44 36 38 36 L22 36 C16 36 12 40 12 45 C12 50 16 54 22 54 L42 54"
        stroke="url(#sfGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── F shape (right side, overlapping) ── */}
      {/* Vertical bar */}
      <line x1="52" y1="18" x2="52" y2="62" stroke="url(#sfGrad2)" strokeWidth="7" strokeLinecap="round" />
      {/* Top horizontal */}
      <line x1="52" y1="18" x2="70" y2="18" stroke="url(#sfGrad2)" strokeWidth="7" strokeLinecap="round" />
      {/* Middle horizontal */}
      <line x1="52" y1="40" x2="66" y2="40" stroke="url(#sfGrad2)" strokeWidth="7" strokeLinecap="round" />

      {/* ── Circuit dots with lines ── */}
      {/* Top-right circuit */}
      <line x1="70" y1="18" x2="76" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <circle cx="76" cy="10" r="2.5" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
      <circle cx="76" cy="10" r="1" fill="#38bdf8" opacity="0.9" />

      {/* Left-middle circuit */}
      <line x1="12" y1="45" x2="6" y2="45" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <circle cx="4" cy="45" r="2.5" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
      <circle cx="4" cy="45" r="1" fill="#38bdf8" opacity="0.9" />

      {/* Small tick/arrow on F bottom — matches the pic's angular cut */}
      <path d="M52 62 L46 68" stroke="url(#sfGrad2)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )

  if (iconOnly) return icon

  return (
    <div className={`flex items-center ${sm ? 'gap-2' : 'gap-3'}`}>
      {icon}

      {/* Wordmark */}
      <div className="flex flex-col leading-none select-none">
        <div className={`font-bold tracking-tight ${sm ? 'text-sm' : 'text-2xl'}`} style={{ letterSpacing: '-0.02em' }}>
          <span className="text-white dark:text-white" style={{ color: 'inherit' }}>
            <span className="text-gray-900 dark:text-white">Synapse</span>
            <span style={{ background: 'linear-gradient(135deg, #38bdf8, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Force
            </span>
          </span>
        </div>
        {!sm && (
          <span
            className="text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase mt-1"
            style={{ fontSize: '9px', letterSpacing: '0.2em' }}
          >
            Intelligence in Motion
          </span>
        )}
        {sm && (
          <span
            className="text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase mt-0.5"
            style={{ fontSize: '7px', letterSpacing: '0.15em' }}
          >
            Intelligence in Motion
          </span>
        )}
      </div>
    </div>
  )
}
