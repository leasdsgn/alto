interface QuartierProps {
  name: string
  description: string
  transit?: string
}

export function ApartmentQuartier({ name, description, transit }: QuartierProps) {
  return (
    <div className="mt-8 border-t border-divider pt-8">
      <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Le quartier</p>
      <h2 className="text-coffee mt-2 text-base font-medium leading-[24px]">{name}</h2>

      {description && (
        <p className="text-coffee mt-6 max-w-[408px] text-xs font-medium leading-[22px]">{description}</p>
      )}

      {transit && (
        <p className="text-taupe mt-4 max-w-[408px] text-xs font-medium leading-[22px]">{transit}</p>
      )}
    </div>
  )
}
