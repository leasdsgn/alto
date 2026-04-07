'use client'

import type { ButtonProps as HeroUIButtonProps } from '@heroui/react'
import type { VariantProps } from 'tailwind-variants'

import { Button as HeroUIButton, buttonVariants } from '@heroui/react'
import Link from 'next/link'
import { tv } from 'tailwind-variants'

const altoButton = tv({
  base: 'text-xs font-bold tracking-[0.24px]',
  defaultVariants: {
    variant: 'primary',
  },
  extend: buttonVariants,
  variants: {
    variant: {
      primary: 'bg-coffee text-cream rounded-sm btn-fill',
      outline: 'border-cream text-cream rounded-sm border bg-transparent btn-fill btn-fill-outline',
    },
  },
})

type AltoButtonVariants = VariantProps<typeof altoButton>
type ButtonProps = Omit<HeroUIButtonProps, 'className' | 'variant'> &
  AltoButtonVariants & {
    className?: string
    href?: string
    children?: React.ReactNode
  }

export function Button({ className, variant, href, children, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={altoButton({ className, variant })}
      >
        {children}
      </Link>
    )
  }

  return (
    <HeroUIButton
      className={altoButton({ className, variant })}
      type={props.type}
      isDisabled={props.isDisabled}
      onPress={props.onPress}
    >
      {children}
    </HeroUIButton>
  )
}
