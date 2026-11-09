import { Hono } from "hono";
import type { AnyLLMProviderGetResponse, AnyLLMProviderListResponse, } from "../../types/api.js";
import type { ContextEnv } from "../../types/hono.js";
import { getConfig } from "../../utils/config.js";
const providersRouter = new Hono<ContextEnv>();
providersRouter.get("/:provider{.+}", (c) => {
    const cfg = getConfig(c);
    const providerName = c.req.param("provider");
    const provider = cfg.providers[providerName];
    if (!provider) {
        return c.json({
            error: {
                message: "Provider not found",
            },
        }, 404);
    }
    return c.json({
        id: providerName,
        ...provider,
        api_key: undefined,
    } as AnyLLMProviderGetResponse);
});
providersRouter.get("/", (c) => {
    const cfg = getConfig(c);
    const providers = Object.entries(cfg.providers).map(([name, provider]) => {
        return {
            id: name,
            ...provider,
            api_key: undefined,
        };
    });
    return c.json({ providers } as AnyLLMProviderListResponse);
});
export default providersRouter;
