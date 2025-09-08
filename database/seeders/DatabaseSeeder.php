<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Main database seeder class
 *
 * Seeds the application's database with initial data for production use.
 * Currently only seeds processing counter statistics for the image conversion feature.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with production-ready data
     *
     * @return void
     */
    public function run(): void
    {
        // Seed processing counter with initial conversion statistics
        $this->call(ProcessingCounterSeeder::class);
    }
}
