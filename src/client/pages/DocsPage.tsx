import React, { useState } from "react";
import { BookOpen, Copy, Check, Terminal, Code2, } from "lucide-react";
export const DocsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("curl");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const copyCode = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const snippets: Record<string, {
        title: string;
        lang: string;
        code: string;
    }> = {
        curl: {
            title: "cURL (OpenAI Compatible)",
            lang: "bash",
            code: `curl http://127.0.0.1:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-anyllm-local" \\
  -d '{
    "model": "openai/gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Hello AnyLLM!" }
    ],
    "temperature": 0.7
  }'`,
        },
        python_openai: {
            title: "Python (OpenAI SDK)",
            lang: "python",
            code: `from openai import OpenAI

# Initialize client pointing to AnyLLM local gateway
client = OpenAI(
    base_url="http://127.0.0.1:3000/v1",
    api_key="sk-anyllm-local"  # Or your generated AnyLLM key
)

# Stream response from any model (GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Flash, etc.)
stream = client.chat.completions.create(
    model="anthropic/claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Write a python script to merge two sorted lists."}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()`,
        },
        node_openai: {
            title: "Node.js / TypeScript (OpenAI SDK)",
            lang: "typescript",
            code: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://127.0.0.1:3000/v1",
  apiKey: "sk-anyllm-local",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: [
      { role: "system", content: "You are a senior fullstack engineer." },
      { role: "user", content: "Explain React Server Components vs SSR." }
    ],
  });

  console.log(completion.choices[0].message.content);
}

main();`,
        },
        anthropic_sdk: {
            title: "Anthropic SDK (Python)",
            lang: "python",
            code: `from anthropic import Anthropic

# AnyLLM supports Anthropic native /v1/messages specification
client = Anthropic(
    base_url="http://127.0.0.1:3000",
    api_key="sk-anyllm-local"
)

message = client.messages.create(
    model="anthropic/claude-3-5-sonnet",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Why is AnyLLM the best local LLM router?"}
    ]
)

print(message.content[0].text)`,
        },
        vercel_ai: {
            title: "Vercel AI SDK",
            lang: "typescript",
            code: `import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const anyllm = createOpenAI({
  baseURL: "http://127.0.0.1:3000/v1",
  apiKey: "sk-anyllm-local",
});

const { textStream } = await streamText({
  model: anyllm("meta-llama/llama-3.3-70b-instruct"),
  prompt: "What is quantum error correction?",
});

for await (const delta of textStream) {
  process.stdout.write(delta);
}`,
        },
    };
    return (<div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
          <BookOpen className="w-6 h-6 text-emerald-400"/>
          <span>Quickstart & SDK Integration</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          AnyLLM acts as a drop-in proxy for all AI applications. Integrate with existing codebases in under 30 seconds.
        </p>
      </div>

      
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.entries(snippets).map(([key, s]) => {
            const active = activeTab === key;
            return (<button key={key} onClick={() => setActiveTab(key)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${active
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"}`}>
              {s.title}
            </button>);
        })}
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"/>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"/>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"/>
            <span className="text-xs font-mono text-slate-400 ml-2">
              {snippets[activeTab].title}
            </span>
          </div>

          <button onClick={() => copyCode(snippets[activeTab].code, activeTab)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
            {copiedId === activeTab ? (<>
                <Check className="w-3.5 h-3.5 text-emerald-400"/>
                <span className="text-emerald-400">Copied</span>
              </>) : (<>
                <Copy className="w-3.5 h-3.5"/>
                <span>Copy</span>
              </>)}
          </button>
        </div>

        <pre className="p-5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {snippets[activeTab].code}
        </pre>
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="font-bold text-white text-base">Supported AnyLLM Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">POST /v1/chat/completions</span>
            <span className="text-slate-400 text-[11px] font-sans">OpenAI Streaming Chat</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">POST /v1/messages</span>
            <span className="text-slate-400 text-[11px] font-sans">Anthropic Native Messages</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">GET /v1/models</span>
            <span className="text-slate-400 text-[11px] font-sans">Model List & Specs</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">POST /v1/embeddings</span>
            <span className="text-slate-400 text-[11px] font-sans">Vector Embeddings</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">POST /v1/images/generations</span>
            <span className="text-slate-400 text-[11px] font-sans">Flux, Imagen & DALL-E</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">POST /v1/audio/transcriptions</span>
            <span className="text-slate-400 text-[11px] font-sans">Whisper Speech-to-Text</span>
          </div>
        </div>
      </div>
    </div>);
};
