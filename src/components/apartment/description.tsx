interface DescriptionProps {
  highlight: string
  space?: string
}

export function ApartmentDescription({ highlight, space }: DescriptionProps) {
  return (
    <div className="mt-8 border-t border-divider pt-8">
      <p className="text-coffee max-w-[408px] text-base font-bold leading-[20px]">{highlight}</p>

      {space && (
        <p className="text-coffee mt-6 max-w-[408px] text-xs font-medium leading-[22px]">{space}</p>
      )}
    </div>
  )
}
