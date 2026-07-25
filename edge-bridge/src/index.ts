export interface Env {
  ONYX_DB: D1Database;
}

async function bootstrapDatabase(db: D1Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS UserSessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT,
      client_version TEXT,
      last_seen INTEGER
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

          // Initialize table if it doesn't exist yet (in reality this should be done via migrations)
          await bootstrapDatabase(env.ONYX_DB);

          await env.ONYX_DB.prepare(
            `INSERT INTO UserSessions (session_id, user_id, client_version, last_seen)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(session_id) DO UPDATE SET last_seen = ?`
          ).bind(sessionId, userId, clientVersion, lastSeen, lastSeen).run();

          return new Response(JSON.stringify({ status: "ok" }), {
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
          return new Response(JSON.stringify({ status: "batch_accepted", count: body.length }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS }
          });
        }
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    ctx.waitUntil(
      env.ONYX_DB.batch([
        env.ONYX_DB.prepare("DELETE FROM TelemetryLogs WHERE created_at < ?").bind(thirtyDaysAgo),
        env.ONYX_DB.prepare("DELETE FROM CommandAuditLogs WHERE created_at < ?").bind(thirtyDaysAgo),
      ])
    );
  }
};
