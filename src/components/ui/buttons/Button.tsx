import * as Haptics from 'expo-haptics'
import React, { memo, useMemo } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { twMerge } from 'tailwind-merge'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'warning'

export interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  haptic?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  textClassName?: string
  fullWidth?: boolean
  onDisabledPress?: () => void
}

const BASE_CLASS = 'flex-row items-center justify-center gap-2 rounded-xl px-4 py-1.5'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-[#3b82f6]',
  secondary: 'border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900',
  success: 'bg-green-600',
  danger: 'border border-red-200/60 bg-white dark:border-red-800 dark:bg-neutral-900',
  ghost: 'bg-transparent',
  outline: 'border border-neutral-300 bg-transparent dark:border-neutral-700',
  warning: 'bg-yellow-500',
}

const TEXT_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-black dark:text-white',
  success: 'text-white',
  danger: 'text-red-600',
  ghost: 'text-blue-500',
  outline: 'text-neutral-700 dark:text-neutral-300',
  warning: 'text-yellow-500',
}

function ButtonComponent({
  title,
  variant = 'secondary',
  disabled = false,
  loading = false,
  haptic = true,
  leftIcon,
  rightIcon,
  className = '',
  textClassName = '',
  fullWidth = false,
  onPress,
  onDisabledPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const buttonClassName = useMemo(() => {
    return twMerge(
      BASE_CLASS,
      fullWidth && 'w-full',
      VARIANT_CLASS[variant],
      isDisabled && 'opacity-50',
      className,
    )
  }, [className, fullWidth, isDisabled, variant])

  const labelClassName = useMemo(() => {
    return twMerge('text-lg font-semibold', TEXT_VARIANT_CLASS[variant], textClassName)
  }, [textClassName, variant])

  const spinnerColor = variant === 'primary' ? '#FFFFFF' : '#6B7280'

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={(e) => {
        if (isDisabled) {
          onDisabledPress?.()
          return
        }

        if (haptic) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }

        onPress?.(e)
      }}
      className={buttonClassName}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {leftIcon}

          <Text numberOfLines={1} ellipsizeMode="tail" className={labelClassName}>
            {title}
          </Text>

          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  )
}

export const Button = memo(ButtonComponent)

Button.displayName = 'Button'
