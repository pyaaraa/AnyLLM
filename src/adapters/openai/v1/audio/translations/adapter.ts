// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type {
  TranslationCreateParams,
  TranslationCreateResponse,
} from "openai/resources/audio/translations";

import { AnyLLMAdapter } from "../../../../adapter.js";
import { OpenAITranslationsOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";

export type OpenAITranslationsAdapter = AnyLLMAdapter<
  TranslationCreateParams,
  {},
  TranslationCreateResponse | string,
  never
>;

const adapters: Record<string, new () => OpenAITranslationsAdapter> = {
  others: OpenAITranslationsOpenAIAdapter,
};

export class OpenAITranslationsAdapterFactory {
  static getAdapter(
    provider: AnyLLMConfigProvider,
  ): OpenAITranslationsAdapter {
    if (!Object.keys(adapters).includes(provider.type)) {
      return new adapters.others();
    }
    return new adapters[provider.type]();
  }
}
