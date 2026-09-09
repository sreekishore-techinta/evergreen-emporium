<?php
// No dependencies — raw PHP only
header('Content-Type: application/json');

if (($_GET['key'] ?? '') !== 'evergreen_setup_2026') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$out = [];
$out['php_version'] = PHP_VERSION;
$out['php_sapi']    = PHP_SAPI;

// Test DB directly without any includes
$host = 'localhost';
$name = 'u910074219_evergreen';
$user = 'u910074219_evergreen';
$pass = 'Techinta@2026';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$name;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $out['db_connection'] = 'OK';

    // Check admins table
    $stmt = $pdo->query("SELECT id, email, password_hash, is_active FROM admins LIMIT 5");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $out['admins_count'] = count($admins);

    foreach ($admins as $a) {
        $pwOk = password_verify('Admin@2026', $a['password_hash']);
        $out['admins'][] = [
            'id'       => $a['id'],
            'email'    => $a['email'],
            'active'   => $a['is_active'],
            'pw_ok'    => $pwOk ? 'YES' : 'NO',
        ];
    }

    // If no admin or pw wrong, fix it now
    $needFix = empty($admins) || !password_verify('Admin@2026', $admins[0]['password_hash']);
    if ($needFix && isset($_GET['fix'])) {
        $hash = password_hash('Admin@2026', PASSWORD_BCRYPT, ['cost' => 12]);
        $existing = $pdo->prepare("SELECT id FROM admins WHERE email=?");
        $existing->execute(['admin@evergreenmedia.in']);
        if ($existing->fetch()) {
            $pdo->prepare("UPDATE admins SET password_hash=?, is_active=1 WHERE email=?")
                ->execute([$hash, 'admin@evergreenmedia.in']);
            $out['fix'] = 'Password updated';
        } else {
            $pdo->prepare("INSERT INTO admins (name,email,password_hash,role,is_active) VALUES (?,?,?,?,1)")
                ->execute(['Evergreen Admin', 'admin@evergreenmedia.in', $hash, 'superadmin']);
            $out['fix'] = 'Admin created';
        }
        // Verify fix
        $stmt2 = $pdo->prepare("SELECT password_hash FROM admins WHERE email=?");
        $stmt2->execute(['admin@evergreenmedia.in']);
        $row = $stmt2->fetch();
        $out['fix_verify'] = password_verify('Admin@2026', $row['password_hash']) ? 'OK' : 'STILL WRONG';
    } elseif ($needFix) {
        $out['action_needed'] = 'Add &fix=1 to URL to reset password';
    } else {
        $out['login_ready'] = 'YES - credentials are correct';
    }

    // Check admin_sessions table exists
    try {
        $pdo->query("SELECT 1 FROM admin_sessions LIMIT 1");
        $out['admin_sessions_table'] = 'OK';
    } catch (Exception $e) {
        $out['admin_sessions_table'] = 'MISSING';
        if (isset($_GET['fix'])) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `admin_sessions` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `admin_id` INT UNSIGNED NOT NULL,
                `token_hash` VARCHAR(255) NOT NULL,
                `ip_address` VARCHAR(45) NULL,
                `user_agent` VARCHAR(300) NULL,
                `expires_at` DATETIME NOT NULL,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                KEY `idx_asessions_token` (`token_hash`(20)),
                KEY `idx_asessions_exp` (`expires_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            $out['admin_sessions_table'] = 'CREATED';
        }
    }

} catch (PDOException $e) {
    $out['db_connection'] = 'FAILED: ' . $e->getMessage();
}

// Check env.php loads without error
$out['env_local_exists'] = file_exists(__DIR__ . '/config/env.local.php') ? 'YES' : 'NO';

// Check index.php URI logic
$testUri = '/evergreen-emporium/api/admin/auth/login';
$pos = strpos($testUri, '/api/');
$norm = $pos !== false ? substr($testUri, $pos) : $testUri;
while (strpos($norm, '/api/api/') !== false) $norm = str_replace('/api/api/', '/api/', $norm);
$out['uri_test'] = "$testUri => $norm";

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
