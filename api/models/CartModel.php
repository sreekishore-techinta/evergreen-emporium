<?php
require_once __DIR__ . '/BaseModel.php';

class CartModel extends BaseModel {

    public function getOrCreate(int $userId): int {
        $stmt = $this->db->prepare("SELECT id FROM cart WHERE user_id=?");
        $stmt->execute([$userId]);
        $cart = $stmt->fetch();
        if ($cart) return (int)$cart['id'];
        $this->db->prepare("INSERT INTO cart (user_id) VALUES (?)")->execute([$userId]);
        return (int)$this->db->lastInsertId();
    }

    public function getItems(int $userId): array {
        $cartId = $this->getOrCreate($userId);
        $stmt   = $this->db->prepare(
            "SELECT ci.id, ci.product_id, ci.quantity, ci.price_snapshot,
                    p.name, p.slug, p.sku, p.price AS current_price,
                    p.discount_price, p.stock, p.weight, p.primary_image, p.is_active
             FROM cart_items ci
             JOIN products p ON p.id=ci.product_id
             WHERE ci.cart_id=?"
        );
        $stmt->execute([$cartId]);
        $items = $stmt->fetchAll();

        $subtotal = 0;
        foreach ($items as &$item) {
            $effectivePrice = $item['discount_price'] ?? $item['price_snapshot'];
            $item['line_total'] = round($effectivePrice * $item['quantity'], 2);
            $subtotal += $item['line_total'];
        }
        unset($item);

        return ['cart_id' => $cartId, 'items' => $items, 'subtotal' => $subtotal];
    }

    public function addItem(int $userId, int $productId, int $qty = 1): bool {
        // Validate product and stock
        $stmt = $this->db->prepare(
            "SELECT id, price, discount_price, stock, is_active FROM products WHERE id=?"
        );
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        if (!$product || !$product['is_active']) {
            throw new RuntimeException('Product not available.');
        }
        if ($product['stock'] < $qty) {
            throw new RuntimeException("Only {$product['stock']} unit(s) available.");
        }

        $cartId = $this->getOrCreate($userId);
        $price  = $product['discount_price'] ?? $product['price'];

        // Upsert
        $stmt = $this->db->prepare(
            "INSERT INTO cart_items (cart_id, product_id, quantity, price_snapshot)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               quantity = LEAST(quantity + VALUES(quantity), ?),
               price_snapshot = VALUES(price_snapshot)"
        );
        $stmt->execute([$cartId, $productId, $qty, $price, $product['stock']]);
        return true;
    }

    public function updateItem(int $userId, int $productId, int $qty): bool {
        if ($qty < 1) return $this->removeItem($userId, $productId);

        $stmt = $this->db->prepare("SELECT stock FROM products WHERE id=? AND is_active=1");
        $stmt->execute([$productId]);
        $p = $stmt->fetch();
        if (!$p) throw new RuntimeException('Product not found.');
        if ($p['stock'] < $qty) throw new RuntimeException("Only {$p['stock']} unit(s) available.");

        $cartId = $this->getOrCreate($userId);
        $stmt   = $this->db->prepare(
            "UPDATE cart_items SET quantity=? WHERE cart_id=? AND product_id=?"
        );
        return $stmt->execute([$qty, $cartId, $productId]);
    }

    public function removeItem(int $userId, int $productId): bool {
        $cartId = $this->getOrCreate($userId);
        return $this->db->prepare(
            "DELETE FROM cart_items WHERE cart_id=? AND product_id=?"
        )->execute([$cartId, $productId]);
    }

    public function clear(int $userId): bool {
        $cartId = $this->getOrCreate($userId);
        return $this->db->prepare("DELETE FROM cart_items WHERE cart_id=?")->execute([$cartId]);
    }

    public function count(int $userId): int {
        $cartId = $this->getOrCreate($userId);
        $stmt   = $this->db->prepare(
            "SELECT COALESCE(SUM(quantity),0) FROM cart_items WHERE cart_id=?"
        );
        $stmt->execute([$cartId]);
        return (int)$stmt->fetchColumn();
    }
}
