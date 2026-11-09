import { Hono } from "hono";
import { createHash } from "crypto";
import type { ContextEnv } from "../../types/hono.js";
import { localDB } from "../../utils/local-db.js";
const userAuthRouter = new Hono<ContextEnv>();
const getSessionUser = (c: any) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader)
        return null;
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token)
        return null;
    return localDB.getUserBySession(token);
};
userAuthRouter.post("/demo", (c) => {
    let user = localDB.findUserById("user_demo");
    if (!user) {
        user = localDB.createUser("Demo Explorer", "demo@anyllm.local", undefined, true);
    }
    const token = localDB.createSession(user.id);
    return c.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isDemo: true,
            tier: user.tier,
            tokenBalance: user.tokenBalance,
            tokensUsed: user.tokensUsed,
            requestsCount: user.requestsCount,
        },
        token,
    });
});
userAuthRouter.post("/register", async (c) => {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) {
        return c.json({ error: { message: "Name, email, and password are required" } }, 400);
    }
    const existing = localDB.findUserByEmail(email);
    if (existing) {
        return c.json({ error: { message: "User with this email already exists" } }, 409);
    }
    const passwordHash = createHash("sha256").update(password).digest("hex");
    const user = localDB.createUser(name.trim(), email.trim(), passwordHash, false);
    const token = localDB.createSession(user.id);
    return c.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isDemo: false,
            tier: user.tier,
            tokenBalance: user.tokenBalance,
            tokensUsed: user.tokensUsed,
            requestsCount: user.requestsCount,
        },
        token,
    });
});
userAuthRouter.post("/login", async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
        return c.json({ error: { message: "Email and password are required" } }, 400);
    }
    const user = localDB.findUserByEmail(email);
    if (!user || !user.passwordHash) {
        return c.json({ error: { message: "Invalid email or password" } }, 401);
    }
    const inputHash = createHash("sha256").update(password).digest("hex");
    if (inputHash !== user.passwordHash) {
        return c.json({ error: { message: "Invalid email or password" } }, 401);
    }
    const token = localDB.createSession(user.id);
    return c.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isDemo: user.isDemo,
            tier: user.tier,
            tokenBalance: user.tokenBalance,
            tokensUsed: user.tokensUsed,
            requestsCount: user.requestsCount,
        },
        token,
    });
});
userAuthRouter.get("/me", (c) => {
    const user = getSessionUser(c);
    if (!user) {
        return c.json({ error: { message: "Unauthorized" } }, 401);
    }
    return c.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isDemo: user.isDemo,
            tier: user.tier,
            tokenBalance: user.tokenBalance,
            tokensUsed: user.tokensUsed,
            requestsCount: user.requestsCount,
        },
    });
});
userAuthRouter.post("/logout", (c) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (token)
            localDB.deleteSession(token);
    }
    return c.json({ message: "Logged out successfully" });
});
userAuthRouter.get("/usage", (c) => {
    const user = getSessionUser(c);
    const userId = user ? user.id : "user_demo";
    const usageData = localDB.getUserUsage(userId);
    return c.json(usageData);
});
userAuthRouter.get("/keys", (c) => {
    const user = getSessionUser(c);
    const userId = user ? user.id : "user_demo";
    const keys = localDB.listApiKeys(userId);
    return c.json({ keys });
});
userAuthRouter.post("/keys", async (c) => {
    const user = getSessionUser(c);
    const userId = user ? user.id : "user_demo";
    const { name } = await c.req.json();
    const { keyRecord, secretKey } = localDB.createApiKey(userId, name || "API Key");
    return c.json({
        key: keyRecord,
        secret: secretKey,
    });
});
userAuthRouter.delete("/keys/:id", (c) => {
    const user = getSessionUser(c);
    const userId = user ? user.id : "user_demo";
    const keyId = c.req.param("id");
    const success = localDB.deleteApiKey(userId, keyId);
    if (!success) {
        return c.json({ error: { message: "Key not found" } }, 404);
    }
    return c.json({ message: "Key revoked successfully" });
});
export default userAuthRouter;
