<?php

use App\Http\Controllers\LoveController;
use App\Http\Controllers\ProcessingStatsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
});

// Love Button API routes
Route::post('/api/love/click', [LoveController::class, 'click']);
Route::get('/api/love/poll', [LoveController::class, 'poll']);

// Processing Stats API routes (keep only stats for hybrid counter)
Route::get('/api/processing/stats', [ProcessingStatsController::class, 'getStats']);
Route::post('/api/processing/increment', [ProcessingStatsController::class, 'incrementCounter']);
