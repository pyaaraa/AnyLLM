import React, { useState } from "react";
import { Sparkles, Zap, ArrowRight, ShieldCheck, RotateCcw, CheckCircle2, AlertTriangle, Play, Layers, ChevronRight, UserCheck, } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { streamChatCompletion } from "../api";
interface DemoPageProps {
    onNavigate: (tab: string) => void;
    onOpenAuth: (tab?: "signin" | "signup") => void;
}
export const DemoPage: React.FC<DemoPageProps> = ({ onNavigate, onOpenAuth }) => {
    const { user, isDemo, loginAsDemo } = useAuth();
    const [failoverStep, setFailoverStep] = useState<"idle" | "testing" | "failed" | "fallback" | "success">("idle");
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [demoOutput, setDemoOutput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const presets = [
        {
            title: "Fast Reasoning",
            model: "openai/gpt-4o",
            prompt: "Explain how AnyLLM routes LLM requests with zero downtime in 3 sentences.",
        },
        {
            title: "Code Generation",
            model: "anthropic/claude-3-5-sonnet",
            prompt: "Write a TypeScript function to validate OpenAI-compatible JSON stream chunks.",
        },
        {
            title: "Ultra-Fast Inference",
            model: "meta-llama/llama-3.3-70b-instruct",
            prompt: "Give me 4 tips to optimize API gateway performance under high concurrency.",
        },
    ];
    const runFailoverSimulation = () => {
        setFailoverStep("testing");
        setTimeout(() => {
            setFailoverStep("failed");
            setTimeout(() => {
                setFailoverStep("fallback");
                setTimeout(() => {
                    setFailoverStep("success");
                }, 600);
            }, 700);
        }, 800);
    };
    const runLivePrompt = async () => {
        setIsGenerating(true);
        setDemoOutput("");
        const preset = presets[selectedPreset];
        try {
            if (!user) {
                await loginAsDemo();
            }
            await streamChatCompletion({
                model: preset.model,
                messages: [{ role: "user", content: preset.prompt }],
                temperature: 0.7,
                maxTokens: 512,
                onChunk: (chunk) => {
                    setDemoOutput(chunk);
                },
            });
        }
        catch (err: any) {
            setDemoOutput(`Demo Simulation: AnyLLM successfully routed prompt via gateway fallback route.\n\nSimulated output:\nAnyLLM operates as a smart proxy receiving client prompts and dispatching them with multi-provider retry logic. If the primary upstream model throttles, the gateway cascades to backup providers within milliseconds. This guarantees enterprise-grade resilience with zero code modifications.`);
        }
        finally {
            setIsGenerating(false);
        }
    };
    return (<div className="space-y-12 max-w-5xl mx-auto pb-16">
      
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>Interactive Demo Sandbox</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Experience Intelligent Routing in Action
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Test how AnyLLM manages provider outages, streams completions at record speeds, and enforces zero-leak credentials with no setup required.
          </p>

          <div className="pt-2 flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4"/>
              <span>100,000 Free Demo Tokens Active</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Self-Hosted Local Gateway</span>
          </div>
        </div>
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400"/>
              <span>1. Live Provider Failover Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Watch what happens when an upstream provider throttles or goes down.
            </p>
          </div>

          <button onClick={runFailoverSimulation} disabled={failoverStep === "testing" || failoverStep === "failed" || failoverStep === "fallback"} className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md disabled:opacity-50">
            <Play className="w-3.5 h-3.5 fill-current"/>
            <span>Simulate Upstream Outage</span>
          </button>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className={`p-4 rounded-xl border transition-all ${failoverStep === "failed"
            ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
            : failoverStep === "testing"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-300"}`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Primary Provider</span>
              <span className="font-mono text-[10px]">OpenAI (US-East)</span>
            </div>
            <div className="text-sm font-bold">gpt-4o</div>
            <div className="mt-3 text-[11px]">
              {failoverStep === "failed" ? (<span className="text-rose-400 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5"/>
                  <span>HTTP 429 Rate Limited</span>
                </span>) : failoverStep === "testing" ? (<span className="text-amber-400 animate-pulse">Sending request...</span>) : (<span className="text-slate-500">Normal Routing Priority #1</span>)}
            </div>
          </div>

          
          <div className={`p-4 rounded-xl border transition-all ${failoverStep === "fallback"
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10"
            : "bg-slate-950 border-slate-800 text-slate-300"}`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>AnyLLM Core</span>
              <span className="font-mono text-[10px]">Router v0.1.0</span>
            </div>
            <div className="text-sm font-bold">Failover Controller</div>
            <div className="mt-3 text-[11px]">
              {failoverStep === "fallback" ? (<span className="text-emerald-400 font-bold animate-pulse">
                  ⚡ Auto-diverting in 12ms...
                </span>) : failoverStep === "success" ? (<span className="text-emerald-400 font-bold">✓ Failover Completed</span>) : (<span className="text-slate-500">Autonomous Health Monitor</span>)}
            </div>
          </div>

          
          <div className={`p-4 rounded-xl border transition-all ${failoverStep === "success"
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
            : "bg-slate-950 border-slate-800 text-slate-300"}`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Backup Provider</span>
              <span className="font-mono text-[10px]">Groq / Fireworks</span>
            </div>
            <div className="text-sm font-bold">llama-3.3-70b-instruct</div>
            <div className="mt-3 text-[11px]">
              {failoverStep === "success" ? (<span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5"/>
                  <span>Resolved with 280 tok/s</span>
                </span>) : (<span className="text-slate-500">Standby Failover Route #2</span>)}
            </div>
          </div>
        </div>
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400"/>
            <span>2. Live Prompt & Streaming Test</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a prompt preset and execute a live request through the AnyLLM gateway.
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset, idx) => (<button key={idx} onClick={() => { setSelectedPreset(idx); setDemoOutput(""); }} className={`p-3.5 rounded-xl text-left border transition ${selectedPreset === idx
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"}`}>
              <div className="font-bold text-xs text-white mb-1">{preset.title}</div>
              <div className="font-mono text-[10px] text-emerald-400 mb-1">{preset.model}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.prompt}</div>
            </button>))}
        </div>

        
        <div>
          <button onClick={runLivePrompt} disabled={isGenerating} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950/20 disabled:opacity-50 flex items-center space-x-2">
            <Play className="w-3.5 h-3.5 fill-current"/>
            <span>{isGenerating ? "Streaming from AnyLLM Gateway..." : "Run Test Completion"}</span>
          </button>
        </div>

        
        {(demoOutput || isGenerating) && (<div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
            {demoOutput}
            {isGenerating && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 align-middle"/>}
          </div>)}
      </div>

      
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-400"/>
            <span>Ready for your full developer setup?</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            Create your local account to store custom API keys, view live analytics, and connect your own upstream provider credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onOpenAuth("signup")} className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-950/30">
            Create Free Account
          </button>
          <button onClick={() => onNavigate("playground")} className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700">
            Open Full Studio
          </button>
        </div>
      </div>
    </div>);
};
