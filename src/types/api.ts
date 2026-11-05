// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type { Session, User } from "better-auth";

import type { AnyLLMConfigModel, AnyLLMConfigProvider } from "./config.js";

export interface AnyLLMSessionResponse {
  session: Session;
  user: User;
}

export interface AnyLLMApiKeyListResponse {
  keys: {
    id: string;
    name: string;
    key_prefix: string;
    created_at: number;
  }[];
}

export interface AnyLLMApiKeyCreateParams {
  name: string;
}

export interface AnyLLMApiKeyCreateResponse {
  key: string;
}

export interface AnyLLMApiKeyUpdateParams {
  name?: string;
}

export interface AnyLLMApiKeyUpdateResponse {
  message: string;
}

export interface AnyLLMApiKeyDeleteResponse {
  message: string;
}

export type AnyLLMModelGetResponse = AnyLLMConfigModel & {
  id: string;
};

export interface AnyLLMModelListResponse {
  models: AnyLLMModelGetResponse[];
}

export type AnyLLMProviderGetResponse = Omit<
  AnyLLMConfigProvider,
  "api_key"
> & {
  id: string;
};

export interface AnyLLMProviderListResponse {
  providers: AnyLLMProviderGetResponse[];
}
