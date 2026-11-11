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
    // If client already has a valid demo session, return it
    const existing = getSessionUser(c);
    if (existing && existing.isDemo) {
        const token = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
        return c.json({
            user: {
                id: existing.id,
                name: existing.name,
                email: existing.email,
                isDemo: true,
                tier: existing.tier,
                tokenBalance: existing.tokenBalance,
                tokensUsed: existing.tokensUsed,
                requestsCount: existing.requestsCount,
            },
            token,
        });
    }

    // Create a new unique anonymous session for this visitor
    const user = localDB.createUser("Anonymous Explorer", `demo_${Date.now()}@anyllm.local`, undefined, true);
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

userAuthRouter.post("/google", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { email, name } = body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (email) {
        let user = localDB.findUserByEmail(email);
        if (!user) {
            user = localDB.createUser(name || email.split("@")[0], email, undefined, false);
        }
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
    }

    if (!clientId || !clientSecret) {
        return c.json({
            error: {
                message: "Google OAuth credentials not configured. Please define GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment or .env file (Redirect callback: http://127.0.0.1:3000/v1/auth/callback/google)",
                code: "GOOGLE_OAUTH_NOT_CONFIGURED",
                requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
                redirectUri: "http://127.0.0.1:3000/v1/auth/callback/google"
            }
        }, 400);
    }

    const redirectUri = encodeURIComponent("http://127.0.0.1:3000/v1/auth/callback/google");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    return c.json({ url: authUrl });
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
    if (!user) {
        return c.json({ records: [], totalTokens: 0, totalCostSaved: 0 });
    }
    const usageData = localDB.getUserUsage(user.id);
    return c.json(usageData);
});

userAuthRouter.get("/keys", (c) => {
    const user = getSessionUser(c);
    if (!user) {
        return c.json({ keys: [] });
    }
    const keys = localDB.listApiKeys(user.id);
    return c.json({ keys });
});

userAuthRouter.post("/keys", async (c) => {
    const user = getSessionUser(c);
    if (!user) {
        return c.json({ error: { message: "Please sign in to generate and manage API keys" } }, 401);
    }
    const { name } = await c.req.json();
    const { keyRecord, secretKey } = localDB.createApiKey(user.id, name || "API Key");
    return c.json({
        key: keyRecord,
        secret: secretKey,
    });
});

userAuthRouter.delete("/keys/:id", (c) => {
    const user = getSessionUser(c);
    if (!user) {
        return c.json({ error: { message: "Unauthorized" } }, 401);
    }
    const keyId = c.req.param("id");
    const success = localDB.deleteApiKey(user.id, keyId);
    if (!success) {
        return c.json({ error: { message: "Key not found" } }, 404);
    }
    return c.json({ message: "Key revoked successfully" });
});

export default userAuthRouter;
