<?php
require_once __DIR__ . '/../config/database.php';

abstract class BaseModel {
    protected PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    protected function paginate(string $sql, array $params, int $page, int $pageSize): array {
        $page     = max(1, $page);
        $pageSize = min(max(1, $pageSize), MAX_PAGE_SIZE);
        $offset   = ($page - 1) * $pageSize;

        // Count
        $countSql = "SELECT COUNT(*) FROM ({$sql}) AS _c";
        $stmt = $this->db->prepare($countSql);
        $stmt->execute($params);
        $total = (int)$stmt->fetchColumn();

        // Data
        $stmt = $this->db->prepare("{$sql} LIMIT {$pageSize} OFFSET {$offset}");
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        return compact('items', 'total', 'page', 'pageSize');
    }

    protected function slugify(string $text): string {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
        $text = preg_replace('/[\s-]+/', '-', $text);
        return trim($text, '-');
    }

    protected function uniqueSlug(string $table, string $base, ?int $excludeId = null): string {
        $slug  = $this->slugify($base);
        $orig  = $slug;
        $i     = 1;
        while (true) {
            $sql  = "SELECT id FROM `{$table}` WHERE slug = ?";
            $args = [$slug];
            if ($excludeId) { $sql .= ' AND id != ?'; $args[] = $excludeId; }
            $stmt = $this->db->prepare($sql);
            $stmt->execute($args);
            if (!$stmt->fetch()) break;
            $slug = "{$orig}-{$i}";
            $i++;
        }
        return $slug;
    }
}
