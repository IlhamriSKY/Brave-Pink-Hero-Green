import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining and merging CSS class names
 *
 * This function combines clsx for conditional class names with tailwind-merge
 * to handle Tailwind CSS class conflicts and duplicates intelligently.
 *
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Merged and optimized class string
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', condition && 'bg-blue-500', {
 *   'text-white': isActive,
 *   'text-gray-500': !isActive
 * })
 * ```
 *
 * @see {@link https://github.com/lukeed/clsx} clsx documentation
 * @see {@link https://github.com/dcastil/tailwind-merge} tailwind-merge documentation
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
