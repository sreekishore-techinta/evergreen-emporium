/**
 * Evergreen Media — Admin API layer
 * All admin panel communication with the PHP REST API.
 */

// Base URL — paths in this file already include /api/admin/...
// Empty string = relative URLs, which work correctly on the live domain.
// Dev with XAMPP: set VITE_API_URL=http://localhost/evergreen-emporium in .env.local
export const ADMIN_API: string = (() => {
  const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  if (!raw) return ""; // production — use relative /api/* paths
  // Strip trailing /api or /api/ if accidentally included
  return raw.replace(/\/api\/?$/, "");
})();

// ── Token helpers ──────────────────────────────────────────────────
// Guard every localStorage access so SSR (server-side rendering) doesn't crash
// with "localStorage is not defined" — on the server window/localStorage don't exist.
const isBrowser = typeof window !== "undefined";

const KEY = "em_admin_token";
export const getAdminToken   = () => (isBrowser ? localStorage.getItem(KEY) ?? "" : "");
export const setAdminToken   = (t: string) => { if (isBrowser) localStorage.setItem(KEY, t); };
export const clearAdminToken = () => { if (isBrowser) localStorage.removeItem(KEY); };

const ADMIN_KEY = "em_admin_user";
export const getStoredAdmin  = () => {
  if (!isBrowser) return null;
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY) ?? "null"); } catch { return null; }
};
export const storeAdmin = (a: AdminUser) => { if (isBrowser) localStorage.setItem(ADMIN_KEY, JSON.stringify(a)); };
export const clearAdmin = () => { if (isBrowser) localStorage.removeItem(ADMIN_KEY); };

// ── Types ──────────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
}

export interface DashboardStats {
  stats: {
    products: { total: number; active: number; low_stock: number };
    orders: { total: number; pending: number; confirmed: number; processing: number; shipped: number; delivered: number; cancelled: number };
    revenue: { total: number; this_month: number };
    customers: { total: number; this_month: number };
  };
  recent_orders: RecentOrder[];
  low_stock: LowStockProduct[];
  sales_chart: SalesChartItem[];
}

export interface RecentOrder {
  id: number; order_number: string; grand_total: number;
  status: string; created_at: string; customer_name: string | null;
}

export interface LowStockProduct {
  id: number; name: string; sku: string; stock: number; low_stock_alert: number; category_name: string;
}

export interface SalesChartItem { date: string; orders: number; revenue: number; }

export interface AdminProduct {
  id: number; category_id: number; name: string; slug: string; sku: string;
  tagline: string | null; description: string | null; long_description: string | null;
  benefits: string[]; usage_info: string | null; type: string | null; badge: string | null;
  price: number; discount_price: number | null; stock: number; low_stock_alert: number;
  weight: string | null; primary_image: string | null; primary_image_url: string;
  rating: number; rating_count: number; is_active: boolean; is_featured: boolean;
  is_bestseller: boolean; applications: string[]; category_name: string; sort_order: number;
  images?: { id: number; url: string; image_path: string; is_primary: boolean; sort_order: number }[];
}

export interface AdminCategory {
  id: number; name: string; slug: string; description: string | null;
  image: string | null; sort_order: number; is_active: boolean; product_count?: number;
}

export interface AdminOrder {
  id: number; order_number: string; user_id: number | null; status: string;
  subtotal: number; shipping_charge: number; discount_amount: number; grand_total: number;
  coupon_code: string | null; payment_status: string; payment_method: string | null;
  ship_name: string; ship_phone: string; ship_line1: string; ship_line2: string | null;
  ship_city: string; ship_state: string; ship_pincode: string;
  created_at: string; item_count?: number; customer_name: string | null; customer_email: string | null;
  items?: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: number; product_name: string; product_sku: string; product_image: string | null;
  quantity: number; unit_price: number; line_total: number;
}

export interface AdminCustomer {
  id: number; name: string; email: string; phone: string | null;
  is_active: boolean; email_verified: boolean; last_login_at: string | null; created_at: string;
}

export interface AdminCoupon {
  id: number; code: string; type: string; value: number; min_order: number;
  max_discount: number | null; usage_limit: number | null; used_count: number;
  starts_at: string | null; expires_at: string | null; is_active: boolean;
}

export interface AdminReview {
  id: number; product_id: number; user_id: number; rating: number;
  title: string | null; body: string | null; status: string;
  created_at: string; user_name: string; product_name: string;
}

export interface Pagination {
  total: number; page: number; page_size: number; total_pages: number;
}

export interface PagedResult<T> { data: T[]; pagination: Pagination; success: boolean; }

