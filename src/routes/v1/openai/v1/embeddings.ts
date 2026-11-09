import { Hono } from "hono";
import type { EmbeddingCreateParams } from "openai/resources/embeddings";
import { OpenAIEmbeddingsAdapterFactory } from "../../../../adapters/openai/v1/embeddings/adapter.js";
import { requireAuth } from "../../../../middlewares/auth.js";
import { parseModel } from "../../../../middlewares/model.js";
import type { ContextEnv } from "../../../../types/hono.js";
import { recordApiCall } from "../../../../utils/usage.js";
import { TimeKeeper } from "../../../../utils/chrono.js";
import { iterateModelProviders } from "../../../../utils/utils.js";
const embeddingsRouter = new Hono<ContextEnv>();
embeddingsRouter.use(requireAuth(), parseModel);
embeddingsRouter.post("/", async (c) => {
    const body = await c.req.json();
    return await iterateModelProviders(c, async (providerCfg, provider) => {
        const reqBody = { ...body } as EmbeddingCreateParams;
        reqBody.model = providerCfg.model;
        const adapter = OpenAIEmbeddingsAdapterFactory.getAdapter(provider);
        const timeKeeper = new TimeKeeper();
        timeKeeper.record();
        const embeddings = await adapter.sendRequest(provider, reqBody);
        timeKeeper.record();
        await recordApiCall(c, providerCfg.provider, 200, timeKeeper.timestamps(), adapter.usage, undefined, false);
        return c.json(embeddings);
    });
});
export default embeddingsRouter;
