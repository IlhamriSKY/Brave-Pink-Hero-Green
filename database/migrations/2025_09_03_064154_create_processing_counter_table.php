<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('processing_counter', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index();
            $table->string('status')->default('processing'); // processing, completed, failed
            $table->string('file_name')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // Create a summary table for quick counting
        Schema::create('processing_stats', function (Blueprint $table) {
            $table->id();
            $table->integer('total_processing')->default(0);
            $table->integer('total_completed')->default(0);
            $table->integer('total_failed')->default(0);
            $table->timestamps();
        });

        // Insert initial stats record
        DB::table('processing_stats')->insert([
            'total_processing' => 0,
            'total_completed' => 0,
            'total_failed' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processing_counter');
        Schema::dropIfExists('processing_stats');
    }
};
