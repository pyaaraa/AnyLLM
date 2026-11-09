import { Hono } from "hono";
import { requireAuth } from "../middlewares/auth.js";
import type { AnyLLMSessionResponse } from "../types/api.js";
import type { AuthBetterAuth, ContextEnv } from "../types/hono.js";
import { getAuth } from "../utils/auth.js";
import { getConfig } from "../utils/config.js";
import anthropicRouter from "./v1/anthropic.js";
import messagesRouter from "./v1/anthropic/v1/messages.js";
import apiKeysRouter from "./v1/api-keys.js";
import modelsRouter from "./v1/models.js";
import openaiRouter from "./v1/openai.js";
import audioRouter from "./v1/openai/v1/audio.js";
import chatRouter from "./v1/openai/v1/chat.js";
import embeddingsRouter from "./v1/openai/v1/embeddings.js";
import imagesRouter from "./v1/openai/v1/images.js";
import responsesRouter from "./v1/openai/v1/responses.js";
import providersRouter from "./v1/providers.js";
import userAuthRouter from "./v1/user-auth.js";
const v1Router = new Hono<ContextEnv>();
v1Router.route("/auth", userAuthRouter);
v1Router.route("/user", userAuthRouter);
v1Router.route("/anthropic", anthropicRouter);
v1Router.route("/api-keys", apiKeysRouter);
v1Router.route("/chat", chatRouter);
v1Router.route("/messages", messagesRouter);
v1Router.route("/embeddings", embeddingsRouter);
v1Router.route("/images", imagesRouter);
v1Router.route("/audio", audioRouter);
v1Router.route("/responses", responsesRouter);
v1Router.on(["GET", "POST"], "/auth/better/**", (c) => {
    const cfg = getConfig(c);
    if (!cfg.auth.enabled) {
        return c.json({
            error: {
                message: "Auth is not enabled",
            },
        }, 400);
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
