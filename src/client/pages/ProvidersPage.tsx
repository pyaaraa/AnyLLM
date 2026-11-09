import React, { useState } from "react";
import { Cpu, CheckCircle2, Activity, Layers, FileCode, ShieldCheck, } from "lucide-react";
import { Provider } from "../types";
interface ProvidersPageProps {
    providers: Provider[];
}
export const ProvidersPage: React.FC<ProvidersPageProps> = ({ providers }) => {
    const [pingStatus, setPingStatus] = useState<Record<string, number | "error">>({});
    const [testingPing, setTestingPing] = useState(false);
    const testGatewayLatency = async () => {
        setTestingPing(true);
        const results: Record<string, number | "error"> = {};
        for (const p of providers) {
            const start = Date.now();
            try {
                const res = await fetch(`/v1/providers/${p.id}`);
                if (res.ok) {
                    results[p.id] = Date.now() - start;
                }
                else {
                    results[p.id] = "error";
                }
            }
            catch {
                results[p.id] = "error";
            }
        }
        setPingStatus(results);
        setTestingPing(false);
    };
    const getProviderBrand = (id: string) => {
        switch (id.toLowerCase()) {
            case "openai":
                return { name: "OpenAI", color: "from-emerald-500 to-teal-600", desc: "GPT-4o, GPT-4o mini, Whisper, Embeddings" };
            case "anthropic":
                return { name: "Anthropic", color: "from-amber-500 to-orange-600", desc: "Claude 3.5 Sonnet, Claude 3.5 Haiku" };
            case "google":
                return { name: "Google Gemini", color: "from-blue-500 to-indigo-600", desc: "Gemini 2.5 Flash, Gemini 2.5 Pro, Imagen" };
            case "groq":
                return { name: "Groq LPU", color: "from-orange-500 to-red-600", desc: "Ultra-low latency LPU hardware inference" };
            case "cerebras":
                return { name: "Cerebras", color: "from-pink-500 to-rose-600", desc: "Wafer-scale high-throughput inference" };
            case "fireworks":
                return { name: "Fireworks AI", color: "from-purple-500 to-violet-600", desc: "Fast open-weights serving and Flux image gen" };
            case "openrouter":
                return { name: "OpenRouter", color: "from-cyan-500 to-blue-600", desc: "Global multi-provider fallback aggregator" };
            default:
                return { name: id, color: "from-slate-700 to-slate-800", desc: "Custom configured provider" };
        }
    };
    return (<div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Cpu className="w-6 h-6 text-emerald-400"/>
            <span>Connected Upstream Providers</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            AnyLLM routes and fails over across these upstream providers in real-time.
          </p>
        </div>

        <button onClick={testGatewayLatency} disabled={testingPing} className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition disabled:opacity-50 self-start sm:self-auto">
          <Activity className={`w-4 h-4 text-emerald-400 ${testingPing ? "animate-spin" : ""}`}/>
          <span>{testingPing ? "Probing Providers..." : "Probe Gateway Latency"}</span>
        </button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p) => {
            const brand = getProviderBrand(p.id);
            const latency = pingStatus[p.id];
            return (<div key={p.id} className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${brand.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {p.id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {brand.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 uppercase">
                        Type: {p.type}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5"/>
                    <span>Active</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{brand.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">Base URL</span>
                  <span className="text-slate-300 truncate max-w-[180px]">
                    {p.base_url || "Default SDK URL"}
                  </span>
                </div>

                {latency !== undefined && (<div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Gateway Probe</span>
                    <span className={`font-mono text-xs font-semibold ${latency === "error" ? "text-rose-400" : "text-emerald-400"}`}>
                      {latency === "error" ? "Timeout" : `${latency}ms`}
                    </span>
                  </div>)}
              </div>
            </div>);
        })}
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <FileCode className="w-4 h-4 text-emerald-400"/>
          <span>Configuring Upstream Providers in AnyLLM</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Providers are loaded from <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">config/config.yaml</code>. If any provider experiences downtime or rate limiting (HTTP 429/500/503), AnyLLM automatically cascades requests to the next configured fallback provider with zero disruption to the client.
        </p>
      </div>
    </div>);
};
