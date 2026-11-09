import fs from "fs";
import path from "path";
import { createHash, randomBytes } from "crypto";
export interface UserRecord {
    id: string;
    name: string;
    email: string;
    passwordHash?: string;
    isDemo?: boolean;
    tier: "Free Demo" | "Developer" | "Enterprise";
    tokenBalance: number;
    tokensUsed: number;
    requestsCount: number;
    createdAt: number;
}
export interface UserApiKeyRecord {
    id: string;
    userId: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
    maskedKey: string;
    createdAt: number;
    secretOnce?: string;
}
export interface UsageRecord {
    id: string;
    userId: string;
    model: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    costSavedEst: number;
    timestamp: number;
}
interface DBData {
    users: Record<string, UserRecord>;
    sessions: Record<string, {
        userId: string;
        expiresAt: number;
    }>;
    apiKeys: Record<string, UserApiKeyRecord>;
    usage: UsageRecord[];
}
const DATA_FILE = path.resolve(process.cwd(), ".anyllm-data.json");
function loadData(): DBData {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, "utf-8");
            return JSON.parse(raw);
        }
    }
    catch (e) {
        console.error("Error reading .anyllm-data.json, creating new database", e);
    }
    const demoUser: UserRecord = {
        id: "user_demo",
        name: "Demo Explorer",
        email: "demo@anyllm.local",
        isDemo: true,
        tier: "Free Demo",
        tokenBalance: 100000,
        tokensUsed: 14200,
        requestsCount: 28,
        createdAt: Date.now() - 86400000 * 2,
    };
    const initialKey: UserApiKeyRecord = {
        id: "key_demo_default",
        userId: "user_demo",
        name: "Default Demo Key",
        keyPrefix: "sk-anyllm-demo",
        keyHash: createHash("sha256").update("sk-anyllm-demo-key-123").digest("hex"),
        maskedKey: "sk-anyllm-••••••••demo",
        createdAt: Date.now() - 86400000,
    };
    const initialUsage: UsageRecord[] = [
        {
            id: "usg_1",
            userId: "user_demo",
            model: "openai/gpt-4o",
            provider: "openai",
            promptTokens: 420,
            completionTokens: 280,
            totalTokens: 700,
            latencyMs: 640,
            costSavedEst: 0.012,
            timestamp: Date.now() - 3600000 * 4,
        },
        {
            id: "usg_2",
            userId: "user_demo",
            model: "anthropic/claude-3-5-sonnet",
            provider: "anthropic",
            promptTokens: 850,
            completionTokens: 520,
            totalTokens: 1370,
            latencyMs: 820,
            costSavedEst: 0.024,
            timestamp: Date.now() - 3600000 * 2,
        },
        {
            id: "usg_3",
            userId: "user_demo",
            model: "meta-llama/llama-3.3-70b-instruct",
            provider: "groq",
            promptTokens: 1200,
            completionTokens: 890,
            totalTokens: 2090,
            latencyMs: 310,
            costSavedEst: 0.045,
            timestamp: Date.now() - 1800000,
        },
    ];
    const initialData: DBData = {
        users: { [demoUser.id]: demoUser },
        sessions: {},
        apiKeys: { [initialKey.id]: initialKey },
        usage: initialUsage,
    };
    saveData(initialData);
    return initialData;
}
function saveData(data: DBData): void {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    catch (e) {
        console.error("Error writing .anyllm-data.json", e);
    }
}
export const localDB = {
    findUserByEmail(email: string): UserRecord | null {
        const data = loadData();
        return Object.values(data.users).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    findUserById(id: string): UserRecord | null {
        const data = loadData();
        return data.users[id] || null;
    },
    createUser(name: string, email: string, passwordHash?: string, isDemo = false): UserRecord {
        const data = loadData();
        const id = isDemo ? "user_demo" : `usr_${Date.now()}_${randomBytes(4).toString("hex")}`;
        const user: UserRecord = {
            id,
            name,
            email,
            passwordHash,
            isDemo,
            tier: isDemo ? "Free Demo" : "Developer",
            tokenBalance: isDemo ? 100000 : 250000,
            tokensUsed: 0,
            requestsCount: 0,
            createdAt: Date.now(),
        };
        data.users[id] = user;
        saveData(data);
        return user;
    },
    createSession(userId: string): string {
        const data = loadData();
        const token = "anyllm_sess_" + randomBytes(24).toString("base64url");
        data.sessions[token] = {
            userId,
            expiresAt: Date.now() + 86400000 * 30,
        };
        saveData(data);
        return token;
    },
    getUserBySession(token: string): UserRecord | null {
        const data = loadData();
        const sess = data.sessions[token];
        if (!sess)
            return null;
        if (Date.now() > sess.expiresAt) {
            delete data.sessions[token];
            saveData(data);
            return null;
        }
        return data.users[sess.userId] || null;
    },
    deleteSession(token: string): void {
        const data = loadData();
        delete data.sessions[token];
        saveData(data);
    },
    listApiKeys(userId: string): UserApiKeyRecord[] {
        const data = loadData();
        return Object.values(data.apiKeys).filter((k) => k.userId === userId);
    },
    createApiKey(userId: string, name: string): {
        keyRecord: UserApiKeyRecord;
        secretKey: string;
    } {
        const data = loadData();
        const secretKey = "sk-anyllm-" + randomBytes(24).toString("base64url");
        const keyHash = createHash("sha256").update(secretKey).digest("hex");
        const lastFour = secretKey.slice(-4);
        const maskedKey = `sk-anyllm-••••••••${lastFour}`;
        const keyRecord: UserApiKeyRecord = {
            id: `key_${Date.now()}_${randomBytes(3).toString("hex")}`,
            userId,
            name: name || "Default Key",
            keyPrefix: secretKey.slice(0, 16),
            keyHash,
            maskedKey,
            createdAt: Date.now(),
        };
        data.apiKeys[keyRecord.id] = keyRecord;
        saveData(data);
        return { keyRecord, secretKey };
    },
    deleteApiKey(userId: string, keyId: string): boolean {
        const data = loadData();
        const k = data.apiKeys[keyId];
        if (k && k.userId === userId) {
            delete data.apiKeys[keyId];
            saveData(data);
            return true;
        }
        return false;
    },
    recordUsage(userId: string, model: string, provider: string, promptTokens: number, completionTokens: number, latencyMs: number) {
        const data = loadData();
        const totalTokens = promptTokens + completionTokens;
        const costSavedEst = (totalTokens / 1000) * 0.008;
        const rec: UsageRecord = {
            id: `usg_${Date.now()}`,
            userId,
            model,
            provider,
            promptTokens,
            completionTokens,
            totalTokens,
            latencyMs,
            costSavedEst: parseFloat(costSavedEst.toFixed(4)),
            timestamp: Date.now(),
        };
        data.usage.unshift(rec);
        if (data.usage.length > 200)
            data.usage.pop();
        const user = data.users[userId];
        if (user) {
            user.tokensUsed += totalTokens;
            user.tokenBalance = Math.max(0, user.tokenBalance - totalTokens);
            user.requestsCount += 1;
        }
        saveData(data);
        return rec;
    },
    getUserUsage(userId: string): {
        records: UsageRecord[];
        totalTokens: number;
        totalCostSaved: number;
    } {
        const data = loadData();
        const records = data.usage.filter((u) => u.userId === userId);
        const totalTokens = records.reduce((acc, r) => acc + r.totalTokens, 0);
        const totalCostSaved = records.reduce((acc, r) => acc + r.costSavedEst, 0);
        return { records, totalTokens, totalCostSaved: parseFloat(totalCostSaved.toFixed(3)) };
    },
};
