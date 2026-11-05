// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type { Session, User } from "better-auth";
import type { KVNamespace } from "@cloudflare/workers-types";

import type { AnyLLMConfigModel } from "./config.js";
import { apiKey } from "../models/keys.js";

export type AuthType = "better-auth" | "api-key" | "access-key" | "byok";

export interface AuthBetterAuth {
  type: "better-auth";
  user: User;
  session: Session;
  ownerType: string;
  ownerId: string;
}

export interface AuthApiKey {
  type: "api-key";
  apiKey: typeof apiKey.$inferSelect;
}

export interface AuthAccessKey {
  type: "access-key";
  accessKey: string;
}

export interface AuthByok {
  type: "byok";
  byok: string;
}

export interface ContextEnv {
  Variables: {
    auth?: AuthBetterAuth | AuthApiKey | AuthAccessKey | AuthByok;
    modelName?: string;
    model?: AnyLLMConfigModel;
  };
  Bindings: {
    ANYLLM_CONFIG?: string;
    ANYLLM_CONFIG_KV?: KVNamespace;
    ANYLLM_CONFIG_KV_KEY?: string;
  };
}
