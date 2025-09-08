<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * AppServiceProvider
 * 
 * Main application service provider for registering and bootstrapping
 * application-specific services. Currently contains no custom logic
 * as the application uses standard Laravel features.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services
     * 
     * @return void
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services
     * 
     * @return void
     */
    public function boot(): void
    {
        //
    }
}
