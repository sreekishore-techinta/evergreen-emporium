<?php
/**
 * Evergreen Media API Router
 * Simple pattern-based router — no framework needed.
 */

require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../config/env.php';

// Autoload all helpers, models, middleware, controllers
$dirs = ['helpers','models','middleware','controllers'];
foreach ($dirs as $dir) {
    foreach (glob(__DIR__ . "/../{$dir}/*.php") as $file) {
        require_once $file;
    }
}

class Router {
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void {
        $this->routes[] = compact('method', 'pattern', 'handler');
    }

    public function get(string $p, callable $h): void  { $this->add('GET',    $p, $h); }
    public function post(string $p, callable $h): void { $this->add('POST',   $p, $h); }
    public function put(string $p, callable $h): void  { $this->add('PUT',    $p, $h); }
    public function patch(string $p, callable $h): void{ $this->add('PATCH',  $p, $h); }
    public function delete(string $p, callable $h): void{ $this->add('DELETE', $p, $h); }

    public function dispatch(string $method, string $uri): void {
        // Strip query string
        $uri = strtok($uri, '?');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $pattern = preg_replace('/\{(\w+)\}/', '([^/]+)', $route['pattern']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                // Cast numeric segments
                $params = array_map(fn($m) => is_numeric($m) ? (int)$m : $m, $matches);
                call_user_func_array($route['handler'], $params);
                return;
            }
        }

        Response::notFound('Endpoint not found: ' . $method . ' ' . $uri);
    }
}

// ── Instantiate router ────────────────────────────────────────────
$r = new Router();

// ── Auth ──────────────────────────────────────────────────────────
$auth = new AuthController();
$r->post('/api/auth/register',        [$auth, 'register']);
$r->post('/api/auth/login',           [$auth, 'login']);
$r->post('/api/auth/logout',          [$auth, 'logout']);
$r->get ('/api/auth/profile',         [$auth, 'profile']);
$r->put ('/api/auth/profile',         [$auth, 'updateProfile']);
$r->post('/api/auth/change-password', [$auth, 'changePassword']);

// ── Admin Auth ────────────────────────────────────────────────────
$adminAuth = new AdminAuthController();
$r->post('/api/admin/auth/login',           [$adminAuth, 'login']);
$r->post('/api/admin/auth/logout',          [$adminAuth, 'logout']);
$r->get ('/api/admin/auth/me',              [$adminAuth, 'me']);
$r->post('/api/admin/auth/change-password', [$adminAuth, 'changePassword']);

// ── Categories (public) ───────────────────────────────────────────
$cats = new CategoryController();
$r->get('/api/categories',        [$cats, 'index']);
$r->get('/api/categories/{id}',   [$cats, 'show']);

// ── Categories (admin) ────────────────────────────────────────────
$r->get   ('/api/admin/categories',        [$cats, 'adminIndex']);
$r->post  ('/api/admin/categories',        [$cats, 'store']);
$r->put   ('/api/admin/categories/{id}',   [$cats, 'update']);
$r->patch ('/api/admin/categories/{id}',   [$cats, 'update']);
$r->delete('/api/admin/categories/{id}',   [$cats, 'destroy']);

// ── Products (public) ─────────────────────────────────────────────
$prods = new ProductController();
$r->get('/api/products',               [$prods, 'index']);
$r->get('/api/products/{id}',          [$prods, 'show']);
$r->get('/api/products/slug/{slug}',   [$prods, 'showBySlug']);

// ── Products (admin) ──────────────────────────────────────────────
$r->get   ('/api/admin/products',                           [$prods, 'adminIndex']);
$r->get   ('/api/admin/products/{id}',                      [$prods, 'adminShow']);
$r->post  ('/api/admin/products',                           [$prods, 'store']);
$r->put   ('/api/admin/products/{id}',                      [$prods, 'update']);
$r->patch ('/api/admin/products/{id}',                      [$prods, 'update']);
$r->delete('/api/admin/products/{id}',                      [$prods, 'destroy']);
$r->post  ('/api/admin/products/{id}/images',               [$prods, 'uploadImage']);
$r->delete('/api/admin/products/{id}/images/{imageId}',     [$prods, 'deleteImage']);
$r->patch ('/api/admin/products/{id}/images/{imageId}/primary', [$prods, 'setPrimaryImage']);
$r->patch ('/api/admin/products/{id}/stock',                [$prods, 'adjustStock']);
$r->get   ('/api/admin/products/{id}/stock/history',        [$prods, 'stockHistory']);

