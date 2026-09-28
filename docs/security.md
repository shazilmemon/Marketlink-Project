# MarketLink Security & Compliance Checklist

## 🛡️ Production Security Checklist Verification

- [x] **No Secrets Committed:** Verified `.gitignore` ignores `.env`, `.env.local`, and build credentials. `.env.example` provided.
- [x] **Password Hashing:** Implemented with `bcryptjs` (salt rounds: 12).
- [x] **Password Leakage Prevention:** `passwordHash` defined with `select: false` in User model schema; excluded automatically in `toJSON` transforms.
- [x] **Backend Authorization Enforcement:** Implemented with `requireRole(['ADMIN'])` and `requireRole(['FARMER', 'ADMIN'])` middleware. Clients cannot access protected routes by modifying URLs alone.
- [x] **Strict Request Input Validation:** All body, query, and path params parsed with Zod schemas on backend before execution.
- [x] **Configured CORS Security:** Whitelisted allowed origins (`FRONTEND_URL`) with credential header support.
- [x] **Helmet Security Headers:** Applied standard security headers (XSS Filter, HSTS, Frameguard, NoSniff).
- [x] **Rate Limiting Architecture:** General rate limiter (100 req/15 min) and strict Auth rate limiter (10 req/15 min) active.
- [x] **Sanitized Error Responses:** Centralized `globalErrorHandler` catches all errors and strips stack traces in production environments (`NODE_ENV=production`).
- [x] **OAuth Client Secrets:** Server-side environment variables only; never exposed in public client bundles.
- [x] **Database Query Injection Safeguards:** Mongoose strict query mode enabled (`mongoose.set('strictQuery', true)`).
