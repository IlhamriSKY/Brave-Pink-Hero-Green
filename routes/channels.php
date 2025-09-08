<?php

/**
 * Broadcast Channels
 *
 * Defines WebSocket broadcast channels for real-time features.
 * All channels are public since the app doesn't require user authentication.
 */

use Illuminate\Support\Facades\Broadcast;

/**
 * Public love counter channel
 *
 * Broadcasts love button click events to all connected clients.
 * No authentication required - public feature for user engagement.
 */
Broadcast::channel('love-counter', function () {
    return true; // Allow all users to listen to love counter updates
});
