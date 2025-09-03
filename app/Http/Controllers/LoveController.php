<?php

namespace App\Http\Controllers;

use App\Events\LoveClicked;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class LoveController extends Controller
{
    public function click(Request $request)
    {
        $userId = $request->session()->getId();

        // Rate limiting: 10 clicks per 1 second per user (untuk spam experience)
        $key = 'love-click:' . $userId;

        if (RateLimiter::tooManyAttempts($key, 10)) {
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

            // Keep only last 50 events and clean old ones
            $events = array_filter($events, fn($e) => (time() - $e['created_at']) < 30);
            $events = array_slice($events, -50);

            Cache::put('love_events', $events, 60);

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
