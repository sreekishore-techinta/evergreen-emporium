<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/../helpers/Upload.php';

class CategoryModel extends BaseModel {

    public function all(bool $activeOnly = true): array {
        $sql  = "SELECT * FROM categories";
        $sql .= $activeOnly ? " WHERE is_active=1" : "";
        $sql .= " ORDER BY sort_order ASC, id ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function find(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function findBySlug(string $slug): ?array {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE slug=? AND is_active=1");
        $stmt->execute([$slug]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int {
        $slug = $this->uniqueSlug('categories', $data['name']);
        $stmt = $this->db->prepare(
            "INSERT INTO categories (name,slug,description,image,sort_order,is_active)
             VALUES (?,?,?,?,?,?)"
        );
        $stmt->execute([
            $data['name'],
            $slug,
            $data['description'] ?? null,
            $data['image']       ?? null,
            $data['sort_order']  ?? 0,
            $data['is_active']   ?? 1,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $params = [];
        $allowed = ['name','description','image','sort_order','is_active'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "`{$f}`=?";
                $params[] = $data[$f];
            }
        }
        if (isset($data['name'])) {
            $fields[] = "slug=?";
            $params[] = $this->uniqueSlug('categories', $data['name'], $id);
        }
        if (!$fields) return false;
        $params[] = $id;
        $stmt = $this->db->prepare("UPDATE categories SET " . implode(',', $fields) . " WHERE id=?");
        return $stmt->execute($params);
    }

    public function delete(int $id): bool {
        // Check if any products use this category
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM products WHERE category_id=?");
        $stmt->execute([$id]);
        if ((int)$stmt->fetchColumn() > 0) {
            throw new RuntimeException('Cannot delete category with existing products.');
        }
        $stmt = $this->db->prepare("DELETE FROM categories WHERE id=?");
        return $stmt->execute([$id]);
    }

    public function withProductCount(): array {
        $sql = "SELECT c.*, COUNT(p.id) AS product_count
                FROM categories c
                LEFT JOIN products p ON p.category_id=c.id AND p.is_active=1
                GROUP BY c.id
                ORDER BY c.sort_order ASC";
        return $this->db->query($sql)->fetchAll();
    }
}
