import type { Response, ResponseCreateParamsBase, ResponseStreamEvent, } from "openai/resources/responses/responses";
import { AnyLLMAdapter } from "../../../adapter.js";
import { OpenAIResponsesOpenAIAdapter } from "./openai.js";
import { OpenAIResponsesOthersAdapter } from "./others.js";
import type { AnyLLMConfigProvider } from "../../../../types/config.js";
import type { ResponsesStore } from "../../../../utils/responses-store.js";
export interface OpenAIResponsesInputOptions {
    responsesStore: ResponsesStore;
    maxTokens?: number;
}
export abstract class OpenAIResponsesAdapter extends AnyLLMAdapter<ResponseCreateParamsBase, OpenAIResponsesInputOptions, Response, ResponseStreamEvent> {
    response?: Response;
}
const adapters: Record<string, new () => OpenAIResponsesAdapter> = {
    fireworks: OpenAIResponsesOpenAIAdapter,
    openai: OpenAIResponsesOpenAIAdapter,
    others: OpenAIResponsesOthersAdapter,
};
export class OpenAIResponsesAdapterFactory {
    static getAdapter(provider: AnyLLMConfigProvider): OpenAIResponsesAdapter {
        if (!Object.keys(adapters).includes(provider.type) ||
            provider.responses === false) {
            return new adapters.others();
        }
        return new adapters[provider.type]();
    }
}
