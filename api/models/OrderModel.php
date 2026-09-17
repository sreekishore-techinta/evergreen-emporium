<?php
require_once __DIR__ . '/BaseModel.php';

class OrderModel extends BaseModel {

    private function generateOrderNumber(): string {
        return 'EM-' . strtoupper(substr(uniqid(), -6)) . '-' . date('ymd');
    }

    // ── Create ─────────────────────────────────────────────────────

    public function create(array $data): int {
        $this->db->beginTransaction();
        try {
            $orderNumber = $this->generateOrderNumber();

            // Validate + decrement stock
            $subtotal = 0;
            $itemsToInsert = [];
            foreach ($data['items'] as $item) {
                $stmt = $this->db->prepare(
                    "SELECT id,name,sku,price,discount_price,stock,primary_image FROM products WHERE id=? AND is_active=1 FOR UPDATE"
                );
                $stmt->execute([$item['product_id']]);
                $p = $stmt->fetch();

                if (!$p) throw new RuntimeException("Product ID {$item['product_id']} not available.");
                if ($p['stock'] < $item['quantity']) {
                    throw new RuntimeException("Insufficient stock for {$p['name']}.");
                }

                $unitPrice = (float)($p['discount_price'] ?? $p['price']);
                $lineTotal = $unitPrice * $item['quantity'];
                $subtotal += $lineTotal;

                $this->db->prepare("UPDATE products SET stock=stock-? WHERE id=?")
                         ->execute([$item['quantity'], $p['id']]);

                // Log stock movement — order_placed
                $stockAfter = (int)$p['stock'] - $item['quantity'];
                $this->logStockMovement(
                    (int)$p['id'],
                    -(int)$item['quantity'],
                    $stockAfter,
                    'order_placed',
                    null,    // orderId not known yet — updated after insert below
                    "New order",
                    null
                );
                // Stash index for post-insert reference_id update
                $itemsToInsert[] = [
                    'product_id'    => $p['id'],
                    'product_name'  => $p['name'],
                    'product_sku'   => $p['sku'],
                    'product_image' => $p['primary_image'],
                    'quantity'      => $item['quantity'],
                    'unit_price'    => $unitPrice,
                    'line_total'    => $lineTotal,
                ];
            }

            $discount = (float)($data['discount_amount'] ?? 0);
            $shipping = (float)($data['shipping_charge'] ?? 0);
            // Apply free shipping threshold now that we know the real subtotal
            $freeAbove = (float)($data['free_shipping_above'] ?? 0);
            if ($freeAbove > 0 && $subtotal >= $freeAbove) $shipping = 0;
            $grand    = max(0, $subtotal - $discount + $shipping);

            $addr = $data['address'];
            $this->db->prepare(
                "INSERT INTO orders
                   (order_number,user_id,status,subtotal,shipping_charge,discount_amount,
                    grand_total,coupon_id,coupon_code,payment_method,
                    ship_name,ship_phone,ship_line1,ship_line2,
                    ship_city,ship_state,ship_pincode,ship_country,notes)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            )->execute([
                $orderNumber,
                $data['user_id'] ?? null,
                'pending',
                $subtotal, $shipping, $discount, $grand,
                $data['coupon_id']   ?? null,
                $data['coupon_code'] ?? null,
                $data['payment_method'] ?? 'cod',
                $addr['name'],    $addr['phone'],
                $addr['line1'],   $addr['line2'] ?? null,
                $addr['city'],    $addr['state'],
                $addr['pincode'], $addr['country'] ?? 'India',
                $data['notes'] ?? null,
            ]);

            $orderId = (int)$this->db->lastInsertId();

            // Back-fill reference_id on the stock_movements we just logged
            try {
                $this->db->prepare(
                    "UPDATE stock_movements
                     SET reference_id=?, notes=CONCAT('Order #', ?)
                     WHERE reference_id IS NULL AND reason='order_placed'
                       AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)"
                )->execute([$orderId, $orderId]);
            } catch (Throwable $e) {
                // Pre-migration: stock_movements table missing — non-fatal
            }

            foreach ($itemsToInsert as $item) {
                $this->db->prepare(
                    "INSERT INTO order_items
                       (order_id,product_id,product_name,product_sku,product_image,quantity,unit_price,line_total)
                     VALUES (?,?,?,?,?,?,?,?)"
                )->execute([
                    $orderId,
                    $item['product_id'],   $item['product_name'],
                    $item['product_sku'],  $item['product_image'],
                    $item['quantity'],     $item['unit_price'],
                    $item['line_total'],
                ]);
            }

            // Update coupon usage
            if (!empty($data['coupon_id'])) {
                $this->db->prepare("UPDATE coupons SET used_count=used_count+1 WHERE id=?")
                         ->execute([$data['coupon_id']]);
            }

            // Create pending payment record
            $this->db->prepare(
                "INSERT INTO payments (order_id,amount,method,status) VALUES (?,?,?,?)"
            )->execute([$orderId, $grand, $data['payment_method'] ?? 'cod', 'pending']);

            $this->db->commit();
            return $orderId;

        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // ── Fetch ──────────────────────────────────────────────────────

    public function find(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM orders o
             LEFT JOIN users u ON u.id=o.user_id
             WHERE o.id=?"
        );
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if (!$order) return null;
        $order['items'] = $this->getItems($id);
        return $order;
    }

