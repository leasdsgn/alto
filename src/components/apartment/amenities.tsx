const AMENITY_ICONS: Record<string, string> = {
  Wifi: 'M3 11a7.002 7.002 0 0 1 10 0M5 14a4 4 0 0 1 6 0M8 17h.01',
  Cuisine: 'M3 3h14v14H3zM8 7v6M12 7v6',
  Linge: 'M3 6h14M3 6v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6M7 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  Climatisation: 'M4 10h16M4 14h16M8 6l-4 4 4 4M16 6l4 4-4 4',
  Parking: 'M3 3h14v14H3zM7 7h3a2 2 0 0 1 0 4H7z',
}

interface AmenitiesProps {
  amenities: string[]
}

export function ApartmentAmenities({ amenities }: AmenitiesProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-0 border-t border-divider pt-8 md:grid-cols-[1fr_200px]">
      <div>
        <p className="text-silver text-xs font-bold uppercase leading-[15px] tracking-[0.24px]">
          Ce que propose le logement
        </p>

        <ul className="mt-6 flex flex-col gap-2">
          {amenities.map((amenity) => (
            <li key={amenity} className="flex items-center gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                stroke="#59453d"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={AMENITY_ICONS[amenity] ?? 'M4 4h12v12H4z'} />
              </svg>
              <span className="text-ash text-xs font-normal leading-[45px]">{amenity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
