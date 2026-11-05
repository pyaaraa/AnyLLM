// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import { Hono } from "hono";

import { requireAuth } from "../middlewares/auth.js";
import type { AnyLLMSessionResponse } from "../types/api.js";
import type { AuthBetterAuth, ContextEnv } from "../types/hono.js";
import { getAuth } from "../utils/auth.js";
import { getConfig } from "../utils/config.js";
import anthropicRouter from "./v1/anthropic.js";
import apiKeysRouter from "./v1/api-keys.js";
import modelsRouter from "./v1/models.js";
import openaiRouter from "./v1/openai.js";
import providersRouter from "./v1/providers.js";

const v1Router = new Hono<ContextEnv>();

v1Router.route("/anthropic", anthropicRouter);
v1Router.route("/api-keys", apiKeysRouter);

v1Router.on(["GET", "POST"], "/auth/**", (c) => {
  const cfg = getConfig(c);
  if (!cfg.auth.enabled) {
    return c.json(
      {
        error: {
          message: "Auth is not enabled",
        },
      },
      400,
    );
  }
  return getAuth(c).handler(c.req.raw);
});

v1Router.route("/models", modelsRouter);
v1Router.route("/openai", openaiRouter);
v1Router.route("/providers", providersRouter);

v1Router.get("/session", requireAuth("better-auth"), (c) => {
  const auth = c.var.auth as AuthBetterAuth;
  return c.json({
    session: auth.session,
    user: auth.user,
  } as AnyLLMSessionResponse);
});

export default v1Router;
