<?php
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Upload.php';

class WishlistController {

    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function index(): void {
        $p    = AuthMiddleware::requireUser();
        $stmt = $this->db->prepare(
            "SELECT w.id AS wishlist_id, p.id, p.name, p.slug, p.price,
                    p.discount_price, p.weight, p.primary_image, p.stock,
                    c.name AS category_name
             FROM wishlist w
             JOIN products p ON p.id=w.product_id
             LEFT JOIN categories c ON c.id=p.category_id
             WHERE w.user_id=?
             ORDER BY w.created_at DESC"
        );
        $stmt->execute([$p['user_id']]);
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['primary_image_url'] = Upload::url($item['primary_image'] ?? '');
        }
        Response::success($items);
    }

    public function add(): void {
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['product_id'])) Response::error('product_id required.', 422);

        $stmt = $this->db->prepare(
            "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?,?)"
        );
        $stmt->execute([$p['user_id'], (int)$data['product_id']]);
        Response::success(null, 'Added to wishlist.');
    }

    public function remove(int $productId): void {
        $p    = AuthMiddleware::requireUser();
        $stmt = $this->db->prepare("DELETE FROM wishlist WHERE user_id=? AND product_id=?");
        $stmt->execute([$p['user_id'], $productId]);
        Response::success(null, 'Removed from wishlist.');
    }

    public function toggle(): void {
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['product_id'])) Response::error('product_id required.', 422);

        $stmt = $this->db->prepare("SELECT id FROM wishlist WHERE user_id=? AND product_id=?");
        $stmt->execute([$p['user_id'], (int)$data['product_id']]);

        if ($stmt->fetch()) {
            $this->db->prepare("DELETE FROM wishlist WHERE user_id=? AND product_id=?")
                     ->execute([$p['user_id'], (int)$data['product_id']]);
            Response::success(['wishlisted' => false], 'Removed from wishlist.');
        } else {
            $this->db->prepare("INSERT INTO wishlist (user_id,product_id) VALUES (?,?)")
                     ->execute([$p['user_id'], (int)$data['product_id']]);
            Response::success(['wishlisted' => true], 'Added to wishlist.');
        }
    }
}
