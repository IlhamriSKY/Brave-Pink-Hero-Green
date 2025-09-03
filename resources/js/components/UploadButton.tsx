import React, { useRef, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * UploadButton Component
 *
 * A reusable button component that triggers a file picker when clicked.
 * Provides proper accessibility support and customizable styling through shadcn/ui Button.
 *
 * @example
 * ```tsx
 * <UploadButton
 *   accept="image/*"
 *   onFiles={(files) => console.log(files)}
 * >
 *   Upload Images
 * </UploadButton>
 * ```
 */
const UploadButton = forwardRef<HTMLButtonElement, {
  /** File types to accept (e.g., "image/*", ".jpg,.png") */
  accept?: string
  /** Allow multiple file selection */
  multiple?: boolean
  /** Callback when files are selected */
  onFiles?: (files: FileList) => void
  /** Button content */
  children?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Disable the button */
  disabled?: boolean
  /** Button size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Button style variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
} & React.ComponentProps<'button'>>(({
  accept = "image/*",
  multiple = false,
  onFiles,
  children,
  className,
  disabled = false,
  size = "default",
  variant = "default",
  ...props
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles button click to trigger file picker
   */
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  /**
   * Handles file selection from the input
   *
   * @param event - Input change event
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList;
    if (files && files.length > 0 && onFiles) {
      onFiles(files);
    }
    // Reset input to allow selecting the same file again
    event.target.value = '';
  };

  /**
   * Handles keyboard interaction for accessibility
   *
   * @param event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <Button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        size={size}
        variant={variant}
        className={cn("cursor-pointer", className)}
        aria-label={`Select ${multiple ? 'files' : 'file'} to upload`}
        {...props}
      >
        {children}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
    </>
  );
});

UploadButton.displayName = 'UploadButton';

export { UploadButton };
