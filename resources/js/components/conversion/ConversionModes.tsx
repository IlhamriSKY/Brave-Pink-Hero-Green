import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CONVERSION_MODES, DUOTONE_COLORS, type ConversionMode } from '@/utils/image/convert'
import { cn } from '@/lib/utils'

/**
 * ConversionModes
 *
 * Button group for selecting the duotone conversion mode.
 */
export default function ConversionModes({
  value = CONVERSION_MODES.DUOTONE_GP,
  onChange,
  disabled = false,
  className,
  ...props
}: {
  value?: ConversionMode
  onChange?: (mode: ConversionMode) => void
  disabled?: boolean
  className?: string
}) {
  const { t } = useTranslation()

  const modes: ConversionMode[] = [
    CONVERSION_MODES.DUOTONE_PG,
    CONVERSION_MODES.DUOTONE_GP,
  ]

  return (
    <div
      className={cn('w-full flex flex-col gap-2 sm:flex-row sm:gap-2', className)}
      role="radiogroup"
      aria-label={t('conversion.modes.label', 'Conversion mode')}
      {...props}
    >
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={value === mode ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onChange?.(mode)}
          disabled={disabled}
          className={cn(
            'transition-all duration-200 justify-start w-full sm:w-auto sm:min-w-[12rem] text-xs sm:text-sm overflow-hidden',
            mode === CONVERSION_MODES.DUOTONE_GP ? 'order-1 sm:order-2' : 'order-2 sm:order-1',
            value === mode && 'shadow-sm'
          )}
          aria-pressed={value === mode}
          role="radio"
          aria-checked={value === mode}
        >
          <span
            className="mr-2 inline-flex h-2 w-6 sm:w-8 rounded-full bg-gradient-to-r flex-shrink-0"
            style={{
              backgroundImage:
                mode === CONVERSION_MODES.DUOTONE_PG
                  ? `linear-gradient(to right, rgb(${DUOTONE_COLORS.PINK.join(',')}), rgb(${DUOTONE_COLORS.GREEN.join(',')}))`
                  : `linear-gradient(to right, rgb(${DUOTONE_COLORS.GREEN.join(',')}), rgb(${DUOTONE_COLORS.PINK.join(',')}))`,
            }}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">
            {mode === CONVERSION_MODES.DUOTONE_PG
              ? t('conversion.modes.duotone_pg', 'Duotone Pink→Green')
              : t('conversion.modes.duotone_gp', 'Duotone Green→Pink')}
          </span>
        </Button>
      ))}
    </div>
  )
}
