<?php

class Validator {
    private array $errors = [];
    private array $data;

    public function __construct(array $data) {
        $this->data = $data;
    }

    public static function make(array $data): self {
        return new self($data);
    }

    public function required(string $field, string $label = ''): self {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        if (!isset($this->data[$field]) || trim((string)$this->data[$field]) === '') {
            $this->errors[$field] = "$label is required.";
        }
        return $this;
    }

    public function email(string $field): self {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Invalid email address.';
        }
        return $this;
    }

    public function min(string $field, int $min, string $label = ''): self {
        $label = $label ?: ucfirst($field);
        $val   = $this->data[$field] ?? '';
        if (strlen((string)$val) < $min) {
            $this->errors[$field] = "$label must be at least $min characters.";
        }
        return $this;
    }

    public function max(string $field, int $max, string $label = ''): self {
        $label = $label ?: ucfirst($field);
        $val   = $this->data[$field] ?? '';
        if (strlen((string)$val) > $max) {
            $this->errors[$field] = "$label must not exceed $max characters.";
        }
        return $this;
    }

    public function numeric(string $field, string $label = ''): self {
        $label = $label ?: ucfirst($field);
        if (isset($this->data[$field]) && !is_numeric($this->data[$field])) {
            $this->errors[$field] = "$label must be a number.";
        }
        return $this;
    }

    public function positive(string $field, string $label = ''): self {
        $label = $label ?: ucfirst($field);
        if (isset($this->data[$field]) && (float)$this->data[$field] < 0) {
            $this->errors[$field] = "$label must be a positive value.";
        }
        return $this;
    }

    public function in(string $field, array $options, string $label = ''): self {
        $label = $label ?: ucfirst($field);
        if (isset($this->data[$field]) && !in_array($this->data[$field], $options, true)) {
            $this->errors[$field] = "$label must be one of: " . implode(', ', $options) . '.';
        }
        return $this;
    }

    public function fails(): bool {
        return !empty($this->errors);
    }

    public function errors(): array {
        return $this->errors;
    }

    public function get(string $field, mixed $default = null): mixed {
        return $this->data[$field] ?? $default;
    }

    public function sanitize(string $field): string {
        return htmlspecialchars(strip_tags(trim($this->data[$field] ?? '')), ENT_QUOTES, 'UTF-8');
    }
}
