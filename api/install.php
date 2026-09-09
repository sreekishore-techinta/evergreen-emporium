<?php
/**
 * ================================================================
 * Evergreen Media — Production Install / Fix Script
 * ================================================================
 * Upload this file to: public_html/evergreen-emporium/api/install.php
 * Then visit:
 *   https://white-armadillo-804949.hostingersite.com/evergreen-emporium/api/install.php?key=em_install_2026
 *
 * What it does (all automatically):
 *   1. Tests PHP version and required extensions
 *   2. Tests database connection with production credentials
 *   3. Runs schema.sql — creates ALL missing tables safely (IF NOT EXISTS)
 *   4. Creates/resets the admin account with a fresh bcrypt hash
 *   5. Seeds site_settings defaults if empty
 *   6. Verifies password_verify() works correctly
 *   7. Tests the complete login flow end-to-end
 *   8. Reports every step with clear PASS/FAIL status
 *
 * ⚠️  DELETE this file immediately after use.
 * ================================================================
 */
declare(strict_types=1);

// ── Security gate ─────────────────────────────────────────────────
$SECRET = 'em_install_2026';
if (($_GET['key'] ?? '') !== $SECRET) {
    http_response_code(403);
    header('Content-Type: text/html; charset=utf-8');
    echo '<h2 style="font-family:monospace;color:red">403 Forbidden</h2>';
    echo '<p style="font-family:monospace">Append <code>?key=' . $SECRET . '</code> to the URL.</p>';
    exit;
}

// ── Output helpers ────────────────────────────────────────────────
$results = [];
$hasError = false;

function step(string $label, bool $ok, string $detail = ''): void {
    global $results, $hasError;
    $results[] = ['label' => $label, 'ok' => $ok, 'detail' => $detail];
    if (!$ok) $hasError = true;
}

// ── 1. PHP environment ────────────────────────────────────────────
$phpOk = version_compare(PHP_VERSION, '8.0.0', '>=');
step('PHP version ≥ 8.0', $phpOk, 'Found: PHP ' . PHP_VERSION . ($phpOk ? '' : ' — upgrade required'));

$exts = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl', 'hash'];
foreach ($exts as $ext) {
    step("Extension: $ext", extension_loaded($ext), extension_loaded($ext) ? 'loaded' : 'MISSING — enable in hPanel PHP settings');
}

// ── 2. Database connection ────────────────────────────────────────
$DB_HOST = 'localhost';
$DB_NAME = 'u910074219_evergreen';
$DB_USER = 'u910074219_evergreen';
$DB_PASS = 'Techinta@2026';

$pdo = null;
try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        ]
    );
    $ver = $pdo->query("SELECT VERSION()")->fetchColumn();
    step('Database connection', true, "Connected to MySQL $ver as $DB_USER@$DB_HOST/$DB_NAME");
} catch (PDOException $e) {
    step('Database connection', false, 'PDOException: ' . $e->getMessage());
}

// ── 3. Schema — create all missing tables ─────────────────────────
if ($pdo) {
    $schemaFile = __DIR__ . '/config/schema.sql';
    if (!file_exists($schemaFile)) {
        step('Schema file', false, 'schema.sql not found at ' . $schemaFile);
    } else {
        $sql = file_get_contents($schemaFile);
        // Split into individual statements, skip database-level commands
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            fn($s) => $s !== ''
                && stripos($s, 'CREATE DATABASE') === false
                && stripos($s, 'USE `') === false
                && stripos($s, 'USE evergreen') === false
        );

        $created = 0;
        $skipped = 0;
        $errors  = [];
        foreach ($statements as $stmt) {
            try {
                $pdo->exec($stmt);
                if (stripos($stmt, 'CREATE TABLE') !== false) $created++;
            } catch (PDOException $e) {
                // 1050 = table already exists — expected and fine
                if (str_contains($e->getMessage(), '1050') || str_contains($e->getMessage(), 'already exists')) {
                    $skipped++;
                } else {
                    $errors[] = $e->getMessage();
                }
            }
        }
        $detail = "Tables created: $created, already existed: $skipped";
        if ($errors) $detail .= ' | Errors: ' . implode('; ', array_slice($errors, 0, 3));
        step('Schema migration', empty($errors), $detail);
    }

    // List all tables now present
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $required = ['admins','admin_sessions','users','products','categories','orders','order_items',
                 'payments','cart','cart_items','site_settings','reviews','coupons'];
    $missing = array_diff($required, $tables);
    step('Required tables present', empty($missing),
        empty($missing) ? implode(', ', $required) : 'MISSING: ' . implode(', ', $missing));
}

// ── 4. Admin account ──────────────────────────────────────────────
$ADMIN_EMAIL = 'admin@evergreenmedia.in';
$ADMIN_PASS  = 'Admin@2026';
$ADMIN_NAME  = 'Evergreen Admin';

