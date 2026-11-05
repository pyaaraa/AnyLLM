// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import { HTTPException } from "hono/http-exception";
import OpenAI from "openai";
import type { SpeechCreateParams } from "openai/resources/audio/speech";

import type { OpenAISpeechAdapter } from "./adapter.js";
import type { AnyLLMApiCallUsage } from "../../../../../types/usage.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";

export class OpenAISpeechOpenAIAdapter implements OpenAISpeechAdapter {
  usage?: AnyLLMApiCallUsage;

  getClient(provider: AnyLLMConfigProvider): OpenAI {
    return new OpenAI({
      baseURL: provider.base_url,
      apiKey: provider.api_key,
    });
  }

  async sendRequest(
    provider: AnyLLMConfigProvider,
    request: SpeechCreateParams,
    options?: {},
  ): Promise<Response> {
    const openai = this.getClient(provider);
    const speech = await openai.audio.speech.create(request);
    this.usage = {
      input: request.input.length,
      request: 1,
    };
    return speech;
  }

  async sendRequestStreaming(
    provider: AnyLLMConfigProvider,
    request: SpeechCreateParams,
    options?: {},
  ): Promise<AsyncGenerator<never>> {
    throw new HTTPException(400, {
      message: "Speech API does not support streaming",
    });
  }
}
