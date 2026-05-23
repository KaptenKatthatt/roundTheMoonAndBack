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

## 2026-05-23 - [Preventing Path and Stack Trace Leakage on File I/O]
**Vulnerability:** The `/api/trajectory` endpoint performed a file read operation without a try/catch block. If the file is missing or unreadable, this could crash the route or be caught by a default framework handler that leaks the server's internal directory structure or a stack trace to the client.
**Learning:** Default error handlers in web frameworks can sometimes leak sensitive internal implementation details when unhandled exceptions occur, especially related to file system operations.
**Prevention:** Wrap all file system operations and potential parsing errors in explicit `try/catch` blocks, and return generic, sanitized error responses to the client.
