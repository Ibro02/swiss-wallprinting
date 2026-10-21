// Four ink dots (cyan, magenta, yellow, black), like the ink ports on the client's
// printer. A small recurring brand detail (Development Plan, section 5). Decorative.

const INKS = ['bg-ink-cyan', 'bg-ink-magenta', 'bg-ink-yellow', 'bg-ink-black ring-1 ring-white/30']

export function CmykDots({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      {INKS.map((ink) => (
        <span key={ink} className={`size-1.5 rounded-full ${ink}`} />
      ))}
    </span>
  )
}
