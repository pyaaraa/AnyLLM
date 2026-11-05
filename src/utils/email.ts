// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Aakash

import type { User } from "better-auth";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { getConfig } from "./config.js";
import { getResend } from "./resend.js";
import type { ContextEnv } from "../types/hono.js";

export const sendVerificationEmail = async (
  user: User,
  url: string,
  c?: Context<ContextEnv>,
) => {
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
    subject: `anyllm email verify`,
    html: `<p>hey ${user.name || ""},</p>
<p>click this to verify your email for anyllm (school project, totally free):</p>
<p><a href="${url}">${url}</a></p>
<p>if this wasn't you just ignore it</p>`,
  });
};
