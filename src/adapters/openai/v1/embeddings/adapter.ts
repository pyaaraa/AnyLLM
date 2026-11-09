import type { CreateEmbeddingResponse, EmbeddingCreateParams, } from "openai/resources/embeddings";
import { AnyLLMAdapter } from "../../../adapter.js";
import { OpenAIEmbeddingsOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../types/config.js";
export type OpenAIEmbeddingsAdapter = AnyLLMAdapter<EmbeddingCreateParams, {}, CreateEmbeddingResponse, never>;
const adapters: Record<string, new () => OpenAIEmbeddingsAdapter> = {
    others: OpenAIEmbeddingsOpenAIAdapter,
};
export class OpenAIEmbeddingsAdapterFactory {
    static getAdapter(provider: AnyLLMConfigProvider): OpenAIEmbeddingsAdapter {
        if (!Object.keys(adapters).includes(provider.type)) {
            return new adapters.others();
        }
        return new adapters[provider.type]();
    }
}
