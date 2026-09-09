<?php
require_once __DIR__ . '/BaseModel.php';

class ReviewModel extends BaseModel {

    public function forProduct(int $productId, int $page = 1, int $ps = 10): array {
        $sql = "SELECT r.*, u.name AS user_name FROM reviews r
                JOIN users u ON u.id=r.user_id
                WHERE r.product_id=? AND r.status='approved'
                ORDER BY r.created_at DESC";
        return $this->paginate($sql, [$productId], $page, $ps);
    }

    public function userReview(int $userId, int $productId): ?array {
        $stmt = $this->db->prepare(
            "SELECT * FROM reviews WHERE user_id=? AND product_id=?"
        );
        $stmt->execute([$userId, $productId]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $d): int {
        $stmt = $this->db->prepare(
            "INSERT INTO reviews (product_id,user_id,order_id,rating,title,body,status)
             VALUES (?,?,?,?,?,?,'pending')"
        );
        $stmt->execute([
            $d['product_id'], $d['user_id'],
            $d['order_id'] ?? null,
            $d['rating'],
            $d['title']    ?? null,
            $d['body']     ?? null,
        ]);
        $id = (int)$this->db->lastInsertId();
        $this->recalcRating((int)$d['product_id']);
        return $id;
    }

    public function updateStatus(int $id, string $status): bool {
        $allowed = ['pending','approved','hidden'];
        if (!in_array($status, $allowed, true)) return false;
        $stmt = $this->db->prepare("UPDATE reviews SET status=? WHERE id=?");
        $ok   = $stmt->execute([$status, $id]);

        // Get product_id to recalc
        $r = $this->db->prepare("SELECT product_id FROM reviews WHERE id=?");
        $r->execute([$id]);
        $pid = $r->fetchColumn();
        if ($pid) $this->recalcRating((int)$pid);
        return $ok;
    }

    public function delete(int $id): bool {
        $r = $this->db->prepare("SELECT product_id FROM reviews WHERE id=?");
        $r->execute([$id]);
        $pid = $r->fetchColumn();
        $ok  = $this->db->prepare("DELETE FROM reviews WHERE id=?")->execute([$id]);
        if ($pid) $this->recalcRating((int)$pid);
        return $ok;
    }

    private function recalcRating(int $productId): void {
        $this->db->prepare(
            "UPDATE products p SET
               p.rating = COALESCE((
                 SELECT ROUND(AVG(r.rating),2) FROM reviews r
                 WHERE r.product_id=p.id AND r.status='approved'
               ),0),
               p.rating_count = (
                 SELECT COUNT(*) FROM reviews r
                 WHERE r.product_id=p.id AND r.status='approved'
               )
             WHERE p.id=?"
        )->execute([$productId]);
    }

    public function adminList(array $filters = [], int $page = 1, int $ps = 20): array {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['status'])) {
            $where[] = 'r.status=?'; $params[] = $filters['status'];
        }
        if (!empty($filters['product_id'])) {
            $where[] = 'r.product_id=?'; $params[] = $filters['product_id'];
        }
        $sql = "SELECT r.*, u.name AS user_name, p.name AS product_name
                FROM reviews r
                JOIN users u ON u.id=r.user_id
                JOIN products p ON p.id=r.product_id
                WHERE " . implode(' AND ', $where) . "
                ORDER BY r.created_at DESC";
        return $this->paginate($sql, $params, $page, $ps);
    }
}