// ── Cart ──────────────────────────────────────────────────────────
$cart = new CartController();
$r->get   ('/api/cart',        [$cart, 'index']);
$r->post  ('/api/cart/add',    [$cart, 'add']);
$r->put   ('/api/cart/update', [$cart, 'update']);
$r->post  ('/api/cart/remove', [$cart, 'remove']);
$r->delete('/api/cart/clear',  [$cart, 'clear']);

// ── Wishlist ──────────────────────────────────────────────────────
$wish = new WishlistController();
$r->get   ('/api/wishlist',                 [$wish, 'index']);
$r->post  ('/api/wishlist/add',             [$wish, 'add']);
$r->post  ('/api/wishlist/toggle',          [$wish, 'toggle']);
$r->delete('/api/wishlist/{productId}',     [$wish, 'remove']);

// ── Orders (customer) ─────────────────────────────────────────────
$ord = new OrderController();
$r->post('/api/checkout',        [$ord, 'checkout']);
$r->get ('/api/orders',          [$ord, 'myOrders']);
$r->get ('/api/orders/{id}',     [$ord, 'myOrder']);

// ── Orders (admin) ────────────────────────────────────────────────
$r->get  ('/api/admin/orders',                     [$ord, 'adminIndex']);
$r->get  ('/api/admin/orders/{id}',                [$ord, 'adminShow']);
$r->patch('/api/admin/orders/{id}/status',         [$ord, 'updateStatus']);
$r->patch('/api/admin/orders/{id}/payment-status', [$ord, 'updatePayment']);
$r->post ('/api/admin/orders/{id}/cancel',         [$ord, 'cancel']);

// ── Coupons ───────────────────────────────────────────────────────
$coup = new CouponController();
$r->post  ('/api/coupons/validate',     [$coup, 'validate']);
$r->get   ('/api/admin/coupons',        [$coup, 'adminIndex']);
$r->get   ('/api/admin/coupons/{id}',   [$coup, 'adminShow']);
$r->post  ('/api/admin/coupons',        [$coup, 'store']);
$r->put   ('/api/admin/coupons/{id}',   [$coup, 'update']);
$r->patch ('/api/admin/coupons/{id}',   [$coup, 'update']);
$r->delete('/api/admin/coupons/{id}',   [$coup, 'destroy']);

// ── Reviews ───────────────────────────────────────────────────────
$rev = new ReviewController();
$r->get   ('/api/products/{id}/reviews',        [$rev, 'forProduct']);
$r->post  ('/api/reviews',                      [$rev, 'create']);
$r->get   ('/api/admin/reviews',                [$rev, 'adminIndex']);
$r->patch ('/api/admin/reviews/{id}/status',    [$rev, 'updateStatus']);
$r->delete('/api/admin/reviews/{id}',           [$rev, 'destroy']);

// ── Dashboard ─────────────────────────────────────────────────────
$dash = new DashboardController();
$r->get  ('/api/admin/dashboard',                [$dash, 'index']);
$r->get  ('/api/admin/settings',                 [$dash, 'settings']);
$r->post ('/api/admin/settings',                 [$dash, 'updateSettings']);
$r->get  ('/api/admin/customers',                [$dash, 'customers']);
$r->get  ('/api/admin/customers/{id}',           [$dash, 'customerDetail']);
$r->patch('/api/admin/customers/{id}/status',    [$dash, 'setCustomerActive']);
$r->get  ('/api/admin/messages',                 [$dash, 'contactMessages']);

// ── Contact ───────────────────────────────────────────────────────
$r->post('/api/contact', function() {
    $data = AuthMiddleware::getRequestBody();
    $v    = Validator::make($data)->required('name')->required('email')->required('message')->email('email');
    if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());
    $db = Database::connect();
    $db->prepare("INSERT INTO contact_messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)")
       ->execute([$data['name'],$data['email'],$data['phone']??null,$data['subject']??null,$data['message']]);
    Response::created(null, 'Message sent. We\'ll get back to you soon.');
});

// ── Newsletter ────────────────────────────────────────────────────
$r->post('/api/newsletter/subscribe', function() {
    $data = AuthMiddleware::getRequestBody();
    $v    = Validator::make($data)->required('email')->email('email');
    if ($v->fails()) Response::error('Invalid email.', 422, $v->errors());
    $db = Database::connect();
    $db->prepare("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)")
       ->execute([strtolower(trim($data['email']))]);
    Response::success(null, 'Subscribed successfully.');
});

return $r;
