import type { ImageGenStreamEvent, ImageGenerateParamsBase, ImagesResponse, } from "openai/resources/images";
import { AnyLLMAdapter } from "../../../../adapter.js";
import { OpenAIImageGenerationFireworksAdapter } from "./fireworks.js";
import { OpenAIImageGenerationGoogleAdapter } from "./google.js";
import { OpenAIImageGenerationOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";
export type OpenAIImageGenerationAdapter = AnyLLMAdapter<ImageGenerateParamsBase, {}, ImagesResponse, ImageGenStreamEvent>;
const adapters: Record<string, new () => OpenAIImageGenerationAdapter> = {
    fireworks: OpenAIImageGenerationFireworksAdapter,
    google: OpenAIImageGenerationGoogleAdapter,
    others: OpenAIImageGenerationOpenAIAdapter,
};
export class OpenAIImageGenerationAdapterFactory {
    static getAdapter(provider: AnyLLMConfigProvider): OpenAIImageGenerationAdapter {
        if (!Object.keys(adapters).includes(provider.type)) {
            return new adapters.others();
        }
        return new adapters[provider.type]();
    }
}
