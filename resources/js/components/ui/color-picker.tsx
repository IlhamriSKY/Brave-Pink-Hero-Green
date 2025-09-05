import * as React from "react"
import { useState, useCallback } from "react"
import { ChromePicker, ColorResult } from 'react-color'
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
    const [showPicker, setShowPicker] = useState(false)

    const handleTogglePicker = useCallback(() => {
      if (!disabled) {
        setShowPicker(prev => !prev)
      }
    }, [disabled])

    const handleColorChange = useCallback((color: ColorResult) => {
      onChange(color.hex)
    }, [onChange])

    const handleColorChangeComplete = useCallback((color: ColorResult) => {
      onChange(color.hex)
    }, [onChange])

    const handleClose = useCallback(() => {
      setShowPicker(false)
    }, [])

    const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const hexValue = e.target.value
      if (/^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
        onChange(hexValue)
      }
    }, [onChange])

    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center gap-2 w-full">
          {/* Color Swatch Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 border-2 border-border flex-shrink-0 hover:scale-105 transition-transform duration-150"
            style={{ backgroundColor: value }}
            onClick={handleTogglePicker}
            disabled={disabled}
          >
            <span className="sr-only">Pick color</span>
          </Button>

          {/* Hidden HTML5 Color Input for accessibility */}
          <input
            ref={ref}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="sr-only"
            {...props}
          />

          {/* Hex Input */}
          <Input
            type="text"
            value={value.toUpperCase()}
            onChange={handleHexChange}
            className="flex-1 h-8 text-xs font-mono bg-background border-border"
            placeholder="#000000"
            disabled={disabled}
          />
        </div>

        {/* React Color Picker - Direct SketchPicker without presets */}
        {showPicker && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={handleClose}
            />

            {/* Color Picker Popup - Compact & Styled */}
            <div className="absolute top-full left-0 mt-2 z-50">
              <div className="bg-background border border-border rounded-lg shadow-lg p-2 w-[200px]">
                <style>{`
                  .chrome-picker input {
                    background-color: hsl(var(--background)) !important;
                    border: 1px solid hsl(var(--border)) !important;
                    border-radius: 4px !important;
                    color: hsl(var(--foreground)) !important;
                    font-size: 11px !important;
                    padding: 2px 4px !important;
                    box-shadow: none !important;
                  }
                  .chrome-picker label {
                    color: hsl(var(--muted-foreground)) !important;
                    font-size: 10px !important;
                  }
                  .chrome-picker .hue-horizontal {
                    border-radius: 6px !important;
                  }
                  .chrome-picker .hue-horizontal .hue-pointer {
                    border-radius: 50% !important;
                    transform: translate(-6px, -2px) !important;
                  }
                  .chrome-picker .saturation-white {
                    border-radius: 6px !important;
                  }
                  .chrome-picker .saturation-black {
                    border-radius: 6px !important;
                  }
                  .chrome-picker .chrome-controls {
                    display: flex !important;
                    align-items: center !important;
                  }
                  .chrome-picker .chrome-color {
                    display: none !important;
                  }
                  .chrome-picker .chrome-sliders {
                    flex: 1 !important;
                  }
                  .chrome-picker .chrome-controls > div:first-child {
                    display: none !important;
                  }
                  .chrome-picker .chrome-body .chrome-controls .chrome-color {
                    display: none !important;
                  }
                  .chrome-picker div[style*="width: 22px"] {
                    display: none !important;
                  }
                `}</style>
                <ChromePicker
                  color={value}
                  onChange={handleColorChange}
                  onChangeComplete={handleColorChangeComplete}
                  disableAlpha={true}
                  styles={{
                    default: {
                      picker: {
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        width: '100%',
                        fontFamily: 'inherit',
                      },
                      saturation: {
                        borderRadius: '6px',
                        height: '100px',
                      },
                      hue: {
                        borderRadius: '6px',
                        height: '8px',
                        marginTop: '4px',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)

ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
