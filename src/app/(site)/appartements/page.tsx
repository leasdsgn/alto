import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentCard } from '@/components/ui/apartment-card'
import { getApartments } from '@/components/sections/apartments-section'
import Image from 'next/image'

export default async function AppartementsPage() {
  const apartments = await getApartments()

  return (
    <>
      <div className="relative h-[422px] overflow-hidden">
        <Image
          src="/images/alto-salon.jpg"
          alt="Nos appartements"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-coffee/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-coffee/75 to-transparent" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-content px-gutter pb-10 md:px-gutter-md">
            <h1 className="text-cream text-base font-bold leading-[24px]">Nos appartements</h1>
            <p className="text-cream/80 mt-2 max-w-[505px] text-xs font-medium leading-[20px]">
              Une collection d'adresses ou chaque detail compte. Paris, Lyon, bientot ailleurs.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        <div className="flex items-baseline justify-between">
          <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">
            {apartments.length} appartement{apartments.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apt) => (
            <ApartmentCard
              key={apt.id}
              name={apt.name}
              price={apt.price}
              guests={apt.guests}
              surface={apt.surface}
              bedrooms={apt.bedrooms}
              slug={apt.slug}
              image={apt.images[0]}
            />
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
