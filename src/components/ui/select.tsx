'use client'

import { Select as HeroUISelect, Label } from '@heroui/react'
import { ListBox, ListBoxItem } from 'react-aria-components'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  name?: string
  options: SelectOption[]
  className?: string
}

export function Select({ label, placeholder, name, options, className }: SelectProps) {
  return (
    <HeroUISelect name={name} className={`w-full ${className ?? ''}`}>
      {label && (
        <Label className="text-coffee text-xs font-bold tracking-[0.24px]">{label}</Label>
      )}
      <HeroUISelect.Trigger className="border-transparent text-coffee h-[42px] rounded-sm border bg-transparent px-4 text-sm">
        <HeroUISelect.Value>
          {({ isPlaceholder, selectedText }) =>
            isPlaceholder ? <span className="text-taupe">{placeholder}</span> : selectedText
          }
        </HeroUISelect.Value>
      </HeroUISelect.Trigger>
      <HeroUISelect.Popover className="bg-cream border-transparent rounded-sm border">
        <ListBox>
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              className="text-coffee hover:bg-sand cursor-pointer px-4 py-2 text-sm outline-none"
            >
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </HeroUISelect.Popover>
    </HeroUISelect>
  )
}
