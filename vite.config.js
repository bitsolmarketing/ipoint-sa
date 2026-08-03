import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
            // App serves from the repo root (index.php: $app->usePublicPath(__DIR__)),
            // so the dev-server hot file must live at the root, not public/, for @vite to detect it.
            hotFile: 'hot',
            // ...and for the same reason production assets must build straight to
            // ./build (the tracked, deployed directory) rather than public/build,
            // which is gitignored and never reaches the server.
            publicDirectory: '.',
        }),
        react(),
    ],
});
