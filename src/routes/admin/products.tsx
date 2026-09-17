import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Plus, Search, Edit2, Trash2, ImagePlus, Star, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, X, Loader2, TrendingUp, TrendingDown, History } from "lucide-react";
import { adminProductsApi, adminCategoriesApi, adminStockApi, type AdminProduct, type AdminCategory, type StockMovement } from "@/lib/adminApi";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Evergreen Admin" }] }),
  component: ProductsPage,
});

const EMPTY: Partial<AdminProduct> & { benefits_text: string; apps_text: string } = {
  name: "", category_id: undefined, sku: "", type: "", badge: "Premium Quality",
  tagline: "", description: "", long_description: "", usage_info: "",
  price: 0, discount_price: undefined, stock: 0, low_stock_alert: 5, weight: "",
  is_active: true, is_featured: false, is_bestseller: false,
  benefits_text: "", apps_text: "",
};

type Toast = { id: number; msg: string; ok: boolean };
let tid = 0;

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
};

function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [cats, setCats]         = useState<AdminCategory[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add" | "edit" | "images" | null>(null);
  const [editing, setEditing]   = useState<AdminProduct | null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [toasts, setToasts]     = useState<Toast[]>([]);
  const [saving, setSaving]     = useState(false);
  const [savingText, setSavingText] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const imgRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // ── Stock adjust modal ─────────────────────────────────────────
  const [stockModal, setStockModal] = useState<AdminProduct | null>(null);
  const [stockDelta, setStockDelta] = useState(0);
  const [stockNotes, setStockNotes] = useState("");
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  const [stockSaving, setStockSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function openStockModal(p: AdminProduct) {
    setStockModal(p);
    setStockDelta(0);
    setStockNotes("");
    setHistoryLoading(true);
    const res = await adminStockApi.history(p.id, 20);
    setStockHistory(res.success && res.data ? res.data : []);
    setHistoryLoading(false);
  }

  async function submitStockAdjust() {
    if (!stockModal || stockDelta === 0) return;
    setStockSaving(true);
    const res = await adminStockApi.adjust(stockModal.id, stockDelta, stockNotes || undefined);
    setStockSaving(false);
    if (res.success && res.data) {
      toast(`Stock updated: now ${res.data.stock} units.`);
      setStockModal(null);
      load();
    } else {
      toast(res.message ?? "Adjust failed.", false);
    }
  }

  // ── Confirm dialog state ───────────────────────────────────────
  type ConfirmState = { open: boolean; title: string; description: string; onConfirm: () => void };
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, title: "", description: "", onConfirm: () => {} });
  function askConfirm(title: string, description: string, onConfirm: () => void) {
    setConfirmState({ open: true, title, description, onConfirm });
  }

  function toast(msg: string, ok = true) {
    const id = ++tid;
    setToasts(t => [...t, { id, msg, ok }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }

  async function load() {
    setLoading(true);
    const [pr, cr] = await Promise.all([
      adminProductsApi.list({ page, page_size: 15, search: search || undefined, category_id: catFilter ? Number(catFilter) : undefined }),
      adminCategoriesApi.list(),
    ]);
    setProducts(pr.data || []);
    setTotal(pr.pagination?.total ?? 0);
    setTotalPages(pr.pagination?.total_pages ?? 1);
    if (cr.success && cr.data) setCats(cr.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, catFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearPending() {
    pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setPendingImages([]);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY });
    clearPending();
    setModal("add");
  }

  function openEdit(p: AdminProduct) {
    setEditing(p);
    setForm({
      ...p,
      benefits_text: Array.isArray(p.benefits) ? p.benefits.join("\n") : "",
      apps_text:     Array.isArray(p.applications) ? p.applications.join(", ") : "",
    });
    clearPending();
    setModal("edit");
  }

  function openImages(p: AdminProduct) {
    setEditing(p);
    setModal("images");
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newPending: PendingImage[] = [];
    const hasExistingPrimary = pendingImages.some(p => p.isPrimary);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast(`"${file.name}" exceeds the 5MB size limit.`, false);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      newPending.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        isPrimary: !hasExistingPrimary && i === 0 && pendingImages.length === 0,
      });
    }

    setPendingImages(prev => [...prev, ...newPending]);
  }

  function removePendingImage(id: string) {
    setPendingImages(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const filtered = prev.filter(p => p.id !== id);
      if (target?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  }

  function setPendingPrimary(id: string) {
    setPendingImages(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  }

  async function save() {
    if (!form.name || !form.category_id || !form.price) {
      toast("Name, category and price are required.", false);
      return;
    }
    setSaving(true);
    setSavingText(editing ? "Updating product…" : "Creating product…");

    const payload: any = {
      ...form,
      benefits:     form.benefits_text?.split("\n").map(s => s.trim()).filter(Boolean) ?? [],
      applications: form.apps_text?.split(",").map(s => s.trim()).filter(Boolean) ?? [],
    };
    if (!payload.sku) delete payload.sku;
    if (!payload.type) delete payload.type;

    try {
      if (editing) {
        const res = await adminProductsApi.update(editing.id, payload);
        if (!res.success) {
          toast(res.message ?? "Save failed.", false);
          setSaving(false);
          return;
        }

        // If new pending images were selected in edit mode, upload them now
        if (pendingImages.length > 0) {
          setSavingText(`Uploading ${pendingImages.length} image(s)…`);
          for (let i = 0; i < pendingImages.length; i++) {
            await adminProductsApi.uploadImage(
              editing.id,
              pendingImages[i].file,
              pendingImages[i].isPrimary && (editing.images?.length ?? 0) === 0
            );
          }
          clearPending();
        }

        toast("Product updated successfully.");
        setModal(null);
        load();
      } else {
        const res = await adminProductsApi.create(payload as Parameters<typeof adminProductsApi.create>[0]);
        if (!res.success || !res.data) {
          toast(res.message ?? "Save failed.", false);
          setSaving(false);
          return;
        }

        const newProductId = (res.data as any).id;

        // If images were selected during creation, upload them automatically!
        if (pendingImages.length > 0 && newProductId) {
          setSavingText(`Uploading ${pendingImages.length} image(s)…`);
          for (let i = 0; i < pendingImages.length; i++) {
            setSavingText(`Uploading image ${i + 1} of ${pendingImages.length}…`);
            await adminProductsApi.uploadImage(
              newProductId,
              pendingImages[i].file,
              pendingImages[i].isPrimary || i === 0
            );
          }
          clearPending();
        }

        toast(pendingImages.length > 0 ? `Product created with ${pendingImages.length} image(s).` : "Product created.");
        setModal(null);
        load();
      }
    } catch (err: any) {
      toast(err.message || "An error occurred while saving.", false);
    } finally {
      setSaving(false);
      setSavingText("");
    }
  }

  async function del(p: AdminProduct) {
    askConfirm(
      "Delete Product",
      `Delete "${p.name}"? This cannot be undone.`,
      async () => {
        const res = await adminProductsApi.delete(p.id);
        if (res.success) { toast("Product deleted."); load(); }
        else toast(res.message ?? "Delete failed.", false);
      }
    );
  }

  async function toggle(p: AdminProduct) {
    await adminProductsApi.update(p.id, { is_active: !p.is_active });
    load();
  }

  async function toggleFeatured(p: AdminProduct) {
    await adminProductsApi.update(p.id, { is_featured: !p.is_featured });
    load();
  }

  async function uploadImages(files: FileList) {
    if (!editing) return;
    for (let i = 0; i < files.length; i++) {
      await adminProductsApi.uploadImage(editing.id, files[i], i === 0 && (editing.images?.length ?? 0) === 0);
    }
    const res = await adminProductsApi.get(editing.id);
    if (res.success && res.data) setEditing(res.data);
    toast("Images uploaded.");
    load();
  }

  async function delImage(imageId: number) {
    if (!editing) return;
    askConfirm(
      "Delete Image",
      "Delete this image? This cannot be undone.",
      async () => {
        await adminProductsApi.deleteImage(editing.id, imageId);
        const res = await adminProductsApi.get(editing.id);
        if (res.success && res.data) setEditing(res.data);
        toast("Image deleted.");
        load();
      }
    );
  }

  async function setPrimary(imageId: number) {
    if (!editing) return;
    await adminProductsApi.setPrimaryImage(editing.id, imageId);
    const res = await adminProductsApi.get(editing.id);
    if (res.success && res.data) setEditing(res.data);
    toast("Primary image set.");
    load();
  }

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const check = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.checked }));

  const catName = (id: number) => cats.find(c => c.id === id)?.name ?? "";
  const STATUSES: Record<string, string> = { true: "bg-green-100 text-green-700", false: "bg-red-100 text-red-700" };

  return (
    <div className="p-6">
      {/* Toast */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg text-white text-sm shadow-lg flex items-center gap-2 ${t.ok ? "bg-green-600" : "bg-red-600"}`}>
            {t.ok ? "✓" : "✕"} {t.msg}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="size-4" /> Add Product
        </button>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Search products…" className="outline-none text-sm flex-1" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => { setPage(1); load(); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          Filter
        </button>
        <span className="ml-auto text-xs text-gray-400">{total} products</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Image","Product","Category","Price","Stock","Status","Featured","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1f5c3a] rounded-full animate-spin" /> Loading…
                </div>
              </td></tr>}
              {!loading && products.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No products found.</td></tr>}
              {products.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    {p.primary_image_url
                      ? <img src={p.primary_image_url} alt={p.name} className="w-11 h-11 rounded-lg object-cover bg-gray-100" />
                      : <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">IMG</div>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
                      {catName(p.category_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold">₹{p.price.toLocaleString("en-IN")}</p>
                    {p.discount_price && <p className="text-xs text-green-600">Sale: ₹{p.discount_price.toLocaleString("en-IN")}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${p.stock === 0 ? "text-red-600" : p.stock <= p.low_stock_alert ? "text-orange-600" : "text-green-600"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(p)}>
                      {p.is_active
                        ? <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><ToggleRight className="size-3.5" />Active</span>
                        : <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><ToggleLeft className="size-3.5" />Inactive</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured(p)}
                      title={p.is_featured ? "Remove from featured" : "Mark as featured"}
                      className="mx-auto flex items-center justify-center rounded-full p-1 transition-colors hover:bg-amber-50"
                    >
                      {p.is_featured
                        ? <Star className="size-4 text-[#b89a4e] fill-[#b89a4e]" />
                        : <Star className="size-4 text-gray-300 hover:text-[#b89a4e]" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1f5c3a] transition-colors" title="Edit"><Edit2 className="size-4" /></button>
                      <button onClick={() => openImages(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title="Images"><ImagePlus className="size-4" /></button>
                      <button onClick={() => del(p)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="size-4" /></button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="size-4" /></button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">{modal === "edit" ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="lbl">Product Name *</label><input className="inp" value={form.name ?? ""} onChange={field("name")} /></div>
                <div><label className="lbl">Category *</label>
                  <select className="inp" value={form.category_id ?? ""} onChange={field("category_id")}>
                    <option value="">Select…</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="lbl">Price (₹) *</label><input className="inp" type="number" min="0" step="0.01" value={form.price ?? ""} onChange={field("price")} /></div>
                <div><label className="lbl">Discount Price</label><input className="inp" type="number" min="0" step="0.01" value={form.discount_price ?? ""} onChange={field("discount_price")} placeholder="Optional" /></div>
                <div><label className="lbl">Stock Qty</label><input className="inp" type="number" min="0" value={form.stock ?? 0} onChange={field("stock")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="lbl">Weight / Size</label><input className="inp" value={form.weight ?? ""} onChange={field("weight")} placeholder="e.g. 1 kg, 5 kg" /></div>
                <div><label className="lbl">Badge</label><input className="inp" value={form.badge ?? ""} onChange={field("badge")} /></div>
              </div>
              <div><label className="lbl">Tagline</label><input className="inp" value={form.tagline ?? ""} onChange={field("tagline")} /></div>
              <div><label className="lbl">Short Description</label><textarea className="inp" rows={2} value={form.description ?? ""} onChange={field("description")} /></div>
              <div><label className="lbl">Long Description</label><textarea className="inp" rows={3} value={form.long_description ?? ""} onChange={field("long_description")} /></div>
              <div><label className="lbl">Benefits (one per line)</label><textarea className="inp" rows={4} value={form.benefits_text ?? ""} onChange={field("benefits_text")} placeholder="Promotes strong root growth&#10;100% natural" /></div>
              <div><label className="lbl">Usage Instructions</label><textarea className="inp" rows={2} value={form.usage_info ?? ""} onChange={field("usage_info")} /></div>
              <div><label className="lbl">Applications (comma-separated)</label><input className="inp" value={form.apps_text ?? ""} onChange={field("apps_text")} placeholder="Home Gardening, Nurseries, Vegetable Crops" /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={!!form.is_active} onChange={check("is_active")} className="accent-[#1f5c3a]" /> Active</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={!!form.is_featured} onChange={check("is_featured")} className="accent-[#b89a4e]" /> Featured</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={!!form.is_bestseller} onChange={check("is_bestseller")} className="accent-[#1f5c3a]" /> Best Seller</label>
              </div>

              {/* ── Image Upload ─────────────────────────────────── */}
              <div>
                <label className="lbl">Product Images</label>
                {/* Drop zone */}
                <div
                  onClick={() => modalFileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFilesSelected(e.dataTransfer.files); }}
                  className="mt-1 border-2 border-dashed border-gray-200 hover:border-[#1f5c3a] rounded-xl p-5 text-center cursor-pointer transition-colors"
                >
                  <ImagePlus className="size-7 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-sm text-gray-500">Click or drag & drop images here</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP — max 5 MB each · first image becomes primary</p>
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => { handleFilesSelected(e.target.files); e.target.value = ""; }}
                  />
                </div>

                {/* Pending previews */}
                {pendingImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {pendingImages.map(img => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.previewUrl}
                          alt="preview"
                          className={`w-full aspect-square object-cover rounded-lg border-2 transition-colors ${img.isPrimary ? "border-[#1f5c3a]" : "border-transparent"}`}
                        />
                        {img.isPrimary && (
                          <span className="absolute top-1 left-1 bg-[#1f5c3a] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">PRIMARY</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex flex-col items-center justify-center gap-1">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPendingPrimary(img.id)}
                              className="text-[10px] bg-[#1f5c3a] text-white px-2 py-0.5 rounded"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePendingImage(img.id)}
                            className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white rounded-lg text-sm font-medium disabled:opacity-60">
              {saving ? savingText || "Saving…" : modal === "edit" ? "Update Product" : pendingImages.length > 0 ? `Create Product + ${pendingImages.length} Image${pendingImages.length > 1 ? "s" : ""}` : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Images modal */}
      {modal === "images" && editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Images — {editing.name}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5">
              {/* Upload zone */}
              <div
                onClick={() => imgRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#1f5c3a] rounded-xl p-6 text-center cursor-pointer transition-colors mb-5"
              >
                <ImagePlus className="size-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload images</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB each</p>
                <input ref={imgRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => { if (e.target.files) uploadImages(e.target.files); e.target.value = ""; }} />
              </div>
              {/* Preview grid */}
              <div className="grid grid-cols-3 gap-3">
                {(editing.images ?? []).map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg border border-gray-100" />
                    {img.is_primary && (
                      <div className="absolute top-1 left-1 bg-[#b89a4e] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">PRIMARY</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex flex-col items-center justify-center gap-1.5">
                      {!img.is_primary && (
                        <button onClick={() => setPrimary(img.id)} className="text-[10px] bg-[#b89a4e] text-white px-2 py-0.5 rounded">Set Primary</button>
                      )}
                      <button onClick={() => delImage(img.id)} className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded">Delete</button>
                    </div>
                  </div>
                ))}
                {(editing.images ?? []).length === 0 && (
                  <p className="col-span-3 text-center text-gray-400 text-sm py-4">No images uploaded yet.</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-[#1f5c3a] text-white rounded-lg text-sm font-medium">Done</button>
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
