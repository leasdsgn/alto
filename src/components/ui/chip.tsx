'use client'

import type { VariantProps } from 'tailwind-variants'

import { tv } from 'tailwind-variants'

const chip = tv({
  base: 'flex h-[35px] items-center rounded-md px-5 text-xs font-bold tracking-[0.24px]',
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'bg-silver text-cream',
      active: 'bg-coffee text-cream',
    },
  },
})

type ChipVariants = VariantProps<typeof chip>

interface ChipProps extends ChipVariants {
  children: React.ReactNode
  className?: string
  onPress?: () => void
}

export function Chip({ children, variant, className, onPress }: ChipProps) {
  return (
    <button type="button" className={chip({ variant, className })} onClick={onPress}>
      {children}
    </button>
  )
}
