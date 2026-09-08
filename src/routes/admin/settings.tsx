import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Key } from "lucide-react";
import { adminDashboardApi, adminAuthApi } from "@/lib/adminApi";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Evergreen Admin" }] }),
  component: SettingsPage,
});

interface Setting { setting_key: string; value: string; type: string; label: string; }

function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [form, setForm]         = useState<Record<string,string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [curPw, setCurPw]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [toast, setToast]       = useState({msg:"",ok:true});

  function showToast(msg:string,ok=true){setToast({msg,ok});setTimeout(()=>setToast({msg:"",ok:true}),3000);}

  useEffect(()=>{
    adminDashboardApi.getSettings().then(res=>{
      if(res.success && res.data){
        setSettings(res.data);
        const init:Record<string,string>={};
        res.data.forEach(s=>{ init[s.setting_key]=s.value??""; });
        setForm(init);
      }
      setLoading(false);
    });
  },[]);

  async function saveSettings(){
    setSaving(true);
    const res=await adminDashboardApi.updateSettings(form);
    setSaving(false);
    if(res.success) showToast("Settings saved.");
    else showToast(res.message??"Save failed.",false);
  }

  async function changePassword(){
    if(!curPw||!newPw){showToast("Both fields required.",false);return;}
    if(newPw.length<8){showToast("New password must be at least 8 characters.",false);return;}
    setPwSaving(true);
    const res=await adminAuthApi.changePassword(curPw,newPw);
    setPwSaving(false);
    if(res.success){showToast("Password changed successfully.");setCurPw("");setNewPw("");}
    else showToast(res.message??"Failed.",false);
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {toast.msg && <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${toast.ok?"bg-green-600":"bg-red-600"}`}>{toast.ok?"✓":"✕"} {toast.msg}</div>}

      {/* Site settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Site Settings</h2>
          <button onClick={saveSettings} disabled={saving||loading} className="flex items-center gap-2 px-4 py-2 bg-[#1f5c3a] hover:bg-[#163f28] text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
            <Save className="size-4"/>{saving?"Saving…":"Save"}
          </button>
        </div>
        <div className="px-5 py-5">
          {loading
            ? <p className="text-center text-gray-400 py-6">Loading settings…</p>
            : <div className="space-y-4">
                {settings.map(s=>(
                  <div key={s.setting_key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{s.label||s.setting_key}</label>
                    {s.type==="boolean"
                      ? <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" className="accent-[#1f5c3a] w-4 h-4" checked={form[s.setting_key]==="1"} onChange={e=>setForm(f=>({...f,[s.setting_key]:e.target.checked?"1":"0"}))}/>
                          Enabled
                        </label>
                      : <input type={s.type==="number"?"number":"text"} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a] transition-colors"
                          value={form[s.setting_key]??""} onChange={e=>setForm(f=>({...f,[s.setting_key]:e.target.value}))}/>
                    }
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Key className="size-4 text-gray-500"/>
          <h2 className="font-semibold text-gray-800">Change Password</h2>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <input type="password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a]" value={curPw} onChange={e=>setCurPw(e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
            <input type="password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1f5c3a]" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min 8 characters"/>
          </div>
          <button onClick={changePassword} disabled={pwSaving} className="flex items-center gap-2 px-5 py-2.5 bg-[#1f5c3a] hover:bg-[#163f28] text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
            <Key className="size-4"/>{pwSaving?"Updating…":"Update Password"}
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-[#163f28]/5 border border-[#163f28]/10 rounded-xl p-5 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-700">API Information</p>
        <p>API Base: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{import.meta.env.VITE_API_URL||"http://localhost/evergreen-emporium/api"}</code></p>
        <p className="text-xs text-gray-400">Update <code className="bg-gray-100 px-1 rounded font-mono">.env.local</code> → <code className="bg-gray-100 px-1 rounded font-mono">VITE_API_URL</code> if your server is on a different URL.</p>
      </div>
    </div>
  );
}
