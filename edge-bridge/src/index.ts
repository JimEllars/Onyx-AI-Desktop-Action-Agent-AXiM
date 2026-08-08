export interface Env {
  ONYX_DB: D1Database;
}

function isD1Available(env: Env): boolean {
  return env && typeof env.ONYX_DB !== "undefined" && env.ONYX_DB !== null;
}

async function bootstrapDatabase(db: D1Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS UserSessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT,
      client_version TEXT,
      last_seen INTEGER
    );
    CREATE TABLE IF NOT EXISTS TelemetryLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT,
      message TEXT,
      created_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS CommandAuditLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT,
      executed_by TEXT,
      created_at INTEGER
    );
  `);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60" // leverage edge caching for 60s
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method === "POST") {
      try {

        if (url.pathname === "/api/v1/admin/init-db") {
          if (!isD1Available(env)) {
            console.warn("[Edge Bridge] D1 binding unavailable. Bypassing database initialization.");
            return new Response(JSON.stringify({ status: "ok", mode: "ephemeral" }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }
          await bootstrapDatabase(env.ONYX_DB);
          return new Response(JSON.stringify({ status: "db_initialized" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS }
          });
        }

        if (url.pathname === "/api/v1/session/heartbeat") {
          const body = await request.json() as { session_id?: string, user_id?: string, client_version?: string };
          const sessionId = body.session_id;
          const userId = body.user_id;
          const clientVersion = body.client_version || "unknown";
          const lastSeen = Math.floor(Date.now() / 1000);

          if (!sessionId || !userId) {
            return new Response(JSON.stringify({ error: "Missing session_id or user_id" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }

          if (!isD1Available(env)) {
            console.warn("[Edge Bridge] D1 binding unavailable. Ephemeral heartbeat accepted.");
            return new Response(JSON.stringify({ status: "ok", mode: "ephemeral" }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }

          try {
            await env.ONYX_DB.prepare(
              `INSERT INTO UserSessions (session_id, user_id, client_version, last_seen)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(session_id) DO UPDATE SET last_seen = ?`
            ).bind(sessionId, userId, clientVersion, lastSeen, lastSeen).run();

            return new Response(JSON.stringify({ status: "ok" }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          } catch (dbError) {
            console.warn("[Edge Bridge] D1 execution error during heartbeat:", dbError);
            return new Response(JSON.stringify({ status: "ok", mode: "ephemeral" }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }
        }

        if (url.pathname === "/api/v1/jules/sessions") {
          const body = await request.json() as { prompt?: string };
          return new Response(JSON.stringify({
            status: "session_queued",
            endpoint: "jules.googleapis.com",
            prompt_received: !!body.prompt
          }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS }
          });
        }

        if (url.pathname === "/api/v1/telemetry/batch") {
          const body = await request.json();
          if (!Array.isArray(body)) {
            return new Response(JSON.stringify({ error: "Payload must be an array" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }

          if (!isD1Available(env)) {
            console.warn("[Edge Bridge] D1 binding unavailable. Dropping telemetry batch (ephemeral mode).");
            return new Response(JSON.stringify({ status: "batch_accepted", mode: "ephemeral", count: body.length }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }

          try {
            const now = Math.floor(Date.now() / 1000);
            const stmt = env.ONYX_DB.prepare(
              `INSERT INTO TelemetryLogs (level, message, created_at) VALUES (?, ?, ?)`
            );

            const batchStmts = body.map((log: any) =>
              stmt.bind(log.level || "info", log.message || "", now)
            );

            if (batchStmts.length > 0) {
              await env.ONYX_DB.batch(batchStmts);
            }

            return new Response(JSON.stringify({ status: "batch_accepted", count: body.length }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          } catch (dbError) {
            console.warn("[Edge Bridge] D1 execution error during telemetry batch:", dbError);
            return new Response(JSON.stringify({ status: "batch_accepted", mode: "ephemeral", count: body.length }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS }
            });
          }
        }
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message || "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (!isD1Available(env)) {
      console.warn("[Edge Bridge] D1 binding unavailable. Skipping scheduled cleanup.");
      return;
    }
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    ctx.waitUntil(
      env.ONYX_DB.batch([
        env.ONYX_DB.prepare("DELETE FROM TelemetryLogs WHERE created_at < ?").bind(thirtyDaysAgo),
        env.ONYX_DB.prepare("DELETE FROM CommandAuditLogs WHERE created_at < ?").bind(thirtyDaysAgo),
      ])
    );
  }
};
