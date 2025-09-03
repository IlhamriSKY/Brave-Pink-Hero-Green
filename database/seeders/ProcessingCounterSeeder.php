<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessingCounterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        DB::table('processing_counter')->truncate();

        // Create 21 completed conversion records
        $completedConversions = [];
        for ($i = 1; $i <= 21; $i++) {
            $startedAt = now()->subDays(rand(1, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            $completedAt = $startedAt->copy()->addSeconds(rand(5, 30)); // Processing took 5-30 seconds

            $completedConversions[] = [
                'session_id' => 'seed_session_' . Str::random(10),
                'status' => 'completed',
                'file_name' => 'image_' . str_pad($i, 2, '0', STR_PAD_LEFT) . '.jpg',
                'started_at' => $startedAt,
                'completed_at' => $completedAt,
                'created_at' => $startedAt,
                'updated_at' => $completedAt,
            ];
        }

        // Insert all completed conversions
        DB::table('processing_counter')->insert($completedConversions);

        // Update processing_stats table
        DB::table('processing_stats')->updateOrInsert(
            ['id' => 1],
            [
                'total_processing' => 0,
                'total_completed' => 21,
                'total_failed' => 0,
                'updated_at' => now(),
            ]
        );

        $this->command->info('Created 21 completed image conversion records');
    }
}