    public function findByNumber(string $number): ?array {
        $stmt = $this->db->prepare(
            "SELECT o.*, u.name AS customer_name
             FROM orders o LEFT JOIN users u ON u.id=o.user_id
             WHERE o.order_number=?"
        );
        $stmt->execute([$number]);
        $order = $stmt->fetch();
        if (!$order) return null;
        $order['items'] = $this->getItems((int)$order['id']);
        return $order;
    }

    public function getItems(int $orderId): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM order_items WHERE order_id=?"
        );
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public function userOrders(int $userId, int $page = 1, int $ps = 10): array {
        $sql = "SELECT o.*, COUNT(oi.id) AS item_count
                FROM orders o
                LEFT JOIN order_items oi ON oi.order_id=o.id
                WHERE o.user_id=?
                GROUP BY o.id
                ORDER BY o.created_at DESC";
        return $this->paginate($sql, [$userId], $page, $ps);
    }

    public function adminList(array $filters = [], int $page = 1, int $ps = 20): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'o.status=?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['payment_status'])) {
            $where[] = 'o.payment_status=?';
            $params[] = $filters['payment_status'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
            $q = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$q, $q, $q]);
        }

        $sql = "SELECT o.*, u.name AS customer_name, u.email AS customer_email,
                       COUNT(oi.id) AS item_count
                FROM orders o
                LEFT JOIN users u  ON u.id=o.user_id
                LEFT JOIN order_items oi ON oi.order_id=o.id
                WHERE " . implode(' AND ', $where) . "
                GROUP BY o.id
                ORDER BY o.created_at DESC";
        return $this->paginate($sql, $params, $page, $ps);
    }

    public function updateStatus(int $id, string $status, ?int $adminId = null): bool {
        $allowed = ['pending','confirmed','processing','shipped','delivered','cancelled'];
        if (!in_array($status, $allowed, true)) return false;

        // Fetch current status before changing
        $stmt = $this->db->prepare("SELECT status FROM orders WHERE id=?");
        $stmt->execute([$id]);
        $current = $stmt->fetchColumn();
        if ($current === false) return false;

        $this->db->prepare("UPDATE orders SET status=? WHERE id=?")->execute([$status, $id]);

        // ── Stock restoration on cancellation ────────────────────────
        // If transitioning TO cancelled from a non-cancelled state, restore stock
        if ($status === 'cancelled' && $current !== 'cancelled') {
            $items = $this->getItems($id);
            foreach ($items as $item) {
                if (!$item['product_id']) continue;

                // Restore stock atomically and get new stock level
                $this->db->prepare(
                    "UPDATE products SET stock = stock + ? WHERE id=?"
                )->execute([$item['quantity'], $item['product_id']]);

                $stockAfter = (int)$this->db->prepare(
                    "SELECT stock FROM products WHERE id=?"
                )->execute([$item['product_id']]) ? (function($db, $pid) {
                    $s = $db->prepare("SELECT stock FROM products WHERE id=?");
                    $s->execute([$pid]);
                    return (int)$s->fetchColumn();
                })($this->db, $item['product_id']) : 0;

                $this->logStockMovement(
                    (int)$item['product_id'],
                    (int)$item['quantity'],   // positive delta = stock back in
                    $stockAfter,
                    'order_cancelled',
                    $id,
                    "Cancelled order #{$id}",
                    $adminId
                );
            }
        }

        // ── Stock deduction log on order confirmation ─────────────────
        // Log the stock_out movement when order moves from pending → confirmed
        // (stock was already decremented at checkout; this just writes the audit row
        //  if it wasn't written yet — idempotent due to reference_id check)
        if ($status === 'confirmed' && $current === 'pending') {
            $items = $this->getItems($id);
            foreach ($items as $item) {
                if (!$item['product_id']) continue;
                // Only log if no 'order_placed' row exists yet for this order+product
                $exists = $this->db->prepare(
                    "SELECT COUNT(*) FROM stock_movements
                     WHERE product_id=? AND reference_id=? AND reason='order_placed'"
                );
                $exists->execute([$item['product_id'], $id]);
                if ((int)$exists->fetchColumn() === 0) {
                    $s = $this->db->prepare("SELECT stock FROM products WHERE id=?");
                    $s->execute([$item['product_id']]);
                    $stockNow = (int)$s->fetchColumn();
                    $this->logStockMovement(
                        (int)$item['product_id'],
                        -(int)$item['quantity'],
                        $stockNow,
                        'order_placed',
                        $id,
                        "Order #{$id} confirmed",
                        null
                    );
                }
            }
        }

        return true;
    }

    // ── Stock movement logger ──────────────────────────────────────

    public function logStockMovement(
        int $productId,
        int $delta,
        int $stockAfter,
        string $reason,
        ?int $referenceId = null,
        ?string $notes    = null,
        ?int $adminId     = null
    ): void {
        try {
            $this->db->prepare(
                "INSERT INTO stock_movements
                   (product_id, delta, stock_after, reason, reference_id, notes, admin_id)
                 VALUES (?,?,?,?,?,?,?)"
            )->execute([$productId, $delta, $stockAfter, $reason, $referenceId, $notes, $adminId]);
        } catch (Throwable $e) {
            // Non-fatal — if the table doesn't exist yet (pre-migration), silently skip
        }
    }

    public function updatePaymentStatus(int $id, string $status, string $txnId = ''): bool {
        $this->db->prepare("UPDATE orders SET payment_status=? WHERE id=?")->execute([$status, $id]);
        if ($txnId) {
            $this->db->prepare("UPDATE payments SET status=?, transaction_id=?, verified_at=NOW() WHERE order_id=?")
                     ->execute([$status === 'paid' ? 'success' : 'failed', $txnId, $id]);
        }
        return true;
    }

    // ── Stats ──────────────────────────────────────────────────────

    public function countByStatus(string $status): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM orders WHERE status=?");
        $stmt->execute([$status]);
        return (int)$stmt->fetchColumn();
    }

    public function totalRevenue(): float {
        return (float)$this->db->query(
            "SELECT COALESCE(SUM(grand_total),0) FROM orders WHERE payment_status='paid'"
        )->fetchColumn();
    }

    public function revenueThisMonth(): float {
        return (float)$this->db->query(
            "SELECT COALESCE(SUM(grand_total),0) FROM orders
             WHERE payment_status='paid' AND created_at >= DATE_FORMAT(NOW(),'%Y-%m-01')"
        )->fetchColumn();
    }

    public function recentOrders(int $limit = 5): array {
        $stmt = $this->db->prepare(
            "SELECT o.id, o.order_number, o.grand_total, o.status, o.created_at,
                    u.name AS customer_name
             FROM orders o
             LEFT JOIN users u ON u.id=o.user_id
             ORDER BY o.created_at DESC LIMIT ?"
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public function salesChart(int $days = 30): array {
        $stmt = $this->db->prepare(
            "SELECT DATE(created_at) AS date, COUNT(*) AS orders,
                    SUM(grand_total) AS revenue
             FROM orders
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
               AND payment_status='paid'
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        );
        $stmt->execute([$days]);
        return $stmt->fetchAll();
    }

    // ── Stock history for a product ────────────────────────────────

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
}
