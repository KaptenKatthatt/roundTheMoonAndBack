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
  // 🛡️ Sentinel: Restrict step length to mitigate DoS via large inputs
  const stepRegex = /^\d{1,4}[hmd]$/
  if (!dateRegex.test(start) || !dateRegex.test(stop)) {
    return c.json({ error: "Invalid start or stop date format (expected YYYY-MM-DD)" }, 400)
  }
  if (!stepRegex.test(step)) {
    return c.json({ error: "Invalid step format (e.g., 1h, 1d, 1m)" }, 400)
  }

  // 🛡️ Sentinel: Enforce maximum date range (60 days) to prevent Upstream API DoS and OOM
  const startDate = new Date(start)
  const stopDate = new Date(stop)
  if (isNaN(startDate.getTime()) || isNaN(stopDate.getTime())) {
    return c.json({ error: "Invalid date value" }, 400)
  }
  if (stopDate <= startDate) {
    return c.json({ error: "Stop date must be after start date" }, 400)
  }
  const diffDays = (stopDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 60) {
    return c.json({ error: "Date range exceeds maximum allowed (60 days)" }, 400)
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
    // 🛡️ Sentinel: Add timeout to prevent external API hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

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
