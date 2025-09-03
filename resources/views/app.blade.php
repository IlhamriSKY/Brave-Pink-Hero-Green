<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Brave-Pink Hero Green') }}</title>
        <meta name="description" content="Brave-Pink Hero Green - A modern web application combining courage, femininity, heroism and environmental sustainability">

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/logo.png">
        <link rel="apple-touch-icon" href="/logo.png">
        <link rel="shortcut icon" href="/logo.png">

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.tsx', 'resources/css/app.css'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gradient-to-br from-pink-50 via-white to-green-50">
        @inertia
    </body>
</html>
