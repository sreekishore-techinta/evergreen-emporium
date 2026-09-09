<?php
/**
 * ──────────────────────────────────────────────────────────────────
 * Admin Setup Script — api/setup-admin.php
 * ──────────────────────────────────────────────────────────────────
 * Run this ONCE on the live server to create/reset the admin user.
 * Visit: https://your-domain.com/api/setup-admin.php?key=evergreen_setup_2026
 *
 * ⚠️  DELETE this file immediately after use.
 * ──────────────────────────────────────────────────────────────────
 */

// Simple security gate — require a secret key in the URL
$allowedKey = 'evergreen_setup_2026';
if (($_GET['key'] ?? '') !== $allowedKey) {
    http_response_code(403);
    echo '<h2>403 Forbidden</h2><p>Append <code>?key=' . htmlspecialchars($allowedKey) . '</code> to the URL.</p>';
    exit;
}

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';

$errors = [];
$steps  = [];

// ── 1. Test DB connection ──────────────────────────────────────────
try {
    $db = Database::connect();
    $steps[] = '✅ Database connected successfully.';
} catch (Throwable $e) {
    $errors[] = '❌ Database connection failed: ' . htmlspecialchars($e->getMessage());
    renderPage($steps, $errors);
    exit;
}

// ── 2. Create tables if missing ───────────────────────────────────
$schema = file_get_contents(__DIR__ . '/config/schema.sql');
// Run each statement individually (skip USE and CREATE DATABASE)
$statements = array_filter(
    array_map('trim', explode(';', $schema)),
    fn($s) => $s !== '' &&
              stripos($s, 'CREATE DATABASE') === false &&
              stripos($s, 'USE `') === false
);

$tableErrors = 0;
foreach ($statements as $sql) {
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        // Ignore "already exists" errors; report others
        if (strpos($e->getMessage(), '1050') === false && strpos($e->getMessage(), 'already exists') === false) {
            $tableErrors++;
        }
    }
}
$steps[] = $tableErrors === 0
    ? '✅ Database tables verified / created.'
    : "⚠️  Schema ran with {$tableErrors} non-fatal error(s) — tables may already exist.";

// ── 3. Create / reset admin user ──────────────────────────────────
$email    = 'admin@evergreenmedia.in';
$name     = 'Evergreen Admin';
$password = 'Admin@2026';
$hash     = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Upsert the admin row
$stmt = $db->prepare("SELECT id FROM admins WHERE email = ?");
$stmt->execute([$email]);
$existing = $stmt->fetch();

if ($existing) {
    // Reset password and ensure active
    $db->prepare("UPDATE admins SET password_hash=?, is_active=1, name=? WHERE email=?")
       ->execute([$hash, $name, $email]);
    $steps[] = '✅ Admin password reset successfully.';
} else {
    // Insert fresh admin
    $db->prepare(
        "INSERT INTO admins (name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'superadmin', 1)"
    )->execute([$name, $email, $hash]);
    $steps[] = '✅ Admin user created successfully.';
}

// ── 4. Seed site settings if empty ───────────────────────────────
$count = (int)$db->query("SELECT COUNT(*) FROM site_settings")->fetchColumn();
if ($count === 0) {
    $defaults = [
        ['site_name',            'Evergreen Media',                 'text',    'Site Name'],
        ['site_tagline',         'Grow Better. Nourish Naturally.', 'text',    'Site Tagline'],
        ['contact_email',        'hello@evergreenmedia.in',         'text',    'Contact Email'],
        ['contact_phone',        '+91 98000 00000',                 'text',    'Contact Phone'],
        ['shipping_charge',      '0',                               'number',  'Flat Shipping Charge (₹)'],
        ['free_shipping_above',  '500',                             'number',  'Free Shipping Above (₹)'],
        ['low_stock_threshold',  '5',                               'number',  'Low Stock Alert Threshold'],
        ['currency',             'INR',                             'text',    'Currency Code'],
        ['currency_symbol',      '₹',                              'text',    'Currency Symbol'],
        ['maintenance_mode',     '0',                               'boolean', 'Maintenance Mode'],
    ];
    $ins = $db->prepare("INSERT IGNORE INTO site_settings (setting_key, value, type, label) VALUES (?,?,?,?)");
    foreach ($defaults as $row) $ins->execute($row);
    $steps[] = '✅ Site settings seeded.';
} else {
    $steps[] = "ℹ️  Site settings already exist ({$count} rows) — skipped.";
}

// ── 5. Verify the hash works ──────────────────────────────────────
$stmt = $db->prepare("SELECT password_hash FROM admins WHERE email=?");
$stmt->execute([$email]);
$row = $stmt->fetch();
if ($row && password_verify($password, $row['password_hash'])) {
    $steps[] = '✅ Password verification confirmed — login will work.';
} else {
    $errors[] = '❌ Password verification FAILED — something went wrong with the hash.';
}

renderPage($steps, $errors);

// ─────────────────────────────────────────────────────────────────
function renderPage(array $steps, array $errors): void {
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Evergreen Media — Admin Setup</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 20px; background: #f5f5f5; }
  h1   { color: #163f28; }
  .card{ background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
  .step{ padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; }
  .err { color: #c0392b; background: #fdf0f0; border-radius: 6px; padding: 10px 14px; margin: 6px 0; }
  .creds { background: #f0faf4; border: 1px solid #b7dfc8; border-radius: 8px; padding: 16px; margin-top: 20px; }
  .creds code { display: block; font-size: 14px; margin: 4px 0; color: #163f28; }
  .warn{ background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; }
</style>
</head>
<body>
<div class="card">
  <h1>🌿 Evergreen Media — Admin Setup</h1>

  <?php foreach ($steps as $s): ?>
    <div class="step"><?= $s ?></div>
  <?php endforeach; ?>

  <?php foreach ($errors as $e): ?>
    <div class="err"><?= $e ?></div>
  <?php endforeach; ?>

  <?php if (empty($errors)): ?>
  <div class="creds">
    <strong>Login credentials:</strong>
    <code>URL: /admin</code>
    <code>Email: admin@evergreenmedia.in</code>
    <code>Password: Admin@2026</code>
  </div>
  <div class="warn">
    ⚠️ <strong>Delete this file immediately after logging in.</strong><br>
    In Hostinger File Manager: delete <code>public_html/api/setup-admin.php</code>
  </div>
  <?php endif; ?>
</div>
</body>
</html>
<?php
}
