import type { Context } from "hono";
import type { AnyLLMApiCallUsage } from "../types/usage.js";
import type { AnyLLMLedgerMetadataApiCallTimestamps } from "../types/usage.js";
import type { ContextEnv } from "../types/hono.js";
export const recordApiCall = async (_c: Context<ContextEnv>, _provider: string, _status: number, _timestamps: AnyLLMLedgerMetadataApiCallTimestamps, _usage?: AnyLLMApiCallUsage, _error?: string, _stream?: boolean) => {
    return;
};
