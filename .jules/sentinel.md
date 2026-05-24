## 2026-05-14 - [Input Validation for Horizons API Proxy]
**Vulnerability:** The `/api/moon` endpoint forwarded `start`, `stop`, and `step` query parameters directly into the URL for NASA's Horizons API without validation.
**Learning:** This could lead to a malformed or malicious payload being sent to the external API, potentially triggering errors, memory issues in parsing the unexpected responses, or cache pollution.
**Prevention:** Always validate and sanitize user-provided parameters, especially those injected into URLs for downstream or external API queries.

## 2026-05-18 - [Backend Security Improvements: DoS and Timeout]
**Vulnerability:**
1. Unbounded in-memory cache could lead to memory exhaustion (DoS).
2. External API requests lacked a timeout, risking connection exhaustion if the external API hangs.
3. Input validation regex lacked length limits.
**Learning:** Even simple APIs can be vulnerable to resource exhaustion if parameters are unbounded or external dependencies fail to respond.
**Prevention:** Implement maximum size limits for in-memory caches, use `AbortController` for timeouts on `fetch` calls, and add length constraints to regex validation.
## 2024-05-24 - Missing Error Handling in Trajectory Route Exposes Backend Internals
**Vulnerability:** File system operations (`readFile`) in the `/trajectory` route lacked a `try...catch` block. If the JSON data file went missing or encountered read permission issues, it could potentially throw unhandled exceptions, triggering default error handlers that leak internal stack traces or server file system paths to the client.
**Learning:** Default framework error handling (like Hono's fallback) doesn't always automatically sanitize native Node.js filesystem errors.
**Prevention:** Always wrap filesystem or external service calls in explicit `try...catch` blocks and return standardized, sanitized generic error responses (e.g., `500 Internal server error`).
