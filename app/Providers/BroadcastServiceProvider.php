<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

/**
 * BroadcastServiceProvider
 * 
 * Service provider for configuring real-time broadcasting features.
 * Registers broadcast routes and loads channel definitions for
 * WebSocket communication in the love button feature.
 */
class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services
     * 
     * Registers broadcast routes and loads channel authorization
     * callbacks from the routes/channels.php file.
     * 
     * @return void
     */
    public function boot(): void
    {
        Broadcast::routes();

        require base_path('routes/channels.php');
    }
}
