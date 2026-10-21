// Five stars in one SVG, filled up to `rating` (whole stars). The label is the
// accessible name ("5 out of 5 stars"), so screen readers read it once.

const STAR = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z'

export function Stars({
  rating,
  label,
  className,
}: {
  rating: number
  label: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 120 24"
      // role="img" + aria-label is the standard pattern for an inline SVG with a text
      // alternative; an <img> element cannot hold inline SVG.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="img"
      aria-label={label}
      className={`h-4 w-20 ${className ?? ''}`}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <path
          key={index}
          d={STAR}
          transform={`translate(${index * 24} 0)`}
          className={index < Math.round(rating) ? 'fill-magenta' : 'fill-graphite/15'}
        />
      ))}
    </svg>
  )
}
