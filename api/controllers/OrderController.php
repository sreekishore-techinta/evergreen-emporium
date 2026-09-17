<?php
require_once __DIR__ . '/../models/OrderModel.php';
require_once __DIR__ . '/../models/CartModel.php';
require_once __DIR__ . '/../models/CouponModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';

class OrderController {

    private OrderModel  $orders;
    private CartModel   $cart;
    private CouponModel $coupons;

    public function __construct() {
        $this->orders  = new OrderModel();
        $this->cart    = new CartModel();
        $this->coupons = new CouponModel();
    }

    // ── Customer: place order ────────────────────────────────────

    public function checkout(): void {
        // Auth is optional — logged-in users are linked; guests get user_id=null
        $p    = AuthMiddleware::optionalUser();
        $data = AuthMiddleware::getRequestBody();

        $v    = Validator::make($data)
            ->required('address')
            ->required('payment_method');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        // Validate items array separately (can't use Validator::required on arrays)
        if (empty($data['items']) || !is_array($data['items'])) {
            Response::error('Cart is empty.', 400);
        }

        // Validate address sub-fields
        $addr = $data['address'] ?? [];
        $av   = Validator::make($addr)
            ->required('name')->required('phone')
            ->required('line1')->required('city')
            ->required('state')->required('pincode');
        if ($av->fails()) Response::error('Address incomplete.', 422, $av->errors());

        // Resolve each item to a numeric product_id via DB lookup when needed
        $db    = Database::connect();
        $items = [];
        foreach ($data['items'] as $ci) {
            $quantity = (int)($ci['quantity'] ?? 1);
            if ($quantity < 1) continue;

            // Accept numeric id or slug string
            $rawId = $ci['product_id'] ?? $ci['id'] ?? null;
            if ($rawId === null) continue;

            if (is_numeric($rawId)) {
                // Already a numeric DB id
                $items[] = ['product_id' => (int)$rawId, 'quantity' => $quantity];
            } else {
                // String slug — look up the real integer id
                $stmt = $db->prepare("SELECT id FROM products WHERE slug=? AND is_active=1");
                $stmt->execute([(string)$rawId]);
                $row  = $stmt->fetch();
                if (!$row) {
                    Response::error("Product '{$rawId}' not found or unavailable.", 400);
                }
                $items[] = ['product_id' => (int)$row['id'], 'quantity' => $quantity];
            }
        }
        if (empty($items)) Response::error('Cart is empty.', 400);

        // Shipping charge from site settings (guarded — table may not exist yet)
        // $db is already connected above during slug resolution
        $shippingCharge = 0;
        $freeAbove      = 0;
        try {
            $shippingStmt = $db->query("SELECT value FROM site_settings WHERE setting_key='shipping_charge'");
            $shippingCharge = (float)($shippingStmt->fetchColumn() ?: 0);

            $freeAboveStmt = $db->query("SELECT value FROM site_settings WHERE setting_key='free_shipping_above'");
            $freeAbove = (float)($freeAboveStmt->fetchColumn() ?: 0);
        } catch (Throwable $e) {
            // site_settings table missing or empty — default to free shipping, do not abort
            $shippingCharge = 0;
            $freeAbove      = 0;
        }
        // Note: free_shipping_above comparison is done after subtotal is known (inside OrderModel)

        // Coupon validation (subtotal is calculated inside OrderModel, so pass 0 as placeholder;
        // coupon's min_order check is re-validated there against the real subtotal)
        $discountAmount = 0;
        $couponId       = null;
        $couponCode     = null;
        if (!empty($data['coupon_code'])) {
            // Estimate subtotal from request for coupon pre-validation
            $cv = $this->coupons->validate($data['coupon_code'], 0);
            if (!$cv['valid']) Response::error($cv['message'], 400);
            $discountAmount = $cv['discount'];
            $couponId       = $cv['coupon_id'];
            $couponCode     = $cv['code'];
        }

        try {
            $orderId = $this->orders->create([
                'user_id'           => $p ? (int)$p['user_id'] : null,
                'items'             => $items,
                'address'           => $addr,
                'payment_method'    => $data['payment_method'],
                'shipping_charge'   => $shippingCharge,
                'free_shipping_above' => $freeAbove,
                'discount_amount'   => $discountAmount,
                'coupon_id'         => $couponId,
                'coupon_code'       => $couponCode,
                'notes'             => $data['notes'] ?? null,
            ]);

            // Clear server-side cart if user is logged in
            if ($p) {
                $this->cart->clear((int)$p['user_id']);
            }

            $order = $this->orders->find($orderId);
            Response::created($order, 'Order placed successfully.');

        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    // ── Customer: order history ──────────────────────────────────

    public function myOrders(): void {
        $p    = AuthMiddleware::requireUser();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $ps   = min((int)($_GET['page_size'] ?? 10), 50);
        $res  = $this->orders->userOrders((int)$p['user_id'], $page, $ps);
        Response::paginated($res['items'], $res['total'], $res['page'], $res['pageSize']);
    }

    public function myOrder(int $id): void {
        $p     = AuthMiddleware::requireUser();
        $order = $this->orders->find($id);
        if (!$order || (int)$order['user_id'] !== (int)$p['user_id']) {
            Response::notFound('Order not found.');
        }
        Response::success($order);
    }

    // ── Admin ────────────────────────────────────────────────────

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        $f = [
            'status'         => $_GET['status']         ?? null,
            'payment_status' => $_GET['payment_status'] ?? null,
            'search'         => $_GET['search']         ?? '',
        ];
        $f    = array_filter($f, fn($v) => $v !== null && $v !== '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $ps   = min((int)($_GET['page_size'] ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
        $res  = $this->orders->adminList($f, $page, $ps);
        Response::paginated($res['items'], $res['total'], $res['page'], $res['pageSize']);
    }

    public function adminShow(int $id): void {
        AuthMiddleware::requireAdmin();
        $order = $this->orders->find($id);
        if (!$order) Response::notFound('Order not found.');
        Response::success($order);
    }

    public function updateStatus(int $id): void {
        $payload = AuthMiddleware::requireAdmin();
        $data    = AuthMiddleware::getRequestBody();
        if (empty($data['status'])) Response::error('Status is required.', 422);

        $ok = $this->orders->updateStatus($id, $data['status'], (int)$payload['admin_id']);
        if (!$ok) Response::error('Invalid status value or order not found.', 400);

        Response::success($this->orders->find($id), 'Order status updated.');
    }

    /**
     * POST /api/admin/orders/{id}/cancel
     * Cancels an order and restores stock for all line items.
     * Idempotent — cancelling an already-cancelled order is a no-op.
     */
    public function cancel(int $id): void {
        $payload = AuthMiddleware::requireAdmin();

        $order = $this->orders->find($id);
        if (!$order) Response::notFound('Order not found.');

        if ($order['status'] === 'cancelled') {
            Response::success($order, 'Order is already cancelled.');
        }

        // Statuses from which cancellation is allowed
        $cancellable = ['pending', 'confirmed', 'processing'];
        if (!in_array($order['status'], $cancellable, true)) {
            Response::error(
                "Cannot cancel a '{$order['status']}' order. Only pending, confirmed or processing orders can be cancelled.",
                400
            );
        }

        $ok = $this->orders->updateStatus($id, 'cancelled', (int)$payload['admin_id']);
        if (!$ok) Response::error('Failed to cancel order.', 500);

        Response::success($this->orders->find($id), 'Order cancelled and stock restored.');
    }

    public function updatePayment(int $id): void {
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['payment_status'])) Response::error('payment_status required.', 422);

        $this->orders->updatePaymentStatus($id, $data['payment_status'], $data['transaction_id'] ?? '');
        Response::success($this->orders->find($id), 'Payment status updated.');
    }
}
