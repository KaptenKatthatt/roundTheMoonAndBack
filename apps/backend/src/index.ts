import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { moonRoute } from "./routes/moon.js"
import { trajectoryRoute } from "./routes/trajectory.js"

const app = new Hono()

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // 🛡️ Sentinel: Restrict CORS to specific origins to prevent unauthorized access
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:4173",
      ]
      // In production, allow from VITE_FRONTEND_URL or generic environment variable
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL)
      }
      return allowedOrigins.includes(origin) ? origin : null
    },
  })
)
app.use("/*", secureHeaders())

// 🛡️ Sentinel: Simple in-memory rate limiter to protect sensitive /api/* endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60; // 60 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // per 1 minute
const MAX_MAP_SIZE = 10000; // Prevent memory exhaustion

app.use("/api/*", async (c, next) => {
  const ip = c.req.header("x-forwarded-for") || (c.env as any)?.REMOTE_ADDR || "unknown";
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    if (rateLimitMap.size >= MAX_MAP_SIZE) {
      // FIFO eviction strategy
      const oldestKey = rateLimitMap.keys().next().value;
      if (oldestKey !== undefined) rateLimitMap.delete(oldestKey);
    }
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, record);
  } else {
    record.count++;
  }

  c.header("X-RateLimit-Limit", RATE_LIMIT_MAX.toString());
  c.header("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX - record.count).toString());

  if (record.count > RATE_LIMIT_MAX) {
    return c.json({ error: "Too Many Requests" }, 429);
  }

  await next();
});

app.route("/api", moonRoute)
app.route("/api", trajectoryRoute)

app.get("/health", (c) => c.json({ ok: true }))

const port = 3001
console.log(`Backend running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
