import * as React from "react"
import { useState } from "react"
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

    // Common color presets
    const presetColors = [
      "#f784c5", "#1b602f", "#ff6b6b", "#4ecdc4", "#45b7d1", 
      "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f",
      "#bb8fce", "#85c1e9", "#f8c471", "#82e0aa", "#f1948a",
      "#000000", "#ffffff", "#808080", "#ff0000", "#00ff00", "#0000ff"
    ]

    return (
      <div className={cn("relative inline-block", className)}>
        <div className="flex items-center gap-2">
          {/* Color Swatch Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-12 h-8 p-0 border-2"
            style={{ backgroundColor: value }}
            onClick={() => setShowPicker(!showPicker)}
            disabled={disabled}
          >
            <span className="sr-only">Pick color</span>
          </Button>
          
          {/* Hidden HTML5 Color Input */}
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
            value={value}
            onChange={(e) => {
              const hexValue = e.target.value
              if (/^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
                onChange(hexValue)
              }
            }}
            className="w-20 h-8 text-xs font-mono"
            placeholder="#000000"
            disabled={disabled}
          />
        </div>

        {/* Color Preset Popup */}
        {showPicker && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-background border rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="grid grid-cols-7 gap-1 mb-3">
              {presetColors.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-6 h-6 p-0 border"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color)
                    setShowPicker(false)
                  }}
                  title={color}
                >
                  <span className="sr-only">{color}</span>
                </Button>
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="border-t pt-3">
              <label className="text-xs text-muted-foreground mb-1 block">
                Custom Color
              </label>
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value)
                  setShowPicker(false)
                }}
                className="w-full h-8 border border-input rounded cursor-pointer"
                aria-label="Custom color picker"
                title="Pick a custom color"
              />
            </div>
            
            {/* Close Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => setShowPicker(false)}
            >
              Close
            </Button>
          </div>
        )}
        
        {/* Backdrop to close picker */}
        {showPicker && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
        )}
      </div>
    )
  }
)

ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
