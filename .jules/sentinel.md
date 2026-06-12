## 2025-06-01 - Update Hono dependency to fix CSS Injection and Cache leakage vulnerabilities
**Vulnerability:** The 'hono' dependency in the backend had moderate security vulnerabilities including CSS Declaration Injection via Style Object Values in JSX SSR, Cache Middleware cross-user cache leakage, bodyLimit bypass, and HTML Injection vulnerabilities.
**Learning:** These vulnerabilities exist in older versions of 'hono' (<4.12.18).
**Prevention:** Regularly audit packages, including in sub-workspaces, using `pnpm audit` and keep dependencies up to date.
## 2025-06-04 - Fix DoS vulnerability via unbounded date range in Horizons API
**Vulnerability:** The `/api/moon` endpoint allowed unbounded date ranges, creating a resource exhaustion (DoS) vulnerability via the external NASA Horizons API and our backend cache.
**Learning:** Endpoints that accept date ranges for data fetching must strictly validate logical order (start <= stop) and enforce reasonable maximum limits (e.g. 30 days) to prevent abuse.
**Prevention:** Implement bounds checking on all date range parameters, calculate the duration in days, and return 400 Bad Request if bounds are exceeded, prior to expensive operations.
## 2025-06-12 - Fix DoS vulnerability via NaN bypass in date validation
**Vulnerability:** The `/api/moon` endpoint was susceptible to a DoS vulnerability because invalid date inputs (e.g., `2026-99-99`) that passed simple regex validation produced `Invalid Date` objects. The `getTime()` of these objects evaluates to `NaN`. Because comparisons like `NaN >= NaN` or `NaN > 30` evaluate to `false`, the bounds checks were silently bypassed.
**Learning:** `NaN` silently bypasses standard numeric comparison checks (`>`, `<`, `>=`, `<=`), potentially circumventing critical security bounds (like maximum durations or resource limits) if not explicitly handled.
**Prevention:** Always explicitly check for `isNaN(date.getTime())` or use `Number.isNaN()` when converting user input into numbers or dates before relying on numeric comparison for bounds checking.