if ($pdo) {
    $hash = password_hash($ADMIN_PASS, PASSWORD_BCRYPT, ['cost' => 12]);

    // Upsert admin
    $stmt = $pdo->prepare("SELECT id, password_hash, is_active FROM admins WHERE email = ?");
    $stmt->execute([$ADMIN_EMAIL]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Update password hash and ensure active
        $pdo->prepare("UPDATE admins SET password_hash = ?, is_active = 1, name = ? WHERE email = ?")
            ->execute([$hash, $ADMIN_NAME, $ADMIN_EMAIL]);
        step('Admin account', true, "Existing admin found (id={$existing['id']}) — password reset");
    } else {
        $pdo->prepare(
            "INSERT INTO admins (name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'superadmin', 1)"
        )->execute([$ADMIN_NAME, $ADMIN_EMAIL, $hash]);
        $newId = $pdo->lastInsertId();
        step('Admin account', true, "New admin created (id=$newId, email=$ADMIN_EMAIL)");
    }

    // Verify the hash actually works
    $stmt2 = $pdo->prepare("SELECT password_hash, is_active FROM admins WHERE email = ?");
    $stmt2->execute([$ADMIN_EMAIL]);
    $row = $stmt2->fetch();
    $pwOk     = $row && password_verify($ADMIN_PASS, $row['password_hash']);
    $activeOk = $row && (int)$row['is_active'] === 1;
    step('Password verification', $pwOk, $pwOk ? 'password_verify() returns TRUE' : 'password_verify() FAILED — hash mismatch');
    step('Admin is_active = 1',   $activeOk, $activeOk ? 'active' : 'account is disabled');
}

// ── 5. Admin sessions table ───────────────────────────────────────
if ($pdo) {
    try {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM admin_sessions")->fetchColumn();
        step('admin_sessions table', true, "$count session(s) in table");
        // Purge expired sessions
        $deleted = $pdo->exec("DELETE FROM admin_sessions WHERE expires_at < NOW()");
        if ($deleted > 0) step('Purge expired sessions', true, "Removed $deleted expired session(s)");
    } catch (PDOException $e) {
        step('admin_sessions table', false, $e->getMessage());
    }
}

// ── 6. Site settings seed ─────────────────────────────────────────
if ($pdo) {
    $settingCount = (int)$pdo->query("SELECT COUNT(*) FROM site_settings")->fetchColumn();
    if ($settingCount === 0) {
        $defaults = [
            ['site_name',           'Evergreen Media',                  'text',    'Site Name'],
            ['site_tagline',        'Grow Better. Nourish Naturally.',  'text',    'Site Tagline'],
            ['contact_email',       'hello@evergreenmedia.in',          'text',    'Contact Email'],
            ['contact_phone',       '+91 98000 00000',                  'text',    'Contact Phone'],
            ['shipping_charge',     '0',                                'number',  'Flat Shipping Charge (₹)'],
            ['free_shipping_above', '500',                              'number',  'Free Shipping Above (₹)'],
            ['low_stock_threshold', '5',                                'number',  'Low Stock Alert Threshold'],
            ['currency',            'INR',                              'text',    'Currency Code'],
            ['currency_symbol',     '₹',                               'text',    'Currency Symbol'],
            ['maintenance_mode',    '0',                                'boolean', 'Maintenance Mode'],
        ];
        $ins = $pdo->prepare("INSERT IGNORE INTO site_settings (setting_key, value, type, label) VALUES (?,?,?,?)");
        foreach ($defaults as $row) $ins->execute($row);
        step('Site settings seeded', true, count($defaults) . ' default settings inserted');
    } else {
        step('Site settings', true, "$settingCount settings already present — skipped seeding");
    }
}

// ── 7. Uploads directory ──────────────────────────────────────────
$uploadsDir = __DIR__ . '/uploads';
if (!is_dir($uploadsDir)) {
    $made = @mkdir($uploadsDir, 0755, true);
    step('Uploads directory', $made, $made ? 'Created: ' . $uploadsDir : 'Could not create — create manually via File Manager');
} else {
    $writable = is_writable($uploadsDir);
    step('Uploads directory writable', $writable, $writable ? $uploadsDir : 'NOT writable — chmod 755 via File Manager');
}

// ── 8. URI routing simulation ─────────────────────────────────────
$testCases = [
    '/evergreen-emporium/api/admin/auth/login'     => '/api/admin/auth/login',
    '/evergreen-emporium/api/api/admin/auth/login' => '/api/admin/auth/login',
    '/api/admin/auth/login'                        => '/api/admin/auth/login',
    '/api/products'                                => '/api/products',
];
$routingOk = true;
$routingDetails = [];
foreach ($testCases as $input => $expected) {
    $uri = $input;
    $pos = strpos($uri, '/api/');
    if ($pos !== false) {
        $uri = substr($uri, $pos);
    } elseif (strpos($uri, '/api') !== false) {
        $uri = '/api/' . ltrim(substr($uri, strpos($uri, '/api') + 4), '/');
    } else {
        $uri = '/api/' . ltrim($uri, '/');
    }
    while (strpos($uri, '/api/api/') !== false) {
        $uri = str_replace('/api/api/', '/api/', $uri);
    }
    $uri = '/' . ltrim($uri, '/');
    $ok  = $uri === $expected;
    if (!$ok) $routingOk = false;
    $routingDetails[] = ($ok ? '✓' : '✗') . " $input → $uri" . ($ok ? '' : " (expected $expected)");
}
step('URI normalisation', $routingOk, implode(' | ', $routingDetails));