// ── Core fetch ─────────────────────────────────────────────────────
export async function adminRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ success: boolean; message?: string; data?: T; errors?: Record<string, string> }> {
  const token = getAdminToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res  = await fetch(`${ADMIN_API}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (res.status === 401) { clearAdminToken(); clearAdmin(); if (isBrowser) window.location.href = "/admin"; }
    return json;
  } catch {
    return { success: false, message: "Network error." };
  }
}

export async function adminPaged<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<PagedResult<T>> {
  const token = getAdminToken();
  const qs    = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") qs.set(k, String(v)); });
  const url = `${ADMIN_API}${path}${qs.toString() ? "?" + qs : ""}`;
  try {
    const res  = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    return await res.json();
  } catch {
    return { success: false, data: [], pagination: { total: 0, page: 1, page_size: 20, total_pages: 0 } };
  }
}

// ── Admin API namespaces ───────────────────────────────────────────
export const adminAuthApi = {
  login:          (email: string, password: string) => adminRequest<{ admin: AdminUser; token: string; expires_at: number }>("POST", "/api/admin/auth/login", { email, password }),
  logout:         () => adminRequest("POST", "/api/admin/auth/logout"),
  me:             () => adminRequest<AdminUser>("GET", "/api/admin/auth/me"),
  changePassword: (current_password: string, new_password: string) => adminRequest("POST", "/api/admin/auth/change-password", { current_password, new_password }),
};

export const adminProductsApi = {
  list:     (p?: Record<string, string | number | boolean | undefined>) => adminPaged<AdminProduct>("/api/admin/products", p),
  get:      (id: number) => adminRequest<AdminProduct>("GET", `/api/admin/products/${id}`),
  create:   (data: Partial<AdminProduct> & { benefits?: string[]; applications?: string[] }) => adminRequest<AdminProduct>("POST", "/api/admin/products", data),
  update:   (id: number, data: Partial<AdminProduct> & { benefits?: string[]; applications?: string[] }) => adminRequest<AdminProduct>("PATCH", `/api/admin/products/${id}`, data),
  delete:   (id: number) => adminRequest("DELETE", `/api/admin/products/${id}`),
  uploadImage: async (productId: number, file: File, isPrimary: boolean) => {
    const fd = new FormData();
    fd.append("image", file);
    if (isPrimary) fd.append("is_primary", "1");
    const res = await fetch(`${ADMIN_API}/api/admin/products/${productId}/images`, {
      method: "POST", headers: { Authorization: `Bearer ${getAdminToken()}` }, body: fd,
    });
    return res.json();
  },
  deleteImage:    (productId: number, imageId: number) => adminRequest("DELETE", `/api/admin/products/${productId}/images/${imageId}`),
  setPrimaryImage:(productId: number, imageId: number) => adminRequest("PATCH",  `/api/admin/products/${productId}/images/${imageId}/primary`),
};

export const adminCategoriesApi = {
  list:   () => adminRequest<AdminCategory[]>("GET", "/api/admin/categories"),
  create: (data: Partial<AdminCategory>) => adminRequest<AdminCategory>("POST",  "/api/admin/categories", data),
  update: (id: number, data: Partial<AdminCategory>) => adminRequest<AdminCategory>("PATCH", `/api/admin/categories/${id}`, data),
  delete: (id: number) => adminRequest("DELETE", `/api/admin/categories/${id}`),
};

export const adminOrdersApi = {
  list:          (p?: Record<string, string | number | undefined>) => adminPaged<AdminOrder>("/api/admin/orders", p),
  get:           (id: number) => adminRequest<AdminOrder>("GET", `/api/admin/orders/${id}`),
  updateStatus:  (id: number, status: string) => adminRequest("PATCH", `/api/admin/orders/${id}/status`, { status }),
  updatePayment: (id: number, payment_status: string) => adminRequest("PATCH", `/api/admin/orders/${id}/payment-status`, { payment_status }),
};

export const adminCustomersApi = {
  list:      (p?: Record<string, string | number | undefined>) => adminPaged<AdminCustomer>("/api/admin/customers", p),
  get:       (id: number) => adminRequest<AdminCustomer & { recent_orders: AdminOrder[] }>("GET", `/api/admin/customers/${id}`),
  setActive: (id: number, is_active: boolean) => adminRequest("PATCH", `/api/admin/customers/${id}/status`, { is_active: is_active ? 1 : 0 }),
};

export const adminCouponsApi = {
  list:   (p?: Record<string, string | number | undefined>) => adminPaged<AdminCoupon>("/api/admin/coupons", p),
  create: (data: Partial<AdminCoupon>) => adminRequest<AdminCoupon>("POST",  "/api/admin/coupons", data),
  update: (id: number, data: Partial<AdminCoupon>) => adminRequest<AdminCoupon>("PATCH", `/api/admin/coupons/${id}`, data),
  delete: (id: number) => adminRequest("DELETE", `/api/admin/coupons/${id}`),
};

export const adminReviewsApi = {
  list:         (p?: Record<string, string | number | undefined>) => adminPaged<AdminReview>("/api/admin/reviews", p),
  updateStatus: (id: number, status: string) => adminRequest("PATCH", `/api/admin/reviews/${id}/status`, { status }),
  delete:       (id: number) => adminRequest("DELETE", `/api/admin/reviews/${id}`),
};

export const adminDashboardApi = {
  stats:          () => adminRequest<DashboardStats>("GET", "/api/admin/dashboard"),
  getSettings:    () => adminRequest<{ setting_key: string; value: string; type: string; label: string }[]>("GET", "/api/admin/settings"),
  updateSettings: (data: Record<string, string>) => adminRequest("POST", "/api/admin/settings", data),
};
