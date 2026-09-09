<?php
require_once __DIR__ . '/../models/CartModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CartController {

    private CartModel $cart;

    public function __construct() { $this->cart = new CartModel(); }

    public function index(): void {
        $p = AuthMiddleware::requireUser();
        Response::success($this->cart->getItems((int)$p['user_id']));
    }

    public function add(): void {
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)->required('product_id')->numeric('product_id');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        try {
            $qty = max(1, (int)($data['quantity'] ?? 1));
            $this->cart->addItem((int)$p['user_id'], (int)$data['product_id'], $qty);
            Response::success($this->cart->getItems((int)$p['user_id']), 'Added to cart.');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(): void {
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)->required('product_id')->required('quantity');
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        try {
            $this->cart->updateItem((int)$p['user_id'], (int)$data['product_id'], (int)$data['quantity']);
            Response::success($this->cart->getItems((int)$p['user_id']), 'Cart updated.');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function remove(): void {
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['product_id'])) Response::error('product_id required.', 422);

        $this->cart->removeItem((int)$p['user_id'], (int)$data['product_id']);
        Response::success($this->cart->getItems((int)$p['user_id']), 'Item removed.');
    }

    public function clear(): void {
        $p = AuthMiddleware::requireUser();
        $this->cart->clear((int)$p['user_id']);
        Response::success(null, 'Cart cleared.');
    }
}
