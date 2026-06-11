## 2024-06-11 - [Input Validation] Prevent DoS bypass with NaN Dates
**Vulnerability:** The `/api/moon` endpoint was vulnerable to a resource exhaustion DoS. While logical bounds checked for duration, an invalid date string (e.g. "9999-99-99") caused `Date.getTime()` to be `NaN`. Comparisons with `NaN` silently bypass greater-than/less-than operators, allowing huge workloads downstream.
**Learning:** Checking string structure is not enough; explicit type and bound checks must happen post-parsing when numeric values (like `getTime()`) are expected, especially for boundary validation logic.
**Prevention:** Explicitly validate parsed numbers for `isNaN()` before they are evaluated in structural constraints (like `startDate >= stopDate` or duration checks).
