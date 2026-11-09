import type { SpeechCreateParams } from "openai/resources/audio/speech";
import { AnyLLMAdapter } from "../../../../adapter.js";
import { OpenAISpeechOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";
export type OpenAISpeechAdapter = AnyLLMAdapter<SpeechCreateParams, {}, Response, never>;
const adapters: Record<string, new () => OpenAISpeechAdapter> = {
    others: OpenAISpeechOpenAIAdapter,
};
export class OpenAISpeechAdapterFactory {
    static getAdapter(provider: AnyLLMConfigProvider): OpenAISpeechAdapter {
        if (!Object.keys(adapters).includes(provider.type)) {
            return new adapters.others();
        }
        return new adapters[provider.type]();
    }
}
