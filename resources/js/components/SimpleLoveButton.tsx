import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Particle } from '@/types/love';

interface SimpleLoveButtonProps {
  className?: string;
}

export const SimpleLoveButton: React.FC<SimpleLoveButtonProps> = ({ className }) => {
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastEventId = useRef<string>('');

  // Helper function for conditional debugging
  const debugLog = (message: string, ...args: any[]) => {
    if (import.meta.env.VITE_WEBSOCKET_DEBUG === 'true') {
      console.log(message, ...args);
    }
  };

  const debugWarn = (message: string, ...args: any[]) => {
    if (import.meta.env.VITE_WEBSOCKET_DEBUG === 'true') {
      console.warn(message, ...args);
    }
  };

  const debugError = (message: string, ...args: any[]) => {
    if (import.meta.env.VITE_WEBSOCKET_DEBUG === 'true') {
      console.error(message, ...args);
    }
  };

  // Create Instagram Live-style floating heart particles
  const createParticles = useCallback(() => {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (!buttonRect) {
      debugWarn('⚠️ [Animation] Button ref not available, using fallback position');
      // Fallback: use fixed position if button ref not available
      createParticlesAtPosition(window.innerWidth - 100, window.innerHeight - 100);
      return;
    }

    // Always start from button position for consistency
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    debugLog(`🎨 [Animation] Creating particles at button position: ${startX}, ${startY}`);
    createParticlesAtPosition(startX, startY);
  }, []);

  // Separate function to create particles at specific position
  const createParticlesAtPosition = useCallback((startX: number, startY: number) => {
    debugLog(`🎨 [Animation] Creating particles at position: ${startX}, ${startY}`);

    // Instagram Live style: random sized floating hearts
    const heartCount = Math.floor(Math.random() * 3) + 5; // 5-7 hearts
    const heartColors = ['#ff1744', '#e91e63', '#ff4569', '#ff6b6b', '#ff8a80'];

    for (let i = 0; i < heartCount; i++) {
      const particle: Particle = {
        id: `${Date.now()}-${Math.random()}-${i}`,
        x: startX + (Math.random() - 0.5) * 25, // Tighter spread around button
        y: startY,
        life: 1,
        velocity: {
          x: (Math.random() - 0.5) * 1, // Gentler horizontal drift
          y: -2.5 - Math.random() * 0.5, // Consistent upward float
        },
        delay: i * 50 + Math.random() * 100, // Faster stagger for more dynamic effect
        size: 0.4 + Math.random() * 0.8, // More random sizes (0.4x - 1.2x)
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
      };

      // Add particles with delay for Instagram effect
      setTimeout(() => {
        setParticles(prev => [...prev, particle]);
      }, particle.delay || 0);
    }

    debugLog(`✅ [Animation] Created ${heartCount} particles successfully`);
  }, []);

  // Hybrid approach: WebSocket with Polling fallback
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initializeConnection = async () => {
      debugLog('🔄 [WebSocket] Initializing connection...');

      try {
        // Try WebSocket first
        await tryWebSocketConnection();
      } catch (error) {
        debugError('❌ [WebSocket] Connection failed:', error);
        debugLog('🔄 [Fallback] Switching to polling mode...');
        setupPollingFallback();
      }
    };

    const tryWebSocketConnection = async () => {
      try {
        debugLog('🔌 [WebSocket] Loading Echo library...');
        // @ts-ignore
        await import('../echo.js');

        if (!window.Echo) {
          throw new Error('Echo not available');
        }

        debugLog('✅ [WebSocket] Echo library loaded successfully');
        const pusher = window.Echo.connector.pusher;

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          debugWarn('⏰ [WebSocket] Connection timeout after 10 seconds');
          debugLog('🔄 [Fallback] Switching to polling due to timeout...');
          setupPollingFallback();
        }, 10000);

        pusher.connection.bind('connected', () => {
          debugLog('🎉 [WebSocket] Successfully connected to WebSocket server!');
          clearTimeout(connectionTimeout);
          setConnectionStatus('connected');

          // Subscribe to love channel for animations
          debugLog('🔔 [WebSocket] Subscribing to love-counter channel...');
          window.Echo.channel('love-counter')
            .listen('LoveClicked', (e: any) => {
              debugLog('💖 [WebSocket] Received love event from another user!', e);
              createParticles(); // Trigger animation for other users' clicks
            });
        });

        pusher.connection.bind('disconnected', () => {
          debugWarn('⚠️ [WebSocket] Disconnected from WebSocket server');
          debugLog('🔄 [Fallback] Switching to polling due to disconnection...');
          setConnectionStatus('disconnected');
          setupPollingFallback();
        });

        pusher.connection.bind('error', (error: any) => {
          debugError('❌ [WebSocket] Connection error:', error);
          debugLog('🔄 [Fallback] Switching to polling due to error...');
          setConnectionStatus('error');
          setupPollingFallback();
        });

        pusher.connection.bind('unavailable', () => {
          debugWarn('⚠️ [WebSocket] WebSocket service unavailable');
          debugLog('🔄 [Fallback] Switching to polling due to service unavailable...');
          setConnectionStatus('error');
          setupPollingFallback();
        });

        cleanup = () => {
          clearTimeout(connectionTimeout);
          window.Echo?.leaveChannel('love-counter');
        };

      } catch (error) {
        debugError('💥 [WebSocket] Failed to initialize WebSocket:', error);
        throw error;
      }
    };

    const setupPollingFallback = () => {
      debugLog('📡 [Polling] Starting HTTP polling fallback mode');
      setConnectionStatus('connected'); // Show as connected for polling

      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Poll for new events every 2 seconds
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const response = await fetch('/api/love/poll', {
            headers: {
              'X-Last-Event-Id': lastEventId.current,
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.events && data.events.length > 0) {
              debugLog(`📡 [Polling] Received ${data.events.length} new events`);
              data.events.forEach((event: any) => {
                debugLog('💖 [Polling] Processing love event:', event);
                lastEventId.current = event.id;
                // Trigger animation for each event
                createParticles();
              });
            }
          } else {
            debugWarn('⚠️ [Polling] HTTP polling request failed:', response.status);
          }
        } catch (error) {
          debugError('❌ [Polling] Polling request error:', error);
        }
      }, 2000);

      debugLog('✅ [Polling] HTTP polling started successfully (2-second interval)');
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

  const handleClick = async () => {
    if (isClicking) return;

    debugLog('💖 [Love Button] Button clicked!');
    setIsClicking(true);

    try {
      debugLog('📤 [Love Button] Sending love click to server...');
      const response = await fetch('/api/love/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        debugLog('✅ [Love Button] Server response:', data);
        debugLog('🎨 [Love Button] Creating particle animation for sender...');
        // Create particles when click is successful
        createParticles(); // Uses button position automatically
        debugLog('🎨 [Love Button] Particle animation triggered for sender');
      } else {
        debugWarn('⚠️ [Love Button] Server returned error:', response.status, response.statusText);
      }
    } catch (error) {
      debugError('❌ [Love Button] Network error:', error);
    } finally {
      setTimeout(() => setIsClicking(false), 300);
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
                width: 16 * (particle.size || 1), // Smaller base size
                height: 16 * (particle.size || 1),
                zIndex: 9999, // Ensure above all elements
              }}
              initial={{
                scale: 0.2, // Start small
                opacity: 0,
                y: 0,
                x: 0
              }}
              animate={{
                scale: [0.2, 1.5, 0], // Small → Big → Gone (continuous growth then shrink)
                opacity: [0, 1, 0], // Fade in → Full → Fade out
                y: -200, // Much higher float distance
                x: (Math.random() - 0.5) * 50, // More horizontal drift
              }}
              exit={{
                scale: 0,
                opacity: 0
              }}
              transition={{
                duration: 2.5, // Faster animation
                ease: "easeOut", // Simple easing for natural movement
                scale: {
                  duration: 2.5,
                  times: [0, 0.6, 1], // Grow until 60%, then shrink quickly
                  ease: "easeOut"
                },
                opacity: {
                  duration: 2.5,
                  times: [0, 0.15, 1], // Very quick fade in, slow fade out
                  ease: "easeOut"
                },
                y: {
                  duration: 2.5,
                  ease: "easeOut" // Slightly faster upward movement
                },
                x: {
                  duration: 2.5,
                  ease: "easeOut" // Natural horizontal drift
                }
              }}
              onAnimationComplete={() => {
                // Remove particle after animation completes
                setParticles(prev => prev.filter(p => p.id !== particle.id));
              }}
            >
              <Heart
                className="w-full h-full filter drop-shadow-md"
                style={{
                  color: particle.color,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                }}
                fill={particle.color}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Love Button */}
      <Button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isClicking}
        variant="ghost"
        size="sm"
        className={cn(
          'relative overflow-hidden group transition-all duration-300 p-2 rounded-full',
          'hover:bg-red-50 hover:scale-110 dark:hover:bg-red-950/20',
          'focus:bg-red-50 focus:scale-110 dark:focus:bg-red-950/20',
          isClicking && 'scale-95',
          'w-10 h-10'
        )}
      >
        {/* Pulse Animation Background */}
        <AnimatePresence>
          {isClicking && (
            <motion.div
              className="absolute inset-0 bg-red-400/20 rounded-md"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Heart Icon with Animation */}
        <motion.div
          animate={isClicking ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={cn(
              'w-15 h-15 transition-colors duration-300',
              isClicking
                ? 'text-red-500 fill-red-500'
                : 'text-red-400 group-hover:text-red-500 group-hover:fill-red-500'
            )}
          />
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
