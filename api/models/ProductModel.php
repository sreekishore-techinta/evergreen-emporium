<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/../helpers/Upload.php';

class ProductModel extends BaseModel {

    // ── Fetch helpers ──────────────────────────────────────────────

    private function enrichProduct(array $row): array {
        // Decode JSON fields
        foreach (['benefits','applications'] as $f) {
            if (isset($row[$f]) && is_string($row[$f])) {
                $row[$f] = json_decode($row[$f], true) ?? [];
            }
        }
        // Build image URL
        $row['primary_image_url'] = Upload::url($row['primary_image'] ?? '');
        // Fetch additional images
        $row['images'] = $this->getImages((int)$row['id']);
        return $row;
    }

    public function getImages(int $productId): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order ASC, id ASC"
        );
        $stmt->execute([$productId]);
        $rows = $stmt->fetchAll();
        return array_map(fn($r) => array_merge($r, ['url' => Upload::url($r['image_path'])]), $rows);
    }

    // ── Listing / search ───────────────────────────────────────────

    public function list(array $filters = [], int $page = 1, int $pageSize = 20): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['active_only'])) {
            $where[] = 'p.is_active=1';
        }
        if (!empty($filters['category_id'])) {
            $where[] = 'p.category_id=?';
            $params[] = $filters['category_id'];
        }
        if (!empty($filters['category_slug'])) {
            $where[] = 'c.slug=?';
            $params[] = $filters['category_slug'];
        }
        if (!empty($filters['featured'])) {
            $where[] = 'p.is_featured=1';
        }
        if (!empty($filters['bestseller'])) {
            $where[] = 'p.is_bestseller=1';
        }
        if (isset($filters['search']) && $filters['search'] !== '') {
            $where[] = '(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
            $q = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$q, $q, $q]);
        }
        if (isset($filters['low_stock'])) {
            $where[] = 'p.stock <= p.low_stock_alert AND p.stock > 0';
        }
        if (isset($filters['out_of_stock'])) {
            $where[] = 'p.stock = 0';
        }

        $sort = 'p.sort_order ASC, p.id ASC';
        switch ($filters['sort'] ?? 'default') {
            case 'price_asc':  $sort = 'p.price ASC';        break;
            case 'price_desc': $sort = 'p.price DESC';       break;
            case 'rating':     $sort = 'p.rating DESC';      break;
            case 'newest':     $sort = 'p.created_at DESC';  break;
        }

        $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug
                FROM products p
                LEFT JOIN categories c ON c.id=p.category_id
                WHERE " . implode(' AND ', $where) . "
                ORDER BY {$sort}";

        $result = $this->paginate($sql, $params, $page, $pageSize);
        $result['items'] = array_map([$this, 'enrichProduct'], $result['items']);
        return $result;
    }

    public function find(int $id, bool $activeOnly = false): ?array {
        $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug
                FROM products p
                LEFT JOIN categories c ON c.id=p.category_id
                WHERE p.id=?";
        if ($activeOnly) $sql .= ' AND p.is_active=1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->enrichProduct($row) : null;
    }

    public function findBySlug(string $slug): ?array {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON c.id=p.category_id
             WHERE p.slug=? AND p.is_active=1"
        );
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ? $this->enrichProduct($row) : null;
    }

    public function related(int $productId, int $categoryId, int $limit = 4): array {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.name AS category_name FROM products p
             LEFT JOIN categories c ON c.id=p.category_id
             WHERE p.category_id=? AND p.id!=? AND p.is_active=1
             ORDER BY p.is_featured DESC, p.rating DESC
             LIMIT ?"
        );
        $stmt->execute([$categoryId, $productId, $limit]);
        return array_map([$this, 'enrichProduct'], $stmt->fetchAll());
    }

    // ── Create / Update / Delete ───────────────────────────────────

    public function create(array $data): int {
        $slug = $this->uniqueSlug('products', $data['name']);
        $sku  = !empty($data['sku']) ? strtoupper($data['sku']) : ('EM-' . strtoupper(substr($slug, 0, 6)) . '-' . time());

        $stmt = $this->db->prepare(
            "INSERT INTO products
               (category_id,name,slug,sku,tagline,description,long_description,
                benefits,usage_info,type,badge,price,discount_price,stock,
                low_stock_alert,weight,primary_image,is_active,is_featured,
                is_bestseller,applications,sort_order)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        );
        $stmt->execute([
            $data['category_id'],
            $data['name'],
            $slug,
            $sku,
            $data['tagline']          ?? null,
            $data['description']      ?? null,
            $data['long_description'] ?? null,
            is_array($data['benefits'] ?? null) ? json_encode($data['benefits']) : ($data['benefits'] ?? null),
            $data['usage_info']       ?? null,
            $data['type']             ?? null,
            $data['badge']            ?? null,
            $data['price'],
            $data['discount_price']   ?? null,
            $data['stock']            ?? 0,
            $data['low_stock_alert']  ?? 5,
            $data['weight']           ?? null,
            $data['primary_image']    ?? null,
            $data['is_active']        ?? 1,
            $data['is_featured']      ?? 0,
            $data['is_bestseller']    ?? 0,
            is_array($data['applications'] ?? null) ? json_encode($data['applications']) : ($data['applications'] ?? null),
            $data['sort_order']       ?? 0,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $allowed = [
            'category_id','name','tagline','description','long_description',
            'benefits','usage_info','type','badge','price','discount_price',
            'stock','low_stock_alert','weight','primary_image','is_active',
            'is_featured','is_bestseller','applications','sort_order',
        ];
        $fields = [];
        $params = [];

        foreach ($allowed as $f) {
            if (!array_key_exists($f, $data)) continue;
            $val = $data[$f];
            if (in_array($f, ['benefits','applications']) && is_array($val)) {
                $val = json_encode($val);
            }
            $fields[] = "`{$f}`=?";
            $params[] = $val;
        }

        if (isset($data['name'])) {
            $fields[] = 'slug=?';
            $params[] = $this->uniqueSlug('products', $data['name'], $id);
        }

        if (!$fields) return false;
        $params[] = $id;
        $stmt = $this->db->prepare(
            "UPDATE products SET " . implode(',', $fields) . " WHERE id=?"
        );
        return $stmt->execute($params);
    }

    public function updateStock(int $id, int $delta): bool {
        $stmt = $this->db->prepare(
            "UPDATE products SET stock = GREATEST(0, stock + ?) WHERE id=?"
        );
        return $stmt->execute([$delta, $id]);
    }

    public function decrementStock(int $id, int $qty): bool {
        // Atomic: only decrement if stock is sufficient
        $stmt = $this->db->prepare(
            "UPDATE products SET stock = stock - ?
             WHERE id=? AND stock >= ?"
        );
        $stmt->execute([$qty, $id, $qty]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Adjust stock by a signed delta, record in stock_movements, and return the
     * new stock level. Returns null if the product doesn't exist.
     * A negative delta that would push stock below 0 is clamped to 0.
     */
    public function adjustStock(
        int     $id,
        int     $delta,
        string  $reason   = 'manual_adjustment',
        ?int    $orderId  = null,
        ?string $notes    = null,
        ?int    $adminId  = null
    ): ?int {
        $this->db->beginTransaction();
        try {
            // Lock the row
            $stmt = $this->db->prepare("SELECT stock FROM products WHERE id=? FOR UPDATE");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) { $this->db->rollBack(); return null; }

            $newStock = max(0, (int)$row['stock'] + $delta);
            $this->db->prepare("UPDATE products SET stock=? WHERE id=?")
                     ->execute([$newStock, $id]);

            $this->logStockMovement($id, $delta, $newStock, $reason, $orderId, $notes, $adminId);

            $this->db->commit();
            return $newStock;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Write one row to stock_movements.
     * Silently swallows errors if the table doesn't exist yet (pre-migration).
     */
    public function logStockMovement(
        int     $productId,
        int     $delta,
        int     $stockAfter,
        string  $reason      = 'manual_adjustment',
        ?int    $referenceId = null,
        ?string $notes       = null,
        ?int    $adminId     = null
    ): void {
        try {
            $this->db->prepare(
                "INSERT INTO stock_movements
                   (product_id, delta, stock_after, reason, reference_id, notes, admin_id)
                 VALUES (?,?,?,?,?,?,?)"
            )->execute([$productId, $delta, $stockAfter, $reason, $referenceId, $notes, $adminId]);
        } catch (Throwable $e) {
            // Pre-migration: table missing — non-fatal
        }
    }

    /**
     * Fetch recent stock movements for a product (newest first).
     */
    public function getStockMovements(int $productId, int $limit = 30): array {
        try {
            $stmt = $this->db->prepare(
                "SELECT sm.*, a.name AS admin_name
                 FROM stock_movements sm
                 LEFT JOIN admins a ON a.id = sm.admin_id
                 WHERE sm.product_id = ?
                 ORDER BY sm.created_at DESC
                 LIMIT ?"
            );
            $stmt->execute([$productId, $limit]);
            return $stmt->fetchAll();
        } catch (Throwable $e) {
            return [];
        }
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM products WHERE id=?");
        return $stmt->execute([$id]);
    }

    // ── Images ────────────────────────────────────────────────────

    public function addImage(int $productId, string $path, bool $isPrimary = false, int $sort = 0): int {
        if ($isPrimary) {
            $this->db->prepare("UPDATE product_images SET is_primary=0 WHERE product_id=?")
                     ->execute([$productId]);
            $this->db->prepare("UPDATE products SET primary_image=? WHERE id=?")
                     ->execute([$path, $productId]);
        }
        $stmt = $this->db->prepare(
            "INSERT INTO product_images (product_id,image_path,is_primary,sort_order) VALUES (?,?,?,?)"
        );
        $stmt->execute([$productId, $path, $isPrimary ? 1 : 0, $sort]);
        return (int)$this->db->lastInsertId();
    }

    public function deleteImage(int $imageId): ?string {
        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE id=?");
        $stmt->execute([$imageId]);
        $img = $stmt->fetch();
        if (!$img) return null;
        $this->db->prepare("DELETE FROM product_images WHERE id=?")->execute([$imageId]);
        return $img['image_path'];
    }

    public function setPrimaryImage(int $productId, int $imageId): bool {
        $this->db->prepare("UPDATE product_images SET is_primary=0 WHERE product_id=?")
                 ->execute([$productId]);
        $stmt = $this->db->prepare("UPDATE product_images SET is_primary=1 WHERE id=? AND product_id=?");
        $stmt->execute([$imageId, $productId]);
        if ($stmt->rowCount()) {
            $s2 = $this->db->prepare("SELECT image_path FROM product_images WHERE id=?");
            $s2->execute([$imageId]);
            $path = $s2->fetchColumn();
            $this->db->prepare("UPDATE products SET primary_image=? WHERE id=?")
                     ->execute([$path, $productId]);
        }
        return $stmt->rowCount() > 0;
    }

    // ── Dashboard helpers ─────────────────────────────────────────

    public function countAll(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM products")->fetchColumn();
    }

    public function countActive(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM products WHERE is_active=1")->fetchColumn();
    }

    public function getLowStock(int $limit = 10): array {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id=p.category_id
             WHERE p.stock <= p.low_stock_alert AND p.is_active=1
             ORDER BY p.stock ASC LIMIT ?"
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}
