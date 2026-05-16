import { Hono } from "hono"
import { getCache, setCache } from "../lib/cache.js"
import { parseHorizonsVectors } from "../lib/horizons-parser.js"
import type { MoonResponse } from "@rtmab/shared"

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

export const moonRoute = new Hono()

moonRoute.get("/moon", async (c) => {
  const start = c.req.query("start") ?? "2026-04-01"
  const stop = c.req.query("stop") ?? "2026-04-12"
  const step = c.req.query("step") ?? "1h"

  // Input validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  const stepRegex = /^\d+[hmd]$/
  if (!dateRegex.test(start) || !dateRegex.test(stop)) {
    return c.json({ error: "Invalid start or stop date format (expected YYYY-MM-DD)" }, 400)
  }
  if (!stepRegex.test(step)) {
    return c.json({ error: "Invalid step format (e.g., 1h, 1d, 1m)" }, 400)
  }

  const cacheKey = `moon:${start}:${stop}:${step}`
  const cached = getCache<MoonResponse>(cacheKey)
  if (cached) return c.json(cached)

  const params = new URLSearchParams({
    format: "text",
    COMMAND: "'301'",
    EPHEM_TYPE: "VECTORS",
    CENTER: "'500@399'",
    START_TIME: `'${start}'`,
    STOP_TIME: `'${stop}'`,
    STEP_SIZE: `'${step}'`,
    OUT_UNITS: "'KM-S'",
    VEC_TABLE: "'2'",
    REF_PLANE: "'ECLIPTIC'",
    REF_SYSTEM: "'J2000'",
    VEC_LABELS: "'YES'",
  })

  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return c.json({ error: "Horizons API error", status: res.status }, 502)
    }

    const raw = await res.text()
    const positions = parseHorizonsVectors(raw)
    const response: MoonResponse = { positions }

    setCache(cacheKey, response, CACHE_TTL)
    return c.json(response)
  } catch (err) {
    console.error("Horizons API error:", err);
    return c.json({ error: "Failed to fetch or parse Horizons data" }, 500)
  }
})
