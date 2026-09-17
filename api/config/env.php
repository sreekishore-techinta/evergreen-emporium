<?php
/**
 * Environment configuration — Evergreen Media API
 *
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────
 * 1. Detect localhost vs production FIRST (before any override file).
 * 2. On localhost only → load api/config/env.local.php if it exists.
 * 3. On any other host (production / staging) → use hardcoded
 *    Hostinger credentials and IGNORE env.local.php entirely.
 *
 * This guarantees that even if env.local.php is accidentally uploaded
 * to the live server it will NEVER affect the production DB connection.
 */

// ── 1. Detect environment FIRST ───────────────────────────────────
$_host = $_SERVER['HTTP_HOST'] ?? '';

// Treat as local only when host is explicitly a loopback / dev address
$_isLocal = (
    $_host === 'localhost'             ||
    strpos($_host, 'localhost:') === 0 ||
    $_host === '127.0.0.1'            ||
    $_host === '[::1]'                ||
    substr($_host, -6) === '.local'   ||
    substr($_host, -5) === '.test'
);

// ── 2. Load local overrides (localhost only) ───────────────────────
if ($_isLocal && file_exists(__DIR__ . '/env.local.php')) {
    require_once __DIR__ . '/env.local.php';
}

// ── Auto-detect site root URL ──────────────────────────────────────
function _detect_app_url(): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $script = $_SERVER['SCRIPT_NAME'] ?? '/api/index.php';
    $root   = preg_replace('#/api(/.*)?$#', '', dirname($script));
    $root   = rtrim($root, '/');
    return "$scheme://$host$root";
}

// ── 3. Database credentials ────────────────────────────────────────
if (!defined('DB_HOST'))    define('DB_HOST',    getenv('DB_HOST') ?: 'localhost');
if (!defined('DB_PORT'))    define('DB_PORT',    getenv('DB_PORT') ?: '3306');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

if ($_isLocal) {
    // ── Local XAMPP ────────────────────────────────────────────────
    // (env.local.php may have already defined these; if () guards skip them)
    if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'evergreen_emporium');
    if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'root');
    if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: '');
} else {
    // ── Hostinger / Production ─────────────────────────────────────
    // env.local.php is NOT loaded here — constants are always set below.
    // Works for any domain: hostingersite.com, evergreenmedia.in, custom, etc.
    if (!defined('DB_NAME')) define('DB_NAME', 'u910074219_evergreen');
    if (!defined('DB_USER')) define('DB_USER', 'u910074219_evergreen');
    if (!defined('DB_PASS')) define('DB_PASS', 'Techinta@2026');
}

// ── App ───────────────────────────────────────────────────────────
if (!defined('APP_NAME'))  define('APP_NAME',  'Evergreen Media');
if (!defined('APP_URL'))   define('APP_URL',   getenv('APP_URL')   ?: _detect_app_url());
if (!defined('API_URL'))   define('API_URL',   getenv('API_URL')   ?: APP_URL . '/api');
if (!defined('ADMIN_URL')) define('ADMIN_URL', getenv('ADMIN_URL') ?: APP_URL . '/admin');

// ── JWT ───────────────────────────────────────────────────────────
if (!defined('JWT_SECRET'))       define('JWT_SECRET',       getenv('JWT_SECRET')       ?: 'evergreen_jwt_secret_change_in_production_2026');
if (!defined('JWT_EXPIRY'))       define('JWT_EXPIRY',       (int)(getenv('JWT_EXPIRY')       ?: 86400));   // 24 h
if (!defined('JWT_ADMIN_EXPIRY')) define('JWT_ADMIN_EXPIRY', (int)(getenv('JWT_ADMIN_EXPIRY') ?: 28800)); // 8 h

// ── File uploads ──────────────────────────────────────────────────
if (!defined('UPLOAD_DIR'))    define('UPLOAD_DIR',    __DIR__ . '/../../api/uploads/');
if (!defined('UPLOAD_URL'))    define('UPLOAD_URL',    API_URL . '/uploads/');
if (!defined('MAX_FILE_SIZE')) define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB
if (!defined('ALLOWED_TYPES')) define('ALLOWED_TYPES', ['image/jpeg','image/png','image/webp','image/gif']);
if (!defined('ALLOWED_EXT'))   define('ALLOWED_EXT',   ['jpg','jpeg','png','webp','gif']);

// ── CORS ──────────────────────────────────────────────────────────
if (!defined('CORS_ORIGINS')) define('CORS_ORIGINS', array_filter(array_unique([
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
    'https://white-armadillo-804949.hostingersite.com',
    'https://www.evergreenmedia.in',
    'https://evergreenmedia.in',
    APP_URL,
    getenv('CORS_EXTRA') ?: '',
])));

// ── Security ──────────────────────────────────────────────────────
if (!defined('BCRYPT_COST')) define('BCRYPT_COST', 12);
if (!defined('RATE_LIMIT'))  define('RATE_LIMIT',  100); // requests/min/IP

// ── Pagination ────────────────────────────────────────────────────
if (!defined('DEFAULT_PAGE_SIZE')) define('DEFAULT_PAGE_SIZE', 20);
if (!defined('MAX_PAGE_SIZE'))     define('MAX_PAGE_SIZE',     100);

// ── Environment ───────────────────────────────────────────────────
if (!defined('APP_ENV'))   define('APP_ENV',   getenv('APP_ENV') ?: ($_isLocal ? 'development' : 'production'));
if (!defined('APP_DEBUG')) define('APP_DEBUG', APP_ENV === 'development');
