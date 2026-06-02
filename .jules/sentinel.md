## 2025-06-01 - Update Hono dependency to fix CSS Injection and Cache leakage vulnerabilities
**Vulnerability:** The 'hono' dependency in the backend had moderate security vulnerabilities including CSS Declaration Injection via Style Object Values in JSX SSR, Cache Middleware cross-user cache leakage, bodyLimit bypass, and HTML Injection vulnerabilities.
**Learning:** These vulnerabilities exist in older versions of 'hono' (<4.12.18).
**Prevention:** Regularly audit packages, including in sub-workspaces, using `pnpm audit` and keep dependencies up to date.
## 2025-02-14 - [DoS via Large Date Ranges on API]
**Vulnerability:** The backend endpoint proxying the NASA Horizons API accepted arbitrary date ranges (`start`, `stop`), making it vulnerable to Denial of Service (DoS) attacks by requesting extremely large datasets (e.g. thousands of years of vector data at high resolution), potentially causing memory exhaustion (OOM) and rate-limiting from the upstream NASA server.
**Learning:** Input validation with regexes for string format (e.g., `YYYY-MM-DD`) is insufficient when dealing with time-series data APIs; logical range validation (maximum allowed duration) must be enforced.
**Prevention:** Always parse date inputs into actual `Date` objects, verify their validity (`!isNaN()`), ensure correct chronological order (`stop > start`), and restrict the maximum time difference to a safe ceiling (e.g. 60 days) before making downstream/upstream queries.
