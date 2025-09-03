import React, { createContext, useContext, useState, useCallback } from 'react'

interface ProcessingContextType {
  isProcessing: boolean
  processedCount: number
  setIsProcessing: (processing: boolean) => void
  incrementCount: () => void
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined)

export function ProcessingProvider({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('processedImageCount') || '0', 10)
    }
    return 0
  })

  const incrementCount = useCallback(() => {
    setProcessedCount(prev => {
      const newCount = prev + 1
      if (typeof window !== 'undefined') {
        localStorage.setItem('processedImageCount', newCount.toString())
      }
      return newCount
    })
  }, [])

  return (
    <ProcessingContext.Provider value={{
      isProcessing,
      processedCount,
      setIsProcessing,
      incrementCount
    }}>
      {children}
    </ProcessingContext.Provider>
  )
}

export function useProcessing() {
  const context = useContext(ProcessingContext)
  if (context === undefined) {
    throw new Error('useProcessing must be used within a ProcessingProvider')
  }
  return context
}
