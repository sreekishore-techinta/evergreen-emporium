import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { adminCategoriesApi, type AdminCategory } from "@/lib/adminApi";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Evergreen Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [cats, setCats]      = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]    = useState<"add"|"edit"|null>(null);
  const [editing, setEditing] = useState<AdminCategory|null>(null);
  const [form, setForm]      = useState({ name:"", description:"", sort_order:0, is_active:true });
  const [saving, setSaving]  = useState(false);
  const [toast, setToast]    = useState({ msg:"", ok:true });

  // ── Confirm dialog state ───────────────────────────────────────
  type ConfirmState = { open: boolean; title: string; description: string; onConfirm: () => void };
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, title: "", description: "", onConfirm: () => {} });
  function askConfirm(title: string, description: string, onConfirm: () => void) {
    setConfirmState({ open: true, title, description, onConfirm });
  }

  function showToast(msg:string, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast({msg:"",ok:true}),3000); }

  async function load() {
    setLoading(true);
    const res = await adminCategoriesApi.list();
    if (res.success && res.data) setCats(res.data);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  function openAdd() { setEditing(null); setForm({name:"",description:"",sort_order:0,is_active:true}); setModal("add"); }
  function openEdit(c:AdminCategory) { setEditing(c); setForm({name:c.name,description:c.description??"",sort_order:c.sort_order,is_active:c.is_active}); setModal("edit"); }

  async function save() {
    if (!form.name) { showToast("Name is required.",false); return; }
    setSaving(true);
    const res = editing ? await adminCategoriesApi.update(editing.id, form) : await adminCategoriesApi.create(form);
    setSaving(false);
    if (res.success) { showToast(editing?"Category updated.":"Category created."); setModal(null); load(); }
    else showToast(res.message??"Save failed.",false);
  }

  async function del(c:AdminCategory) {
    askConfirm(
      "Delete Category",
      `Delete "${c.name}"? All products in this category must be moved first.`,
      async () => {
        const res = await adminCategoriesApi.delete(c.id);
        if (res.success) { showToast("Deleted."); load(); }
        else showToast(res.message ?? "Delete failed.", false);
      }
    );
  }

  async function toggle(c:AdminCategory) {
    await adminCategoriesApi.update(c.id, { is_active: !c.is_active });
    load();
  }

  return (
    <div className="p-6">
      {toast.msg && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${toast.ok?"bg-green-600":"bg-red-600"}`}>
          {toast.ok?"✓":"✕"} {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="size-4" /> Add Category
        </button>
        <span className="ml-auto text-xs text-gray-400">{cats.length} categories</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["#","Name","Slug","Products","Sort","Status","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>}
            {!loading && cats.length===0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No categories found.</td></tr>}
            {cats.map((c,i) => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{String(i+1).padStart(2,"0")}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{c.slug}</td>
                <td className="px-4 py-3 text-center font-semibold">{c.product_count ?? 0}</td>
                <td className="px-4 py-3 text-center text-gray-500">{c.sort_order}</td>
                <td className="px-4 py-3">
                  <button onClick={()=>toggle(c)}>
                    {c.is_active
                      ? <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit"><ToggleRight className="size-3.5"/>Active</span>
                      : <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit"><ToggleLeft className="size-3.5"/>Inactive</span>}
                  </button>
                </td>
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

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">{modal==="edit"?"Edit Category":"Add Category"}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name *</label>
                <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a]" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a] resize-none" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sort Order</label>
                  <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a]" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:parseInt(e.target.value)||0}))} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="accent-[#1f5c3a] w-4 h-4" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} />
                    Active
                  </label>
                </div>
              </div>
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
    </div>
  );
}
