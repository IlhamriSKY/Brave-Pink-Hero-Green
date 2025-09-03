import { useState, useEffect, useCallback } from 'react';

interface HybridCounterStats {
  total_count: number;
  last_updated: string;
  is_animating?: boolean;
  display_count?: number; // For slot machine animation
}

export const useHybridCounter = () => {
  const [stats, setStats] = useState<HybridCounterStats>({
    total_count: 0,
    last_updated: '',
    is_animating: false,
    display_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current count from database
  const fetchDatabaseCount = useCallback(async () => {
    try {
      const response = await fetch('/api/processing/stats');
      if (response.ok) {
        const data = await response.json();
        return data.total_completed || 0;
      }
    } catch (error) {
      console.error('Failed to fetch database count:', error);
    }
    return 0;
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

  // Increment counter via database API (race condition safe)
  const incrementCounter = useCallback(async (fileName?: string) => {
    try {
      const response = await fetch('/api/processing/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          file_name: fileName || 'converted_image.png'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newTotal = data.total_completed;

        // Update total count and start slot machine animation
        setStats(prev => ({
          ...prev,
          total_count: newTotal,
          last_updated: new Date().toISOString(),
        }));

        // Start slot machine animation for the new total
        animateSlotMachine(newTotal);

        // Dispatch event for other components
        window.dispatchEvent(new Event('hybridCounterUpdate'));

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
