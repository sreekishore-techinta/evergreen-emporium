import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  TrendingUp, ShoppingBag, Users, Package,
  CheckCircle, Truck, Clock, XCircle, AlertTriangle,
} from "lucide-react";
import { adminDashboardApi, type DashboardStats } from "@/lib/adminApi";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Evergreen Admin" }] }),
  component: DashboardPage,
});

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className={`size-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="size-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function fmt(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function DashboardPage() {
  const [data, setData]       = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    setError(null);
    adminDashboardApi.stats().then(res => {
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message ?? "Failed to load dashboard data.");
      }
      setLoading(false);
    }).catch(() => {
      setError("Network error loading dashboard data.");
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#1f5c3a] rounded-full animate-spin mr-3" />
      Loading dashboard…
    </div>
  );

  if (error || !data) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 max-w-lg space-y-3">
        <div className="flex items-center gap-2 font-semibold text-base">
          <AlertTriangle className="size-5 text-red-600 shrink-0" />
          <span>Failed to load dashboard data</span>
        </div>
        <p className="text-sm text-red-600">{error || "Could not retrieve statistics from server."}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const { stats, recent_orders, low_stock } = data;
  const o = stats.orders;
  const r = stats.revenue;

  return (
    <div className="p-6 space-y-6">

      {/* Stats row 1 — revenue + orders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"  value={`₹${fmt(r.total)}`}        sub={`₹${fmt(r.this_month)} this month`}  icon={TrendingUp}  color="bg-[#b89a4e]" />
        <StatCard label="Total Orders"   value={o.total}                    sub={`${o.pending} pending`}              icon={ShoppingBag} color="bg-[#1f5c3a]" />
        <StatCard label="Customers"      value={stats.customers.total}      sub={`${stats.customers.this_month} this month`} icon={Users} color="bg-blue-500" />
        <StatCard label="Products"       value={stats.products.active}      sub={`${stats.products.low_stock} low stock`} icon={Package}  color="bg-purple-500" />
      </div>

      {/* Stats row 2 — order statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Pending",    value: o.pending,    icon: Clock,        bg: "bg-orange-500" },
          { label: "Confirmed",  value: o.confirmed,  icon: CheckCircle,  bg: "bg-blue-500" },
          { label: "Processing", value: o.processing, icon: Package,      bg: "bg-yellow-500" },
          { label: "Shipped",    value: o.shipped,    icon: Truck,        bg: "bg-violet-500" },
          { label: "Delivered",  value: o.delivered,  icon: CheckCircle,  bg: "bg-green-500" },
          { label: "Cancelled",  value: o.cancelled,  icon: XCircle,      bg: "bg-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <div className={`mx-auto size-8 rounded-full flex items-center justify-center ${s.bg} mb-2`}>
              <s.icon className="size-4 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-[#1f5c3a] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No orders yet</td></tr>
                )}
                {recent_orders.map(ord => (
                  <tr key={ord.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-semibold text-[#1f5c3a]">{ord.order_number}</td>
                    <td className="px-4 py-3 text-gray-600">{ord.customer_name ?? "Guest"}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{fmt(ord.grand_total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[ord.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" /> Low Stock Alert
            </h2>
            <Link to="/admin/products" className="text-xs text-[#1f5c3a] hover:underline font-medium">
              Manage →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody>
                {low_stock.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-400 text-sm">All products well stocked ✓</td></tr>
                )}
                {low_stock.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${p.stock === 0 ? "text-red-600" : "text-orange-600"}`}>
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
