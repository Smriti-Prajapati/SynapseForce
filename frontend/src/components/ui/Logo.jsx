/**
 * SynapseForce brand logo — SF monogram matching the provided image
 * The S is a stylized shape with two horizontal bars + curve
 * The F shares the vertical bar with horizontal bars
 * Circuit dots on the left side of the S
 * Blue gradient throughout, "Force" in blue, tagline below
 */
export default function Logo({ size = 'md' }) {
  const sm = size === 'sm'

  const iconW = sm ? 44 : 64
  const iconH = sm ? 36 : 52

  const icon = (
    <svg
      viewBox="0 0 110 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: iconW, height: iconH }}
    >
      <defs>
        <linearGradient id="sfG1" x1="5" y1="10" x2="75" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="sfG2" x1="50" y1="10" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* ── S shape (left) ── */}
      {/* Top horizontal bar of S */}
      <line x1="18" y1="18" x2="46" y2="18" stroke="url(#sfG1)" strokeWidth="8" strokeLinecap="round" />
      {/* Top-right curve going down */}
      <path d="M46 18 Q52 18 52 26 Q52 34 46 34" stroke="url(#sfG1)" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Middle horizontal bar of S */}
      <line x1="18" y1="34" x2="46" y2="34" stroke="url(#sfG1)" strokeWidth="8" strokeLinecap="round" />
      {/* Bottom-left curve going down */}
      <path d="M18 34 Q12 34 12 42 Q12 50 18 50" stroke="url(#sfG1)" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Bottom horizontal bar of S */}
      <line x1="18" y1="50" x2="46" y2="50" stroke="url(#sfG1)" strokeWidth="8" strokeLinecap="round" />

      {/* ── F shape (right, shares space) ── */}
      {/* Vertical bar */}
      <line x1="62" y1="18" x2="62" y2="68" stroke="url(#sfG2)" strokeWidth="8" strokeLinecap="round" />
      {/* Top horizontal */}
      <line x1="62" y1="18" x2="90" y2="18" stroke="url(#sfG2)" strokeWidth="8" strokeLinecap="round" />
      {/* Middle horizontal (shorter) */}
      <line x1="62" y1="43" x2="84" y2="43" stroke="url(#sfG2)" strokeWidth="8" strokeLinecap="round" />

      {/* ── Circuit dot — top right of F ── */}
      <line x1="90" y1="18" x2="98" y2="10" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <circle cx="100" cy="8" r="3" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.85" />
      <circle cx="100" cy="8" r="1.2" fill="#38bdf8" opacity="0.85" />

      {/* ── Circuit dot — left of S middle ── */}
      <line x1="12" y1="34" x2="4" y2="34" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <circle cx="2" cy="34" r="3" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.85" />
      <circle cx="2" cy="34" r="1.2" fill="#38bdf8" opacity="0.85" />
    </svg>
  )

  return (
    <div className={`flex items-center ${sm ? 'gap-2' : 'gap-3'}`}>
      {icon}

      {/* Wordmark */}
      <div className="flex flex-col leading-none select-none">
        <div
          className={`font-bold ${sm ? 'text-sm' : 'text-[22px]'}`}
          style={{ letterSpacing: '-0.01em', lineHeight: 1 }}
        >
          <span className="text-gray-900 dark:text-white">Synapse</span>
          <span style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Force</span>
        </div>
        <span
          className="text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase"
          style={{ fontSize: sm ? '6.5px' : '8.5px', letterSpacing: '0.22em', marginTop: sm ? '3px' : '5px' }}
        >
          Intelligence in Motion
        </span>
      </div>
    </div>
  )
}
