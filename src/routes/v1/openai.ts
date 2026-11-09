import { Hono } from "hono";
import openaiV1Router from "./openai/v1.js";
import type { ContextEnv } from "../../types/hono.js";
const openaiRouter = new Hono<ContextEnv>();
openaiRouter.route("/v1", openaiV1Router);
export default openaiRouter;
