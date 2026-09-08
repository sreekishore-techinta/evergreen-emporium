/**
 * Admin auth context — lives outside the router so every admin route
 * (including the login page at /admin/) can safely call useAdminAuth().
 */
import {
  createContext, useContext, useCallback, useState, useEffect, type ReactNode,
} from "react";
import {
  adminAuthApi, getAdminToken, setAdminToken, clearAdminToken,
  getStoredAdmin, storeAdmin, clearAdmin, type AdminUser,
} from "@/lib/adminApi";

export interface AdminAuthCtx {
  admin: AdminUser | null;
  token: string;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Always start with empty state (safe for SSR — no localStorage on server).
  // We hydrate from localStorage in useEffect below (runs only on the client).
  const [admin, setAdminState] = useState<AdminUser | null>(null);
  const [token, setTokenState] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate auth state from localStorage once the component mounts on the client.
  useEffect(() => {
    const storedAdmin = getStoredAdmin();
    const storedToken = getAdminToken();
    if (storedAdmin) setAdminState(storedAdmin);
    if (storedToken) setTokenState(storedToken);
    setHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminAuthApi.login(email, password);
    if (res.success && res.data) {
      setAdminToken(res.data.token);
      storeAdmin(res.data.admin);
      setTokenState(res.data.token);
      setAdminState(res.data.admin);
      return { success: true };
    }
    return { success: false, message: res.message ?? "Login failed." };
  }, []);

  const logout = useCallback(() => {
    adminAuthApi.logout();
    clearAdminToken();
    clearAdmin();
    setTokenState("");
    setAdminState(null);
    if (typeof window !== "undefined") window.location.href = "/admin";
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        // Not authenticated until localStorage is hydrated AND both values exist.
        isAuthenticated: hydrated && !!token && !!admin,
        hydrated,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthCtx {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  return ctx;
}
