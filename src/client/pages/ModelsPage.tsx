import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Zap,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Cpu,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Model } from "../types";
import { fetchModels } from "../api";

interface ModelsPageProps {
  models?: Model[];
  onSelectModelForChat?: (modelId: string) => void;
}

export const ModelsPage: React.FC<ModelsPageProps> = ({
  models: propModels,
  onSelectModelForChat,
}) => {
  const navigate = useNavigate();
  const [internalModels, setInternalModels] = useState<Model[]>(propModels || []);
  const models = propModels && propModels.length > 0 ? propModels : internalModels;

  useEffect(() => {
    if (!propModels || propModels.length === 0) {
      fetchModels().then((data) => setInternalModels(data)).catch(console.error);
    }
  }, [propModels]);

  const handleOpenPlayground = (id: string) => {
    if (onSelectModelForChat) {
      onSelectModelForChat(id);
    } else {
      navigate(`/playground?model=${encodeURIComponent(id)}`);
    }
  };
    const [search, setSearch] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("all");
    const [selectedModal, setSelectedModal] = useState<Model | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const providers = useMemo(() => {
        const set = new Set<string>();
        models.forEach((m) => {
            m.providers.forEach((p) => {
                if (p.provider)
                    set.add(p.provider.toLowerCase());
            });
        });
        return ["all", ...Array.from(set)];
    }, [models]);
    const filteredModels = useMemo(() => {
        return models.filter((m) => {
            if (m.id === "*")
                return false;
            const matchesSearch = m.id.toLowerCase().includes(search.toLowerCase()) ||
                (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
                (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
            const matchesProvider = selectedProvider === "all" ||
                m.providers.some((p) => p.provider.toLowerCase() === selectedProvider);
            return matchesSearch && matchesProvider;
        });
    }, [models, search, selectedProvider]);
    const formatContext = (ctx?: number) => {
        if (!ctx)
            return "Dynamic";
        if (ctx >= 1000000)
            return `${(ctx / 1000000).toFixed(1)}M tokens`;
        if (ctx >= 1000)
            return `${Math.round(ctx / 1000)}k tokens`;
        return `${ctx} tokens`;
    };
    const getProviderBadgeColor = (providerName: string) => {
        switch (providerName.toLowerCase()) {
            case "openai":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "anthropic":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "google":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "groq":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "cerebras":
                return "bg-pink-500/10 text-pink-400 border-pink-500/20";
            case "fireworks":
                return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default:
                return "bg-slate-800 text-slate-300 border-slate-700";
        }
    };
    return (<div className="space-y-8 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-emerald-400"/>
            <span>Model Catalog & Routing Chains</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse all configured models, inspect context windows, and view provider fallback priorities.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {filteredModels.length} models available
        </div>
      </div>

      
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models by name, ID, or description (e.g. gpt-4o, sonnet, llama)..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition text-sm"/>
        </div>

        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {providers.map((p) => {
            const active = selectedProvider === p;
            return (<button key={p} onClick={() => setSelectedProvider(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${active
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                {p}
              </button>);
        })}
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((model) => (<div key={model.id} className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all p-5 shadow-lg hover:shadow-xl">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {model.name || model.id}
                </h3>
                {model.context_length ? (<span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-mono">
                    {formatContext(model.context_length)}
                  </span>) : null}
              </div>

              
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mb-3 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800/50">
                <span className="truncate">{model.id}</span>
                <button onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(model.id, model.id);
            }} className="p-0.5 hover:text-white transition" title="Copy Model ID">
                  {copiedId === model.id ? (<Check className="w-3.5 h-3.5 text-emerald-400"/>) : (<Copy className="w-3.5 h-3.5"/>)}
                </button>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {model.description || "High-performance inference routed via AnyLLM unified gateway."}
              </p>
            </div>

            <div>
              
              <div className="pt-3 border-t border-slate-800/60 mb-4">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-2 flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-slate-500"/>
                  <span>Failover Sequence:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {model.providers.map((p, idx) => (<React.Fragment key={p.provider + idx}>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${getProviderBadgeColor(p.provider)}`}>
                        {p.provider}
                      </span>
                      {idx < model.providers.length - 1 && (<ChevronRight className="w-3 h-3 text-slate-600 shrink-0"/>)}
                    </React.Fragment>))}
                </div>
              </div>

              
              <div className="flex items-center justify-between gap-2.5">
                <button onClick={() => setSelectedModal(model)} className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition">
                  <Info className="w-3.5 h-3.5"/>
                  <span>Specs</span>
                </button>

                <button onClick={() => onSelectModelForChat(model.id)} className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm">
                  <Zap className="w-3.5 h-3.5"/>
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>))}
      </div>

      
      {selectedModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setSelectedModal(null)}>
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedModal.name || selectedModal.id}
                </h3>
                <p className="text-xs font-mono text-emerald-400 mt-0.5">{selectedModal.id}</p>
              </div>
              <button onClick={() => setSelectedModal(null)} className="text-slate-400 hover:text-white text-lg font-bold p-1">
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {selectedModal.description || "Routed via AnyLLM multi-provider gateway."}
            </p>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Context Window</span>
                  <span className="font-semibold text-slate-200">
                    {formatContext(selectedModal.context_length)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Upstream Providers</span>
                  <span className="font-semibold text-slate-200">
                    {selectedModal.providers.length} in failover route
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                  Provider Failover Sequence
                </span>
                <div className="space-y-2">
                  {selectedModal.providers.map((p, idx) => (<div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                          {idx + 1}
                        </span>
                        <span className="font-semibold capitalize text-slate-200">{p.provider}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{p.model}</span>
                    </div>))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                  cURL Snippet
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
            {`curl http://127.0.0.1:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-anyllm-local" \\
  -d '{
    "model": "${selectedModal.id}",
    "messages": [{"role": "user", "content": "Hello AnyLLM!"}]
  }'`}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button onClick={() => setSelectedModal(null)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition">
                Close
              </button>
              <button onClick={() => {
                const id = selectedModal.id;
                setSelectedModal(null);
                handleOpenPlayground(id);
            }} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition">
                Open in Playground
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
