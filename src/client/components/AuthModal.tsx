import React, { useState } from "react";
import { LogIn, UserPlus, X, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "signin" | "signup";
}
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = "signin", }) => {
    const { login, register } = useAuth();
    const [tab, setTab] = useState<"signin" | "signup">(initialTab);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    if (!isOpen)
        return null;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (tab === "signup") {
                if (!name.trim())
                    throw new Error("Full Name is required");
                await register(name.trim(), email.trim(), password);
            }
            else {
                await login(email.trim(), password);
            }
            onClose();
        }
        catch (err: any) {
            setError(err.message || "Authentication failed");
        }
        finally {
            setLoading(false);
        }
    };

        setError(null);
        setLoading(true);
        try {
            await loginAsDemo();
            onClose();
        }
        catch (err: any) {
            setError(err.message || "Failed to start demo");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-slate-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5"/>
        </button>

        
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 items-center justify-center text-slate-950 font-black text-xl mb-3 shadow-lg shadow-emerald-500/20">
            A
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-emerald-400">AnyLLM</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Universal AI Gateway, Intelligent Router & Multi-Model Playground
          </p>
        </div>

        
        <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400"/>
              <span>Instant Free Demo</span>
            </span>
            <p className="text-[11px] text-slate-300 mt-0.5">
              100,000 free tokens, no signup or card needed.
            </p>
          </div>
          <button onClick={handleDemoAccess} disabled={loading} className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap transition shadow-md shadow-emerald-950/40">
            {loading ? "Launching..." : "Try Demo"}
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Or Account Sign In
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        
        <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
          <button onClick={() => { setTab("signin"); setError(null); }} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${tab === "signin"
            ? "bg-slate-800 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"}`}>
            Sign In
          </button>
          <button onClick={() => { setTab("signup"); setError(null); }} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${tab === "signup"
            ? "bg-slate-800 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"}`}>
            Create Account
          </button>
        </div>

        {error && (<div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400"/>
            <span>{error}</span>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (<div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Developer" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"/>
            </div>)}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@domain.com" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"/>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"/>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950/40 disabled:opacity-50">
            {loading ? "Processing..." : tab === "signin" ? "Sign In to AnyLLM" : "Create Developer Account"}
          </button>
        </form>

        <div className="mt-5 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/>
          <span>Local database storage • Zero tracking</span>
        </div>
      </div>
    </div>);
};
