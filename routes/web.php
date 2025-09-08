<?php

/**
 * Web Routes
 *
 * Main application routes for the Brave Pink Hero Green image conversion app.
 * Includes the main SPA route and API endpoints for love button and processing stats.
 */

use App\Http\Controllers\LoveController;
use App\Http\Controllers\ProcessingStatsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Main application route - serves the React SPA
 */
Route::get('/', function () {
    return Inertia::render('Home');
});

/**
 * Love Button API routes
 * Handles the interactive love button feature with real-time updates
 */
Route::post('/api/love/click', [LoveController::class, 'click']);
Route::get('/api/love/poll', [LoveController::class, 'poll']);

/**
 * Processing Stats API routes
 * Manages the image processing counter with atomic updates
 */
Route::get('/api/processing/stats', [ProcessingStatsController::class, 'getStats']);
Route::post('/api/processing/increment', [ProcessingStatsController::class, 'incrementCounter']);
