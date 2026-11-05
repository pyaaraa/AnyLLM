// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import { HTTPException } from "hono/http-exception";
import OpenAI from "openai";
import type {
  CreateEmbeddingResponse,
  EmbeddingCreateParams,
} from "openai/resources/embeddings";

import type { OpenAIEmbeddingsAdapter } from "./adapter.js";
import type { AnyLLMApiCallUsage } from "../../../../types/usage.js";
import type { AnyLLMConfigProvider } from "../../../../types/config.js";

export class OpenAIEmbeddingsOpenAIAdapter implements OpenAIEmbeddingsAdapter {
  usage?: AnyLLMApiCallUsage;

  async sendRequest(
    provider: AnyLLMConfigProvider,
    request: EmbeddingCreateParams,
    options?: {},
  ): Promise<CreateEmbeddingResponse> {
    const openai = new OpenAI({
      baseURL: provider.base_url,
      apiKey: provider.api_key,
    });
    const embeddings = await openai.embeddings.create(request);
    this.usage = {
      input: embeddings.usage.prompt_tokens,
      request: 1,
    };
    return embeddings;
  }

  async sendRequestStreaming(
    provider: AnyLLMConfigProvider,
    request: EmbeddingCreateParams,
    options?: {},
  ): Promise<AsyncGenerator<never>> {
    throw new HTTPException(400, {
      message: "Embeddings API does not support streaming",
    });
  }
}
