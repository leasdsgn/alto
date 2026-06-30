export function BrandKickerText({ value }: { value: string }) {
  if (!value.startsWith('Alto')) return value

  return (
    <>
      <span className="font-display italic">Alto</span>
      {value.slice('Alto'.length)}
    </>
  )
}
