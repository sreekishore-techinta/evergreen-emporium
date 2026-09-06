<?php
require_once __DIR__ . '/BaseModel.php';

class CouponModel extends BaseModel {

    public function findByCode(string $code): ?array {
        $stmt = $this->db->prepare("SELECT * FROM coupons WHERE code=?");
        $stmt->execute([strtoupper(trim($code))]);
        return $stmt->fetch() ?: null;
    }

    public function validate(string $code, float $orderTotal): array {
        $c = $this->findByCode($code);

        if (!$c) return ['valid' => false, 'message' => 'Coupon not found.'];
        if (!$c['is_active']) return ['valid' => false, 'message' => 'Coupon is inactive.'];

        $now = time();
        if ($c['starts_at'] && strtotime($c['starts_at']) > $now)
            return ['valid' => false, 'message' => 'Coupon not yet active.'];
        if ($c['expires_at'] && strtotime($c['expires_at']) < $now)
            return ['valid' => false, 'message' => 'Coupon has expired.'];
        if ($c['usage_limit'] !== null && $c['used_count'] >= $c['usage_limit'])
            return ['valid' => false, 'message' => 'Coupon usage limit reached.'];
        if ($orderTotal < (float)$c['min_order'])
            return ['valid' => false, 'message' => "Minimum order ₹{$c['min_order']} required."];

        $discount = $c['type'] === 'percent'
            ? ($orderTotal * $c['value'] / 100)
            : (float)$c['value'];

        if ($c['max_discount'] !== null) {
            $discount = min($discount, (float)$c['max_discount']);
        }
        $discount = round($discount, 2);

        return [
            'valid'      => true,
            'coupon_id'  => $c['id'],
            'code'       => $c['code'],
            'type'       => $c['type'],
            'value'      => $c['value'],
            'discount'   => $discount,
            'message'    => "Coupon applied! You save ₹{$discount}.",
        ];
    }

    public function all(int $page = 1, int $ps = 20): array {
        return $this->paginate("SELECT * FROM coupons ORDER BY created_at DESC", [], $page, $ps);
    }

    public function find(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM coupons WHERE id=?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $d): int {
        $stmt = $this->db->prepare(
            "INSERT INTO coupons
               (code,type,value,min_order,max_discount,usage_limit,starts_at,expires_at,is_active)
             VALUES (?,?,?,?,?,?,?,?,?)"
        );
        $stmt->execute([
            strtoupper(trim($d['code'])),
            $d['type'] ?? 'percent',
            $d['value'],
            $d['min_order']    ?? 0,
            $d['max_discount'] ?? null,
            $d['usage_limit']  ?? null,
            $d['starts_at']    ?? null,
            $d['expires_at']   ?? null,
            $d['is_active']    ?? 1,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $d): bool {
        $allowed = ['type','value','min_order','max_discount','usage_limit','starts_at','expires_at','is_active'];
        $fields  = []; $params = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $d)) { $fields[] = "`$f`=?"; $params[] = $d[$f]; }
        }
        if (!$fields) return false;
        $params[] = $id;
        return $this->db->prepare("UPDATE coupons SET " . implode(',', $fields) . " WHERE id=?")
                        ->execute($params);
    }

    public function delete(int $id): bool {
        return $this->db->prepare("DELETE FROM coupons WHERE id=?")->execute([$id]);
    }
}
