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
  const res = await fetch(url)
  if (!res.ok) {
    return c.json({ error: "Horizons API error", status: res.status }, 502)
  }

  const raw = await res.text()
  const positions = parseHorizonsVectors(raw)
  const response: MoonResponse = { positions }

  setCache(cacheKey, response, CACHE_TTL)
  return c.json(response)
})
