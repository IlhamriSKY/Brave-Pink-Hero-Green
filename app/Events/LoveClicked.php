<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * LoveClicked Event
 *
 * Broadcast event triggered when a user clicks the love button.
 * Implements ShouldBroadcastNow for immediate real-time broadcasting
 * to all connected clients via WebSocket.
 */
class LoveClicked implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The user session ID who triggered the event
     *
     * @var string
     */
    public string $userId;

    /**
     * Create a new event instance
     *
     * @param string $userId The session ID of the user who clicked love
     */
    public function __construct(string $userId)
    {
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('love-counter'),
        ];
    }

    /**
     * The event's broadcast name
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'love.clicked';
    }

    /**
     * Get the data to broadcast
     *
     * Only includes timestamp for privacy - no user identifiers
     * are exposed to connected clients.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        // Do not expose session/user identifiers to clients for privacy
        return [
            'timestamp' => now()->toISOString(),
        ];
    }
}
