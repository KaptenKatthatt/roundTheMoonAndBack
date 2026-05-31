## 2024-05-31 - Update Hono to resolve security vulnerabilities
**Vulnerability:** Hono < 4.12.18 had multiple moderate severity vulnerabilities including CSS Injection via Style Object in JSX SSR, Cache Middleware cross-user leakage, bypassing bodyLimit() with chunked requests, HTML Injection via unvalidated JSX tags, and improper JWT NumericDate claim validation.
**Learning:** Checking `pnpm audit` regularly is important as frameworks can have vulnerabilities discovered in them. Upgrading to a patched version fixes these framework-level vulnerabilities.
**Prevention:** Integrate `pnpm audit` into CI/CD pipelines to automatically block builds or alert on dependencies with known vulnerabilities to prevent outdated vulnerable packages from persisting.
