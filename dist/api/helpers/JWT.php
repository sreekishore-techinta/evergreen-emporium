<?php
require_once __DIR__ . '/../config/env.php';

class JWT {
    public static function encode(array $payload, int $expiry = 0): string {
        $expiry = $expiry ?: time() + JWT_EXPIRY;
        $payload['iat'] = time();
        $payload['exp'] = $expiry;

        $header  = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $body    = self::base64url(json_encode($payload));
        $sig     = self::base64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));

        return "$header.$body.$sig";
    }

    public static function decode(string $token): array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid token structure');
        }

        [$header, $body, $sig] = $parts;

        $expected = self::base64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
        if (!hash_equals($expected, $sig)) {
            throw new RuntimeException('Invalid token signature');
        }

        $payload = json_decode(self::base64urlDecode($body), true);
        if (!$payload) throw new RuntimeException('Invalid token payload');

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new RuntimeException('Token expired');
        }

        return $payload;
    }

    public static function getTokenFromRequest(): ?string {
        $auth = '';

        // 1. Standard FastCGI / mod_php key
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['HTTP_AUTHORIZATION'];
        }
        // 2. Apache mod_rewrite sets this via RewriteRule E=HTTP_AUTHORIZATION
        elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        // 3. cPanel/CGI: .htaccess SetEnvIf stores the value in this key
        elseif (!empty($_SERVER['Authorization'])) {
            $auth = $_SERVER['Authorization'];
        }
        // 4. Some cPanel servers use all-caps with no HTTP_ prefix
        elseif (!empty($_SERVER['AUTHORIZATION'])) {
            $auth = $_SERVER['AUTHORIZATION'];
        }
        // 5. getallheaders() — available on Apache + PHP module
        elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (is_array($headers)) {
                foreach ($headers as $key => $val) {
                    if (strcasecmp((string)$key, 'Authorization') === 0) {
                        $auth = (string)$val;
                        break;
                    }
                }
            }
        }
        // 6. apache_request_headers() — older alias
        elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (is_array($headers)) {
                foreach ($headers as $key => $val) {
                    if (strcasecmp((string)$key, 'Authorization') === 0) {
                        $auth = (string)$val;
                        break;
                    }
                }
            }
        }

        // 7. Last resort: scan all $_SERVER keys for any variant of the header
        if ($auth === '') {
            foreach ($_SERVER as $key => $val) {
                if (strcasecmp($key, 'HTTP_AUTHORIZATION') === 0 ||
                    strcasecmp($key, 'Authorization') === 0 ||
                    strcasecmp($key, 'AUTHORIZATION') === 0) {
                    $auth = (string)$val;
                    break;
                }
            }
        }

        $auth = trim($auth);
        if (stripos($auth, 'Bearer ') === 0) {
            return trim(substr($auth, 7));
        }
        return null;
    }

    public static function fromRequest(): array {
        $token = self::getTokenFromRequest();
        if ($token) {
            return self::decode($token);
        }
        throw new RuntimeException('No authorization token provided');
    }

    private static function base64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
