## 2025-06-01 - Update Hono dependency to fix CSS Injection and Cache leakage vulnerabilities
**Vulnerability:** The 'hono' dependency in the backend had moderate security vulnerabilities including CSS Declaration Injection via Style Object Values in JSX SSR, Cache Middleware cross-user cache leakage, bodyLimit bypass, and HTML Injection vulnerabilities.
**Learning:** These vulnerabilities exist in older versions of 'hono' (<4.12.18).
**Prevention:** Regularly audit packages, including in sub-workspaces, using `pnpm audit` and keep dependencies up to date.
## 2025-06-04 - Fix DoS vulnerability via unbounded date range in Horizons API
**Vulnerability:** The `/api/moon` endpoint allowed unbounded date ranges, creating a resource exhaustion (DoS) vulnerability via the external NASA Horizons API and our backend cache.
**Learning:** Endpoints that accept date ranges for data fetching must strictly validate logical order (start <= stop) and enforce reasonable maximum limits (e.g. 30 days) to prevent abuse.
**Prevention:** Implement bounds checking on all date range parameters, calculate the duration in days, and return 400 Bad Request if bounds are exceeded, prior to expensive operations.
## 2025-06-10 - Fix DoS vulnerability via date validation bypass
**Vulnerability:** The `/api/moon` endpoint parsed user input directly as dates, but didn't check for invalid dates like `"2026-99-99"` that resulted in `NaN`. This `NaN` bypassed the duration and bounds checks, allowing unbounded inputs to reach the backend cache and external NASA Horizons API, re-exposing a resource exhaustion DoS vulnerability.
**Learning:** Comparing `NaN` with standard numeric conditions (`>=`, `>`) evaluates to `false`, effectively bypassing bounds checks for invalid data.
**Prevention:** Explicitly guard against invalid date inputs resulting in `NaN` via `isNaN()` checks before doing bound checking.
