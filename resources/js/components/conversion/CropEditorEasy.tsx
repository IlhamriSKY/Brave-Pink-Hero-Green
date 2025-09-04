import React, { useCallback, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CropEditorEasy({
  imageSrc,
  onConfirm,
  onCancel,
  className,
}: {
  imageSrc: string
  onConfirm: (areaPixels: Area) => void
  onCancel: () => void
  className?: string
}) {
  const { t } = useTranslation()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels)
  }, [])

  return (
    <div className={cn('relative w-full', className)} style={{ aspectRatio: '1 / 1' }}>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape="round"
        objectFit="contain"
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        classes={{
          containerClassName: 'rounded-lg overflow-hidden',
          mediaClassName: 'select-none',
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-white/70 rounded accent-primary"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={onCancel}
        >
          {t('conversion.actions.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={() => area && onConfirm(area)}
          disabled={!area}
        >
          {t('conversion.actions.apply')}
        </Button>
      </div>
    </div>
  )
}
