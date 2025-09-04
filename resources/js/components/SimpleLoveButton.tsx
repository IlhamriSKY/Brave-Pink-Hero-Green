import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Cat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Particle } from '@/types/love';

interface SimpleLoveButtonProps {
  className?: string;
}

export const SimpleLoveButton: React.FC<SimpleLoveButtonProps> = ({ className }) => {
  const { i18n } = useTranslation();
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastEventId = useRef<string>('');

  // Check if current language is Japanese
  const isJapanese = i18n.language === 'ja';

  // Helper function for conditional debugging
  const debugEnabled = import.meta.env.VITE_WEBSOCKET_DEBUG === 'true'
  const debugLog = (message: string, ...args: any[]) => { if (debugEnabled) console.log(message, ...args) }
  const debugWarn = (message: string, ...args: any[]) => { if (debugEnabled) console.warn(message, ...args) }
  const debugError = (message: string, ...args: any[]) => { if (debugEnabled) console.error(message, ...args) }

  // Create Instagram Live-style floating heart particles
  const createParticles = useCallback(() => {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (!buttonRect) {
      debugWarn('[Love] Button ref not available, using fallback position');
      // Fallback: use fixed position if button ref not available
      createParticlesAtPosition(window.innerWidth - 100, window.innerHeight - 100);
      return;
    }

    // Always start from button position for consistency
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    debugLog(`[Love] Creating particles at button position: ${startX}, ${startY}`);
    createParticlesAtPosition(startX, startY);
  }, []);

  // Separate function to create particles at specific position
  const createParticlesAtPosition = useCallback((startX: number, startY: number, countOverride?: number) => {
    debugLog(`[Love] Creating particles at position: ${startX}, ${startY}`);

    const baseCount = countOverride ?? (10 + Math.floor(Math.random() * 6)); // 10-15 hearts by default

    // Different colors for Japanese (cat colors) vs other languages (heart colors)
    const particleColors = isJapanese
      ? ['#ff6b35', '#ffa500', '#ffb347', '#ff8c00', '#ff7f50'] // Cat colors: orange tones
      : ['#ff1744', '#e91e63', '#ff4569', '#ff6b6b', '#ff8a80']; // Heart colors: pink/red tones

    // Poisson-like sampling in 1D (x direction) to avoid overlap
    const samples: number[] = [];
    const span = 80; // total horizontal span (+/- 40px)
    const minDist = 12; // min separation in px
    let attempts = 0;
    while (samples.length < baseCount && attempts < baseCount * 20) {
      attempts++;
      const candidate = (Math.random() - 0.5) * span;
      if (samples.every((s) => Math.abs(s - candidate) >= minDist)) {
        samples.push(candidate);
      }
    }

    samples.sort((a, b) => a - b);

    samples.forEach((dx, i) => {
      const rise = 200 + Math.random() * 160; // 200-360 px upward
      const drift = dx + (Math.random() - 0.5) * 10; // small extra jitter
      const duration = 1.5 + Math.random() * 0.8; // 1.5 - 2.3s
      const particle: Particle = {
        id: `${Date.now()}-${Math.random()}-${i}`,
        x: startX + dx,
        y: startY,
        life: 1,
        velocity: { x: 0, y: -3 },
        delay: i * 18 + Math.random() * 40, // waterfall upwards
        size: 0.6 + Math.random() * 0.7,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        drift,
        rise,
        duration,
      };
      setTimeout(() => setParticles((prev) => [...prev, particle]), particle.delay || 0);
    });

    debugLog(`[Love] Created ${samples.length} particles`);
  }, []);

  // Hybrid approach: WebSocket with Polling fallback
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initializeConnection = async () => {
      debugLog('[WS] Initializing connection');

      try {
        // Try WebSocket first
        await tryWebSocketConnection();
      } catch (error) {
        debugError('[WS] Connection failed:', error);
        debugLog('[Fallback] Switching to polling mode');
        setupPollingFallback();
      }
    };

    const tryWebSocketConnection = async () => {
      try {
        debugLog('[WS] Loading Echo library');
        // @ts-ignore
        await import('../echo.js');

        if (!window.Echo) {
          throw new Error('Echo not available');
        }

        debugLog('[WS] Echo library loaded');
        const pusher = window.Echo.connector.pusher;

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          debugWarn('[WS] Connection timeout after 10 seconds');
          debugLog('[Fallback] Switching to polling due to timeout');
          setupPollingFallback();
        }, 10000);

        pusher.connection.bind('connected', () => {
          debugLog('[WS] Connected');
          clearTimeout(connectionTimeout);
          setConnectionStatus('connected');

          // Subscribe to love channel for animations
          debugLog('[WS] Subscribing to love-counter');
          const channel = window.Echo.channel('love-counter')
          const handleEvent = (e: any) => {
            debugLog('[WS] Received love event', e);
            enqueueRemoteBurst();
          }
          // Support both default and custom names for safety
          channel.listen('.love.clicked', handleEvent)
          channel.listen('LoveClicked', handleEvent)
        });

        pusher.connection.bind('disconnected', () => {
          debugWarn('[WS] Disconnected');
          debugLog('[Fallback] Switching to polling due to disconnection');
          setConnectionStatus('disconnected');
          setupPollingFallback();
        });

        pusher.connection.bind('error', (error: any) => {
          debugError('[WS] Connection error:', error);
          debugLog('[Fallback] Switching to polling due to error');
          setConnectionStatus('error');
          setupPollingFallback();
        });

        pusher.connection.bind('unavailable', () => {
          debugWarn('[WS] Service unavailable');
          debugLog('[Fallback] Switching to polling due to service unavailable');
          setConnectionStatus('error');
          setupPollingFallback();
        });

        cleanup = () => {
          clearTimeout(connectionTimeout);
          window.Echo?.leaveChannel('love-counter');
        };

      } catch (error) {
        debugError('[WS] Failed to initialize WebSocket:', error);
        throw error;
      }
    };

    const setupPollingFallback = () => {
      debugLog('[Polling] Starting HTTP polling');
      setConnectionStatus('connected');

      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Adaptive polling: fast for first 10s (400ms), then 1000ms
      const start = Date.now();
      const fastDuration = 10000;
      const loop = async () => {
        const elapsed = Date.now() - start;
        const interval = elapsed < fastDuration ? 400 : 1000;
        try {
          const response = await fetch('/api/love/poll', {
            headers: { 'X-Last-Event-Id': lastEventId.current },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.events && data.events.length > 0) {
              debugLog(`[Polling] Received ${data.events.length} new events`);
              for (const event of data.events) {
                lastEventId.current = event.id;
                enqueueRemoteBurst();
              }
            }
          } else {
            debugWarn('[Polling] HTTP request failed:', response.status);
          }
        } catch (error) {
          debugError('[Polling] Request error:', error);
        } finally {
          pollingIntervalRef.current = window.setTimeout(loop, interval) as unknown as number;
        }
      };
      loop();

      debugLog('[Polling] Started (adaptive)');
    };

    initializeConnection();

    return () => {
      if (cleanup) cleanup();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createParticles, debugLog, debugWarn, debugError]);

  // Cleanup particles automatically via Framer Motion
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Listen for language changes to update button appearance
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render when language changes
      debugLog(`[Love] Language changed to: ${i18n.language}`);
    };

    // Listen for custom language change event from LanguageSwitcher
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [i18n.language, debugLog]);

  // Aggregate remote events to lighter bursts
  const pendingRemoteCount = useRef<number>(0);
  const flushTimer = useRef<number | null>(null);
  const enqueueRemoteBurst = useCallback(() => {
    pendingRemoteCount.current += 1;
    if (flushTimer.current) return;
    flushTimer.current = window.setTimeout(() => {
      const count = Math.min(8, Math.max(2, pendingRemoteCount.current));
      pendingRemoteCount.current = 0;
      flushTimer.current && clearTimeout(flushTimer.current);
      flushTimer.current = null;
      // Use button position burst for consistency
      const rect = buttonRef.current?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 100;
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight - 100;
      createParticlesAtPosition(x, y, count);
    }, 200);
  }, [createParticlesAtPosition]);

  const handleClick = async () => {
    debugLog('[Love] Button clicked');
    setIsClicking(true);

    // Create particles immediately for instant feedback (don't wait for server)
    debugLog('[Love] Creating instant particles for sender');
    // Local burst richer: 12-18 hearts
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 100;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight - 100;
    createParticlesAtPosition(x, y, 12 + Math.floor(Math.random() * 7));
    debugLog('[Love] Instant particles triggered');

    // Send to server in background (non-blocking)
    try {
      debugLog('[Love] Sending click to server');
      const response = await fetch('/api/love/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        debugLog('[Love] Server response received:', data);
      } else {
        debugWarn('[Love] Server returned error:', response.status, response.statusText);
      }
    } catch (error) {
      debugError('[Love] Network error:', error);
    } finally {
      // Quick reset for rapid clicking
      setTimeout(() => setIsClicking(false), 40);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400 animate-pulse';
      case 'disconnected': return 'bg-orange-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Particles Canvas */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: particle.x - 8,
                top: particle.y - 8,
                width: 16 * (particle.size || 1),
                height: 16 * (particle.size || 1),
                zIndex: 9999, // Ensure above all elements
              }}
              initial={{
                scale: 0.2,
                opacity: 0,
                y: 0,
                x: 0
              }}
              animate={{
                scale: [0.2, 1.1, 0],
                opacity: [0, 1, 0],
                y: -(particle.rise || 220),
                x: particle.drift ?? 0,
              }}
              exit={{
                scale: 0,
                opacity: 0
              }}
              transition={{
                duration: particle.duration || 1.9,
                ease: "easeOut",
                scale: {
                  duration: particle.duration || 1.9,
                  times: [0, 0.7, 1],
                  ease: "easeOut"
                },
                opacity: {
                  duration: particle.duration || 1.9,
                  times: [0, 0.2, 1],
                  ease: "easeOut"
                },
                y: {
                  duration: particle.duration || 1.9,
                  ease: "easeOut"
                },
                x: {
                  duration: (particle.duration || 1.9) + 0.3,
                  ease: "easeOut"
                }
              }}
              onAnimationComplete={() => {
                // Remove particle after animation completes
                setParticles(prev => prev.filter(p => p.id !== particle.id));
              }}
            >
              {isJapanese ? (
                <Cat
                  className="w-full h-full filter drop-shadow-md"
                  style={{
                    color: particle.color,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                  }}
                />
              ) : (
                <Heart
                  className="w-full h-full filter drop-shadow-md"
                  style={{
                    color: particle.color,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                  }}
                  fill={particle.color}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Love/Cat Button */}
      <Button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isClicking}
        variant="ghost"
        size="sm"
        className={cn(
          'relative overflow-hidden group transition-all duration-300 p-2 rounded-full',
          isJapanese
            ? 'hover:bg-orange-50 hover:scale-110 dark:hover:bg-orange-950/20 focus:bg-orange-50 focus:scale-110 dark:focus:bg-orange-950/20'
            : 'hover:bg-red-50 hover:scale-110 dark:hover:bg-red-950/20 focus:bg-red-50 focus:scale-110 dark:focus:bg-red-950/20',
          isClicking && 'scale-95',
          'w-10 h-10'
        )}
      >
        {/* Pulse Animation Background */}
        <AnimatePresence>
          {isClicking && (
            <motion.div
              className={cn(
                'absolute inset-0 rounded-md',
                isJapanese ? 'bg-orange-400/20' : 'bg-red-400/20'
              )}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Heart/Cat Icon with Animation */}
        <motion.div
          animate={isClicking ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isJapanese ? (
            <Cat
              className={cn(
                'w-15 h-15 transition-colors duration-300',
                isClicking
                  ? 'text-orange-500 fill-orange-500'
                  : 'text-orange-400 group-hover:text-orange-500 group-hover:fill-orange-500'
              )}
            />
          ) : (
            <Heart
              className={cn(
                'w-15 h-15 transition-colors duration-300',
                isClicking
                  ? 'text-red-500 fill-red-500'
                  : 'text-red-400 group-hover:text-red-500 group-hover:fill-red-500'
              )}
            />
          )}
        </motion.div>

        {/* Connection Status Indicator */}
        <div className={cn(
          'absolute -top-1 -right-1 w-2 h-2 rounded-full',
          getStatusColor()
        )} />
      </Button>
    </div>
  );
};
