## 2024-05-16 - [Third-Party Injection Risk in Moon Route]
**Vulnerability:** The NASA Horizons API endpoint allows third-party query parameter injection through `start`, `stop`, and `step` without proper input validation.
**Learning:** Third-party integrations in routes are prone to SSRF risks when arbitrary input goes directly into the fetch URL.
**Prevention:** Always strictly validate and sanitize parameters (e.g., using regex or a schema validator like Zod) before injecting them into outbound API requests.
