import { createFileRoute, Outlet, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users, Star,
  Ticket, Settings, LogOut, ChevronRight, Menu, X, Leaf, Bell,
} from "lucide-react";
import { useAdminAuth } from "@/lib/adminContext";


// ─────────────────────────────────────────────────────────────────
// Sidebar nav config
// ─────────────────────────────────────────────────────────────────
const NAV = [
  { label: "Dashboard",  to: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Products",   to: "/admin/products",   icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Orders",     to: "/admin/orders",     icon: ShoppingBag },
  { label: "Customers",  to: "/admin/customers",  icon: Users },
  { label: "Reviews",    to: "/admin/reviews",    icon: Star },
  { label: "Coupons",    to: "/admin/coupons",    icon: Ticket },
  { label: "Settings",   to: "/admin/settings",   icon: Settings },
] as const;

// ─────────────────────────────────────────────────────────────────
// Admin Shell (sidebar + header + content)
// Only rendered when the user IS authenticated.
// The login page at /admin/ is rendered by its own component without
// this shell — it calls <Outlet /> directly.
// ─────────────────────────────────────────────────────────────────
function AdminShell() {
  const { admin, logout, isAuthenticated, hydrated } = useAdminAuth();
  const navigate  = useNavigate();
  const router    = useRouter();
  const [sideOpen, setSideOpen] = useState(false);
  const pathname  = router.state.location.pathname;

  // If not authenticated (after client hydration) and not on login page → redirect
  useEffect(() => {
    if (hydrated && !isAuthenticated && pathname !== "/admin" && pathname !== "/admin/") {
      navigate({ to: "/admin" });
    }
  }, [hydrated, isAuthenticated, pathname, navigate]);

  // On the login page itself, just render the login component
  if (pathname === "/admin" || pathname === "/admin/") {
    return <Outlet />;
  }

  // Still hydrating from localStorage — show clean loading spinner
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1f5c3a] rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated after hydration — blank while redirect fires
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#f5f1eb] font-sans overflow-hidden">

      {/* Mobile overlay */}
      {sideOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#163f28] text-white
          transition-transform duration-200 lg:static lg:translate-x-0
          ${sideOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Leaf className="size-5 text-[#b89a4e] shrink-0" />
          <div>
            <p className="font-bold text-sm tracking-wider">EVERGREEN</p>
            <p className="text-[10px] text-white/40 tracking-[.15em] uppercase">MEX Admin</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSideOpen(false)}>
            <X className="size-4 text-white/50" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map(({ label, to, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSideOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 text-sm
                  transition-colors select-none
                  ${active
                    ? "bg-white/10 text-white border-l-2 border-[#b89a4e] pl-[10px]"
                    : "text-white/60 hover:bg-white/8 hover:text-white"}
                `}
              >
                <Icon className="size-4 shrink-0" />
                {label}
                {active && <ChevronRight className="size-3 ml-auto text-[#b89a4e]" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-8 rounded-full bg-[#b89a4e] flex items-center justify-center font-bold text-sm shrink-0">
              {admin?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{admin?.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-white/60 hover:bg-white/8 hover:text-white transition-colors"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 shrink-0 shadow-sm">
          <button className="lg:hidden" onClick={() => setSideOpen(true)}>
            <Menu className="size-5 text-gray-500" />
          </button>
          <h1 className="font-semibold text-gray-800 text-base">
            {NAV.find(n => pathname.startsWith(n.to))?.label ?? "Admin"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span
              className="hidden sm:block text-xs text-gray-400"
              suppressHydrationWarning
            >
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="size-4 text-gray-500" />
            </button>
            <Link to="/" className="text-xs text-[#1f5c3a] hover:underline hidden sm:block">
              ← View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Route definition — no provider here; provider is in __root.tsx
// ─────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Evergreen Media" }] }),
  component: AdminShell,
});
