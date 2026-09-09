<?php
require_once __DIR__ . '/../models/CouponModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CouponController {
    private CouponModel $coupons;
    public function __construct() { $this->coupons = new CouponModel(); }

    public function validate(): void {
        AuthMiddleware::requireUser();
        $data  = AuthMiddleware::getRequestBody();
        $v     = Validator::make($data)->required('code')->required('order_total');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $result = $this->coupons->validate($data['code'], (float)$data['order_total']);
        if (!$result['valid']) Response::error($result['message'], 400);
        Response::success($result);
    }

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        $page = max(1,(int)($_GET['page']??1));
        $ps   = min((int)($_GET['page_size']??20),100);
        $res  = $this->coupons->all($page,$ps);
        Response::paginated($res['items'],$res['total'],$res['page'],$res['pageSize']);
    }

    public function adminShow(int $id): void {
        AuthMiddleware::requireAdmin();
        $c = $this->coupons->find($id);
        if (!$c) Response::notFound('Coupon not found.');
        Response::success($c);
    }

    public function store(): void {
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)
            ->required('code')->required('value')
            ->numeric('value')->positive('value')
            ->in('type', ['percent','fixed']);
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        $id = $this->coupons->create($data);
        Response::created($this->coupons->find($id), 'Coupon created.');
    }

    public function update(int $id): void {
        AuthMiddleware::requireAdmin();
        if (!$this->coupons->find($id)) Response::notFound('Coupon not found.');
        $data = AuthMiddleware::getRequestBody();
        $this->coupons->update($id, $data);
        Response::success($this->coupons->find($id), 'Coupon updated.');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        if (!$this->coupons->find($id)) Response::notFound('Coupon not found.');
        $this->coupons->delete($id);
        Response::success(null, 'Coupon deleted.');
    }
}
