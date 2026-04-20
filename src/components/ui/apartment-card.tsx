import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ApartmentCardProps {
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  image?: string
}

export function ApartmentCard({
  name,
  price,
  guests,
  surface,
  bedrooms,
  slug,
  image,
}: ApartmentCardProps) {
  return (
    <article className="bg-sand group flex h-full flex-col rounded-lg" data-hover>
      {image ? (
        <div className="relative h-[278px] overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="bg-coffee/0 absolute inset-0 transition-colors duration-500 group-hover:bg-coffee/10" />
        </div>
      ) : (
        <div className="h-[278px] rounded-t-lg bg-sand" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-coffee text-lg font-semibold">{name}</h3>
          <span className="text-silver text-sm tabular-nums">{price}&euro;/nuit</span>
        </div>

        <p className="text-taupe text-xs font-bold tracking-[0.24px]">Check-in</p>

        <div className="flex items-center gap-4">
          <Stat icon="guests" value={`${guests} p.`} />
          <Stat icon="surface" value={`${surface} m\u00B2`} />
          <Stat icon="bedrooms" value={String(bedrooms)} />
        </div>

        <Button href={`/appartements/${slug}`} className="mt-auto w-full">
          Voir l'appartement
        </Button>
      </div>
    </article>
  )
}

function Stat({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="border-silver flex size-[19px] items-center justify-center rounded-[10px] border">
        {icon === 'guests' && <GuestsIcon />}
        {icon === 'surface' && <SurfaceIcon />}
        {icon === 'bedrooms' && <BedroomsIcon />}
      </div>
      <span className="text-taupe text-xs font-bold tracking-[0.24px]">{value}</span>
    </div>
  )
}

function GuestsIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="3.5" r="2" stroke="#82756b" strokeWidth="0.8" />
      <path d="M2 9.5a3 3 0 0 1 6 0" stroke="#82756b" strokeWidth="0.8" />
    </svg>
  )
}

function SurfaceIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="1" y="1" width="8" height="8" rx="1" stroke="#82756b" strokeWidth="0.8" />
    </svg>
  )
}

function BedroomsIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M1 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M1 7v1.5M9 7v1.5M2 5h6"
        stroke="#82756b"
        strokeWidth="0.8"
      />
    </svg>
  )
}
