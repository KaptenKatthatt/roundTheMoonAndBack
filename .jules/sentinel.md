## 2025-06-01 - Update Hono dependency to fix CSS Injection and Cache leakage vulnerabilities
**Vulnerability:** The 'hono' dependency in the backend had moderate security vulnerabilities including CSS Declaration Injection via Style Object Values in JSX SSR, Cache Middleware cross-user cache leakage, bodyLimit bypass, and HTML Injection vulnerabilities.
**Learning:** These vulnerabilities exist in older versions of 'hono' (<4.12.18).
**Prevention:** Regularly audit packages, including in sub-workspaces, using `pnpm audit` and keep dependencies up to date.
## 2025-06-04 - Fix DoS vulnerability via unbounded date range in Horizons API
**Vulnerability:** The `/api/moon` endpoint allowed unbounded date ranges, creating a resource exhaustion (DoS) vulnerability via the external NASA Horizons API and our backend cache.
**Learning:** Endpoints that accept date ranges for data fetching must strictly validate logical order (start <= stop) and enforce reasonable maximum limits (e.g. 30 days) to prevent abuse.
**Prevention:** Implement bounds checking on all date range parameters, calculate the duration in days, and return 400 Bad Request if bounds are exceeded, prior to expensive operations.
## 2026-06-08 - Protect endpoints with in-memory Rate Limiting and Regex Validation
**Vulnerability:** The application was missing rate limiting, allowing rapid requests that could lead to Denial of Service (DoS) and excessive external API consumption. The regex for `/api/moon` step accepted a 0 value which triggered API rejections.
**Learning:** All endpoints, especially those hitting external services like the NASA Horizons API, require traffic controls. A simple bounded map rate limiter with a FIFO eviction strategy can prevent memory leaks. Also, regex for inputs affecting iterators or queries should strictly deny edge-case nullifiers like 0 unless explicitly supported.
**Prevention:** Incorporate a custom in-memory rate limiting middleware. Validate all query strings and inputs rigidly for values that may cause infinite loops or resource waste.
