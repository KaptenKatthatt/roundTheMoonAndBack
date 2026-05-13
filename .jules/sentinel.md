## 2026-05-13 - [Missing Input Validation on External API Proxy]
**Vulnerability:** Missing input validation for start, stop, and step parameters in /moon endpoint.
**Learning:** Unvalidated parameters passed directly to an external API URL search parameters can allow injection or cause unintended high load (DoS) on both the server (caching infinitely large/many strings) and the upstream provider.
**Prevention:** Always validate and sanitize user input before using it to construct external API queries or caching keys.
