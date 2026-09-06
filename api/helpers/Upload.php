<?php
require_once __DIR__ . '/../config/env.php';

class Upload {
    public static function image(array $file, string $subdir = 'products'): string {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Upload error: ' . $file['error']);
        }

        if ($file['size'] > MAX_FILE_SIZE) {
            throw new RuntimeException('File too large. Maximum size is 5MB.');
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, ALLOWED_TYPES, true)) {
            throw new RuntimeException('Invalid file type. Allowed: JPG, PNG, WebP, GIF.');
        }

        $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ALLOWED_EXT, true)) {
            throw new RuntimeException('Invalid file extension.');
        }

        $filename  = uniqid('img_', true) . '_' . time() . '.' . $ext;
        $targetDir = UPLOAD_DIR . $subdir . '/';

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $targetPath = $targetDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Failed to save uploaded file.');
        }

        return 'uploads/' . $subdir . '/' . $filename;
    }

    public static function delete(string $path): void {
        $fullPath = __DIR__ . '/../' . ltrim($path, '/');
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    public static function url(string $path): string {
        if (empty($path)) return '';
        if (str_starts_with($path, 'http')) return $path;
        return API_URL . '/' . ltrim($path, '/');
    }
}
