import * as React from "react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ value, onChange, className, disabled, ...props }, ref) => {
    return (
      <div className={cn("relative inline-block", className)}>
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-12 h-8 rounded-md border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            "appearance-none bg-transparent",
            "[&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-sm",
            "[&::-moz-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-sm"
          )}
          {...props}
        />
      </div>
    )
  }
)

ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
