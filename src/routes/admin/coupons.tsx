import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { adminCouponsApi, type AdminCoupon } from "@/lib/adminApi";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Evergreen Admin" }] }),
  component: CouponsPage,
});

const EMPTY:Partial<AdminCoupon>={code:"",type:"percent",value:0,min_order:0,max_discount:undefined,usage_limit:undefined,starts_at:null,expires_at:null,is_active:true};

function CouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<"add"|"edit"|null>(null);
  const [editing, setEditing] = useState<AdminCoupon|null>(null);
  const [form, setForm]       = useState<Partial<AdminCoupon>>({...EMPTY});
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState({msg:"",ok:true});

  // ── Confirm dialog state ───────────────────────────────────────
  type ConfirmState = { open: boolean; title: string; description: string; onConfirm: () => void };
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, title: "", description: "", onConfirm: () => {} });
  function askConfirm(title: string, description: string, onConfirm: () => void) {
    setConfirmState({ open: true, title, description, onConfirm });
  }

  function showToast(msg:string,ok=true){setToast({msg,ok});setTimeout(()=>setToast({msg:"",ok:true}),3000);}

  async function load(){
    setLoading(true);
    const res=await adminCouponsApi.list({page:1,page_size:50});
    setCoupons(res.data||[]);
    setLoading(false);
  }
  useEffect(()=>{load();},[]);

  function openAdd(){setEditing(null);setForm({...EMPTY});setModal("add");}
  function openEdit(c:AdminCoupon){setEditing(c);setForm({...c,starts_at:c.starts_at?c.starts_at.slice(0,16):null,expires_at:c.expires_at?c.expires_at.slice(0,16):null});setModal("edit");}

  async function save(){
    if (!form.code||!form.value){showToast("Code and value required.",false);return;}
    setSaving(true);
    const payload={...form,code:(form.code??"").toUpperCase()};
    const res=editing?await adminCouponsApi.update(editing.id,payload):await adminCouponsApi.create(payload);
    setSaving(false);
    if(res.success){showToast(editing?"Coupon updated.":"Coupon created.");setModal(null);load();}
    else showToast(res.message??"Save failed.",false);
  }

  async function del(c:AdminCoupon){
    askConfirm(
      "Delete Coupon",
      `Delete coupon "${c.code}"? This cannot be undone.`,
      async () => {
        const res = await adminCouponsApi.delete(c.id);
        if (res.success) { showToast("Deleted."); load(); }
      }
    );
  }

  const f=(k:keyof AdminCoupon)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>setForm(x=>({...x,[k]:e.target.value}));

  return (
    <div className="p-6">
      {toast.msg && <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${toast.ok?"bg-green-600":"bg-red-600"}`}>{toast.ok?"✓":"✕"} {toast.msg}</div>}

      <div className="flex items-center gap-3 mb-5">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="size-4"/> Add Coupon
        </button>
        <span className="ml-auto text-xs text-gray-400">{coupons.length} coupons</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Code","Type","Value","Min Order","Used","Expires","Status","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading…</td></tr>}
            {!loading && coupons.length===0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400">No coupons yet.</td></tr>}
            {coupons.map(c=>(
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 font-bold font-mono tracking-wider text-[#1f5c3a]">{c.code}</td>
                <td className="px-4 py-3 text-gray-600">{c.type==="percent"?"Percent (%)":"Fixed (₹)"}</td>
                <td className="px-4 py-3 font-semibold">{c.type==="percent"?`${c.value}%`:`₹${c.value}`}</td>
                <td className="px-4 py-3">₹{c.min_order}</td>
                <td className="px-4 py-3 text-center">{c.used_count}{c.usage_limit!=null?`/${c.usage_limit}`:""}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.expires_at?new Date(c.expires_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):<span className="text-gray-300">Never</span>}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.is_active?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{c.is_active?"Active":"Inactive"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={()=>openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1f5c3a] transition-colors"><Edit2 className="size-4"/></button>
                    <button onClick={()=>del(c)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="size-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">{modal==="edit"?"Edit Coupon":"Add Coupon"}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="lbl">Code *</label><input className="inp" style={{textTransform:"uppercase"}} value={form.code??""} onChange={f("code")} placeholder="SAVE10"/></div>
                <div><label className="lbl">Type</label><select className="inp" value={form.type??""} onChange={f("type")}><option value="percent">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="lbl">Discount Value *</label><input type="number" className="inp" min="0" step="0.01" value={form.value??""} onChange={f("value")}/></div>
                <div><label className="lbl">Max Discount (₹)</label><input type="number" className="inp" min="0" step="0.01" value={form.max_discount??""} onChange={f("max_discount")} placeholder="Optional cap"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="lbl">Min Order (₹)</label><input type="number" className="inp" min="0" value={form.min_order??0} onChange={f("min_order")}/></div>
                <div><label className="lbl">Usage Limit</label><input type="number" className="inp" min="0" value={form.usage_limit??""} onChange={f("usage_limit")} placeholder="Empty = unlimited"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="lbl">Start Date</label><input type="datetime-local" className="inp" value={(form.starts_at??"").slice(0,16)} onChange={f("starts_at")}/></div>
                <div><label className="lbl">Expiry Date</label><input type="datetime-local" className="inp" value={(form.expires_at??"").slice(0,16)} onChange={f("expires_at")}/></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" className="accent-[#1f5c3a] w-4 h-4" checked={!!form.is_active} onChange={e=>setForm(x=>({...x,is_active:e.target.checked}))}/>
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={()=>setModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white rounded-lg text-sm font-medium disabled:opacity-60">
                {saving?"Saving…":modal==="edit"?"Update":"Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <AlertDialog open={confirmState.open} onOpenChange={open => setConfirmState(s => ({ ...s, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { confirmState.onConfirm(); setConfirmState(s => ({ ...s, open: false })); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`.lbl{display:block;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}.inp{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;transition:border-color .15s}.inp:focus{border-color:#1f5c3a}`}</style>
    </div>
  );
}
