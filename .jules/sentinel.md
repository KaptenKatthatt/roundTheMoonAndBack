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

## 2026-05-21 - [Prevent Internal Path Leakage in File Operations]
**Vulnerability:** File read operations (`readFile`) were not wrapped in try/catch blocks in the backend API routes (e.g., `/trajectory`).
**Learning:** If a file is missing or unreadable, an unhandled error could be thrown. Depending on the framework's default error handler, this could potentially leak internal filesystem paths or stack traces to clients, revealing server architecture details.
**Prevention:** Always wrap filesystem operations and parsing steps in try/catch blocks. Log the detailed error internally and return a generic sanitized response (like "Internal Server Error") to the client.
