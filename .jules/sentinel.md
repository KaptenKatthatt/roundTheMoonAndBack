## 2025-06-01 - Update Hono dependency to fix CSS Injection and Cache leakage vulnerabilities
**Vulnerability:** The 'hono' dependency in the backend had moderate security vulnerabilities including CSS Declaration Injection via Style Object Values in JSX SSR, Cache Middleware cross-user cache leakage, bodyLimit bypass, and HTML Injection vulnerabilities.
**Learning:** These vulnerabilities exist in older versions of 'hono' (<4.12.18).
**Prevention:** Regularly audit packages, including in sub-workspaces, using `pnpm audit` and keep dependencies up to date.
## 2026-06-03 - Prevent DoS memory exhaustion from unbound date ranges
**Vulnerability:** The `/api/moon` endpoint allowed clients to pass unbounded date ranges for celestial coordinates without limits. Because it queries a downstream NASA API with these parameters, an attacker could request thousands of years of data with minute-by-minute step size (e.g. `1m`), causing massive responses that exhaust backend memory and processing capacity, leading to a Denial of Service.
**Learning:** Input validation must not only check the string format using RegEx but also enforce logical, context-aware bounds (e.g. maximum time delta) for inputs that directly dictate resource consumption downstream.
**Prevention:** Explicitly limit the maximum timespan (e.g., 30 days) and verify that stop dates succeed start dates when processing user input.
