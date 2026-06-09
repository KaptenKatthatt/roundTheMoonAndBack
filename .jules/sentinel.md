## 2025-06-01 - Update Hono dependency to fix CSS Injection and Cache leakage vulnerabilities
**Vulnerability:** The 'hono' dependency in the backend had moderate security vulnerabilities including CSS Declaration Injection via Style Object Values in JSX SSR, Cache Middleware cross-user cache leakage, bodyLimit bypass, and HTML Injection vulnerabilities.
**Learning:** These vulnerabilities exist in older versions of 'hono' (<4.12.18).
**Prevention:** Regularly audit packages, including in sub-workspaces, using `pnpm audit` and keep dependencies up to date.
## 2025-06-04 - Fix DoS vulnerability via unbounded date range in Horizons API
**Vulnerability:** The `/api/moon` endpoint allowed unbounded date ranges, creating a resource exhaustion (DoS) vulnerability via the external NASA Horizons API and our backend cache.
**Learning:** Endpoints that accept date ranges for data fetching must strictly validate logical order (start <= stop) and enforce reasonable maximum limits (e.g. 30 days) to prevent abuse.
**Prevention:** Implement bounds checking on all date range parameters, calculate the duration in days, and return 400 Bad Request if bounds are exceeded, prior to expensive operations.
## 2025-06-09 - Fix DoS vulnerability via NaN date bypass in validation
**Vulnerability:** The `/api/moon` endpoint's date bound checks could be bypassed by providing invalid calendar dates (e.g. `2026-99-99`) which matched the basic regex `^\d{4}-\d{2}-\d{2}$`.
**Learning:** `new Date("2026-99-99")` results in an `Invalid Date` object, whose `getTime()` returns `NaN`. Comparisons with `NaN` in JavaScript (like `NaN > 30` or `NaN >= NaN`) always evaluate to `false`, silently bypassing maximum duration and logical order checks. This would allow an attacker to send invalid dates directly to the Horizons API, potentially causing errors or resource exhaustion.
**Prevention:** Always explicitly check for `isNaN(date.getTime())` after constructing a `Date` object from user input to ensure the date is valid before performing any numerical comparisons or passing it to external APIs.
