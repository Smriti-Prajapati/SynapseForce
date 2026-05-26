/**
 * SynapseForce — brand logo
 * size="sm"  → sidebar
 * size="md"  → auth pages (larger, centered)
 */
export default function Logo({ size = 'md' }) {
  const sm = size === 'sm'

  return (
    <div className={`flex items-center ${sm ? 'gap-2.5' : 'gap-3'}`}>
      {/* ── Icon mark ── */}
      <div className={`relative shrink-0 ${sm ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Rounded square background */}
          <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />

          {/* ── S-shaped lightning bolt / synapse path ── */}
          {/* Top-right arc → center → bottom-left arc — reads as "S" + energy */}
          <path
            d="M26 10 L16 10 C13.8 10 12 11.8 12 14 C12 16.2 13.8 18 16 18 L24 18 C26.2 18 28 19.8 28 22 C28 24.2 26.2 26 24 26 L14 26"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
          />
          {/* Accent dot — bottom terminal */}
          <circle cx="14" cy="30" r="2.5" fill="white" opacity="0.9" />
          {/* Accent dot — top terminal */}
          <circle cx="26" cy="10" r="0" fill="white" opacity="0" />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Wordmark ── */}
      <div className="flex flex-col leading-none select-none">
        <span
          className={`font-bold tracking-tight text-gray-900 dark:text-white ${sm ? 'text-[13px]' : 'text-[18px]'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Synapse<span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
          >Force</span>
        </span>
        <span
          className={`text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium ${sm ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1'}`}
        >
          Workforce Intelligence
        </span>
      </div>
    </div>
  )
}
