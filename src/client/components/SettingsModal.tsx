import React, { useState } from "react";
import { Settings, Eye, EyeOff, ShieldCheck, Info, Check, Key } from "lucide-react";
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [byok, setByok] = useState(localStorage.getItem("anyllm_byok") || "");
    const [activeKey, setActiveKey] = useState(localStorage.getItem("anyllm_active_key") || "sk-anyllm-local");
    const [showKey, setShowKey] = useState(false);
    const [showByok, setShowByok] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    if (!isOpen)
        return null;
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (byok.trim()) {
            localStorage.setItem("anyllm_byok", byok.trim());
        }
        else {
            localStorage.removeItem("anyllm_byok");
        }
        if (activeKey.trim()) {
            localStorage.setItem("anyllm_active_key", activeKey.trim());
        }
        setSavedNotice(true);
        setTimeout(() => {
            setSavedNotice(false);
            onClose();
        }, 900);
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 sm:p-7 shadow-2xl text-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-400"/>
            <span>Gateway & Credential Settings</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Gateway Access Key
            </label>
            <div className="relative">
              <input type={showKey ? "text" : "password"} value={activeKey} onChange={(e) => setActiveKey(e.target.value)} placeholder="sk-anyllm-local" className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"/>
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default access key passed to local AnyLLM gateway.
            </span>
          </div>

          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              BYOK (Bring Your Own Key) - Optional
            </label>
            <div className="relative">
              <input type={showByok ? "text" : "password"} value={byok} onChange={(e) => setByok(e.target.value)} placeholder="sk-proj-•••••••• or sk-ant-••••••••" className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"/>
              <button type="button" onClick={() => setShowByok(!showByok)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showByok ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Direct upstream provider key. If specified, forwarded using secure BYOK protocol.
            </span>
          </div>

          
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400"/>
              <span>Zero-Leakage Security Policy</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Provider credentials configured in <code className="text-emerald-400">config/config.yaml</code> are scrubbed from all API responses and browser caches.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedNotice ? (<span className="text-xs text-emerald-400 flex items-center space-x-1 font-semibold">
                <Check className="w-4 h-4"/>
                <span>Settings Saved!</span>
              </span>) : <span />}

            <div className="flex items-center space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>);
};
