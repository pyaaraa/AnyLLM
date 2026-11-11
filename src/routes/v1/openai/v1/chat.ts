import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { OpenAIChatCompletionAdapterFactory } from "../../../../adapters/openai/v1/chat/adapter.js";
import { requireAuth } from "../../../../middlewares/auth.js";
import { parseModel } from "../../../../middlewares/model.js";
import type { ContextEnv } from "../../../../types/hono.js";
import { recordApiCall } from "../../../../utils/usage.js";
import { TimeKeeper } from "../../../../utils/chrono.js";
import { iterateModelProviders } from "../../../../utils/utils.js";
import { localDB } from "../../../../utils/local-db.js";

const chatRouter = new Hono<ContextEnv>();
chatRouter.use(requireAuth(), parseModel);

chatRouter.post("/completions", async (c) => {
    const authObj = c.var.auth as any;
    const currentUser = authObj?.user || (authObj?.userId ? localDB.findUserById(authObj.userId) : null);

    // Enforce one-prompt limit for anonymous demo users server-side
    if (currentUser?.isDemo && currentUser.requestsCount >= 1) {
        return c.json({
            error: {
                message: "Free demo limit reached (1 prompt allowed). Please create a free developer account to continue.",
                type: "demo_limit_exceeded",
                code: "demo_limit_exceeded",
            }
        }, 403);
    }

    const body = await c.req.json();
    return await iterateModelProviders(c, async (providerCfg, provider) => {
        const reqBody = { ...body } as ChatCompletionCreateParamsBase;
        reqBody.model = providerCfg.model;
        if (reqBody.stream === true) {
            reqBody.stream_options = {
                include_usage: true,
            };
        }
        const adapter = OpenAIChatCompletionAdapterFactory.getAdapter(provider);
        const timeKeeper = new TimeKeeper();
        timeKeeper.record();
        if (reqBody.stream !== true) {
            const completion = await adapter.sendRequest(provider, reqBody, {
                maxTokens: providerCfg.max_tokens,
            });
            timeKeeper.record();
            await recordApiCall(c, providerCfg.provider, 200, timeKeeper.timestamps(), adapter.usage, undefined, false);
            try {
                const recordUserId = currentUser?.id || (c.var.auth?.type === "better-auth" ? (c.var.auth as any).user?.id : undefined);
                if (recordUserId) {
                    localDB.recordUsage(recordUserId, providerCfg.model, providerCfg.provider, adapter.usage?.input || 50, adapter.usage?.output || 120, Math.max(10, Date.now() - (timeKeeper.timestamps().start || Date.now())));
                }
            }
            catch { }
            return c.json(completion);
        }
        const s = await adapter.sendRequestStreaming(provider, reqBody, {
            maxTokens: providerCfg.max_tokens,
        });
        return streamSSE(c, async (stream) => {
            for await (const chunk of s) {
                timeKeeper.record();
                await stream.writeSSE({
                    data: JSON.stringify(chunk),
                });
            }
            await stream.writeSSE({
                data: "[DONE]",
            });
            await recordApiCall(c, providerCfg.provider, 200, timeKeeper.timestamps(), adapter.usage, undefined, true);
            try {
                const recordUserId = currentUser?.id || (c.var.auth?.type === "better-auth" ? (c.var.auth as any).user?.id : undefined);
                if (recordUserId) {
                    localDB.recordUsage(recordUserId, providerCfg.model, providerCfg.provider, adapter.usage?.input || 50, adapter.usage?.output || 120, Math.max(10, Date.now() - (timeKeeper.timestamps().start || Date.now())));
                }
            }
            catch { }
        });
    });
});

export default chatRouter;
