'use client'

interface FilterToolbarButtonProps {
  active?: boolean
  icon: React.ReactNode
  label: string
  onClick?: () => void
  variant?: 'coffee' | 'map'
}

export function FilterToolbarButton({
  active = false,
  icon,
  label,
  onClick,
  variant = 'coffee',
}: FilterToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex size-9 shrink-0 items-center justify-center rounded-filter-button text-cream transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coffee ${
        variant === 'map' ? 'bg-linear-to-r from-taupe to-ash' : 'bg-coffee'
      }`}
    >
      <span aria-hidden="true" className="flex shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  )
}
