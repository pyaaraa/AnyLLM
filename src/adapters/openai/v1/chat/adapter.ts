// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParamsBase,
} from "openai/resources/chat/completions";

import { AnyLLMAdapter } from "../../../adapter.js";
import { OpenAIChatCompletionAnthropicAdapter } from "./anthropic.js";
import { OpenAIChatCompletionOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../types/config.js";

export interface OpenAIChatCompletionInputOptions {
  maxTokens?: number;
}

export type OpenAIChatCompletionAdapter = AnyLLMAdapter<
  ChatCompletionCreateParamsBase,
  OpenAIChatCompletionInputOptions,
  ChatCompletion,
  ChatCompletionChunk
>;

const adapters: Record<string, new () => OpenAIChatCompletionAdapter> = {
  anthropic: OpenAIChatCompletionAnthropicAdapter,
  others: OpenAIChatCompletionOpenAIAdapter,
};

export class OpenAIChatCompletionAdapterFactory {
  static getAdapter(
    provider: AnyLLMConfigProvider,
  ): OpenAIChatCompletionAdapter {
    if (!Object.keys(adapters).includes(provider.type)) {
      return new adapters.others();
    }
    return new adapters[provider.type]();
  }
}