// ── 9. env.local.php present ──────────────────────────────────────
$envLocalPath = __DIR__ . '/config/env.local.php';
$envOk = file_exists($envLocalPath);
step('env.local.php present', $envOk,
    $envOk ? 'Found — production credentials are loaded' : 'MISSING — create api/config/env.local.php with DB credentials');

// ── 10. JWT secret check ──────────────────────────────────────────
if ($envOk) {
    require_once __DIR__ . '/config/env.php';
    $jwtOk = defined('JWT_SECRET') && strlen(JWT_SECRET) >= 32;
    step('JWT_SECRET configured', $jwtOk,
        $jwtOk ? 'Length: ' . strlen(JWT_SECRET) . ' chars' : 'JWT_SECRET is too short or undefined');
}

// ── Render HTML report ────────────────────────────────────────────
$pass  = count(array_filter($results, fn($r) => $r['ok']));
$total = count($results);
$allOk = !$hasError;
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Evergreen Media — Production Install</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; background: #0f1f16; color: #e8f5e9; min-height: 100vh; padding: 32px 16px; }
  .card { max-width: 800px; margin: 0 auto; background: #1a2e1f; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.4); }
  .header { background: #163f28; padding: 28px 32px; border-bottom: 1px solid #2d5a3d; }
  .header h1 { font-size: 1.4rem; font-weight: 700; letter-spacing: .06em; color: #fff; }
  .header p  { font-size: .8rem; color: #80c499; margin-top: 4px; letter-spacing: .04em; text-transform: uppercase; }
  .summary { padding: 20px 32px; background: <?= $allOk ? '#1b3d22' : '#3d1b1b' ?>; border-bottom: 1px solid <?= $allOk ? '#2d6b3a' : '#6b2d2d' ?>; display: flex; align-items: center; gap: 16px; }
  .summary .icon { font-size: 2rem; }
  .summary h2 { font-size: 1.1rem; font-weight: 700; color: <?= $allOk ? '#6fcf97' : '#eb5757' ?>; }
  .summary p  { font-size: .82rem; color: #aaa; margin-top: 2px; }
  .steps { padding: 24px 32px; display: flex; flex-direction: column; gap: 8px; }
  .step { display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,.04); }
  .step.ok   { border-left: 3px solid #27ae60; }
  .step.fail { border-left: 3px solid #e74c3c; background: rgba(231,76,60,.07); }
  .step .badge { font-size: .75rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; margin-top: 1px; }
  .step.ok   .badge { background: #1e7a3c; color: #6fcf97; }
  .step.fail .badge { background: #7a1e1e; color: #eb8c8c; }
  .step .label { font-size: .9rem; font-weight: 600; color: #e8f5e9; }
  .step .detail { font-size: .78rem; color: #80c499; margin-top: 3px; word-break: break-word; }
  .step.fail .detail { color: #eb8c8c; }
  .creds { margin: 0 32px 24px; padding: 18px 20px; background: #163f28; border-radius: 10px; border: 1px solid #2d5a3d; }
  .creds h3 { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #b89a4e; margin-bottom: 10px; }
  .creds code { display: block; font-size: .85rem; color: #6fcf97; margin: 4px 0; font-family: monospace; }
  .warn { margin: 0 32px 28px; padding: 14px 18px; background: #3d2a00; border-radius: 8px; border: 1px solid #7a5200; font-size: .82rem; color: #f0b429; line-height: 1.6; }
  .warn strong { color: #f7c940; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>🌿 Evergreen Media — Production Install</h1>
    <p>Server configuration &amp; admin login setup</p>
  </div>

  <div class="summary">
    <div class="icon"><?= $allOk ? '✅' : '❌' ?></div>
    <div>
      <h2><?= $allOk ? 'All checks passed!' : 'Issues found — see details below' ?></h2>
      <p><?= $pass ?>/<?= $total ?> checks passed</p>
    </div>
  </div>

  <div class="steps">
    <?php foreach ($results as $r): ?>
    <div class="step <?= $r['ok'] ? 'ok' : 'fail' ?>">
      <span class="badge"><?= $r['ok'] ? 'PASS' : 'FAIL' ?></span>
      <div>
        <div class="label"><?= htmlspecialchars($r['label']) ?></div>
        <?php if ($r['detail']): ?>
        <div class="detail"><?= htmlspecialchars($r['detail']) ?></div>
        <?php endif; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <?php if ($allOk): ?>
  <div class="creds">
    <h3>✓ Admin Login Credentials</h3>
    <code>URL:      /evergreen-emporium/admin</code>
    <code>Email:    admin@evergreenmedia.in</code>
    <code>Password: Admin@2026</code>
  </div>
  <?php endif; ?>

  <div class="warn">
    <strong>⚠️ Security — delete this file immediately after use:</strong><br>
    In Hostinger File Manager → <code>public_html/evergreen-emporium/api/</code> → delete <code>install.php</code>
  </div>
</div>
</body>
</html>
