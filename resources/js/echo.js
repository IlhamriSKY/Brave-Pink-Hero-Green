import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher globally available
window.Pusher = Pusher;

// Check if WebSocket debugging is enabled
const isDebugEnabled = import.meta.env.VITE_WEBSOCKET_DEBUG === 'true';

// Debug WebSocket configuration only if debug is enabled
if (isDebugEnabled) {
  console.log('🔧 [Echo Config] WebSocket configuration:');
  console.log('  📍 Host:', import.meta.env.VITE_REVERB_HOST || '127.0.0.1');
  console.log('  🔌 Port:', import.meta.env.VITE_REVERB_PORT || 8080);
  console.log('  🔑 Key:', import.meta.env.VITE_REVERB_APP_KEY || 'brave-love-key-2024');
  console.log('  🔐 Scheme:', import.meta.env.VITE_REVERB_SCHEME || 'http');
}

// Create Echo instance for Laravel Reverb
window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'brave-love-key-2024',
  wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  enableLogging: false, // Disable excessive logging
  logToConsole: false,
  // Connection timeout settings
  activityTimeout: 30000,
  pongTimeout: 30000,
  unavailableTimeout: 15000,
});

if (isDebugEnabled) {
  console.log('✅ [Echo Config] Echo instance created successfully');
}

export default window.Echo;
