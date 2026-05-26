export default function Logo({ size = 'md' }) {
  const sm = size === 'sm'
  const w = sm ? 40 : 56
  const h = sm ? 34 : 48

  const SFMark = ({ width, height }) => (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
    >
      <defs>
        <linearGradient id="sfMain" x1="10" y1="20" x2="190" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sfDark" x1="10" y1="20" x2="190" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Bold S ── */}
      {/* The S: top arc curves right, middle narrows, bottom arc curves left */}
      {/* Top half of S */}
      <path
        d="M 30 30
           L 85 30
           Q 105 30 105 52
           Q 105 72 85 72
           L 45 72
           Q 28 72 28 90
           Q 28 108 45 108
           L 100 108"
        stroke="url(#sfMain)"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* S bottom tail — sharp angular arrow pointing bottom-left */}
      <path
        d="M 45 108 L 22 138 L 38 138"
        stroke="url(#sfMain)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Bold F ── */}
      {/* Vertical bar */}
      <line x1="118" y1="30" x2="118" y2="155" stroke="url(#sfMain)" strokeWidth="22" strokeLinecap="round" />
      {/* Top horizontal — angled/slanted arrow shape */}
      <path
        d="M 118 30 L 178 30 L 168 50 L 118 50"
        fill="url(#sfMain)"
        stroke="url(#sfMain)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Middle horizontal — angled arrow shape, shorter */}
      <path
        d="M 118 88 L 165 88 L 155 108 L 118 108"
        fill="url(#sfMain)"
        stroke="url(#sfMain)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* F bottom tail — sharp angular arrow pointing down */}
      <path
        d="M 118 155 L 105 175 L 125 165"
        stroke="url(#sfMain)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Circuit dot — top right (off F top bar) ── */}
      <line x1="178" y1="30" x2="192" y2="18" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
      <circle cx="196" cy="14" r="5" fill="none" stroke="#22d3ee" strokeWidth="2.5" filter="url(#glow)" />
      <circle cx="196" cy="14" r="2" fill="#22d3ee" filter="url(#glow)" />

      {/* ── Circuit dot — bottom left (off S tail) ── */}
      <line x1="22" y1="138" x2="8" y2="148" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
      <circle cx="4" cy="152" r="5" fill="none" stroke="#22d3ee" strokeWidth="2.5" filter="url(#glow)" />
      <circle cx="4" cy="152" r="2" fill="#22d3ee" filter="url(#glow)" />
    </svg>
  )

  return (
    <div className={`flex items-center ${sm ? 'gap-2' : 'gap-3'}`}>
      <SFMark width={w} height={h} />

      {/* Wordmark */}
      <div className="flex flex-col leading-none select-none">
        <div
          className={`font-bold ${sm ? 'text-[13px]' : 'text-[20px]'}`}
          style={{ letterSpacing: '-0.01em', lineHeight: 1 }}
        >
          <span className="text-gray-900 dark:text-white">Synapse</span>
          <span style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Force</span>
        </div>
        <span
          className="text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase"
          style={{ fontSize: sm ? '6px' : '8px', letterSpacing: '0.2em', marginTop: sm ? '3px' : '5px' }}
        >
          Intelligence in Motion
        </span>
      </div>
    </div>
  )
}
