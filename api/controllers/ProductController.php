<?php
require_once __DIR__ . '/../models/ProductModel.php';
require_once __DIR__ . '/../models/ReviewModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../helpers/Upload.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProductController {

    private ProductModel $products;

    public function __construct() { $this->products = new ProductModel(); }

    // ── Public ────────────────────────────────────────────────────

    public function index(): void {
        $f = [
            'active_only'   => true,
            'category_id'   => isset($_GET['category_id'])   ? (int)$_GET['category_id']   : null,
            'category_slug' => $_GET['category_slug']        ?? null,
            'featured'      => !empty($_GET['featured']),
            'bestseller'    => !empty($_GET['bestseller']),
            'search'        => $_GET['search']               ?? '',
            'sort'          => $_GET['sort']                 ?? 'default',
        ];
        // Remove null filters
        $f = array_filter($f, fn($v) => $v !== null && $v !== '' && $v !== false);
        $f['active_only'] = true;

        $page = max(1, (int)($_GET['page'] ?? 1));
        $ps   = min((int)($_GET['page_size'] ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

        $result = $this->products->list($f, $page, $ps);
        Response::paginated($result['items'], $result['total'], $result['page'], $result['pageSize']);
    }

    public function show(int $id): void {
        $product = $this->products->find($id, true);
        if (!$product) Response::notFound('Product not found.');

        // Attach reviews
        $reviewModel     = new ReviewModel();
        $reviewResult    = $reviewModel->forProduct($id, 1, 5);
        $product['reviews'] = $reviewResult['items'];

        // Related products
        $product['related'] = $this->products->related($id, (int)$product['category_id']);

        Response::success($product);
    }

    public function showBySlug(string $slug): void {
        $product = $this->products->findBySlug($slug);
        if (!$product) Response::notFound('Product not found.');
        $this->show((int)$product['id']);
    }

    // ── Admin CRUD ────────────────────────────────────────────────

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        $f = [
            'category_id'  => isset($_GET['category_id']) ? (int)$_GET['category_id'] : null,
            'search'       => $_GET['search'] ?? '',
            'sort'         => $_GET['sort']   ?? 'default',
        ];
        if (isset($_GET['low_stock']))    $f['low_stock']    = true;
        if (isset($_GET['out_of_stock'])) $f['out_of_stock'] = true;
        if (isset($_GET['active'])) $f['active_only'] = (bool)$_GET['active'];

        $f = array_filter($f, fn($v) => $v !== null && $v !== '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $ps   = min((int)($_GET['page_size'] ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
        $result = $this->products->list($f, $page, $ps);
        Response::paginated($result['items'], $result['total'], $result['page'], $result['pageSize']);
    }

    public function adminShow(int $id): void {
        AuthMiddleware::requireAdmin();
        $p = $this->products->find($id);
        if (!$p) Response::notFound('Product not found.');
        Response::success($p);
    }

    public function store(): void {
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)
            ->required('name')->required('category_id')->required('price')
            ->numeric('price')->positive('price')
            ->numeric('stock')->positive('stock');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $id = $this->products->create($data);
        $p  = $this->products->find($id);
        Response::created($p, 'Product created.');
    }

    public function update(int $id): void {
        AuthMiddleware::requireAdmin();
        if (!$this->products->find($id)) Response::notFound('Product not found.');
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data);
        if (isset($data['price']))  $v->numeric('price')->positive('price');
        if (isset($data['stock']))  $v->numeric('stock')->positive('stock');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $this->products->update($id, $data);
        Response::success($this->products->find($id), 'Product updated.');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        if (!$this->products->find($id)) Response::notFound('Product not found.');
        $this->products->delete($id);
        Response::success(null, 'Product deleted.');
    }

    // ── Images ────────────────────────────────────────────────────

    public function uploadImage(int $productId): void {
        AuthMiddleware::requireAdmin();
        if (!$this->products->find($productId)) Response::notFound('Product not found.');

        if (empty($_FILES['image'])) Response::error('No image file provided.', 422);

        try {
            $path      = Upload::image($_FILES['image'], 'products');
            $existing  = $this->products->getImages($productId);
            $isPrimary = !empty($_POST['is_primary']) || empty($existing);
            $sort      = (int)($_POST['sort_order'] ?? 0);
            $imgId     = $this->products->addImage($productId, $path, $isPrimary, $sort);
            Response::created([
                'id'    => $imgId,
                'path'  => $path,
                'url'   => Upload::url($path),
            ], 'Image uploaded.');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function deleteImage(int $productId, int $imageId): void {
        AuthMiddleware::requireAdmin();
        $path = $this->products->deleteImage($imageId);
        if ($path === null) Response::notFound('Image not found.');
        Upload::delete($path);
        Response::success(null, 'Image deleted.');
    }

    public function setPrimaryImage(int $productId, int $imageId): void {
        AuthMiddleware::requireAdmin();
        $ok = $this->products->setPrimaryImage($productId, $imageId);
        if (!$ok) Response::notFound('Image not found.');
        Response::success(null, 'Primary image set.');
    }

    // ── Stock management ──────────────────────────────────────────

    /**
     * PATCH /api/admin/products/{id}/stock
     * Body: { "delta": <int>, "notes": <string optional> }
     * delta > 0 = stock in (restock), delta < 0 = stock out (correction)
     */
    public function adjustStock(int $id): void {
        $payload = AuthMiddleware::requireAdmin();
        $p = $this->products->find($id);
        if (!$p) Response::notFound('Product not found.');

        $data  = AuthMiddleware::getRequestBody();
        $delta = isset($data['delta']) ? (int)$data['delta'] : null;
        if ($delta === null || $delta === 0) Response::error('delta must be a non-zero integer.', 422);

        $notes = isset($data['notes']) ? trim((string)$data['notes']) : null;
        if (!$notes) {
            $notes = $delta > 0
                ? "Manual stock-in (+{$delta}) by admin"
                : "Manual stock correction ({$delta}) by admin";
        }

        $newStock = $this->products->adjustStock(
            $id,
            $delta,
            'manual_adjustment',
            null,
            $notes,
            (int)$payload['admin_id']
        );

        Response::success([
            'product_id' => $id,
            'delta'      => $delta,
            'stock'      => $newStock,
        ], $delta > 0 ? "Stock increased by {$delta}." : "Stock reduced by " . abs($delta) . ".");
    }

    /**
     * GET /api/admin/products/{id}/stock/history
     * Returns recent stock_movements for a product.
     */
    public function stockHistory(int $id): void {
        AuthMiddleware::requireAdmin();
        if (!$this->products->find($id)) Response::notFound('Product not found.');

        $limit = min((int)($_GET['limit'] ?? 30), 100);
        $rows  = $this->products->getStockMovements($id, $limit);
        Response::success($rows);
    }
}
