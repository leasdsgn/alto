'use client'

import {
  TextField,
  Label,
  Input as HeroUIInput,
  Description,
  FieldError,
} from '@heroui/react'

interface InputProps {
  label?: string
  description?: string
  placeholder?: string
  name?: string
  type?: string
  isRequired?: boolean
  className?: string
  errorMessage?: string
}

export function Input({
  label,
  description,
  placeholder,
  name,
  type = 'text',
  isRequired,
  className,
  errorMessage,
}: InputProps) {
  return (
    <TextField
      name={name}
      type={type}
      isRequired={isRequired}
      isInvalid={!!errorMessage}
      className={`w-full ${className ?? ''}`}
    >
      {label && (
        <Label className="text-coffee text-xs font-bold tracking-[0.24px]">{label}</Label>
      )}
      <HeroUIInput
        placeholder={placeholder}
        className="border-transparent text-coffee placeholder:text-taupe h-[42px] rounded-sm border bg-transparent px-4 text-sm"
      />
      {description && <Description className="text-taupe text-xs">{description}</Description>}
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </TextField>
  )
}
