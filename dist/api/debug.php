<?php
/**
 * ──────────────────────────────────────────────────────────────────
 * Evergreen Media — Live-Server Diagnostic Script
 * ──────────────────────────────────────────────────────────────────
 * USAGE:  Visit  https://your-domain.com/api/debug.php
 *
 * ⚠️  DELETE or RENAME this file after diagnosing the issue.
 *     It exposes environment info that should not be public.
 * ──────────────────────────────────────────────────────────────────
 */

// Simple IP-based gate: only accessible from localhost OR with the secret param
$allowedIPs = ['127.0.0.1', '::1'];
$secretKey  = 'evergreen_debug_2026';   // change if you like

$clientIP = $_SERVER['REMOTE_ADDR'] ?? '';
$provided = $_GET['key'] ?? '';

if (!in_array($clientIP, $allowedIPs, true) && $provided !== $secretKey) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden. Append ?key=' . $secretKey . ' to the URL.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/env.php';

$result = [];

// ── PHP & Server info ─────────────────────────────────────────────
$result['php_version']      = PHP_VERSION;
$result['sapi']             = PHP_SAPI;
$result['os']               = PHP_OS;
$result['extensions_loaded']= array_values(array_intersect(
    ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'],
    array_map('strtolower', get_loaded_extensions())
));
$result['missing_extensions'] = array_values(array_diff(
    ['pdo', 'pdo_mysql', 'json', 'mbstring'],
    array_map('strtolower', get_loaded_extensions())
));

// ── Environment constants ─────────────────────────────────────────
$result['APP_ENV']   = APP_ENV;
$result['APP_DEBUG'] = APP_DEBUG ? 'true' : 'false';
$result['APP_URL']   = APP_URL;
$result['API_URL']   = API_URL;
$result['DB_HOST']   = DB_HOST;
$result['DB_PORT']   = DB_PORT;
$result['DB_NAME']   = DB_NAME;
$result['DB_USER']   = DB_USER;
$result['DB_PASS']   = str_repeat('*', max(0, strlen(DB_PASS) - 2)) . substr(DB_PASS, -2);  // masked
$result['JWT_SECRET_length'] = strlen(JWT_SECRET);

// ── env.local.php present? ────────────────────────────────────────
$result['env_local_php_exists'] = file_exists(__DIR__ . '/config/env.local.php') ? 'YES ✓' : 'NO — create it with real DB creds!';

// ── URI routing test ──────────────────────────────────────────────
$uri       = $_SERVER['REQUEST_URI'] ?? '/';
$scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '/api/debug.php');
$result['raw_REQUEST_URI']  = $uri;
$result['SCRIPT_NAME_dir']  = $scriptDir;

// ── Database connection test ──────────────────────────────────────
try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::connect();
    $result['db_connection'] = 'OK ✓';

    // Check critical tables
    $tables = ['users','products','orders','order_items','payments','cart','cart_items','site_settings'];
    $existing = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $missing  = array_values(array_diff($tables, $existing));
    $result['db_tables_present'] = array_values(array_intersect($tables, $existing));
    $result['db_tables_MISSING'] = $missing ?: 'none — all OK ✓';

    // Check site_settings rows
    if (in_array('site_settings', $existing, true)) {
        $rows = $db->query("SELECT setting_key, value FROM site_settings")->fetchAll(PDO::FETCH_KEY_PAIR);
        $result['site_settings'] = [
            'shipping_charge'  => $rows['shipping_charge']  ?? '(not set)',
            'free_shipping_above' => $rows['free_shipping_above'] ?? '(not set)',
        ];
    }
} catch (Throwable $e) {
    $result['db_connection'] = 'FAILED ✗';
    $result['db_error']      = $e->getMessage();
}

// ── Authorization header test ─────────────────────────────────────
$authHeader = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? $_SERVER['Authorization']
    ?? (function_exists('getallheaders') ? (getallheaders()['Authorization'] ?? '') : '');
$result['auth_header_visible'] = $authHeader !== '' ? 'YES ✓ (' . substr($authHeader, 0, 20) . '...)' : 'NOT VISIBLE — check .htaccess';

// ── .htaccess check ───────────────────────────────────────────────
$result['api_htaccess_exists'] = file_exists(__DIR__ . '/.htaccess') ? 'YES ✓' : 'NO — missing!';

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
