<?php
/**
 * Environment configuration
 * IMPORTANT: Do NOT commit real credentials. Copy this to env.local.php and override.
 */

// ── Database ──────────────────────────────────────────────────────
define('DB_HOST',     getenv('DB_HOST')     ?: 'localhost');
define('DB_PORT',     getenv('DB_PORT')     ?: '3306');
define('DB_NAME',     getenv('DB_NAME')     ?: 'evergreen_emporium');
define('DB_USER',     getenv('DB_USER')     ?: 'root');
define('DB_PASS',     getenv('DB_PASS')     ?: '');
define('DB_CHARSET',  'utf8mb4');

// ── App ───────────────────────────────────────────────────────────
define('APP_NAME',    'Evergreen Media');
define('APP_URL',     getenv('APP_URL')     ?: 'http://localhost:8080');
define('API_URL',     getenv('API_URL')     ?: 'http://localhost/evergreen-emporium/api');
define('ADMIN_URL',   getenv('ADMIN_URL')   ?: 'http://localhost/evergreen-emporium/admin');

// ── JWT ───────────────────────────────────────────────────────────
define('JWT_SECRET',  getenv('JWT_SECRET')  ?: 'evergreen_jwt_secret_change_in_production_2026');
define('JWT_EXPIRY',  (int)(getenv('JWT_EXPIRY') ?: 86400));   // 24 hours
define('JWT_ADMIN_EXPIRY', (int)(getenv('JWT_ADMIN_EXPIRY') ?: 28800)); // 8 hours

// ── File uploads ──────────────────────────────────────────────────
define('UPLOAD_DIR',       __DIR__ . '/../uploads/');
define('UPLOAD_URL',       API_URL . '/uploads/');
define('MAX_FILE_SIZE',    5 * 1024 * 1024); // 5 MB
define('ALLOWED_TYPES',    ['image/jpeg','image/png','image/webp','image/gif']);
define('ALLOWED_EXT',      ['jpg','jpeg','png','webp','gif']);

// ── CORS ──────────────────────────────────────────────────────────
define('CORS_ORIGINS', [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
    APP_URL,
]);

// ── Security ──────────────────────────────────────────────────────
define('BCRYPT_COST', 12);
define('RATE_LIMIT',  100); // requests per minute per IP

// ── Pagination ────────────────────────────────────────────────────
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE',     100);

// ── Environment ───────────────────────────────────────────────────
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_DEBUG', APP_ENV === 'development');
