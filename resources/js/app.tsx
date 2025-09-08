import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import './i18n' // Initialize i18n

/**
 * Inertia app bootstrap
 * 
 * Initializes the React application with Inertia.js integration.
 * Uses lazy page loading (code-splitting) for optimized bundle sizes.
 */
createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })
    const page = pages[`./Pages/${name}.tsx`]
    if (!page) {
      throw new Error(`Page ${name} not found`)
    }
    return page
  },
  setup({ el, App, props }) {
    if (!el) {
      throw new Error('Element not found')
    }
    createRoot(el).render(<App {...props} />)
  },
})
