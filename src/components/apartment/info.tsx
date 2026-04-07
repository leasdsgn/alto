interface InfoProps {
  name: string
  location: string
  guests: number
  surface: number
  bedrooms: number
  bathrooms: number
}

export function ApartmentInfo({ name, location, guests, surface, bedrooms, bathrooms }: InfoProps) {
  return (
    <div className="mt-6">
      <h1 className="text-coffee text-base font-bold leading-[24px]">{name}</h1>
      <p className="text-coffee mt-1 text-xs font-medium leading-[24px]">{location}</p>

      <div className="mt-4 flex items-center gap-6 border-t border-divider pt-4">
        <Stat label={`${guests}p.`} />
        {surface > 0 && <Stat label={`${surface}m²`} />}
        <Stat label={`${bedrooms} chambre${bedrooms > 1 ? 's' : ''}`} />
        {bathrooms > 0 && <Stat label={`${bathrooms} sdb`} />}
      </div>
    </div>
  )
}

function Stat({ label }: { label: string }) {
  return (
    <span className="text-ash text-xs font-extrabold leading-[45px]">{label}</span>
  )
}
