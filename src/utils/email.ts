import type { User } from "better-auth";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getConfig } from "./config.js";
import { getResend } from "./resend.js";
import type { ContextEnv } from "../types/hono.js";
export const sendVerificationEmail = async (user: User, url: string, c?: Context<ContextEnv>) => {
    const cfg = getConfig(c);
    if (!cfg.auth.enabled) {
        throw new HTTPException(400, {
            message: "Auth is not enabled",
        });
    }
    const resend = getResend(c);
    await resend.emails.send({
        from: cfg.auth.email.from_email,
        to: user.email,
        replyTo: cfg.auth.email.reply_to_email,
        subject: `Verify your AnyLLM account`,
        html: `<p>Hello ${user.name || "there"},</p>
<p>Please verify your email address to complete your AnyLLM registration:</p>
<p><a href="${url}">${url}</a></p>
<p>If you did not request this email, please ignore it.</p>`,
    });
};
