<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ProcessingCounter extends Model
{
    use HasFactory;

    protected $table = 'processing_counter';

    protected $fillable = [
        'session_id',
        'status',
        'file_name',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

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
