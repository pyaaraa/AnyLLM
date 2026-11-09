import { createHash, randomBytes } from "crypto";
export const generateApiKey = () => {
    return "sk-anyllm-" + randomBytes(32).toString("base64url");
};
export const hashApiKey = (apiKey: string) => {
    return createHash("sha256").update(apiKey).digest("hex");
};
export const getApiKeyPrefix = (apiKey: string) => {
    return apiKey.slice(0, 15);
};
