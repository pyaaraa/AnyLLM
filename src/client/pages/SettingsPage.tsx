import React, { useState } from "react";
import { Settings, Eye, EyeOff, ShieldCheck, Check, Key, Sliders, Server, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [byok, setByok] = useState(localStorage.getItem("anyllm_byok") || "");
  const [activeKey, setActiveKey] = useState(localStorage.getItem("anyllm_active_key") || "sk-anyllm-local");
  const [routingStrategy, setRoutingStrategy] = useState("failover");
  const [showKey, setShowKey] = useState(false);
  const [showByok, setShowByok] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (byok.trim()) {
      localStorage.setItem("anyllm_byok", byok.trim());
    } else {
      localStorage.removeItem("anyllm_byok");
    }
    if (activeKey.trim()) {
      localStorage.setItem("anyllm_active_key", activeKey.trim());
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Gateway & Account Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage local gateway credentials, client authentication headers, and runtime routing policies.
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-base shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{user?.name || user?.email || "Local User"}</div>
              <div className="text-xs text-slate-400">{user?.email || "anonymous@anyllm.local"}</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {user?.role === "admin" ? "Admin Gateway" : "Active Member"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Account ID</span>
            <span className="font-mono text-slate-300">{user?.id || "usr_local_default"}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Session Provider</span>
            <span className="text-slate-300 font-medium">AnyLLM Self-Hosted</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Quick Actions</span>
            <Link to="/dashboard/providers" className="text-teal-400 hover:text-teal-300 inline-flex items-center space-x-1 font-medium">
              <span>View Providers</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Gateway Access Key */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold text-base">
            <Key className="w-5 h-5 text-emerald-400" />
            <span>Gateway Access Token</span>
          </div>
          <p className="text-xs text-slate-400">
            The bearer token sent in HTTP <code className="text-emerald-400 font-mono">Authorization: Bearer ...</code> headers from your frontend or local SDKs to this AnyLLM gateway.
          </p>
          <div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={activeKey}
                onChange={(e) => setActiveKey(e.target.value)}
                placeholder="sk-anyllm-local"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Configured in <code className="text-slate-400">config/config.yaml</code> under <code className="text-slate-400">auth.api_keys</code>.
            </span>
          </div>
        </div>

        {/* BYOK Override */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold text-base">
            <Sliders className="w-5 h-5 text-teal-400" />
            <span>BYOK (Bring Your Own Upstream Key) - Optional</span>
          </div>
          <p className="text-xs text-slate-400">
            If you want the gateway to use your personal upstream API key (OpenAI, OpenRouter, Anthropic) instead of server-configured keys, specify it below. It will be passed per-request.
          </p>
          <div>
            <div className="relative">
              <input
                type={showByok ? "text" : "password"}
                value={byok}
                onChange={(e) => setByok(e.target.value)}
                placeholder="sk-proj-•••••••• or sk-ant-••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowByok(!showByok)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showByok ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Stored locally in browser session storage and forwarded via secure headers.
            </span>
          </div>
        </div>

        {/* Routing Policy */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold text-base">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Failover & Dispatch Mode</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "failover", title: "Priority Failover", desc: "Routes to highest priority provider, fails over on 429 / 5xx" },
              { id: "lowest-latency", title: "Lowest Latency", desc: "Routes requests based on real-time rolling response times" },
              { id: "lowest-cost", title: "Lowest Cost", desc: "Selects lowest input/output token pricing among equivalent models" },
            ].map((strategy) => (
              <div
                key={strategy.id}
                onClick={() => setRoutingStrategy(strategy.id)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  routingStrategy === strategy.id
                    ? "border-emerald-500/60 bg-emerald-500/5 text-slate-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-sm text-white mb-1">{strategy.title}</div>
                <div className="text-xs text-slate-400">{strategy.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Leakage Notice */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Self-Hosted Security Guarantee</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            All credentials stored in <code className="text-emerald-400">config/config.yaml</code> remain strictly local. AnyLLM scrubs API keys, authorization tokens, and upstream metadata before sending responses to web clients.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="text-xs text-emerald-400 flex items-center space-x-1.5 font-semibold">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-md whitespace-nowrap min-w-[7rem]"
            >
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
