import React, { useState, useRef, useEffect } from "react";
import { Send, SlidersHorizontal, RotateCcw, Sparkles, Bot, User, Copy, Check, ChevronDown, Trash2, Download, StopCircle, Columns, } from "lucide-react";
import { Model, ChatMessage } from "../types";
import { streamChatCompletion } from "../api";
import { useAuth } from "../context/AuthContext";
interface PlaygroundPageProps {
    models: Model[];
    selectedModelId: string;
    onSelectModel: (id: string) => void;
}
export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({ models, selectedModelId, onSelectModel, }) => {
    const { user, isDemo, refreshUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "msg_welcome",
            role: "assistant",
            content: "Welcome to the AnyLLM Studio! You can choose any model from the dropdown above, adjust parameters on the right, or try out quick prompts below.",
            timestamp: Date.now(),
            model: selectedModelId,
        },
    ]);
    const [input, setInput] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful, brilliant, and precise AI assistant running via AnyLLM gateway.");
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [showParameters, setShowParameters] = useState(false);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<boolean>(false);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);
    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const clearChat = () => {
        setMessages([]);
    };
    const exportChat = () => {
        const dataStr = "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(messages, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `anyllm-chat-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };
    const handleSend = async () => {
        if (!input.trim() || isLoading)
            return;
        const userText = input.trim();
        setInput("");
        abortControllerRef.current = false;
        const userMessage: ChatMessage = {
            id: `usr_${Date.now()}`,
            role: "user",
            content: userText,
            timestamp: Date.now(),
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const assistantId = `ast_${Date.now()}`;
        const assistantMessage: ChatMessage = {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
            model: selectedModelId,
        };
        setMessages([...newMessages, assistantMessage]);
        setIsLoading(true);
        try {
            const apiMessages: Array<{
                role: string;
                content: string;
            }> = [];
            if (systemPrompt.trim()) {
                apiMessages.push({ role: "system", content: systemPrompt.trim() });
            }
            newMessages.forEach((m) => {
                apiMessages.push({ role: m.role, content: m.content });
            });
            const { fullText, latencyMs } = await streamChatCompletion({
                model: selectedModelId,
                messages: apiMessages,
                temperature,
                maxTokens,
                onChunk: (chunk) => {
                    if (abortControllerRef.current)
                        return;
                    setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content: chunk } : msg));
                },
            });
            const words = fullText.trim().split(/\s+/).length;
            const estimatedTokens = Math.round(words * 1.3);
            setMessages((prev) => prev.map((msg) => msg.id === assistantId
                ? {
                    ...msg,
                    content: fullText,
                    latencyMs,
                    tokenCount: estimatedTokens,
                }
                : msg));
            refreshUser();
        }
        catch (err: any) {
            const errMsg = err.message || "Failed to generate completion";
            setMessages((prev) => prev.map((msg) => msg.id === assistantId
                ? {
                    ...msg,
                    content: `⚠️ AnyLLM Gateway Notice: ${errMsg}\n\nTip: You can provide a BYOK key in Settings or configure your provider keys in 'config/config.yaml'.`,
                }
                : msg));
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const promptSuggestions = [
        "Write a high-performance Fibonacci function in Rust",
        "Explain quantum computing simply in 3 bullets",
        "Compare LLM routing architectures: Gateway vs Proxy",
        "Create a clean system design diagram for AnyLLM",
    ];
    return (<div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-2xl">
      
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-3">
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select value={selectedModelId} onChange={(e) => onSelectModel(e.target.value)} className="appearance-none pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-sm font-semibold text-slate-100 hover:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition cursor-pointer">
              {models.map((m) => (<option key={m.id} value={m.id}>
                  {m.name ? `${m.name} (${m.id})` : m.id}
                </option>))}
            </select>
            <Sparkles className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>

          <button onClick={() => setShowSystemPrompt(!showSystemPrompt)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${showSystemPrompt
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"}`}>
            System Prompt
          </button>
        </div>

        
        <div className="flex items-center space-x-2">
          {user && (<span className="text-[11px] font-mono text-slate-400 hidden md:inline px-2 py-1 rounded bg-slate-950 border border-slate-800">
              Balance: <strong className="text-emerald-400">{user.tokenBalance.toLocaleString()} tok</strong>
            </span>)}

          <button onClick={() => setShowParameters(!showParameters)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${showParameters
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"}`}>
            <SlidersHorizontal className="w-3.5 h-3.5"/>
            <span>Parameters</span>
          </button>

          <button onClick={clearChat} disabled={messages.length === 0} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition disabled:opacity-40" title="Clear Chat">
            <Trash2 className="w-3.5 h-3.5"/>
          </button>

          <button onClick={exportChat} disabled={messages.length === 0} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition disabled:opacity-40" title="Export JSON">
            <Download className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      
      {showSystemPrompt && (<div className="p-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center space-x-3 text-xs">
          <span className="font-semibold text-slate-400 shrink-0 uppercase tracking-wider text-[10px]">
            System:
          </span>
          <input type="text" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="Set instructions for model behavior..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500/50"/>
        </div>)}

      
      <div className="flex-1 flex overflow-hidden">
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (<div key={msg.id} className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto justify-end" : "mr-auto justify-start"}`}>
                {!isUser && (<div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4"/>
                  </div>)}

                <div className={`space-y-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser
                    ? "bg-emerald-600 text-slate-950 font-medium shadow-md shadow-emerald-950/20"
                    : "bg-slate-900 border border-slate-800/90 text-slate-200 shadow-md"}`}>
                    {msg.content}
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 px-1">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                    </span>
                    {msg.latencyMs ? <span>• {msg.latencyMs}ms</span> : null}
                    {msg.tokenCount ? <span>• ~{msg.tokenCount} tok</span> : null}
                    {msg.model && !isUser && (<span className="font-mono text-slate-400">• {msg.model}</span>)}
                    <button onClick={() => copyText(msg.content, msg.id)} className="hover:text-slate-300 transition p-0.5" title="Copy Message">
                      {copiedId === msg.id ? (<Check className="w-3 h-3 text-emerald-400"/>) : (<Copy className="w-3 h-3"/>)}
                    </button>
                  </div>
                </div>

                {isUser && (<div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4"/>
                  </div>)}
              </div>);
        })}

          {isLoading && (<div className="flex items-center space-x-2 text-xs text-slate-500 pl-11">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              <span>Routing completion via AnyLLM gateway...</span>
            </div>)}

          <div ref={messagesEndRef}/>
        </div>

        
        {showParameters && (<div className="w-72 border-l border-slate-800 bg-slate-900/70 p-5 space-y-6 text-xs text-slate-300 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-200">Temperature</span>
                <span className="font-mono text-emerald-400">{temperature}</span>
              </div>
              <input type="range" min="0" max="2" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-emerald-500 cursor-pointer"/>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Lower = precise and analytical; Higher = creative.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-200">Max Tokens</span>
                <span className="font-mono text-emerald-400">{maxTokens}</span>
              </div>
              <input type="range" min="256" max="8192" step="256" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full accent-emerald-500 cursor-pointer"/>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Upper token generation limit.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Failover Policy
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-200 font-medium">Automatic Cascade</div>
                <p>If the designated provider fails, AnyLLM tries the next provider in the chain transparently.</p>
              </div>
            </div>
          </div>)}
      </div>

      
      {messages.length <= 1 && (<div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0">Try:</span>
          {promptSuggestions.map((prompt, idx) => (<button key={idx} onClick={() => setInput(prompt)} className="text-xs px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition">
              {prompt}
            </button>))}
        </div>)}

      
      <div className="border-t border-slate-800/80 bg-slate-900/80 p-3 sm:p-4">
        <div className="relative flex items-end rounded-xl border border-slate-700/80 bg-slate-950 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/60 transition">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your prompt here... (Shift+Enter for newline)" rows={2} className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"/>

          <div className="p-2 shrink-0">
            {isLoading ? (<button onClick={() => {
                abortControllerRef.current = true;
                setIsLoading(false);
            }} className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition" title="Stop Generation">
                <StopCircle className="w-4 h-4"/>
              </button>) : (<button onClick={handleSend} disabled={!input.trim()} className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-40 shadow-md" title="Send Message">
                <Send className="w-4 h-4"/>
              </button>)}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Active Gateway: <strong className="text-slate-400">AnyLLM v0.1.0</strong> (127.0.0.1:3000)</span>
          <span>OpenRouter & OpenAI Drop-In Compatible</span>
        </div>
      </div>
    </div>);
};
