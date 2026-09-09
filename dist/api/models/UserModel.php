<?php
require_once __DIR__ . '/BaseModel.php';

class UserModel extends BaseModel {

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT id,name,email,phone,is_active,email_verified,last_login_at,created_at
             FROM users WHERE id=?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email=?");
        $stmt->execute([strtolower(trim($email))]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name,email,password_hash,phone,is_active,email_verified)
             VALUES (?,?,?,?,1,0)"
        );
        $stmt->execute([
            trim($data['name']),
            strtolower(trim($data['email'])),
            password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]),
            $data['phone'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateProfile(int $id, array $data): bool {
        $allowed = ['name','phone'];
        $fields  = [];
        $params  = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "`{$f}`=?";
                $params[] = $data[$f];
            }
        }
        if (!$fields) return false;
        $params[] = $id;
        return $this->db->prepare("UPDATE users SET " . implode(',', $fields) . " WHERE id=?")
                        ->execute($params);
    }

    public function updatePassword(int $id, string $newPassword): bool {
        $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
        return $this->db->prepare("UPDATE users SET password_hash=? WHERE id=?")
                        ->execute([$hash, $id]);
    }

    public function touchLogin(int $id): void {
        $this->db->prepare("UPDATE users SET last_login_at=NOW() WHERE id=?")->execute([$id]);
    }

    public function verifyPassword(array $user, string $password): bool {
        return password_verify($password, $user['password_hash']);
    }

    public function setActive(int $id, bool $active): bool {
        return $this->db->prepare("UPDATE users SET is_active=? WHERE id=?")
                        ->execute([$active ? 1 : 0, $id]);
    }

    // Admin: list all customers
    public function adminList(array $filters = [], int $page = 1, int $pageSize = 20): array {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['search'])) {
            $where[] = '(name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            $q = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$q, $q, $q]);
        }
        if (isset($filters['is_active'])) {
            $where[] = 'is_active=?';
            $params[] = (int)$filters['is_active'];
        }
        $sql = "SELECT id,name,email,phone,is_active,email_verified,last_login_at,created_at
                FROM users WHERE " . implode(' AND ', $where) . "
                ORDER BY created_at DESC";
        return $this->paginate($sql, $params, $page, $pageSize);
    }

    public function countAll(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    }

    public function countThisMonth(): int {
        return (int)$this->db->query(
            "SELECT COUNT(*) FROM users WHERE created_at >= DATE_FORMAT(NOW(),'%Y-%m-01')"
        )->fetchColumn();
    }
}
