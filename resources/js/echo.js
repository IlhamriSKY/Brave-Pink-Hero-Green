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
  enableLogging: false,
  logToConsole: false,
  // Improved connection settings
  activityTimeout: 120000, // 2 minutes
  pongTimeout: 30000, // 30 seconds
  unavailableTimeout: 10000, // 10 seconds
  // Additional Pusher options for better stability
  cluster: undefined, // Disable cluster for local Reverb
  encrypted: false, // Set to true if using HTTPS
  authEndpoint: '/broadcasting/auth',
});

if (isDebugEnabled) {
  console.log('✅ [Echo Config] Echo instance created successfully');
}

export default window.Echo;
