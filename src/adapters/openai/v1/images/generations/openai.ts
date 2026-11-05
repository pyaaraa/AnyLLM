// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import OpenAI from "openai";
import { Stream } from "openai/core/streaming";
import type {
  ImageGenStreamEvent,
  ImageGenerateParamsBase,
  ImagesResponse,
} from "openai/resources/images";

import type { OpenAIImageGenerationAdapter } from "./adapter.js";
import type { AnyLLMApiCallUsage } from "../../../../../types/usage.js";
import type { AnyLLMConfigProvider } from "../../../../../types/config.js";

export class OpenAIImageGenerationOpenAIAdapter
  implements OpenAIImageGenerationAdapter
{
  usage?: AnyLLMApiCallUsage;

  getClient(provider: AnyLLMConfigProvider): OpenAI {
    return new OpenAI({
      baseURL: provider.base_url,
      apiKey: provider.api_key,
    });
  }

  async sendRequest(
    provider: AnyLLMConfigProvider,
    request: ImageGenerateParamsBase,
    options?: {},
  ): Promise<ImagesResponse> {
    const openai = this.getClient(provider);
    const image = await openai.images.generate(request);
    this.usage = {
      input:
        ((image as ImagesResponse).usage?.input_tokens ?? 0) -
        ((image as ImagesResponse).usage?.input_tokens_details.image_tokens ??
          0),
      input_image:
        (image as ImagesResponse).usage?.input_tokens_details.image_tokens ?? 0,
      output: (image as ImagesResponse).usage?.output_tokens ?? 0,
      image: (image as ImagesResponse).data?.length ?? 0,
      image_quality: (image as ImagesResponse).quality,
      image_size: (image as ImagesResponse).size,
      request: 1,
    };
    return image as ImagesResponse;
  }

  async sendRequestStreaming(
    provider: AnyLLMConfigProvider,
    request: ImageGenerateParamsBase,
    options?: {},
  ): Promise<AsyncGenerator<ImageGenStreamEvent>> {
    const openai = this.getClient(provider);
    const stream = await openai.images.generate(request);
    return async function* (this: OpenAIImageGenerationOpenAIAdapter) {
      for await (const chunk of stream as Stream<ImageGenStreamEvent>) {
        if (chunk.type === "image_generation.completed") {
          this.usage = {
            input:
              chunk.usage.input_tokens -
              chunk.usage.input_tokens_details.image_tokens,
            input_image: chunk.usage.input_tokens_details.image_tokens,
            output: chunk.usage.output_tokens,
            image: 1,
            image_quality: chunk.quality,
            image_size: chunk.size,
            request: 1,
          };
          yield chunk;
        }
      }
    }.bind(this)();
  }
}
