<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProcessingCounter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessingStatsController extends Controller
{
    public function getStats()
    {
        $stats = ProcessingCounter::getStats();

        return response()->json([
            'total_processing' => $stats->total_processing ?? 0,
            'total_completed' => $stats->total_completed ?? 0,
            'total_failed' => $stats->total_failed ?? 0,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Increment the conversion counter with race condition protection
     */
    public function incrementCounter(Request $request)
    {
        try {
            // Use database transaction for race condition protection
            $result = DB::transaction(function () use ($request) {
                $sessionId = $request->session()->getId() ?: 'anonymous_' . Str::random(10);
                $fileName = $request->input('file_name', 'converted_image.png');

                // Insert new processing record
                $processingRecord = DB::table('processing_counter')->insertGetId([
                    'session_id' => $sessionId,
                    'status' => 'completed',
                    'file_name' => $fileName,
                    'started_at' => now(),
                    'completed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Atomically increment the stats table using database-level increment
                DB::table('processing_stats')
                    ->where('id', 1)
                    ->increment('total_completed');

                // Get updated stats
                $stats = DB::table('processing_stats')->where('id', 1)->first();

                return [
                    'success' => true,
                    'processing_id' => $processingRecord,
                    'total_completed' => $stats->total_completed ?? 1,
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Failed to increment counter: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to increment counter',
                'total_completed' => ProcessingCounter::getStats()->total_completed ?? 0,
            ], 500);
        }
    }
}
