// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type {
  Message,
  MessageCreateParamsBase,
  RawMessageStreamEvent,
} from "@anthropic-ai/sdk/resources/messages";

import { AnyLLMAdapter } from "../../../adapter.js";
import { AnthropicMessagesAnthropicAdapter } from "./anthropic.js";
import { AnthropicMessagesOthersAdapter } from "./others.js";
import type { AnyLLMConfigProvider } from "../../../../types/config.js";

export interface AnthropicMessagesInputOptions {
  maxTokens?: number;
}

export type AnthropicMessagesAdapter = AnyLLMAdapter<
  MessageCreateParamsBase,
  AnthropicMessagesInputOptions,
  Message,
  RawMessageStreamEvent
>;

const adapters: Record<string, new () => AnthropicMessagesAdapter> = {
  anthropic: AnthropicMessagesAnthropicAdapter,
  others: AnthropicMessagesOthersAdapter,
};

export class AnthropicMessagesAdapterFactory {
  static getAdapter(
    provider: AnyLLMConfigProvider,
  ): AnthropicMessagesAdapter {
    if (!Object.keys(adapters).includes(provider.type)) {
      return new adapters.others();
    }
    return new adapters[provider.type]();
  }
}
