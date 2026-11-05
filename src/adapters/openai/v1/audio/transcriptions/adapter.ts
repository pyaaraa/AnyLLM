// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type {
  TranscriptionCreateParamsBase,
  TranscriptionCreateResponse,
  TranscriptionStreamEvent,
} from "openai/resources/audio/transcriptions";

import { AnyLLMAdapter } from "../../../../adapter.js";
import { OpenAITranscriptionsOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";

export type OpenAITranscriptionsAdapter = AnyLLMAdapter<
  TranscriptionCreateParamsBase,
  {},
  TranscriptionCreateResponse | string,
  TranscriptionStreamEvent
>;

const adapters: Record<string, new () => OpenAITranscriptionsAdapter> = {
  others: OpenAITranscriptionsOpenAIAdapter,
};

export class OpenAITranscriptionsAdapterFactory {
  static getAdapter(
    provider: AnyLLMConfigProvider,
  ): OpenAITranscriptionsAdapter {
    if (!Object.keys(adapters).includes(provider.type)) {
      return new adapters.others();
    }
    return new adapters[provider.type]();
  }
}
