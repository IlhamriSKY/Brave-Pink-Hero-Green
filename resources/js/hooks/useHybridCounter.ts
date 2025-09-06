import { useState, useEffect, useCallback, useRef } from 'react';

interface HybridCounterStats {
  total_count: number;
  last_updated: string;
  is_animating?: boolean;
  display_count?: number; // For slot machine animation
}

// Cache for avoiding unnecessary API calls
const statsCache = {
  data: null as HybridCounterStats | null,
  timestamp: 0,
  ttl: 5000, // 5 seconds cache
};

export const useHybridCounter = () => {
  const [stats, setStats] = useState<HybridCounterStats>({
    total_count: 0,
    last_updated: '',
    is_animating: false,
    display_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Optimized fetch with cache and abort controller
  const fetchDatabaseCount = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (statsCache.data && (now - statsCache.timestamp) < statsCache.ttl) {
      return statsCache.data.total_count;
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/processing/stats', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const count = data.total_completed || 0;

        // Update cache
        statsCache.data = {
          total_count: count,
          last_updated: new Date().toISOString(),
          is_animating: false,
          display_count: count,
        };
        statsCache.timestamp = now;

        return count;
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch database count:', error);
      }
    }
    return statsCache.data?.total_count || 0;
  }, []);

  // Function to animate slot machine numbers
  const animateSlotMachine = useCallback((finalCount: number, duration: number = 2500) => {
    const startTime = Date.now();
    const finalCountString = finalCount.toString();
    const numDigits = finalCountString.length;

    const updateRandomNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        // Generate random number with same number of digits as final count
        let randomNumber = '';
        for (let i = 0; i < numDigits; i++) {
          if (i === 0 && numDigits > 1) {
            // First digit shouldn't be 0 for multi-digit numbers
            randomNumber += Math.floor(Math.random() * 9) + 1;
          } else {
            randomNumber += Math.floor(Math.random() * 10);
          }
        }

        setStats(prev => ({
          ...prev,
          display_count: parseInt(randomNumber),
          is_animating: true,
        }));

        // Decrease interval as we get closer to the end
        const interval = Math.max(50, 300 - (progress * 250));
        setTimeout(updateRandomNumber, interval);
      } else {
        // Animation complete - show final count
        setStats(prev => ({
          ...prev,
          display_count: finalCount,
          is_animating: false,
        }));
      }
    };

    updateRandomNumber();
  }, []);

  // Initialize with database count and slot machine animation
  const initializeStats = useCallback(async () => {
    try {
      // Start with loading state
      setStats({
        total_count: 0,
        last_updated: '',
        is_animating: true,
        display_count: 0,
      });

      const dbCount = await fetchDatabaseCount();

      // Update actual count but start slot machine animation
      setStats(prev => ({
        ...prev,
        total_count: dbCount,
        last_updated: new Date().toISOString(),
      }));

      // Start slot machine animation
      animateSlotMachine(dbCount);

    } catch (error) {
      console.error('Failed to initialize stats:', error);
      setStats({
        total_count: 0,
        last_updated: new Date().toISOString(),
        is_animating: false,
        display_count: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchDatabaseCount, animateSlotMachine]);

  // Optimized increment counter with debouncing for rapid uploads
  const incrementCounter = useCallback(async (fileName?: string) => {
    // Invalidate cache immediately
    statsCache.timestamp = 0;

    try {
      const response = await fetch('/api/processing/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          file_name: fileName || 'converted_image.png'
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const newTotal = data.total_completed;

        // Update cache with new data
        statsCache.data = {
          total_count: newTotal,
          last_updated: new Date().toISOString(),
          is_animating: false,
          display_count: newTotal,
        };
        statsCache.timestamp = Date.now();

        // Update state and start slot machine animation
        setStats(prev => ({
          ...prev,
          total_count: newTotal,
          last_updated: new Date().toISOString(),
        }));

        // Start slot machine animation for the new total
        animateSlotMachine(newTotal);

        // Dispatch event for other components (debounced)
        setTimeout(() => {
          window.dispatchEvent(new Event('hybridCounterUpdate'));
        }, 100);

        return { success: true, total_count: newTotal };
      } else {
        console.error('Failed to increment counter');
        return { success: false, total_count: stats.total_count };
      }
    } catch (error) {
      console.error('Failed to increment counter:', error);
      return { success: false, total_count: stats.total_count };
    }
  }, [stats.total_count, animateSlotMachine]);

  // Initialize on mount
  useEffect(() => {
    initializeStats();
  }, [initializeStats]);

  // Listen for counter update events
  useEffect(() => {
    const handleCounterUpdate = () => {
      initializeStats();
    };

    window.addEventListener('hybridCounterUpdate', handleCounterUpdate);

    return () => {
      window.removeEventListener('hybridCounterUpdate', handleCounterUpdate);
    };
  }, [initializeStats]);

  return {
    stats,
    isLoading,
    incrementCounter,
    refreshStats: initializeStats,
  };
};
