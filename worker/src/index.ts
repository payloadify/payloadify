import type { Env } from "./env";
import { handleEmailAuth } from "./emailAuth/handler";
import { handleSecurityHeaders } from "./securityHeaders/handler";
import { errorResponse } from "./util/http";

/** Only `/api/*` reaches this Worker at all — `assets.run_worker_first` in wrangler.jsonc scopes it
 *  that way, so every other path is served directly from the static export with zero Worker
 *  involvement. The `env.ASSETS.fetch` fallback below is a safety net, not the normal path. */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/security-headers") {
      if (request.method !== "GET") return errorResponse("Method not allowed.", 405);
      return handleSecurityHeaders(request, ctx);
    }

    if (url.pathname === "/api/email-auth") {
      if (request.method !== "GET") return errorResponse("Method not allowed.", 405);
      return handleEmailAuth(request, ctx);
    }

    if (url.pathname.startsWith("/api/")) {
      return errorResponse("Not found.", 404);
    }

    return env.ASSETS.fetch(request);
  },
};
