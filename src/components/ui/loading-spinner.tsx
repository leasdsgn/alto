interface LoadingSpinnerProps {
  label: string
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <span className="inline-flex items-center justify-center gap-1" role="status">
      <span className="sr-only">{label}</span>
      <span className="bg-taupe h-1.5 w-1.5 animate-pulse rounded-full" />
      <span className="bg-taupe h-1.5 w-1.5 animate-pulse rounded-full delay-150" />
      <span className="bg-taupe h-1.5 w-1.5 animate-pulse rounded-full delay-300" />
    </span>
  )
}
