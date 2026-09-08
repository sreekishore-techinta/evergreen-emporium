import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, EyeOff, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { adminReviewsApi, type AdminReview } from "@/lib/adminApi";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Evergreen Admin" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [reviews, setReviews]   = useState<AdminReview[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({msg:"",ok:true});

  function showToast(msg:string,ok=true){ setToast({msg,ok}); setTimeout(()=>setToast({msg:"",ok:true}),3000); }

  async function load() {
    setLoading(true);
    const res = await adminReviewsApi.list({ page, page_size:15, status:status||undefined });
    setReviews(res.data||[]);
    setTotal(res.pagination?.total??0);
    setTotalPages(res.pagination?.total_pages??1);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[page,status]); // eslint-disable-line

  async function approve(id:number){ const r=await adminReviewsApi.updateStatus(id,"approved"); if(r.success){showToast("Approved.");load();} }
  async function hide(id:number){ const r=await adminReviewsApi.updateStatus(id,"hidden"); if(r.success){showToast("Hidden.");load();} }
  async function del(id:number){ if(!confirm("Delete this review?"))return; const r=await adminReviewsApi.delete(id); if(r.success){showToast("Deleted.");load();} }

  const BADGE:Record<string,string>={pending:"bg-yellow-100 text-yellow-700",approved:"bg-green-100 text-green-700",hidden:"bg-gray-100 text-gray-500"};

  return (
    <div className="p-6">
      {toast.msg && <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${toast.ok?"bg-green-600":"bg-red-600"}`}>{toast.ok?"✓":"✕"} {toast.msg}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
          <option value="">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
        <span className="ml-auto text-xs text-gray-400">{total} reviews</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Product","Customer","Rating","Review","Status","Date","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td></tr>}
              {!loading && reviews.length===0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No reviews found.</td></tr>}
              {reviews.map(r=>(
                <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{r.product_name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.user_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({length:5}).map((_,i)=>(
                        <span key={i} className={i<r.rating?"text-[#b89a4e]":"text-gray-200"}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {r.title && <p className="font-semibold text-xs text-gray-800 mb-0.5">{r.title}</p>}
                    <p className="text-xs text-gray-500 truncate">{(r.body??"").slice(0,70)}{(r.body?.length??0)>70?"…":""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${BADGE[r.status]??""}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {r.status!=="approved" && <button onClick={()=>approve(r.id)} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Approve"><CheckCircle className="size-4"/></button>}
                      {r.status!=="hidden"   && <button onClick={()=>hide(r.id)}    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Hide"><EyeOff className="size-4"/></button>}
                      <button onClick={()=>del(r.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="size-4"/></button>
                    </div>
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
    </div>
  );
}
