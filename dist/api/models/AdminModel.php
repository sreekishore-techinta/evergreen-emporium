<?php
require_once __DIR__ . '/BaseModel.php';

class AdminModel extends BaseModel {

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM admins WHERE email=? AND is_active=1");
        $stmt->execute([strtolower(trim($email))]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT id,name,email,role,is_active,last_login_at FROM admins WHERE id=?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function verifyPassword(array $admin, string $password): bool {
        return password_verify($password, $admin['password_hash']);
    }

    public function touchLogin(int $id, string $ip = ''): void {
        $this->db->prepare("UPDATE admins SET last_login_at=NOW() WHERE id=?")->execute([$id]);
    }

    public function saveSession(int $adminId, string $token, string $ip, string $ua, int $expiry): void {
        $hash = hash('sha256', $token);
        $this->db->prepare(
            "INSERT INTO admin_sessions (admin_id,token_hash,ip_address,user_agent,expires_at)
             VALUES (?,?,?,?,FROM_UNIXTIME(?))"
        )->execute([$adminId, $hash, $ip, $ua, $expiry]);
    }

    public function revokeSession(string $token): void {
        $hash = hash('sha256', $token);
        $this->db->prepare("DELETE FROM admin_sessions WHERE token_hash=?")->execute([$hash]);
    }

    public function validateSession(string $token): bool {
        $hash = hash('sha256', $token);
        $stmt = $this->db->prepare(
            "SELECT id FROM admin_sessions WHERE token_hash=? AND expires_at > NOW()"
        );
        $stmt->execute([$hash]);
        return (bool)$stmt->fetch();
    }

    public function updatePassword(int $id, string $newPassword): bool {
        $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
        return $this->db->prepare("UPDATE admins SET password_hash=? WHERE id=?")
                        ->execute([$hash, $id]);
    }

    // Purge expired sessions (call periodically)
    public function purgeExpiredSessions(): void {
        $this->db->exec("DELETE FROM admin_sessions WHERE expires_at < NOW()");
    }
}
