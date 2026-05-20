import { Hono } from "hono"
import { readFile } from "node:fs/promises"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { TrajectoryResponse } from "@rtmab/shared"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const trajectoryRoute = new Hono()

let cached: TrajectoryResponse | null = null

trajectoryRoute.get("/trajectory", async (c) => {
  if (cached) return c.json(cached)

  try {
    const dataPath = resolve(__dirname, "../../data/trajectory.json")
    const raw = await readFile(dataPath, "utf-8")
    cached = JSON.parse(raw) as TrajectoryResponse
    return c.json(cached)
  } catch (error) {
    // 🛡️ Sentinel: Catch file system/parsing errors to prevent leaking internal paths or stack traces
    console.error("Failed to read or parse trajectory data:", error)
    return c.json({ error: "Internal server error while loading trajectory data" }, 500)
  }
})
