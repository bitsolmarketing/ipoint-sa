<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Render native UI (scrollbars, form controls) to match the active scheme --}}
        <meta name="color-scheme" content="light dark">

        {{--
            Apply the colour scheme onto <html class="dark"> before paint, so there's
            no flash of the wrong theme. A saved choice from the ThemeToggle wins;
            otherwise this mirrors the browser/OS setting and keeps listening so the
            site flips live when the OS setting changes.
        --}}
        <script>
            (function () {
                var mq = window.matchMedia('(prefers-color-scheme: dark)');
                var apply = function (isDark) {
                    document.documentElement.classList.toggle('dark', isDark);
                };
                var saved = null;
                try { saved = localStorage.getItem('theme'); } catch (e) {}

                apply(saved ? saved === 'dark' : mq.matches);

                var onSystemChange = function (e) {
                    var current = null;
                    try { current = localStorage.getItem('theme'); } catch (err) {}
                    if (!current) apply(e.matches);
                };
                if (mq.addEventListener) {
                    mq.addEventListener('change', onSystemChange);
                } else if (mq.addListener) {
                    mq.addListener(onSystemChange);
                }
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;650;700;800;900&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])

        {{--
            Admin-configured colour palette (Admin → Appearance). Emitted after
            @vite so the html background rule wins over the compiled stylesheet.
            Defaults land on :root, overrides on .storefront-theme — see
            App\Support\ThemePalette.
        --}}
        <style id="theme-palette">{!! \App\Support\ThemePalette::css() !!}</style>
        <!-- HERE Maps SDK -->
        <link rel="stylesheet" type="text/css" href="https://js.api.here.com/v3/3.1/mapsjs-ui.css" />
        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-ui.js"></script>
        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"></script>

        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
