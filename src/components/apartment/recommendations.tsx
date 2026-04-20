import { ApartmentCard } from '@/components/ui/apartment-card'
import { type Apartment } from '@/types/apartment'

interface RecommendationsProps {
  apartments: Apartment[]
}

export function ApartmentRecommendations({ apartments }: RecommendationsProps) {
  return (
    <div className="mt-16 border-t border-divider pt-8">
      <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Les recommandations</p>
      <h2 className="text-coffee mt-2 text-base font-medium leading-[24px]">Vous aimerez aussi</h2>

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {apartments.slice(0, 3).map((apt) => (
          <ApartmentCard key={apt.slug} {...apt} />
        ))}
      </div>
    </div>
  )
}
