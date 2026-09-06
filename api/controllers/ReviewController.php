<?php
require_once __DIR__ . '/../models/ReviewModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ReviewController {
    private ReviewModel $reviews;
    public function __construct() { $this->reviews = new ReviewModel(); }

    public function forProduct(int $productId): void {
        $page = max(1,(int)($_GET['page']??1));
        $ps   = min((int)($_GET['page_size']??10),50);
        $res  = $this->reviews->forProduct($productId,$page,$ps);
        Response::paginated($res['items'],$res['total'],$res['page'],$res['pageSize']);
    }

    public function create(): void {
        $p    = AuthMiddleware::requireUser();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)
            ->required('product_id')->required('rating')
            ->numeric('rating')->in('rating',['1','2','3','4','5']);
        if ($v->fails()) Response::error('Validation failed.',422,$v->errors());

        if ($this->reviews->userReview((int)$p['user_id'],(int)$data['product_id'])) {
            Response::error('You have already reviewed this product.',409);
        }

        $data['user_id'] = (int)$p['user_id'];
        $id = $this->reviews->create($data);
        Response::created(['id'=>$id],'Review submitted. It will appear after approval.');
    }

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        $f = ['status' => $_GET['status']??null, 'product_id' => isset($_GET['product_id'])?(int)$_GET['product_id']:null];
        $f = array_filter($f,fn($v)=>$v!==null&&$v!=='');
        $page = max(1,(int)($_GET['page']??1));
        $ps   = min((int)($_GET['page_size']??20),100);
        $res  = $this->reviews->adminList($f,$page,$ps);
        Response::paginated($res['items'],$res['total'],$res['page'],$res['pageSize']);
    }

    public function updateStatus(int $id): void {
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        if (empty($data['status'])) Response::error('Status required.',422);
        $ok = $this->reviews->updateStatus($id,$data['status']);
        if (!$ok) Response::error('Invalid status.',400);
        Response::success(null,'Review status updated.');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        $this->reviews->delete($id);
        Response::success(null,'Review deleted.');
    }
}
