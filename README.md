# AnyLLM 🚀

**AnyLLM** is an open-source, high-performance universal AI gateway, router, and playground — built as an OpenRouter alternative for local and self-hosted environments.

It provides a single unified OpenAI- and Anthropic-compatible API endpoint that intelligently routes prompts to the fastest, cheapest, or highest-availability upstream LLM providers with automatic fallback failover.

---

## 🌟 Key Features

- **🌐 Unified API Interface**: Full drop-in compatibility with the OpenAI SDK (`/v1/chat/completions`, `/v1/models`, `/v1/embeddings`, `/v1/images/generations`, `/v1/audio/transcriptions`) and Anthropic SDK (`/v1/messages`).
- **🔀 Smart Multi-Provider Routing & Failover**: Chain multiple providers (e.g. Groq ➔ Cerebras ➔ Fireworks ➔ OpenRouter) with automatic fallback if the primary provider throttles or errors out.
- **🎨 Interactive React & TypeScript UI**:
  - **Model Catalog**: Browse models with context window specs, latency benchmarks, and failover routing trees.
  - **Chat Playground**: Real-time SSE streaming playground with temperature, max tokens, and system prompt controls.
  - **API Key Management**: Create and manage local `sk-anyllm-...` authentication keys.
  - **Providers Health**: Diagnostic health checks and live probe latency testing.
  - **Code Generation**: Instant snippets for cURL, Python, Node.js, and Vercel AI SDK.
- **🔑 BYOK (Bring Your Own Key) Support**: Allow individual client calls to provide upstream keys directly via `Authorization: Bearer BYOK:<provider_key>` without modifying server configuration.
- **⚡ Dual-Runtime Ready**: Runs natively on Node.js with Hono and can deploy to Cloudflare Workers edge.

---

## 🚀 Quickstart

### 1. Install Dependencies

```bash
# Install root backend dependencies
pnpm install

# Install frontend dependencies
cd frontend && pnpm install && cd ..
```

### 2. Configure Providers & Models

Create your configuration file from the template:

```bash
cp config/config.example.yaml config/config.yaml
```

Add your upstream provider keys (e.g., OpenAI, Anthropic, Google, Groq, Fireworks) in `config/config.yaml`.

### 3. Run Locally

You can run the full AnyLLM stack locally:

#### Option A: Full Production Gateway & Web App (Single Port: 3000)
```bash
# Build the React frontend and compile backend
pnpm build:all

# Start AnyLLM on port 3000
pnpm start
```
Visit **`http://127.0.0.1:3000`** in your browser to access the AnyLLM UI and API gateway.

#### Option B: Hot-Reload Development Mode
In one terminal, start the backend:
```bash
pnpm dev
```
In another terminal, start the Vite frontend with Hot Module Replacement:
```bash
pnpm dev:frontend
```
Visit **`http://127.0.0.1:5173`** for live UI development (proxies requests to the backend at `127.0.0.1:3000`).

---

## 🔌 API Usage

### OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:3000/v1",
    api_key="sk-anyllm-local"
)

response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a quicksort implementation in Rust."}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()
```

### OpenAI SDK (Node.js / TypeScript)

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://127.0.0.1:3000/v1",
  apiKey: "sk-anyllm-local",
});

const completion = await openai.chat.completions.create({
  model: "anthropic/claude-3-5-sonnet",
  messages: [{ role: "user", content: "Explain vector databases." }],
});

console.log(completion.choices[0].message.content);
```

### Anthropic SDK (Python)

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="http://127.0.0.1:3000",
    api_key="sk-anyllm-local"
)

message = client.messages.create(
    model="anthropic/claude-3-5-sonnet",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello from AnyLLM gateway!"}]
)

print(message.content[0].text)
```

### cURL

```bash
curl http://127.0.0.1:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-anyllm-local" \
  -d '{
    "model": "meta-llama/llama-3.3-70b-instruct",
    "messages": [{"role": "user", "content": "Why is local LLM routing powerful?"}]
  }'
```

---

## ⚙️ Routing Configuration (`config/config.yaml`)

```yaml
server:
  host: 127.0.0.1
  port: 3000
  logging: dev

auth:
  enabled: false

access_keys:
  - sk-anyllm-local

providers:
  openai:
    type: openai
    api_key: sk-your-openai-key
  groq:
    type: openai
    base_url: https://api.groq.com/openai/v1
    api_key: sk-your-groq-key
  anthropic:
    type: anthropic
    api_key: sk-your-anthropic-key

models:
  meta-llama/llama-3.3-70b-instruct:
    name: Llama 3.3 70B
    context_length: 128000
    providers:
      - provider: groq
        model: llama-3.3-70b-versatile
      - provider: openai
        model: gpt-4o-mini
  "*":
    providers:
      - provider: openai
        model: ""
```

---

## 🛡️ License

MIT License. Copyright (c) 2025 AnyLLM.
