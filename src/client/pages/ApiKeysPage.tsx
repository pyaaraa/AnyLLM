import React, { useState, useEffect } from "react";
import { KeyRound, Plus, Copy, Check, Trash2, ShieldCheck, Terminal, Lock, Eye, EyeOff, } from "lucide-react";
import { UserApiKey } from "../types";
import { apiGetKeys, apiCreateKey, apiDeleteKey } from "../api";
import { useAuth } from "../context/AuthContext";
export const ApiKeysPage: React.FC = () => {
    const { user, isDemo } = useAuth();
    const [keys, setKeys] = useState<UserApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const loadKeys = async () => {
        try {
            const list = await apiGetKeys();
            setKeys(list);
        }
        catch (err) {
            console.error("Failed to load keys", err);
        }
    };
    useEffect(() => {
        loadKeys();
    }, [user]);
    const copyKey = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim())
            return;
        setLoading(true);
        try {
            const res = await apiCreateKey(newKeyName.trim());
            setCreatedSecret(res.secret);
            setNewKeyName("");
            loadKeys();
        }
        catch (err) {
            console.error("Failed to create key", err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id: string) => {
        try {
            await apiDeleteKey(id);
            loadKeys();
        }
        catch (err) {
            console.error("Failed to delete key", err);
        }
    };
    return (<div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <KeyRound className="w-6 h-6 text-emerald-400"/>
            <span>API Keys & Credentials</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate and manage access keys for Cursor, Continue, LangChain, or your custom agents.
          </p>
        </div>

        <button onClick={() => {
            setCreatedSecret(null);
            setIsModalOpen(true);
        }} className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg self-start sm:self-auto">
          <Plus className="w-4 h-4"/>
          <span>Create New Key</span>
        </button>
      </div>

      
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center space-x-3 text-xs text-slate-400">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0"/>
        <p>
          Keys are stored as SHA-256 hashes on your local database. Full key secrets are shown only once upon generation and never stored in plain text.
        </p>
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Key Label</span>
          <div className="flex items-center space-x-8 pr-4">
            <span className="hidden sm:inline">Created</span>
            <span>Masked Credential</span>
            <span>Revoke</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {keys.map((k) => (<div key={k.id} className="p-4 flex items-center justify-between hover:bg-slate-900/90 transition text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs">
                  sk
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{k.name}</div>
                  <div className="text-[11px] text-slate-500 sm:hidden">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8 pr-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {new Date(k.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-xs font-mono text-slate-300">
                  <span>{k.maskedKey}</span>
                </div>

                <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Revoke Key">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>))}

          {keys.length === 0 && (<div className="text-center py-12 text-slate-500 text-sm">
              No API keys created yet. Click "Create New Key" above.
            </div>)}
        </div>
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400"/>
          <span>Quick SDK Integration</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Authenticate directly against AnyLLM's unified gateway using the standard OpenAI client:
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
        {`from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:3000/v1",
    api_key="sk-anyllm-local"  # Replace with your newly generated AnyLLM key
)

response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello from Python via AnyLLM!"}]
)

print(response.choices[0].message.content)`}
        </pre>
      </div>

      
      {isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {!createdSecret ? (<form onSubmit={handleCreate}>
                <h3 className="text-lg font-bold text-white mb-1.5">Generate AnyLLM API Key</h3>
                <p className="text-xs text-slate-400 mb-5">
                  Give your key a descriptive name (e.g. "Cursor IDE", "Backend Service", "Coding Agent").
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Key Name
                    </label>
                    <input type="text" required value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. My App / Dev Agent" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"/>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50">
                    {loading ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </form>) : (<div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <ShieldCheck className="w-6 h-6"/>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Key Generated Successfully!</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Copy your secret key now. For your security, this full secret will never be displayed again.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-300 mb-6">
                  <span className="truncate mr-2">{createdSecret}</span>
                  <button onClick={() => copyKey(createdSecret, "newly_created")} className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition shrink-0" title="Copy Key">
                    {copiedId === "newly_created" ? (<Check className="w-4 h-4 text-emerald-400"/>) : (<Copy className="w-4 h-4"/>)}
                  </button>
                </div>

                <button onClick={() => setIsModalOpen(false)} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition">
                  I Have Stored This Key Safely
                </button>
              </div>)}
          </div>
        </div>)}
    </div>);
};
