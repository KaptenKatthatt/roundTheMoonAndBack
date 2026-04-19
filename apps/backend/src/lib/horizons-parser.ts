import type { CelestialPosition } from "@rtmab/shared"

/**
 * Parse JPL Horizons vector table response.
 * Data rows are between $$SOE and $$EOE markers.
 * Each block: JDTDB line, datetime line, then X/Y/Z, VX/VY/VZ, etc.
 */
export function parseHorizonsVectors(raw: string): CelestialPosition[] {
  const soeIdx = raw.indexOf("$$SOE")
  const eoeIdx = raw.indexOf("$$EOE")
  if (soeIdx === -1 || eoeIdx === -1) {
    throw new Error("Could not find $$SOE/$$EOE markers in Horizons response")
  }

  const dataBlock = raw.slice(soeIdx + 5, eoeIdx).trim()
  const lines = dataBlock.split("\n").map((l) => l.trim()).filter(Boolean)

  const positions: CelestialPosition[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Look for lines starting with a Julian Date (numeric)
    if (!/^\d/.test(line)) continue

    // The JD line also contains the calendar date: "2460767.437500000 = A.D. 2025-Apr-01 22:30:00.0000 TDB"
    const dateMatch = line.match(
      /A\.D\.\s+(\d{4})-([A-Za-z]+)-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
    )
    if (!dateMatch) continue

    const [, year, monthStr, day, hour, min, sec] = dateMatch
    const monthMap: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    }
    const month = monthMap[monthStr]
    if (month === undefined) continue

    const t = Date.UTC(
      Number(year), month, Number(day),
      Number(hour), Number(min), Number(sec),
    )

    // Next line(s) should contain X, Y, Z
    // Format: " X = 1.234E+05  Y = 5.678E+05  Z = 9.012E+05"
    const xyzLine = lines[i + 1]
    if (!xyzLine) continue

    const xMatch = xyzLine.match(/X\s*=\s*([^\s]+)/)
    const yMatch = xyzLine.match(/Y\s*=\s*([^\s]+)/)
    const zMatch = xyzLine.match(/Z\s*=\s*([^\s]+)/)

    if (!xMatch || !yMatch || !zMatch) continue

    const x = parseFloat(xMatch[1])
    const y = parseFloat(yMatch[1])
    const z = parseFloat(zMatch[1])

    if (isNaN(x) || isNaN(y) || isNaN(z)) continue

    positions.push({ t, p: [x, y, z] })
  }

  return positions
}
