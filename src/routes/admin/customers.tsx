import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { adminCustomersApi, type AdminCustomer } from "@/lib/adminApi";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Evergreen Admin" }] }),
  component: CustomersPage,
});

function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); }

function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [detail, setDetail]       = useState<(AdminCustomer & { recent_orders?: { order_number:string; grand_total:number; status:string; created_at:string }[] })|null>(null);
  const [toast, setToast]         = useState("");

  function showToast(m:string){ setToast(m); setTimeout(()=>setToast(""),3000); }

  async function load() {
    setLoading(true);
    const res = await adminCustomersApi.list({ page, page_size:15, search: search||undefined });
    setCustomers(res.data||[]);
    setTotal(res.pagination?.total??0);
    setTotalPages(res.pagination?.total_pages??1);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[page]); // eslint-disable-line

  async function openDetail(id:number) {
    const res = await adminCustomersApi.get(id);
    if (res.success && res.data) setDetail(res.data);
  }

  async function toggleActive(id:number, current:boolean) {
    await adminCustomersApi.setActive(id, !current);
    showToast("Customer status updated.");
    load();
    setDetail(null);
  }

  const BADGE_MAP: Record<string, string> = {
    pending:"bg-orange-100 text-orange-700", confirmed:"bg-blue-100 text-blue-700",
    processing:"bg-yellow-100 text-yellow-700", shipped:"bg-purple-100 text-purple-700",
    delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700",
  };

  return (
    <div className="p-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-lg text-sm shadow-lg">✓ {toast}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()}
            placeholder="Name, email, phone…" className="outline-none text-sm flex-1" />
        </div>
        <button onClick={()=>{setPage(1);load();}} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Search</button>
        <span className="ml-auto text-xs text-gray-400">{total} customers</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Name","Email","Phone","Status","Joined","Last Login","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td></tr>}
              {!loading && customers.length===0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No customers found.</td></tr>}
              {customers.map(c => (
                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.is_active?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
                      {c.is_active?"Active":"Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.last_login_at ? fmtDate(c.last_login_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>openDetail(c.id)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                      <Eye className="size-3"/> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="size-4"/></button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="size-4"/></button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">{detail.name}</h2>
              <button onClick={()=>setDetail(null)}><X className="size-5 text-gray-400 hover:text-gray-600"/></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[["Email",detail.email],["Phone",detail.phone??"—"],["Status",null],["Joined",fmtDate(detail.created_at)],["Last Login",detail.last_login_at?fmtDate(detail.last_login_at):"—"],["Verified",detail.email_verified?"Yes":"No"]].map(([k,v],i)=>(
                  <div key={i}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{k}</p>
                    {k==="Status"
                      ? <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${detail.is_active?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{detail.is_active?"Active":"Disabled"}</span>
                      : <p className="text-gray-800 mt-0.5">{v as string}</p>}
                  </div>
                ))}
              </div>

              {detail.recent_orders && detail.recent_orders.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Recent Orders</p>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Order</th><th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">Total</th><th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th><th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Date</th></tr></thead>
                    <tbody>
                      {detail.recent_orders.map((o,i)=>(
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-3 py-2 font-semibold text-[#1f5c3a]">{o.order_number}</td>
                          <td className="px-3 py-2 text-right font-semibold">₹{Number(o.grand_total).toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${BADGE_MAP[o.status]??""}`}>{o.status}</span></td>
                          <td className="px-3 py-2 text-gray-400 text-xs">{fmtDate(o.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <button onClick={()=>toggleActive(detail.id,detail.is_active)} className={`px-4 py-2 rounded-lg text-sm font-medium ${detail.is_active?"bg-red-50 text-red-600 hover:bg-red-100":"bg-green-50 text-green-700 hover:bg-green-100"} transition-colors`}>
                {detail.is_active?"Disable Account":"Enable Account"}
              </button>
              <button onClick={()=>setDetail(null)} className="px-5 py-2 bg-[#1f5c3a] text-white rounded-lg text-sm font-medium hover:bg-[#163f28]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
