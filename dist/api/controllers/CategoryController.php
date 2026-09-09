<?php
require_once __DIR__ . '/../models/CategoryModel.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../helpers/Upload.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CategoryController {

    private CategoryModel $cats;

    public function __construct() { $this->cats = new CategoryModel(); }

    public function index(): void {
        $withCount = !empty($_GET['with_count']);
        $data      = $withCount ? $this->cats->withProductCount() : $this->cats->all(true);
        Response::success($data);
    }

    public function show(int $id): void {
        $cat = $this->cats->find($id);
        if (!$cat) Response::notFound('Category not found.');
        Response::success($cat);
    }

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        Response::success($this->cats->withProductCount());
    }

    public function store(): void {
        AuthMiddleware::requireAdmin();
        $data = AuthMiddleware::getRequestBody();
        $v    = Validator::make($data)->required('name')->max('name', 120);
        if ($v->fails()) Response::error('Validation failed.', 422, $v->errors());

        // Handle image upload if sent as multipart
        if (!empty($_FILES['image'])) {
            try { $data['image'] = Upload::image($_FILES['image'], 'categories'); }
            catch (RuntimeException $e) { Response::error($e->getMessage(), 422); }
        }

        $id  = $this->cats->create($data);
        $cat = $this->cats->find($id);
        Response::created($cat, 'Category created.');
    }

    public function update(int $id): void {
        AuthMiddleware::requireAdmin();
        if (!$this->cats->find($id)) Response::notFound('Category not found.');
        $data = AuthMiddleware::getRequestBody();

        if (!empty($_FILES['image'])) {
            try { $data['image'] = Upload::image($_FILES['image'], 'categories'); }
            catch (RuntimeException $e) { Response::error($e->getMessage(), 422); }
        }

        $this->cats->update($id, $data);
        Response::success($this->cats->find($id), 'Category updated.');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        try {
            $this->cats->delete($id);
            Response::success(null, 'Category deleted.');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 409);
        }
    }
}
