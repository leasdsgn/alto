'use client'

import * as React from 'react'
import Link from 'next/link'
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: 'group/btn relative inline-flex min-w-[100px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-8 outline-none transition-colors duration-200 focus-visible:border-2 focus-visible:border-taupe disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  variants: {
    variant: {
      primary:
        'bg-coffee text-[#fffff8] hover:bg-taupe disabled:bg-silver aria-disabled:bg-silver active:bg-coffee active:shadow-[inset_0_2px_5px_0_rgba(48,26,10,0.5)]',
      secondary:
        'bg-transparent text-[#301a0a] border border-coffee hover:bg-silver hover:text-[#fffff8] hover:border-silver disabled:border-silver disabled:text-[#aba39e] disabled:bg-transparent aria-disabled:border-silver aria-disabled:bg-transparent aria-disabled:text-[#aba39e] active:bg-cream active:text-[#301a0a] active:shadow-[inset_0_2px_5px_0_rgba(48,26,10,0.5)]',
    },
    size: {
      regular: 'h-[50px] text-[14px] leading-[1.5] font-normal',
      small: 'h-8 text-[12px] leading-[1.55] font-bold',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'regular',
  },
})

type Variants = VariantProps<typeof button>

interface CommonProps {
  variant?: Variants['variant'] | 'outline'
  size?: Variants['size']
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  className?: string
  children: React.ReactNode
}

function resolveVariant(v: CommonProps['variant']): Variants['variant'] {
  return v === 'outline' ? 'secondary' : v
}

function IconSlot({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex size-4 shrink-0 items-center justify-center">{children}</span>
}

interface ButtonAsButton extends CommonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  href?: undefined
  isDisabled?: boolean
}

interface ButtonAsLink extends CommonProps {
  href: string
  isDisabled?: boolean
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  prefetch?: boolean | null
}

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button(props: ButtonProps) {
  const { variant, size, iconLeft, iconRight, className, children } = props
  const cls = button({ variant: resolveVariant(variant), size, className })

  const content = (
    <>
      {iconLeft && <IconSlot>{iconLeft}</IconSlot>}
      <span className="whitespace-nowrap">{children}</span>
      {iconRight && <IconSlot>{iconRight}</IconSlot>}
    </>
  )

  if ('href' in props && props.href) {
    const { href, target, rel, isDisabled, prefetch } = props
    if (isDisabled) {
      return (
        <span className={cls} aria-disabled="true">
          {content}
        </span>
      )
    }
    return (
      <Link href={href} target={target} rel={rel} prefetch={prefetch ?? false} className={cls}>
        {content}
      </Link>
    )
  }

  const { isDisabled, disabled, type = 'button', ...rest } = props as ButtonAsButton
  return (
    <button {...rest} type={type} disabled={disabled ?? isDisabled} className={cls}>
      {content}
    </button>
  )
}
