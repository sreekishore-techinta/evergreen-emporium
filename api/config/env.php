<?php
/**
 * Environment configuration
 * IMPORTANT: Do NOT commit real credentials. Copy this to env.local.php and override.
 *
 * Production setup (cPanel):
 *   Set these in cPanel → Software → MultiPHP INI Editor, or create a .env.local.php
 *   that overrides these defaults.
 */

// ── Load local overrides if present (never committed) ─────────────
if (file_exists(__DIR__ . '/env.local.php')) {
    require_once __DIR__ . '/env.local.php';
}

// ── Auto-detect site root URL ──────────────────────────────────────
// Works on both XAMPP subfolder and production root domain
function _detect_app_url(): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // Strip /api/* from the path to get the site root
    $script = $_SERVER['SCRIPT_NAME'] ?? '/api/index.php';
    $root   = preg_replace('#/api(/.*)?$#', '', dirname($script));
    $root   = rtrim($root, '/');
    return "$scheme://$host$root";
}

// ── Database ──────────────────────────────────────────────────────
// IMPORTANT: Detection is fail-safe — we treat as LOCAL only when the host is
// explicitly a localhost/loopback address. Any other host (including custom
// domains on Hostinger) falls through to PRODUCTION credentials.
// This prevents a silent fallback to local root credentials when a custom
// domain is used on Hostinger that doesn't match the old allowlist.
$_host = $_SERVER['HTTP_HOST'] ?? '';

// Detect local development: localhost, 127.0.0.1, ::1, or any *.local / *.test domain
$_isLocal = (
    $_host === 'localhost'                  ||
    strpos($_host, 'localhost:') === 0      ||
    $_host === '127.0.0.1'                 ||
    $_host === '[::1]'                     ||
    substr($_host, -6) === '.local'        ||
    substr($_host, -5) === '.test'
);

if (!defined('DB_HOST'))    define('DB_HOST',    getenv('DB_HOST')  ?: 'localhost');
if (!defined('DB_PORT'))    define('DB_PORT',    getenv('DB_PORT')  ?: '3306');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

if ($_isLocal) {
    // ── Local XAMPP defaults ───────────────────────────────────────
    if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'evergreen_emporium');
    if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'root');
    if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: '');
} else {
    // ── Hostinger / live production credentials ────────────────────
    // Used for ALL non-localhost hosts: hostingersite.com, evergreenmedia.in,
    // custom domains, www subdomain, etc.
    if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'u910074219_evergreen');
    if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'u910074219_evergreen');
    if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: 'Techinta@2026');
}

// ── App ───────────────────────────────────────────────────────────
if (!defined('APP_NAME'))   define('APP_NAME',    'Evergreen Media');
// APP_URL: auto-detected from request, or overridden via env var / env.local.php
if (!defined('APP_URL'))    define('APP_URL',     getenv('APP_URL')     ?: _detect_app_url());
if (!defined('API_URL'))    define('API_URL',     getenv('API_URL')     ?: APP_URL . '/api');
if (!defined('ADMIN_URL'))  define('ADMIN_URL',   getenv('ADMIN_URL')   ?: APP_URL . '/admin');

// ── JWT ───────────────────────────────────────────────────────────
if (!defined('JWT_SECRET')) define('JWT_SECRET',  getenv('JWT_SECRET')  ?: 'evergreen_jwt_secret_change_in_production_2026');
if (!defined('JWT_EXPIRY')) define('JWT_EXPIRY',  (int)(getenv('JWT_EXPIRY') ?: 86400));   // 24 hours
if (!defined('JWT_ADMIN_EXPIRY')) define('JWT_ADMIN_EXPIRY', (int)(getenv('JWT_ADMIN_EXPIRY') ?: 28800)); // 8 hours

// ── File uploads ──────────────────────────────────────────────────
if (!defined('UPLOAD_DIR'))      define('UPLOAD_DIR',       __DIR__ . '/../../api/uploads/');
if (!defined('UPLOAD_URL'))      define('UPLOAD_URL',       API_URL . '/uploads/');
if (!defined('MAX_FILE_SIZE'))   define('MAX_FILE_SIZE',    5 * 1024 * 1024); // 5 MB
if (!defined('ALLOWED_TYPES'))   define('ALLOWED_TYPES',    ['image/jpeg','image/png','image/webp','image/gif']);
if (!defined('ALLOWED_EXT'))     define('ALLOWED_EXT',      ['jpg','jpeg','png','webp','gif']);

// ── CORS ──────────────────────────────────────────────────────────
// Allow both localhost dev ports and the live domain
if (!defined('CORS_ORIGINS')) define('CORS_ORIGINS', array_filter(array_unique([
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
    'https://white-armadillo-804949.hostingersite.com', // live domain root
    APP_URL,
    getenv('CORS_EXTRA') ?: '',
])));

// ── Security ──────────────────────────────────────────────────────
if (!defined('BCRYPT_COST'))   define('BCRYPT_COST', 12);
if (!defined('RATE_LIMIT'))    define('RATE_LIMIT',  100); // requests per minute per IP

// ── Pagination ────────────────────────────────────────────────────
if (!defined('DEFAULT_PAGE_SIZE')) define('DEFAULT_PAGE_SIZE', 20);
if (!defined('MAX_PAGE_SIZE'))     define('MAX_PAGE_SIZE',     100);

// ── Environment ───────────────────────────────────────────────────
if (!defined('APP_ENV'))   define('APP_ENV', getenv('APP_ENV') ?: 'production');
if (!defined('APP_DEBUG')) define('APP_DEBUG', APP_ENV === 'development');
