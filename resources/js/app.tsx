import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { ProcessingProvider } from './contexts/ProcessingContext'
import './i18n' // Initialize i18n

/**
 * Inertia app bootstrap
 * Use lazy page loading (code-splitting) for smaller initial bundles.
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
    createRoot(el).render(
      <ProcessingProvider>
        <App {...props} />
      </ProcessingProvider>
    )
  },
})
