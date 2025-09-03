<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LoveClicked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $userId;

    public function __construct(string $userId)
    {
        $this->userId = $userId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('love-counter'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'love.clicked';
    }

    public function broadcastWith(): array
    {
        // Do not expose session/user identifiers to clients for privacy
        return [
            'timestamp' => now()->toISOString(),
        ];
    }
}
