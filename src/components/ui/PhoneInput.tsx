'use client'

import { Input } from '@/components/ui/input'
import { forwardRef } from 'react'

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onInput'> & {
  className?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        inputMode="numeric"
        maxLength={10}
        minLength={10}
        pattern="[6-9][0-9]{9}"
        title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9"
        className={className}
        onInput={(e) => {
          const input = e.currentTarget
          input.value = input.value.replace(/\D/g, '').slice(0, 10)
        }}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
