<?php
declare(strict_types=1);

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/cors.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// ── Error logging ─────────────────────────────────────────────────
function _logError(string $message): void {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
    @file_put_contents(
        $logDir . '/error.log',
        '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

// ── Error handling ────────────────────────────────────────────────
set_error_handler(function(int $errno, string $msg, string $file, int $line): bool {
    if (!($errno & (E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR))) return false;
    _logError("PHP[$errno]: $msg in $file:$line");
    if (APP_DEBUG) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
    return true;
});

set_exception_handler(function(Throwable $e): void {
    _logError(get_class($e) . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => APP_DEBUG
            ? $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine()
            : 'An unexpected error occurred.',
    ]);
    exit;
});

// ── Router ────────────────────────────────────────────────────────
$router = require_once __DIR__ . '/routes/router.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// ── URI normalisation ─────────────────────────────────────────────
// Routes are registered as /api/...
// Site is deployed at domain ROOT on Hostinger:
//   https://white-armadillo-804949.hostingersite.com/
//
// REQUEST_URI arrives as: /api/admin/auth/login
// We just need to ensure the URI starts at /api/
//
// Still handle legacy /evergreen-emporium/ prefix in case of old bookmarks:
//   /evergreen-emporium/api/admin/auth/login → /api/admin/auth/login

// Find first /api/ and strip everything before it
$pos = strpos($uri, '/api/');
if ($pos !== false) {
    $uri = substr($uri, $pos);
} elseif (strpos($uri, '/api') !== false) {
    $uri = '/api/' . ltrim(substr($uri, strpos($uri, '/api') + 4), '/');
} else {
    $uri = '/api/' . ltrim($uri, '/');
}

// Collapse accidental /api/api/ doubles
while (strpos($uri, '/api/api/') !== false) {
    $uri = str_replace('/api/api/', '/api/', $uri);
}

$uri = '/' . ltrim($uri, '/');
$router->dispatch($method, $uri);
