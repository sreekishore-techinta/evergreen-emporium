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
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)
            ->required('address')
            ->required('payment_method');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        // Validate address sub-fields
        $addr = $data['address'] ?? [];
        $av   = Validator::make($addr)
            ->required('name')->required('phone')
            ->required('line1')->required('city')
            ->required('state')->required('pincode');
        if ($av->fails()) Response::error('Address incomplete.', 422, $av->errors());

        // Get cart items
        $cartData = $this->cart->getItems((int)$p['user_id']);
        if (empty($cartData['items'])) Response::error('Cart is empty.', 400);

        // Build order items
        $items = array_map(fn($ci) => [
            'product_id' => (int)$ci['product_id'],
            'quantity'   => (int)$ci['quantity'],
        ], $cartData['items']);

        // Shipping charge from site settings
        $db           = Database::connect();
        $shippingStmt = $db->query("SELECT value FROM site_settings WHERE setting_key='shipping_charge'");
        $shippingCharge = (float)($shippingStmt->fetchColumn() ?: 0);

        $freeAboveStmt = $db->query("SELECT value FROM site_settings WHERE setting_key='free_shipping_above'");
        $freeAbove = (float)($freeAboveStmt->fetchColumn() ?: 0);
        if ($freeAbove > 0 && $cartData['subtotal'] >= $freeAbove) $shippingCharge = 0;

        // Coupon validation
        $discountAmount = 0;
        $couponId       = null;
        $couponCode     = null;
        if (!empty($data['coupon_code'])) {
            $cv = $this->coupons->validate($data['coupon_code'], $cartData['subtotal']);
            if (!$cv['valid']) Response::error($cv['message'], 400);
            $discountAmount = $cv['discount'];
            $couponId       = $cv['coupon_id'];
            $couponCode     = $cv['code'];
        }

        try {
            $orderId = $this->orders->create([
                'user_id'        => (int)$p['user_id'],
                'items'          => $items,
                'address'        => $addr,
                'payment_method' => $data['payment_method'],
                'shipping_charge'=> $shippingCharge,
                'discount_amount'=> $discountAmount,
                'coupon_id'      => $couponId,
                'coupon_code'    => $couponCode,
                'notes'          => $data['notes'] ?? null,
            ]);

            // Clear cart after successful order
            $this->cart->clear((int)$p['user_id']);

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
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['status'])) Response::error('Status is required.', 422);

        $ok = $this->orders->updateStatus($id, $data['status']);
        if (!$ok) Response::error('Invalid status value.', 400);

        Response::success($this->orders->find($id), 'Order status updated.');
    }

    public function updatePayment(int $id): void {
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['payment_status'])) Response::error('payment_status required.', 422);

        $this->orders->updatePaymentStatus($id, $data['payment_status'], $data['transaction_id'] ?? '');
        Response::success($this->orders->find($id), 'Payment status updated.');
    }
}
