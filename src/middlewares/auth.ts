import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { apiKey as apiKeyModel } from "../models/keys.js";
import type { AuthType, ContextEnv } from "../types/hono.js";
import { hashApiKey } from "../utils/api-key.js";
import { getAuth } from "../utils/auth.js";
import { getConfig } from "../utils/config.js";
import { getDb } from "../utils/database.js";
import { localDB } from "../utils/local-db.js";

export const auth = createMiddleware<ContextEnv>(async (c, next) => {
    const cfg = getConfig(c);
    const apiKey = c.req.header("Authorization")?.split(" ")[1] ?? c.req.header("x-api-key");
    if (apiKey) {
        if (apiKey.startsWith("BYOK:")) {
            c.set("auth", {
                type: "byok",
                byok: apiKey.slice(5),
            });
            await next();
            return;
        }

        // Check local database session tokens (for web users and anonymous demo sessions)
        const sessionUser = localDB.getUserBySession(apiKey);
        if (sessionUser) {
            c.set("auth", {
                type: "access-key",
                accessKey: apiKey,
                user: sessionUser,
                userId: sessionUser.id,
            } as any);
            await next();
            return;
        }

        // Check local database user API keys
        const dbApiKey = localDB.findApiKey(apiKey);
        if (dbApiKey) {
            const keyUser = localDB.findUserById(dbApiKey.userId);
            c.set("auth", {
                type: "access-key",
                accessKey: apiKey,
                user: keyUser,
                userId: dbApiKey.userId,
            } as any);
            await next();
            return;
        }

        if (cfg.access_keys.includes(apiKey) ||
            cfg.access_keys.includes("*") ||
            (!cfg.auth.enabled && cfg.access_keys.length === 0)) {
            c.set("auth", {
                type: "access-key",
                accessKey: apiKey,
            });
            await next();
            return;
        }
        if (cfg.auth.enabled) {
            const apiKeyRow = await getDb(c)
                .select()
                .from(apiKeyModel)
                .where(eq(apiKeyModel.keyHash, hashApiKey(apiKey)));
            if (apiKeyRow.length === 1) {
                c.set("auth", {
                    type: "api-key",
                    apiKey: apiKeyRow[0],
                });
                await next();
                return;
            }
        }
    }
    if (!cfg.auth.enabled && cfg.access_keys.length === 0) {
        c.set("auth", {
            type: "access-key",
            accessKey: "sk-anyllm-local",
        });
        await next();
        return;
    }
    if (cfg.auth.enabled) {
        const session = await getAuth(c).api.getSession({
            headers: c.req.raw.headers,
        });
        if (session) {
            c.set("auth", {
                type: "better-auth",
                user: session.user,
                session: session.session,
                ownerType: "user",
                ownerId: session.user.id,
            });
            await next();
            return;
        }
    }
    await next();
});

export const requireAuth = (type?: AuthType | AuthType[]) => {
    return createMiddleware<ContextEnv>(async (c, next) => {
        const auth = c.var.auth;
        if (!auth) {
            return c.json({ error: { message: "Unauthorized" } }, 401);
        }
        if (Array.isArray(type)) {
            if (!type.includes(auth.type)) {
                return c.json({ error: { message: "Unauthorized" } }, 401);
            }
        }
        else if (type && auth.type !== type) {
            return c.json({ error: { message: "Unauthorized" } }, 401);
        }
        await next();
    });
};
