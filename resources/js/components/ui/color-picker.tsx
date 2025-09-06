import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import { SketchPicker, ColorResult } from 'react-color'
import { Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ value, onChange, className, disabled, ...props }, ref) => {
    const { t } = useTranslation()
    const [currentColor, setCurrentColor] = useState(value)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tempColor, setTempColor] = useState(value)

    // Update local color when prop changes
    useEffect(() => {
      setCurrentColor(value)
      setTempColor(value)
    }, [value])

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = ''
        }
      }
    }, [isModalOpen])

    const handleColorChange = useCallback((color: ColorResult) => {
      setTempColor(color.hex)
    }, [])

    const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const hexValue = e.target.value
      // Validate hex color format
      if (/^#[0-9A-F]{0,6}$/i.test(hexValue)) {
        setCurrentColor(hexValue)
        onChange(hexValue)
      }
    }, [onChange])

    const openColorPicker = useCallback(() => {
      if (!disabled) {
        setTempColor(currentColor)
        setIsModalOpen(true)
      }
    }, [disabled, currentColor])

    const handleApplyColor = useCallback(() => {
      setCurrentColor(tempColor)
      onChange(tempColor)
      setIsModalOpen(false)
    }, [tempColor, onChange])

    const handleCancelColor = useCallback(() => {
      setTempColor(currentColor)
      setIsModalOpen(false)
    }, [currentColor])

    const handleModalClose = useCallback(() => {
      setTempColor(currentColor)
      setIsModalOpen(false)
    }, [currentColor])

    return (
      <>
        <div className={cn("relative", className)}>
          <div className="flex items-center gap-2 w-full">
            {/* Color Preview Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-10 h-8 p-0 border-2 flex-shrink-0 relative overflow-hidden hover:scale-105 transition-transform duration-200"
              onClick={openColorPicker}
              disabled={disabled}
              style={{ '--color-preview': currentColor } as React.CSSProperties}
            >
              <div className="w-full h-full flex items-center justify-center color-preview-bg rounded-sm">
                {/* Fallback icon if color is transparent */}
                {(!currentColor || currentColor === 'transparent') && (
                  <Palette className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </Button>

            {/* Visible input for ref forwarding */}
            <input
              ref={ref}
              type="hidden"
              value={currentColor}
              disabled={disabled}
              {...props}
            />

            {/* Hex Input */}
            <Input
              type="text"
              value={currentColor}
              onChange={handleHexInputChange}
              className="flex-1 h-8 text-xs font-mono"
              placeholder={t('colorPicker.hexPlaceholder')}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Color Picker Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleModalClose}
            />

            {/* Modal Content */}
            <div className="relative bg-background border border-border rounded-xl shadow-2xl w-fit overflow-hidden">
              <div className="p-4 space-y-4">
                {/* Sketch Color Picker */}
                <div className="flex justify-center">
                  <SketchPicker
                    color={tempColor}
                    onChange={handleColorChange}
                    disableAlpha={true}
                    presetColors={[]}
                    styles={{
                      default: {
                        picker: {
                          background: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          fontFamily: 'inherit',
                        },
                      },
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelColor}
                  >
                    {t('colorPicker.cancel')}
                  </Button>
                  <Button
                    onClick={handleApplyColor}
                    className="flex items-center gap-2"
                    style={{ '--color-preview': tempColor } as React.CSSProperties}
                  >
                    <div className="w-4 h-4 rounded border border-white/20 color-preview-temp"></div>
                    {t('colorPicker.apply')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
)

ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
