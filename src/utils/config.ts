import fs from "fs";
import type { Context } from "hono";
import yaml from "yaml";
import type { AnyLLMConfig } from "../types/config.js";
import type { ContextEnv } from "../types/hono.js";
let configCache: AnyLLMConfig | null = null;
let configCacheRaw: string | null = null;
export const loadConfigFromCloudflareKV = async (c: Context<ContextEnv>): Promise<void> => {
    if (!c.env.ANYLLM_CONFIG_KV || !c.env.ANYLLM_CONFIG_KV_KEY) {
        return;
    }
    const configFromKV = await c.env.ANYLLM_CONFIG_KV.get(c.env.ANYLLM_CONFIG_KV_KEY);
    if (configFromKV && configFromKV !== configCacheRaw) {
        configCacheRaw = configFromKV;
        configCache = JSON.parse(configFromKV) as AnyLLMConfig;
    }
};
export const getConfig = (c?: Context<ContextEnv>): AnyLLMConfig => {
    if (configCache) {
        return configCache;
    }
    const configFromEnv = c?.env.ANYLLM_CONFIG ?? process.env.ANYLLM_CONFIG;
    if (configFromEnv) {
        console.log("Loading config from env...");
        configCache = yaml.parse(Buffer.from(configFromEnv, "base64").toString("utf8")) as AnyLLMConfig;
        return configCache;
    }
    if (process.argv.length < 3) {
        console.log("Loading default config...");
        configCache = yaml.parse(fs.readFileSync(new URL("../../config/config.default.example.yaml", import.meta.url)
            .pathname, "utf8")) as AnyLLMConfig;
        return configCache;
    }
    console.log(`Loading config from file "${process.argv[2]}"...`);
    configCache = yaml.parse(fs.readFileSync(process.argv[2], "utf8")) as AnyLLMConfig;
    return configCache;
};
