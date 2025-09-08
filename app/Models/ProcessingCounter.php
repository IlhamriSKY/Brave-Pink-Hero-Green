<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * ProcessingCounter Model
 *
 * Represents individual image processing operations and manages
 * aggregated statistics for the application's processing counter feature.
 */
class ProcessingCounter extends Model
{
    use HasFactory;

    /**
     * The table associated with the model
     *
     * @var string
     */
    protected $table = 'processing_counter';

    /**
     * The attributes that are mass assignable
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_id',
        'status',
        'file_name',
        'started_at',
        'completed_at',
    ];

    /**
     * The attributes that should be cast to native types
     *
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get aggregated processing statistics
     *
     * Retrieves or creates the global processing statistics record.
     * Initializes with zero counts if no stats exist yet.
     *
     * @return \stdClass The statistics object with processing counts
     */
    public static function getStats()
    {
        $stats = DB::table('processing_stats')->first();

        if (!$stats) {
            // Create initial stats if none exist
            DB::table('processing_stats')->insert([
                'id' => 1,
                'total_processing' => 0,
                'total_completed' => 0,
                'total_failed' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $stats = DB::table('processing_stats')->first();
        }

        return $stats;
    }
}
