export interface User {
    id: string;
    name: string;
    email: string;
    isDemo?: boolean;
    tier: "Free Demo" | "Developer" | "Enterprise";
    tokenBalance: number;
    tokensUsed: number;
    requestsCount: number;
}
export interface UserApiKey {
    id: string;
    userId: string;
    name: string;
    keyPrefix: string;
    maskedKey: string;
    createdAt: number;
    secretOnce?: string;
}
export interface UsageRecord {
    id: string;
    userId: string;
    model: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    costSavedEst: number;
    timestamp: number;
}
export interface ModelProviderConfig {
    provider: string;
    model: string;
    max_tokens?: number;
}
export interface Model {
    id: string;
    name?: string;
    description?: string;
    context_length?: number;
    object?: string;
    created?: number;
    owned_by?: string;
    providers: ModelProviderConfig[];
}
export interface Provider {
    id: string;
    type: string;
    base_url?: string;
    responses?: boolean;
}
export interface ChatMessage {
    id: string;
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: number;
    model?: string;
    providerUsed?: string;
    latencyMs?: number;
    tokenCount?: number;
}
export interface GatewayStatus {
    name: string;
    version: string;
    message: string;
    uptime: string;
    apis_available: string[];
}
