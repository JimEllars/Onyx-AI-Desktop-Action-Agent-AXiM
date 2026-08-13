export interface Env {
  ONYX_DB: D1Database;
}

const ALLOWED_ORIGINS = new Set([
  "https://onyx-ai-desktop-action-agent-axim.pages.dev",
  "http://localhost:5173",
]);

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

function validTelemetryEntry(entry: unknown): entry is { level?: string; message?: string } {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const { level, message } = entry as { level?: unknown; message?: unknown };
  return (level === undefined || typeof level === "string") &&
    typeof message === "string" &&
    message.length <= 4_096;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json(request, { status: "ok" });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/jules/sources") {
      return json(request, {
        sources: [{
          name: "sources/github/axim-network/onyx-agent",
          githubRepo: {
            owner: "axim-network",
            repo: "onyx-agent",
            defaultBranch: { displayName: "main" },
          },
        }],
      });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/jules/activities") {
      const sessionId = url.searchParams.get("session") || "sessions/default";
      return json(request, {
        session: sessionId,
        activities: [{
          id: `act_${Date.now()}`,
          originator: "agent",
          agentMessaged: { agentMessage: `[Session: ${sessionId}] Analyzing repository files and applying refactor...` },
          artifacts: [{
            bashOutput: { command: "npm run test", output: "All 12 test suites passed cleanly.", exitCode: 0 }
          }],
          createTime: new Date().toISOString(),
        }],
      });
    }


    if (request.method !== "POST") {
      return json(request, { error: "Not found" }, 404);
    }

    if (url.pathname === "/api/v1/jules/approve-plan") {
      const body = await request.json<{ sessionId?: unknown }>().catch(() => null);
      const createdAt = Math.floor(Date.now() / 1000);
      ctx.waitUntil(
        env.ONYX_DB.prepare(
          "INSERT INTO telemetry_logs (level, message, created_at) VALUES (?, ?, ?)"
        ).bind("info", `[JULES_EDGE] Plan approved for session: ${typeof body?.sessionId === 'string' ? body.sessionId : 'sessions/default'}`, createdAt).run()
      );
      return json(request, {
        status: "plan_approved",
        session: typeof body?.sessionId === "string" ? body.sessionId : "sessions/default",
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/api/v1/jules/sessions") {
      const body = await request.json<{ prompt?: unknown }>().catch(() => null);
      if (!body || typeof body.prompt !== "string" || body.prompt.length === 0) {
        return json(request, { error: "prompt is required" }, 400);
      }

      const createdAt = Math.floor(Date.now() / 1000);
      ctx.waitUntil(
        env.ONYX_DB.prepare(
          "INSERT INTO telemetry_logs (level, message, created_at) VALUES (?, ?, ?)"
        ).bind("info", `[JULES_EDGE] Session created: ${body.prompt.slice(0, 100)}`, createdAt).run()
      );

      return json(request, {
        status: "session_queued",
        prompt_received: true,
      });
    }

    if (url.pathname === "/api/v1/session/heartbeat") {
      const body = await request.json<{
        session_id?: unknown;
        user_id?: unknown;
        client_version?: unknown;
      }>().catch(() => null);

      if (!body || typeof body.session_id !== "string" || typeof body.user_id !== "string") {
        return json(request, { error: "session_id and user_id are required" }, 400);
      }

      if (body.session_id.length > 256 || body.user_id.length > 256) {
        return json(request, { error: "session_id or user_id is too long" }, 400);
      }

      const clientVersion = typeof body.client_version === "string"
        ? body.client_version.slice(0, 128)
        : "unknown";
      const lastSeen = Math.floor(Date.now() / 1000);

      ctx.waitUntil(
        env.ONYX_DB.prepare(
          `INSERT INTO user_sessions (session_id, user_id, client_version, last_seen)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(session_id) DO UPDATE SET
             user_id = excluded.user_id,
             client_version = excluded.client_version,
             last_seen = excluded.last_seen`,
        ).bind(body.session_id, body.user_id, clientVersion, lastSeen).run(),
      );

      return json(request, { status: "ok" });
    }

    if (url.pathname === "/api/v1/telemetry/batch") {
      const body = await request.json<unknown>().catch(() => null);
      if (!Array.isArray(body) || body.length > 100 || !body.every(validTelemetryEntry)) {
        return json(request, { error: "Payload must contain at most 100 valid telemetry entries" }, 400);
      }

      const createdAt = Math.floor(Date.now() / 1000);
      const statement = env.ONYX_DB.prepare(
        "INSERT INTO telemetry_logs (level, message, created_at) VALUES (?, ?, ?)",
      );
      const entries = body.map((entry) =>
        statement.bind(entry.level?.slice(0, 64) ?? "info", entry.message, createdAt)
      );

      if (entries.length > 0) {
        await env.ONYX_DB.batch(entries);
      }

      return json(request, { status: "batch_accepted", count: entries.length });
    }

    return json(request, { error: "Not found" }, 404);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    ctx.waitUntil(
      env.ONYX_DB.prepare("DELETE FROM telemetry_logs WHERE created_at < ?").bind(thirtyDaysAgo).run(),
    );
  },
};
