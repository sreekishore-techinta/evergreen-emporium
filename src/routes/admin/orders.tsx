import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, X, XCircle, PackageX } from "lucide-react";
import { adminOrdersApi, type AdminOrder } from "@/lib/adminApi";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Evergreen Admin" }] }),
  component: OrdersPage,
});

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled"] as const;

// Statuses from which an order can be cancelled (must match backend)
const CANCELLABLE = new Set(["pending","confirmed","processing"]);

const BADGE: Record<string, string> = {
  pending:    "bg-orange-100 text-orange-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  paid:       "bg-green-100 text-green-700",
  pending_pay:"bg-orange-100 text-orange-700",
  failed:     "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-600",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}
function fmt(n: number) { return Number(n || 0).toLocaleString("en-IN"); }

type ToastState = { msg: string; ok: boolean };

function OrdersPage() {
  const [orders, setOrders]         = useState<AdminOrder[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [loading, setLoading]       = useState(true);
  const [detail, setDetail]         = useState<AdminOrder | null>(null);
  const [toast, setToast]           = useState<ToastState>({ msg: "", ok: true });
  const [cancelling, setCancelling] = useState(false);

  // Cancel confirmation dialog
  const [cancelDialog, setCancelDialog] = useState(false);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3500);
  }

  async function load() {
    setLoading(true);
    const res = await adminOrdersApi.list({
      page, page_size: 15,
      search: search || undefined,
      status: statusFilter || undefined,
    });
    setOrders(res.data || []);
    setTotal(res.pagination?.total ?? 0);
    setTotalPages(res.pagination?.total_pages ?? 1);
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, statusFilter]); // eslint-disable-line

  async function openDetail(id: number) {
    const res = await adminOrdersApi.get(id);
    if (res.success && res.data) setDetail(res.data);
  }

  async function updateStatus(id: number, status: string) {
    const res = await adminOrdersApi.updateStatus(id, status);
    if (res.success && res.data) {
      showToast("Status updated.");
      setDetail(res.data);
      load();
    } else {
      showToast(res.message ?? "Update failed.", false);
    }
  }

  async function confirmCancel() {
    if (!detail) return;
    setCancelling(true);
    const res = await adminOrdersApi.cancel(detail.id);
    setCancelling(false);
    setCancelDialog(false);
    if (res.success && res.data) {
      showToast(`Order cancelled — stock restored for ${detail.items?.length ?? 0} item(s).`);
      setDetail(res.data);
      load();
    } else {
      showToast(res.message ?? "Cancel failed.", false);
    }
  }

  // Total units being restored if cancelled
  const cancelRestoreCount = detail?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div className="p-6">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg flex items-center gap-2 ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Order #, customer…"
            className="outline-none text-sm flex-1"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button onClick={() => { setPage(1); load(); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          Filter
        </button>
        <span className="ml-auto text-xs text-gray-400">{total} orders</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Order #","Date","Customer","Items","Total","Status","Payment","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading…</td></tr>
              )}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found.</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#1f5c3a]">{o.order_number}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{o.customer_name ?? "Guest"}</p>
                    {o.customer_email && <p className="text-[11px] text-gray-400">{o.customer_email}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">{o.item_count ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold">₹{fmt(o.grand_total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${BADGE[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${BADGE[o.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(o.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="size-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="size-4"/></button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="size-4"/></button>
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ──────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-800">Order — {detail.order_number}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${BADGE[detail.status] ?? ""}`}>
                  {detail.status}
                </span>
              </div>
              <button onClick={() => setDetail(null)}>
                <X className="size-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* Cancelled stock-restore notice */}
              {detail.status === "cancelled" && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <PackageX className="size-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">
                    This order was cancelled. Stock has been automatically restored for all items.
                  </p>
                </div>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Customer</p>
                  <p className="font-semibold text-gray-800">{detail.customer_name ?? "Guest"}</p>
                  {detail.customer_email && <p className="text-sm text-gray-500">{detail.customer_email}</p>}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Placed</p>
                  <p className="text-gray-800">{fmtDate(detail.created_at)}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${BADGE[detail.payment_status] ?? ""}`}>
                      {detail.payment_status}
                    </span>
                    {detail.coupon_code && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
                        {detail.coupon_code}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ship To</p>
                  <p className="font-medium text-gray-800">{detail.ship_name}</p>
                  <p className="text-sm text-gray-500">
                    {detail.ship_line1}{detail.ship_line2 ? ", " + detail.ship_line2 : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {detail.ship_city}, {detail.ship_state} — {detail.ship_pincode}
                  </p>
                  <p className="text-sm text-gray-500">{detail.ship_phone}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Update Status</p>
                  {detail.status === "cancelled" ? (
                    <p className="text-sm text-red-500 font-medium italic">Order is cancelled — cannot change status.</p>
                  ) : (
                    <select
                      value={detail.status}
                      onChange={e => updateStatus(detail.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a]"
                    >
                      {STATUSES.filter(s => s !== "cancelled").map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Items table — shows stock-out per item */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
                  Order Items
                  <span className="ml-2 font-normal normal-case text-gray-400">
                    (stock {detail.status === "cancelled" ? "restored" : "deducted"} on order)
                  </span>
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Product</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">Qty</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">Stock Δ</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">Unit</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items ?? []).map(item => (
                      <tr key={item.id} className="border-t border-gray-50">
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-gray-800">{item.product_name}</p>
                          <p className="text-[11px] text-gray-400">{item.product_sku}</p>
                        </td>
                        <td className="px-3 py-2.5 text-right">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right">
                          {detail.status === "cancelled" ? (
                            <span className="text-green-600 font-semibold">+{item.quantity}</span>
                          ) : (
                            <span className="text-red-500 font-semibold">−{item.quantity}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">₹{fmt(item.unit_price)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">₹{fmt(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 text-right space-y-1">
                <p className="text-sm text-gray-500">Subtotal: ₹{fmt(detail.subtotal)}</p>
                {detail.discount_amount > 0 && (
                  <p className="text-sm text-green-600">Discount: −₹{fmt(detail.discount_amount)}</p>
                )}
                {detail.shipping_charge > 0 && (
                  <p className="text-sm text-gray-500">Shipping: ₹{fmt(detail.shipping_charge)}</p>
                )}
                <p className="text-lg font-bold text-gray-800">Grand Total: ₹{fmt(detail.grand_total)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              {/* Cancel button — only shown for cancellable statuses */}
              {CANCELLABLE.has(detail.status) ? (
                <button
                  onClick={() => setCancelDialog(true)}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="size-4" />
                  Cancel Order &amp; Restore Stock
                </button>
              ) : (
                <span />   /* spacer keeps Close button on the right */
              )}
              <button
                onClick={() => setDetail(null)}
                className="px-5 py-2 bg-[#1f5c3a] text-white rounded-lg text-sm font-medium hover:bg-[#163f28]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel confirmation dialog ──────────────────────────────── */}
      <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-500" />
              Cancel Order {detail?.order_number}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-600">
                <p>This will permanently cancel the order and <strong className="text-gray-800">restore {cancelRestoreCount} unit(s)</strong> back to product stock:</p>
                <ul className="space-y-1 border border-gray-100 rounded-lg p-3 bg-gray-50">
                  {(detail?.items ?? []).map(item => (
                    <li key={item.id} className="flex justify-between">
                      <span className="text-gray-700">{item.product_name}</span>
                      <span className="text-green-600 font-semibold">+{item.quantity} units</span>
                    </li>
                  ))}
                </ul>
                <p className="text-orange-600 text-xs font-medium">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={e => { e.preventDefault(); confirmCancel(); }}
            >
              {cancelling ? "Cancelling…" : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
