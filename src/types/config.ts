export interface AnyLLMConfigServer {
    host: string;
    port: number;
    logging: string;
}
export interface AnyLLMConfigAuthDisabled {
    enabled: false;
}
export interface AnyLLMConfigAuthEnabled {
    enabled: true;
    database_url: string;
    better_auth: {
        secret: string;
        url: string;
        telemetry?: boolean;
        trusted_origins?: string[];
        social_providers?: Record<string, any>;
    };
    email: {
        resend: {
            api_key: string;
        };
        from_email: string;
        reply_to_email: string;
    };
}
export type AnyLLMConfigAuth = AnyLLMConfigAuthDisabled | AnyLLMConfigAuthEnabled;
export interface AnyLLMConfigResponsesStoreInMemory {
    type: "in_memory";
}
export interface AnyLLMConfigResponsesStoreUpstashRedis {
    type: "upstash_redis";
    url: string;
    token: string;
}
export type AnyLLMConfigResponsesStore = AnyLLMConfigResponsesStoreInMemory | AnyLLMConfigResponsesStoreUpstashRedis;
export type AnyLLMConfigProviderType = "openai" | "anthropic" | "fireworks" | "google";
export interface AnyLLMConfigProvider {
    name?: string;
    type: AnyLLMConfigProviderType;
    icon?: string;
    description?: string;
    website?: string;
    responses?: boolean;
    base_url?: string;
    api_key: string;
}
export interface AnyLLMConfigModelProvider {
    provider: string;
    model: string;
    context_window?: number;
    max_tokens?: number;
    responses_only?: boolean;
}
export type AnyLLMConfigModelType = "language" | "image" | "embedding" | "audio";
export interface AnyLLMConfigModel {
    name?: string;
    type?: AnyLLMConfigModelType;
    icon?: string;
    author?: string;
    description?: string;
    website?: string;
    created?: number;
    providers: AnyLLMConfigModelProvider[];
}
export interface AnyLLMConfig {
    server: AnyLLMConfigServer;
    auth: AnyLLMConfigAuth;
    responses_store: AnyLLMConfigResponsesStore;
    access_keys: string[];
    providers: Record<string, AnyLLMConfigProvider>;
    models: Record<string, AnyLLMConfigModel>;
}
