<?php

namespace App\Http\Controllers;

use App\Events\LoveClicked;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

/**
 * LoveController
 *
 * Handles the "love button" feature that allows users to express appreciation
 * for the application. Implements rate limiting and real-time broadcasting
 * with polling fallback for cross-browser compatibility.
 */
class LoveController extends Controller
{
    /**
     * Handle love button click events
     *
     * Processes love button clicks with rate limiting to prevent spam.
     * Broadcasts events via WebSocket and caches them for polling fallback.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function click(Request $request)
    {
        $userId = $request->session()->getId();

        // Rate limiting: allow high burst for spam experience but keep guard
        $key = 'love-click:' . $userId;

        if (RateLimiter::tooManyAttempts($key, 100)) {
            return response()->json([
                'error' => 'Too many attempts. Please wait.'
            ], 429);
        }

        RateLimiter::hit($key, 1); // 1 second decay

        try {
            // Store event for polling fallback
            $eventId = uniqid();
            $eventData = [
                'id' => $eventId,
                // Do not include user identifier in payload returned to clients
                'timestamp' => now()->toISOString(),
                'created_at' => time()
            ];

            // Store in cache for 30 seconds
            $events = Cache::get('love_events', []);
            $events[] = $eventData;

            // Keep only recent events for fallback consumers
            $events = array_filter($events, fn($e) => (time() - $e['created_at']) < 12);
            $events = array_slice($events, -200);

            Cache::put('love_events', $events, 30);

            // Broadcast the event (no counter needed)
            broadcast(new LoveClicked($userId));

            return response()->json([
                'success' => true,
                'user_id' => $userId,
                'event_id' => $eventId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process love click: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Poll for love button events (fallback for WebSocket)
     *
     * Provides polling-based fallback for environments where WebSocket
     * connections are not available or reliable. Returns recent events
     * since the last received event ID.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function poll(Request $request)
    {
        $lastEventId = $request->header('X-Last-Event-Id', '');
        $events = Cache::get('love_events', []);

        // Filter events newer than last received
        if ($lastEventId) {
            $events = array_filter($events, function($event) use ($lastEventId) {
                return strcmp($event['id'], $lastEventId) > 0;
            });
        }

        // Only return events from last 10 seconds to avoid spam
        $events = array_filter($events, fn($e) => (time() - $e['created_at']) < 10);

        return response()->json([
            'events' => array_values($events),
            'timestamp' => now()->toISOString()
        ]);
    }
}
