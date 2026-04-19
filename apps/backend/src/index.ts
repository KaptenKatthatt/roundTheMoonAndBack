import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { moonRoute } from "./routes/moon.js"
import { trajectoryRoute } from "./routes/trajectory.js"

const app = new Hono()

app.use("/*", cors())

app.route("/api", moonRoute)
app.route("/api", trajectoryRoute)

app.get("/health", (c) => c.json({ ok: true }))

const port = 3001
console.log(`Backend running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
