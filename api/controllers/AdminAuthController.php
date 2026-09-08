<?php
require_once __DIR__ . '/../models/AdminModel.php';
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminAuthController {

    private AdminModel $admins;

    public function __construct() { $this->admins = new AdminModel(); }

    public function login(): void {
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)->required('email')->required('password');
        if ($v->fails()) Response::error('Email and password required.', 422, $v->errors());

        $admin = $this->admins->findByEmail($data['email']);
        if (!$admin || !$this->admins->verifyPassword($admin, $data['password'])) {
            Response::unauthorized('Invalid credentials.');
        }

        $expiry = time() + JWT_ADMIN_EXPIRY;
        $token  = JWT::encode(['admin_id' => $admin['id'], 'role' => $admin['role'], 'type' => 'admin'], $expiry);

        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $this->admins->saveSession((int)$admin['id'], $token, $ip, $ua, $expiry);
        $this->admins->touchLogin((int)$admin['id'], $ip);
        $this->admins->purgeExpiredSessions();

        unset($admin['password_hash']);
        Response::success(['admin' => $admin, 'token' => $token, 'expires_at' => $expiry], 'Login successful.');
    }

    public function logout(): void {
        try {
            $token = JWT::getTokenFromRequest();
            if ($token) $this->admins->revokeSession($token);
        } catch (Throwable) {}
        Response::success(null, 'Logged out.');
    }

    public function me(): void {
        $payload = AuthMiddleware::requireAdmin();
        $admin   = $this->admins->findById((int)$payload['admin_id']);
        if (!$admin) Response::notFound('Admin not found.');
        Response::success($admin);
    }

    public function changePassword(): void {
        $payload = AuthMiddleware::requireAdmin();
        $data    = AuthMiddleware::getRequestBody();
        $v       = Validator::make($data)
            ->required('current_password')
            ->required('new_password')->min('new_password', 8);
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $stmt = Database::connect()->prepare("SELECT * FROM admins WHERE id=?");
        $stmt->execute([$payload['admin_id']]);
        $full = $stmt->fetch();
        if (!$full || !$this->admins->verifyPassword($full, $data['current_password'])) {
            Response::error('Current password is incorrect.', 400);
        }
        $this->admins->updatePassword((int)$payload['admin_id'], $data['new_password']);
        Response::success(null, 'Password changed successfully.');
    }
}
