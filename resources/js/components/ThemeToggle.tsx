import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ThemeToggle Component
 *
 * A button component that toggles between light and dark themes.
 * Provides persistent theme storage and respects system preferences.
 *
 * Features:
 * - Automatic theme detection from system preferences
 * - LocalStorage persistence
 * - Custom event dispatch for theme changes
 * - Accessibility support with proper ARIA labels
 * - Hydration-safe rendering
 *
 * @param props - Component props extending Button props
 * @param props.className - Additional CSS classes
 * @param props.size - Button size variant
 */
export default function ThemeToggle({
  className,
  size = "icon",
  ...props
}: {
  className?: string;
  size?: 'icon' | 'sm' | 'default' | 'lg'
} & React.ComponentProps<'button'>) {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  /**
   * Initialize theme on component mount
   * Checks localStorage first, then falls back to system preference
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    applyTheme(shouldBeDark)
    setMounted(true)
  }, [])

  /**
   * Applies theme to the document root element
   *
   * @param dark - Whether to apply dark theme
   */
  const applyTheme = (dark: boolean) => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  /**
   * Handles theme toggle button click
   * Updates state, applies theme, saves to localStorage, and dispatches event
   */
  const handleToggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    applyTheme(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newIsDark ? 'dark' : 'light' }
    }))
  }

  // Prevent hydration mismatch with loading skeleton
  if (!mounted) {
    return (
      <div className={cn("w-9 h-9 bg-gray-200 rounded-md animate-pulse", className)} />
    )
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      className={cn(
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={`${t('theme.toggle')} - ${isDark ? t('theme.light') : t('theme.dark')}`}
      {...props}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  )
}
