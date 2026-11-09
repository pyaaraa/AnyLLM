import React from "react";
import { Sparkles, Zap, ArrowRight, Boxes, Cpu, Layers, ShieldCheck, Code2, Activity, CheckCircle2, Terminal, } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Model } from "../types";
interface HomePageProps {
    onNavigate: (tab: string) => void;
    onOpenAuth: (tab?: "signin" | "signup") => void;
    models: Model[];
}
export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth, models, }) => {
    const { user, loginAsDemo } = useAuth();
    const handleFreeDemo = async () => {
        if (!user) {
            await loginAsDemo();
        }
        onNavigate("demo");
    };
    const topModels = [
        { id: "openai/gpt-4o", name: "GPT-4o", context: "128k", provider: "OpenAI", speed: "84 tok/s", rating: "99.4" },
        { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet", context: "200k", provider: "Anthropic", speed: "78 tok/s", rating: "99.6" },
        { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", context: "1M", provider: "Google", speed: "142 tok/s", rating: "98.8" },
        { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", context: "128k", provider: "Groq", speed: "280 tok/s", rating: "98.5" },
        { id: "deepseek/deepseek-r1", name: "DeepSeek R1", context: "64k", provider: "Fireworks", speed: "65 tok/s", rating: "99.1" },
    ];
    return (<div className="space-y-16 pb-12">
      
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-[#090d16] p-8 sm:p-14 md:p-16 text-center shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>OpenRouter Alternative • Self-Hosted & Local</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            One Unified API. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Intelligent LLM Routing.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            AnyLLM seamlessly multiplexes OpenAI, Anthropic, Google Gemini, Groq, and Fireworks through a single endpoint with automatic fallback failover, zero markups, and instant local execution.
          </p>

          
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button onClick={handleFreeDemo} className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-emerald-500/25 group">
              <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform"/>
              <span>Try Free Live Demo</span>
              <ArrowRight className="w-4 h-4"/>
            </button>

            <button onClick={() => onNavigate("playground")} className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition">
              <span>Launch Studio</span>
            </button>

            <button onClick={() => onNavigate("models")} className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 font-medium text-sm transition">
              <Boxes className="w-4 h-4"/>
              <span>Browse Catalog</span>
            </button>
          </div>

          
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-2xl mx-auto border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400">OpenAI Compatible</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">&lt; 3ms</div>
              <div className="text-xs text-slate-400">Internal Routing Latency</div>
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-400">7+</div>
              <div className="text-xs text-slate-400">Top Providers Integrated</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">0%</div>
              <div className="text-xs text-slate-400">Price Markups</div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400"/>
              <span>Supported High-Performance Models</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant failover chaining across providers for zero downtime.
            </p>
          </div>

          <button onClick={() => onNavigate("models")} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
            <span>View All Models</span>
            <ArrowRight className="w-3.5 h-3.5"/>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {topModels.map((m) => (<div key={m.id} onClick={() => onNavigate("playground")} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {m.provider}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{m.speed}</span>
                </div>
                <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 text-sm">
                  {m.name}
                </h3>
                <span className="text-[11px] font-mono text-slate-500 truncate block mt-0.5">{m.id}</span>
              </div>

              <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Context: <strong className="text-slate-200">{m.context}</strong></span>
                <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Test →
                </span>
              </div>
            </div>))}
        </div>
      </section>

      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Layers className="w-5 h-5"/>
          </div>
          <h3 className="font-bold text-white text-base">Automatic Provider Failover</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Never suffer from upstream outages or rate limits. If OpenAI or Anthropic is temporarily down, AnyLLM automatically reroutes to Groq, Cerebras, or Fireworks without interrupting client requests.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
            <ShieldCheck className="w-5 h-5"/>
          </div>
          <h3 className="font-bold text-white text-base">Zero-Leak Credential Shield</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            API keys and provider secrets are securely held on the backend. Frontend requests only interact with masked keys (<code className="text-emerald-400 font-mono">sk-anyllm-••••</code>) or ephemeral session tokens.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
            <Code2 className="w-5 h-5"/>
          </div>
          <h3 className="font-bold text-white text-base">Drop-In SDK Integration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Point standard OpenAI or Anthropic clients to <code className="text-emerald-400 font-mono">http://127.0.0.1:3000/v1</code>. No custom SDK needed. Works instantly with Cursor, Continue, LangChain, and Vercel AI.
          </p>
        </div>
      </section>

      
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400"/>
            <span>Ready to call AnyLLM from code?</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Get your instant local API key or test live endpoints directly with cURL or Python.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("keys")} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700">
            Create API Key
          </button>
          <button onClick={() => onNavigate("docs")} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-950/20">
            View Code Snippets
          </button>
        </div>
      </section>
    </div>);
};
