<?php
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../models/AdminModel.php';

class AuthMiddleware {

    /** Require a valid customer JWT. Returns payload. */
    public static function requireUser(): array {
        try {
            $payload = JWT::fromRequest();
            if (empty($payload['user_id']) || ($payload['type'] ?? '') !== 'user') {
                Response::unauthorized('Invalid user token.');
            }
            return $payload;
        } catch (RuntimeException $e) {
            Response::unauthorized($e->getMessage());
        }
    }

    /** Require a valid admin JWT. Returns payload. */
    public static function requireAdmin(): array {
        try {
            $payload = JWT::fromRequest();
            if (empty($payload['admin_id']) || ($payload['type'] ?? '') !== 'admin') {
                Response::unauthorized('Admin access required.');
            }
            // Also validate against DB session
            $token = substr($_SERVER['HTTP_AUTHORIZATION'] ?? '', 7);
            $model = new AdminModel();
            if (!$model->validateSession($token)) {
                Response::unauthorized('Session expired. Please log in again.');
            }
            return $payload;
        } catch (RuntimeException $e) {
            Response::unauthorized($e->getMessage());
        }
    }

    /** Optional user auth — returns payload or null */
    public static function optionalUser(): ?array {
        try {
            $payload = JWT::fromRequest();
            if (!empty($payload['user_id']) && ($payload['type'] ?? '') === 'user') {
                return $payload;
            }
        } catch (RuntimeException) {}
        return null;
    }

    public static function getRequestBody(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    public static function getMethod(): string {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }
}
