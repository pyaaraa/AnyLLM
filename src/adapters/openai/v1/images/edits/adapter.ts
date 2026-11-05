// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type {
  ImageEditParamsBase,
  ImageEditStreamEvent,
  ImagesResponse,
} from "openai/resources/images";

import { AnyLLMAdapter } from "../../../../adapter.js";
import { OpenAIImageEditFireworksAdapter } from "./fireworks.js";
import { OpenAIImageEditGoogleAdapter } from "./google.js";
import { OpenAIImageEditOpenAIAdapter } from "./openai.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";

export type OpenAIImageEditAdapter = AnyLLMAdapter<
  ImageEditParamsBase,
  {},
  ImagesResponse,
  ImageEditStreamEvent
>;

const adapters: Record<string, new () => OpenAIImageEditAdapter> = {
  fireworks: OpenAIImageEditFireworksAdapter,
  google: OpenAIImageEditGoogleAdapter,
  others: OpenAIImageEditOpenAIAdapter,
};

export class OpenAIImageEditAdapterFactory {
  static getAdapter(provider: AnyLLMConfigProvider): OpenAIImageEditAdapter {
    if (!Object.keys(adapters).includes(provider.type)) {
      return new adapters.others();
    }
    return new adapters[provider.type]();
  }
}
