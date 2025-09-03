import * as React from 'react'
import { cn } from '@/lib/utils'
import { MoveHorizontal } from 'lucide-react'

/**
 * Comparison
 *
 * Accessible before/after image comparison slider inspired by shadcn/ui visualization.
 * Provides mouse, touch, and keyboard interactions.
 */
export function Comparison({
  beforeSrc,
  afterSrc,
  alt = 'Image comparison',
  className,
  initialPosition = 50,
  beforeLabel = 'Before',
  afterLabel = 'After',
  naturalWidth,
  naturalHeight,
  objectFit = 'contain',
  style,
  ...props
}: {
  beforeSrc: string
  afterSrc: string
  alt?: string
  className?: string
  initialPosition?: number
  beforeLabel?: string
  afterLabel?: string
  naturalWidth?: number
  naturalHeight?: number
  objectFit?: 'contain' | 'cover'
  style?: React.CSSProperties
} & React.ComponentProps<'div'>) {
  const [position, setPosition] = React.useState(initialPosition)
  const [dragging, setDragging] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  const update = React.useCallback((clientX: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, pct)))
  }, [])

  const onMouseDown = React.useCallback((e: React.MouseEvent) => {
    setDragging(true)
    update(e.clientX)
  }, [update])

  const onMouseMove = React.useCallback((e: MouseEvent) => {
    if (dragging) update(e.clientX)
  }, [dragging, update])

  const onMouseUp = React.useCallback(() => setDragging(false), [])

  const onTouchStart = React.useCallback((e: React.TouchEvent) => {
    setDragging(true)
    update(e.touches[0].clientX)
  }, [update])

  const onTouchMove = React.useCallback((e: TouchEvent) => {
    if (dragging) {
      e.preventDefault()
      update(e.touches[0].clientX)
    }
  }, [dragging, update])

  const onTouchEnd = React.useCallback(() => setDragging(false), [])

  const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    const step = 2
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPosition((p) => Math.max(0, p - step))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setPosition((p) => Math.min(100, p + step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setPosition(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setPosition(100)
    }
  }, [])

  React.useEffect(() => {
    if (!dragging) return
    const mm = (e: MouseEvent) => onMouseMove(e)
    const mu = () => onMouseUp()
    const tm = (e: TouchEvent) => onTouchMove(e)
    const tu = () => onTouchEnd()
    document.addEventListener('mousemove', mm)
    document.addEventListener('mouseup', mu)
    document.addEventListener('touchmove', tm, { passive: false })
    document.addEventListener('touchend', tu)
    return () => {
      document.removeEventListener('mousemove', mm)
      document.removeEventListener('mouseup', mu)
      document.removeEventListener('touchmove', tm)
      document.removeEventListener('touchend', tu)
    }
  }, [dragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd])

  const containerStyle: React.CSSProperties = {
    ...(style || {}),
    ...(naturalWidth && naturalHeight
      ? { aspectRatio: `${naturalWidth} / ${naturalHeight}` }
      : {}),
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 select-none',
        className,
      )}
      style={containerStyle}
      {...props}
    >
      {/* Before */}
      <div className="relative w-full h-full">
        <img src={beforeSrc} alt={`${alt} - Before`} className={cn('w-full h-full pointer-events-none', objectFit === 'cover' ? 'object-cover' : 'object-contain')} />
        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 text-[10px] font-medium rounded">
          {beforeLabel}
        </div>
      </div>

      {/* After clipped */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={afterSrc} alt={`${alt} - After`} className={cn('w-full h-full pointer-events-none', objectFit === 'cover' ? 'object-cover' : 'object-contain')} />
        {position > 15 && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 text-[10px] font-medium rounded">
            {afterLabel}
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg cursor-ew-resize z-10" style={{ left: `${position}%` }}>
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-8 h-8 bg-white rounded-full shadow-lg cursor-ew-resize flex items-center justify-center',
            'transition-transform hover:scale-110 focus:scale-110 border-2 border-gray-200 dark:border-gray-700',
            dragging && 'scale-110',
          )}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Image comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
        >
          <MoveHorizontal className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    </div>
  )
}

export default Comparison
