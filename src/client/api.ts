import { Model, Provider, GatewayStatus, User, UserApiKey, UsageRecord } from "./types";
const BASE_URL = "";
export function getAuthToken(): string | null {
    return localStorage.getItem("anyllm_session_token");
}
export function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    else {
        const byok = localStorage.getItem("anyllm_byok");
        if (byok && byok.trim()) {
            headers["Authorization"] = `Bearer BYOK:${byok.trim()}`;
        }
        else {
            headers["Authorization"] = `Bearer sk-anyllm-local`;
        }
    }
    return headers;
}
export async function fetchGatewayStatus(): Promise<GatewayStatus | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/status`);
        if (!res.ok)
            return null;
        return await res.json();
    }
    catch (e) {
        return null;
    }
}
export async function fetchModels(): Promise<Model[]> {
    try {
        const res = await fetch(`${BASE_URL}/v1/models`, {
            headers: { ...getAuthHeaders() },
        });
        if (!res.ok)
            return [];
        const data = await res.json();
        return data.models || data.data || [];
    }
    catch (e) {
        console.error("Failed to fetch models", e);
        return [];
    }
}
export async function fetchProviders(): Promise<Provider[]> {
    try {
        const res = await fetch(`${BASE_URL}/v1/providers`, {
            headers: { ...getAuthHeaders() },
        });
        if (!res.ok)
            return [];
        const data = await res.json();
        return data.providers || [];
    }
    catch (e) {
        return [];
    }
}
export async function apiDemoLogin(): Promise<{
    user: User;
    token: string;
}> {
    const res = await fetch(`${BASE_URL}/v1/auth/demo`, { method: "POST" });
    if (!res.ok)
        throw new Error("Failed to start free demo session");
    return await res.json();
}
export async function apiRegister(name: string, email: string, password: string): Promise<{
    user: User;
    token: string;
}> {
    const res = await fetch(`${BASE_URL}/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(data.error?.message || "Registration failed");
    return data;
}
export async function apiLogin(email: string, password: string): Promise<{
    user: User;
    token: string;
}> {
    const res = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(data.error?.message || "Login failed");
    return data;
}
export async function apiGetMe(): Promise<User | null> {
    const token = getAuthToken();
    if (!token)
        return null;
    try {
        const res = await fetch(`${BASE_URL}/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        return data.user || null;
    }
    catch {
        return null;
    }
}
export async function apiLogout(): Promise<void> {
    const token = getAuthToken();
    if (token) {
        try {
            await fetch(`${BASE_URL}/v1/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        catch { }
    }
}
export async function apiGetUsage(): Promise<{
    records: UsageRecord[];
    totalTokens: number;
    totalCostSaved: number;
}> {
    try {
        const res = await fetch(`${BASE_URL}/v1/user/usage`, {
            headers: { ...getAuthHeaders() },
        });
        if (!res.ok)
            return { records: [], totalTokens: 0, totalCostSaved: 0 };
        return await res.json();
    }
    catch {
        return { records: [], totalTokens: 0, totalCostSaved: 0 };
    }
}
export async function apiGetKeys(): Promise<UserApiKey[]> {
    try {
        const res = await fetch(`${BASE_URL}/v1/user/keys`, {
            headers: { ...getAuthHeaders() },
        });
        if (!res.ok)
            return [];
        const data = await res.json();
        return data.keys || [];
    }
    catch {
        return [];
    }
}
export async function apiCreateKey(name: string): Promise<{
    key: UserApiKey;
    secret: string;
}> {
    const res = await fetch(`${BASE_URL}/v1/user/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(data.error?.message || "Failed to create key");
    return data;
}
export async function apiDeleteKey(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/v1/user/keys/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok)
        throw new Error("Failed to revoke key");
}
export async function streamChatCompletion({ model, messages, temperature = 0.7, maxTokens = 2048, onChunk, }: {
    model: string;
    messages: Array<{
        role: string;
        content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
    onChunk: (chunk: string) => void;
}): Promise<{
    fullText: string;
    latencyMs: number;
}> {
    const startTime = Date.now();
    const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: true,
        }),
    });
    if (!res.ok) {
        const errText = await res.text();
        let parsedMessage = errText;
        try {
            const errObj = JSON.parse(errText);
            parsedMessage = errObj.error?.message || errObj.message || errText;
        }
        catch { }
        throw new Error(parsedMessage);
    }
    if (!res.body) {
        throw new Error("No response body received from AnyLLM gateway stream");
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":") || !trimmed.startsWith("data:"))
                continue;
            const dataPayload = trimmed.slice(5).trim();
            if (dataPayload === "[DONE]")
                continue;
            try {
                const parsed = JSON.parse(dataPayload);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                if (delta) {
                    fullText += delta;
                    onChunk(fullText);
                }
            }
            catch (err) { }
        }
    }
    const latencyMs = Date.now() - startTime;
    return { fullText, latencyMs };
}
