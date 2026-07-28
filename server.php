<?php

/**
 * Router for PHP's built-in server: `php -S localhost:8000 server.php`
 *
 * The app serves from the repo root (index.php: $app->usePublicPath(__DIR__)),
 * so `php -S ... index.php` sends EVERY request through Laravel — including
 * /uploads/... image requests, which then come back as an HTML page instead of
 * the file. Apache does the right thing in production via the .htaccess
 * `RewriteCond %{REQUEST_FILENAME} !-f` rule; this mirrors it locally.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve real files (uploads, build assets, favicon) straight off disk.
if ($uri !== '/' && file_exists(__DIR__ . $uri) && is_file(__DIR__ . $uri)) {
    return false;
}

require_once __DIR__ . '/index.php';
