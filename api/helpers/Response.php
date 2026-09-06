<?php

class Response {
    public static function json(mixed $data, int $code = 200): never {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $code = 200): never {
        self::json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    public static function created(mixed $data = null, string $message = 'Created'): never {
        self::success($data, $message, 201);
    }

    public static function error(string $message, int $code = 400, mixed $errors = null): never {
        $payload = ['success' => false, 'message' => $message];
        if ($errors !== null) $payload['errors'] = $errors;
        self::json($payload, $code);
    }

    public static function notFound(string $message = 'Not found'): never {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Unauthorized'): never {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden'): never {
        self::error($message, 403);
    }

    public static function serverError(string $message = 'Internal server error'): never {
        self::error(APP_DEBUG ? $message : 'Internal server error', 500);
    }

    public static function paginated(array $items, int $total, int $page, int $pageSize): never {
        self::json([
            'success'    => true,
            'data'       => $items,
            'pagination' => [
                'total'       => $total,
                'page'        => $page,
                'page_size'   => $pageSize,
                'total_pages' => (int)ceil($total / max(1, $pageSize)),
            ],
        ]);
    }
}
