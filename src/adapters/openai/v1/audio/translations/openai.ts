import { HTTPException } from "hono/http-exception";
import OpenAI from "openai";
import type { TranslationCreateParams, TranslationCreateResponse, } from "openai/resources/audio/translations";
import type { OpenAITranslationsAdapter } from "./adapter.js";
import type { AnyLLMApiCallUsage } from "../../../../../types/usage.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";
import { getAudioDuration } from "../../../../../utils/audio.js";
export class OpenAITranslationsOpenAIAdapter implements OpenAITranslationsAdapter {
    usage?: AnyLLMApiCallUsage;
    getClient(provider: AnyLLMConfigProvider): OpenAI {
        return new OpenAI({
            baseURL: provider.base_url,
            apiKey: provider.api_key,
        });
    }
    async sendRequest(provider: AnyLLMConfigProvider, request: TranslationCreateParams, options?: {}): Promise<TranslationCreateResponse | string> {
        const openai = this.getClient(provider);
        const translation = await openai.audio.translations.create(request);
        this.usage = {
            input_audio_time: Math.ceil((await getAudioDuration(request.file as File)) ?? 0),
            request: 1,
        };
        return translation;
    }
    async sendRequestStreaming(provider: AnyLLMConfigProvider, request: TranslationCreateParams, options?: {}): Promise<AsyncGenerator<never>> {
        throw new HTTPException(400, {
            message: "Translations API does not support streaming",
        });
    }
}
