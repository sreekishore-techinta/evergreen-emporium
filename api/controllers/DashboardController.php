<?php
require_once __DIR__ . '/../models/ProductModel.php';
require_once __DIR__ . '/../models/OrderModel.php';
require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class DashboardController {

    public function index(): void {
        AuthMiddleware::requireAdmin();

        $products = new ProductModel();
        $orders   = new OrderModel();
        $users    = new UserModel();

        $stats = [
            'products' => [
                'total'       => $products->countAll(),
                'active'      => $products->countActive(),
                'low_stock'   => count($products->getLowStock(100)),
            ],
            'orders' => [
                'total'       => $orders->countByStatus('pending') +
                                 $orders->countByStatus('confirmed') +
                                 $orders->countByStatus('processing') +
                                 $orders->countByStatus('shipped') +
                                 $orders->countByStatus('delivered') +
                                 $orders->countByStatus('cancelled'),
                'pending'     => $orders->countByStatus('pending'),
                'confirmed'   => $orders->countByStatus('confirmed'),
                'processing'  => $orders->countByStatus('processing'),
                'shipped'     => $orders->countByStatus('shipped'),
                'delivered'   => $orders->countByStatus('delivered'),
                'cancelled'   => $orders->countByStatus('cancelled'),
            ],
            'revenue' => [
                'total'       => $orders->totalRevenue(),
                'this_month'  => $orders->revenueThisMonth(),
            ],
            'customers' => [
                'total'       => $users->countAll(),
                'this_month'  => $users->countThisMonth(),
            ],
        ];

        $data = [
            'stats'         => $stats,
            'recent_orders' => $orders->recentOrders(8),
            'low_stock'     => $products->getLowStock(8),
            'sales_chart'   => $orders->salesChart(30),
        ];

        Response::success($data);
    }

    public function settings(): void {
        AuthMiddleware::requireAdmin();
        $db   = \Database::connect();
        $rows = $db->query("SELECT * FROM site_settings ORDER BY id ASC")->fetchAll();
        Response::success($rows);
    }

    public function updateSettings(): void {
        AuthMiddleware::requireAdmin();
        $data = \AuthMiddleware::getRequestBody();
        $db   = \Database::connect();

        foreach ($data as $key => $value) {
            $db->prepare(
                "UPDATE site_settings SET value=? WHERE setting_key=?"
            )->execute([$value, $key]);
        }
        Response::success(null, 'Settings updated.');
    }

    public function customers(): void {
        AuthMiddleware::requireAdmin();
        $users  = new UserModel();
        $f      = ['search' => $_GET['search'] ?? '', 'is_active' => $_GET['is_active'] ?? null];
        $f      = array_filter($f, fn($v) => $v !== null && $v !== '');
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $ps     = min((int)($_GET['page_size'] ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
        $result = $users->adminList($f, $page, $ps);
        Response::paginated($result['items'], $result['total'], $result['page'], $result['pageSize']);
    }

    public function customerDetail(int $id): void {
        AuthMiddleware::requireAdmin();
        $users  = new UserModel();
        $user   = $users->findById($id);
        if (!$user) Response::notFound('Customer not found.');

        $orders = new OrderModel();
        $history = $orders->userOrders($id, 1, 5);
        $user['recent_orders'] = $history['items'];
        Response::success($user);
    }

    public function setCustomerActive(int $id): void {
        AuthMiddleware::requireAdmin();
        $data  = \AuthMiddleware::getRequestBody();
        $users = new UserModel();
        $users->setActive($id, !empty($data['is_active']));
        Response::success(null, 'Customer status updated.');
    }

    public function contactMessages(): void {
        AuthMiddleware::requireAdmin();
        $db   = \Database::connect();
        $page = max(1,(int)($_GET['page']??1));
        $ps   = 20;
        $off  = ($page-1)*$ps;
        $total= (int)$db->query("SELECT COUNT(*) FROM contact_messages")->fetchColumn();
        $stmt = $db->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT $ps OFFSET $off");
        $stmt->execute();
        Response::paginated($stmt->fetchAll(),$total,$page,$ps);
    }
}
