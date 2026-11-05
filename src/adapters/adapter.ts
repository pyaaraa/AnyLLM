// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type { AnyLLMApiCallUsage } from "../types/usage.js";
import type { AnyLLMConfigProvider } from "../types/config.js";

export abstract class AnyLLMAdapter<
  TInput,
  TInputOptions,
  TOutput,
  TOutputStreamChunk,
> {
  usage?: AnyLLMApiCallUsage;

  abstract sendRequest(
    provider: AnyLLMConfigProvider,
    request: TInput,
    options?: TInputOptions,
  ): Promise<TOutput>;

  abstract sendRequestStreaming(
    provider: AnyLLMConfigProvider,
    request: TInput,
    options?: TInputOptions,
  ): Promise<AsyncGenerator<TOutputStreamChunk>>;
}
