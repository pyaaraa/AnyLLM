// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type { Context } from "hono";

import type { AnyLLMApiCallUsage } from "../types/usage.js";
import type { AnyLLMLedgerMetadataApiCallTimestamps } from "../types/usage.js";
import type { ContextEnv } from "../types/hono.js";

// leftover hook from when i thought i might log usage. nothing is billed.
export const recordApiCall = async (
  _c: Context<ContextEnv>,
  _provider: string,
  _status: number,
  _timestamps: AnyLLMLedgerMetadataApiCallTimestamps,
  _usage?: AnyLLMApiCallUsage,
  _error?: string,
  _stream?: boolean,
) => {
  return;
};
