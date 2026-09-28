# MarketLink Technical Architecture Guide

## 1. System Overview

MarketLink is designed as a decoupled, multi-tier web application architecture. The system consists of a Next.js frontend presentation layer communicating over REST API v1 with a Node.js/Express backend service backed by MongoDB.

```
+-------------------------------------------------------------------+
|                        Frontend (Next.js)                         |
|   App Router | Tailwind CSS (eGreen Basket) | Zod | Lucide        |
+-------------------------------------------------------------------+
                                  |
                                  | HTTP REST / JSON (Credentials / Cookie)
                                  v
+-------------------------------------------------------------------+
|                     Backend API Server (Express)                  |
|  /api/v1/health | /api/v1/auth | Rate Limiters | Helmet Headers   |
+-------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
            v                     v                     v
  +------------------+  +------------------+  +------------------+
  |    AIService     |  |    MapService    |  |  StorageService  |
  | (Gemini/OpenAI)  |  |  (OSM/Google)    |  |  (S3/Cloudinary) |
  +------------------+  +------------------+  +------------------+
            |                     |                     |
            +---------------------+---------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                         MongoDB / Mongoose                        |
|  User | FarmerProfile | Market | Product | AuditLog               |
+-------------------------------------------------------------------+
```

---

## 2. Provider Abstraction Services

To prevent vendor lock-in and enable smooth future growth, all third-party capabilities are engineered behind service interfaces:

### A. AI Service Abstraction (`IAIServiceProvider`)
Located in `backend/src/services/aiService.ts`.
- Swappable implementations: `MockAIProvider`, `GeminiAIProvider`, `OpenAIProvider`.
- Methods: `generateText`, `analyzeDemandForecast`, `generateVendorInsights`.
- **Validation Constraint:** Business calculations remain in deterministic code; AI output is treated as untrusted and validated.

### B. Map Service Abstraction (`IMapServiceProvider`)
Located in `backend/src/services/mapService.ts`.
- Swappable implementations: `OpenStreetMapProvider`, `GoogleMapsProvider`.
- Methods: `calculateDistance` (Haversine formula), `formatMarkers`.

### C. Storage Service Abstraction (`IStorageServiceProvider`)
Located in `backend/src/services/storageService.ts`.
- Swappable implementations: `LocalStorageProvider`, `CloudinaryProvider`, `S3StorageProvider`.
- Methods: `uploadFile`, `deleteFile`.

---

## 3. Request Flow & Middleware Chain

1. **Request Intake:** Helmet headers applied, CORS origin verified against whitelist.
2. **Rate Limiting:** Request evaluated against `generalRateLimiter` or `authRateLimiter`.
3. **Zod Validation:** `validateRequest(schema)` validates `body`, `query`, and `params`.
4. **Auth Middleware:** `requireAuth` decodes JWT from HTTP-only cookie or Bearer token.
5. **Role Guard:** `requireRole(['ADMIN', 'FARMER'])` checks user role in JWT payload.
6. **Controller Execution:** Controller calls corresponding service (`AuthService`, etc.).
7. **Error Handler:** Any caught exceptions are passed to `globalErrorHandler` for sanitized JSON response.
