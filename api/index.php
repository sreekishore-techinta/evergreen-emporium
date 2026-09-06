<?php
declare(strict_types=1);

// ── Bootstrap ─────────────────────────────────────────────────────
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/cors.php';   // Sets CORS headers + handles OPTIONS

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// ── Error handling ────────────────────────────────────────────────
set_error_handler(function(int $severity, string $message, string $file, int $line): bool {
    if (!APP_DEBUG) return true;
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "PHP Error: $message"]);
    exit;
});

set_exception_handler(function(Throwable $e): void {
    $message = APP_DEBUG ? $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine()
                         : 'An unexpected error occurred.';
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
});

// ── Dispatch ──────────────────────────────────────────────────────
$router = require_once __DIR__ . '/routes/router.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uri    = $_SERVER['REQUEST_URI'] ?? '/';

// Strip the base path if running under a sub-directory
$basePath = '/evergreen-emporium';
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}
$uri = '/' . ltrim($uri, '/');

$router->dispatch($method, $uri);
