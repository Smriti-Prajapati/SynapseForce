import logoImg from '../../assets/logo.png'

/**
 * SynapseForce brand logo — uses the official SF logo image
 * size="sm"  → sidebar
 * size="md"  → auth pages
 */
export default function Logo({ size = 'md' }) {
  const sm = size === 'sm'

  return (
    <div className={`flex items-center ${sm ? 'gap-2' : 'gap-3'}`}>
      <img
        src={logoImg}
        alt="SynapseForce"
        className={sm ? 'w-9 h-9 object-contain' : 'w-14 h-14 object-contain'}
        draggable={false}
      />

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
