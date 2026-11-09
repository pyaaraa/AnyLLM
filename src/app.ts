import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import fs from "fs";
import { serveStatic } from "@hono/node-server/serve-static";
import { auth } from "./middlewares/auth.js";
import anthropicRouter from "./routes/v1/anthropic.js";
import openaiRouter from "./routes/v1/openai.js";
import v1Router from "./routes/v1.js";
import type { ContextEnv } from "./types/hono.js";
import { getConfig, loadConfigFromCloudflareKV } from "./utils/config.js";
import { getUptime } from "./utils/utils.js";
const app = new Hono<ContextEnv>();
app.use((c, next) => loadConfigFromCloudflareKV(c).then(() => next()));
app.use(logger());
app.use((c, next) => {
    const cfg = getConfig(c);
    if (!cfg.auth.enabled || !cfg.auth.better_auth.trusted_origins) {
        return cors()(c, next);
    }
    return cors({
        origin: cfg.auth.better_auth.trusted_origins,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })(c, next);
});
app.use(auth);
const clientDist = fs.existsSync("./dist/client")
    ? "./dist/client"
    : fs.existsSync("./frontend/dist")
        ? "./frontend/dist"
        : null;
if (clientDist) {
    app.use("/assets/*", serveStatic({ root: clientDist }));
}
app.get("/api/status", (c) => {
    return c.json({
        name: "AnyLLM",
        version: "0.1.0",
        message: "AnyLLM Gateway is running",
        uptime: getUptime(),
        apis_available: ["anthropic", "openai", "v1"],
    });
});
app.get("/", async (c, next) => {
    const accept = c.req.header("Accept") || "";
    if (clientDist && accept.includes("text/html") && fs.existsSync(`${clientDist}/index.html`)) {
        const res = await serveStatic({ path: `${clientDist}/index.html` })(c, next);
        if (res)
            return res;
    }
    return c.json({
        name: "AnyLLM",
        version: "0.1.0",
        message: "AnyLLM Gateway is running",
        uptime: getUptime(),
        apis_available: ["anthropic", "openai", "v1"],
    });
});
app.route("/anthropic", anthropicRouter);
app.route("/openai", openaiRouter);
app.route("/v1", v1Router);
app.get("*", async (c, next) => {
    const accept = c.req.header("Accept") || "";
    if (clientDist &&
        accept.includes("text/html") &&
        fs.existsSync(`${clientDist}/index.html`) &&
        !c.req.path.startsWith("/v1") &&
        !c.req.path.startsWith("/openai") &&
        !c.req.path.startsWith("/anthropic") &&
        !c.req.path.startsWith("/api")) {
        const res = await serveStatic({ path: `${clientDist}/index.html` })(c, next);
        if (res)
            return res;
    }
    return next();
});
app.onError((err, c) => {
    console.error(err.stack);
    const cfg = getConfig(c);
    return c.json({
        error: {
            message: err instanceof HTTPException ? err.message : "Internal Server Error",
            stack: cfg.server.logging === "dev" ? err.stack : undefined,
        },
    }, err instanceof HTTPException ? err.status : 500);
});
app.notFound((c) => {
    return c.json({
        error: {
            message: "Not Found",
        },
    }, 404);
});
export default app;
