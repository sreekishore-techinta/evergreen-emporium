<?php
require_once __DIR__ . '/env.php';

function setCorsHeaders(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    $allowed  = array_values(array_filter(array_unique(CORS_ORIGINS)));

    // Add http/https variants of every allowed origin
    $variants = [];
    foreach ($allowed as $o) {
        if (strncmp($o, 'https://', 8) === 0) {
            $variants[] = 'http://' . substr($o, 8);
        } elseif (strncmp($o, 'http://', 7) === 0) {
            $variants[] = 'https://' . substr($o, 7);
        }
    }
    $allowed = array_unique(array_merge($allowed, $variants));

    $matched = false;

    if ($origin !== '') {
        // 1. Exact match against allowed list
        if (in_array($origin, $allowed, true)) {
            $matched = true;
        }

        // 2. Always allow any localhost port (dev machines)
        if (!$matched && preg_match('#^https?://localhost(:\d+)?$#', $origin)) {
            $matched = true;
        }

        // 3. Same host as the server (same-origin requests arriving with Origin header)
        if (!$matched) {
            $serverHost = $_SERVER['HTTP_HOST'] ?? '';
            $originHost = parse_url($origin, PHP_URL_HOST) ?? '';
            if ($serverHost !== '' && strcasecmp($serverHost, $originHost) === 0) {
                $matched = true;
            }
        }
    }

    if ($matched) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setCorsHeaders();
    http_response_code(204);
    exit;
}

setCorsHeaders();
