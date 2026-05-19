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

app.route("/api", moonRoute)
app.route("/api", trajectoryRoute)

app.get("/health", (c) => c.json({ ok: true }))

const port = 3001
console.log(`Backend running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
