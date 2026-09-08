import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/lib/adminContext";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Login — Evergreen Media" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("admin@evergreenmedia.in");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/admin/dashboard" });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate({ to: "/admin/dashboard" });
    } else {
      setError(res.message ?? "Login failed. Check your credentials.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#163f28] to-[#1f5c3a] px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Top banner */}
        <div className="bg-[#163f28] px-8 py-7 text-center">
          <div className="flex justify-center mb-3">
            <div className="size-12 bg-[#b89a4e]/20 rounded-full flex items-center justify-center">
              <Leaf className="size-6 text-[#b89a4e]" />
            </div>
          </div>
          <h1 className="text-white font-bold text-xl tracking-wider">EVERGREEN MEDIA</h1>
          <p className="text-white/40 text-[11px] tracking-[.18em] uppercase mt-1">Admin Panel · MEX</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8">
          <h2 className="text-gray-800 font-semibold text-lg mb-6">Sign in to your account</h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@evergreenmedia.in"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a] focus:ring-2 focus:ring-[#1f5c3a]/10 transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a] focus:ring-2 focus:ring-[#1f5c3a]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1f5c3a] hover:bg-[#163f28] disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-5">
            Default: admin@evergreenmedia.in · Admin@2026
          </p>
        </form>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-white/30 text-xs">
        © {new Date().getFullYear()} Evergreen Media (MEX)
      </p>
    </div>
  );
}
