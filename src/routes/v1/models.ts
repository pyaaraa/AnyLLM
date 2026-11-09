import { Hono } from "hono";
import type { AnyLLMModelGetResponse, AnyLLMModelListResponse, } from "../../types/api.js";
import type { ContextEnv } from "../../types/hono.js";
import { getConfig } from "../../utils/config.js";
const modelsRouter = new Hono<ContextEnv>();
modelsRouter.get("/:model{.+}", (c) => {
    const cfg = getConfig(c);
    const modelName = c.req.param("model");
    const model = cfg.models[modelName];
    if (!model) {
        return c.json({
            error: {
                message: "Model not found",
            },
        }, 404);
    }
    return c.json({
        id: modelName,
        object: "model",
        created: (model as any).created ?? 0,
        owned_by: model.providers.map((p) => p.provider).join(", "),
        ...model,
    });
});
modelsRouter.get("/", (c) => {
    const cfg = getConfig(c);
    const models = Object.entries(cfg.models).map(([name, model]) => {
        return {
            id: name,
            object: "model",
            created: (model as any).created ?? 0,
            owned_by: model.providers.map((p) => p.provider).join(", "),
            ...model,
        };
    });
    return c.json({
        object: "list",
        data: models,
        models,
    });
});
export default modelsRouter;
