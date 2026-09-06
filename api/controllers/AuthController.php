<?php
require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController {

    private UserModel $users;

    public function __construct() { $this->users = new UserModel(); }

    public function register(): void {
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)
            ->required('name')->max('name', 120)
            ->required('email')->email('email')
            ->required('password')->min('password', 8, 'Password');

        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        if ($this->users->findByEmail($data['email'])) {
            Response::error('Email already registered.', 409);
        }

        $id   = $this->users->create($data);
        $user = $this->users->findById($id);
        $token = JWT::encode(['user_id' => $id, 'type' => 'user'], time() + JWT_EXPIRY);

        Response::created(['user' => $user, 'token' => $token], 'Registration successful.');
    }

    public function login(): void {
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)->required('email')->required('password');
        if ($v->fails()) Response::error('Email and password required.', 422, $v->errors());

        $user = $this->users->findByEmail($data['email']);
        if (!$user || !$this->users->verifyPassword($user, $data['password'])) {
            Response::unauthorized('Invalid email or password.');
        }
        if (!$user['is_active']) {
            Response::forbidden('Account is disabled. Please contact support.');
        }

        $this->users->touchLogin((int)$user['id']);
        $token = JWT::encode(['user_id' => $user['id'], 'type' => 'user'], time() + JWT_EXPIRY);

        unset($user['password_hash']);
        Response::success(['user' => $user, 'token' => $token], 'Login successful.');
    }

    public function profile(): void {
        $payload = AuthMiddleware::requireUser();
        $user    = $this->users->findById((int)$payload['user_id']);
        if (!$user) Response::notFound('User not found.');
        Response::success($user);
    }

    public function updateProfile(): void {
        $payload = AuthMiddleware::requireUser();
        $data    = AuthMiddleware::getRequestBody();
        $v       = Validator::make($data)->max('name', 120)->max('phone', 20);
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $this->users->updateProfile((int)$payload['user_id'], $data);
        $user = $this->users->findById((int)$payload['user_id']);
        Response::success($user, 'Profile updated.');
    }

    public function changePassword(): void {
        $payload = AuthMiddleware::requireUser();
        $data    = AuthMiddleware::getRequestBody();
        $v       = Validator::make($data)
            ->required('current_password')
            ->required('new_password')->min('new_password', 8, 'New password');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $user = $this->users->findByEmail(''); // load full row
        // Load full user with password hash
        $stmt = Database::connect()->prepare("SELECT * FROM users WHERE id=?");
        $stmt->execute([$payload['user_id']]);
        $full = $stmt->fetch();

        if (!$full || !$this->users->verifyPassword($full, $data['current_password'])) {
            Response::error('Current password is incorrect.', 400);
        }
        $this->users->updatePassword((int)$payload['user_id'], $data['new_password']);
        Response::success(null, 'Password changed successfully.');
    }

    public function logout(): void {
        // JWT is stateless for users; client discards token.
        Response::success(null, 'Logged out successfully.');
    }
}
