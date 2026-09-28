# MarketLink (eGreen Basket) — Phase 1 Production Foundation

[![MarketLink Status](https://img.shields.io/badge/MarketLink-Phase_1_Active-10B981?style=for-the-badge)](https://github.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Production_Grade-0F2F24?style=for-the-badge)](https://github.com/)

**MarketLink** is an end-to-end eGreen Basket web solutions platform designed to connect local farmers and farmers-market vendors directly with consumers. 

This repository contains **Phase 1: Production Foundation**, engineered with clean separation of concerns, provider-agnostic service abstractions (AI, Maps, Storage), production security middleware, Zod validation, role authorization, database indexing, dynamic UI shells, and development documentation.

---

## 🌾 Tech Stack

### **Frontend**
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Vanilla Tailwind CSS with custom **eGreen Basket** design system palette
- **Icons:** Lucide React icons
- **Form & Validation:** Zod + React Hook Form
- **State & API Client:** Custom `fetchApi` client with credentials support & HTTP-only cookies

### **Backend**
- **Runtime & Framework:** Node.js + Express.js (TypeScript)
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod schema validation
- **Security:** Helmet, CORS allowed origins, express-rate-limit, bcryptjs password hashing, JWT session architecture
- **Logging:** Morgan & structured logger with sensitive credential sanitization

---

## 📁 Monorepo Structure

```
MarketLink/
├── frontend/                     # Next.js App Router Frontend
│   ├── app/                      # (public), (auth), dashboard, farmer, admin
│   ├── components/               # ui, layout, shared
│   ├── lib/                      # api, utils
│   └── public/
│
├── backend/                      # Express TypeScript Backend Engine
│   └── src/
│       ├── config/               # env, database
│       ├── controllers/          # health, auth
│       ├── middleware/           # auth, role, validate, rateLimiter, error
│       ├── models/               # User, FarmerProfile, Market, Product, AuditLog
│       ├── routes/               # health, auth, index
│       ├── services/             # authService, aiService, mapService, storageService
│       ├── utils/                # errors, response, logger
│       ├── validators/           # authValidator
│       └── tests/                # integration tests
│
├── docs/                         # Technical Architecture Documentation
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── security.md
│
├── .env.example                  # Environment Configuration Template
├── .gitignore
├── README.md
└── package.json                  # Workspace Script Commands
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18.x
- MongoDB (local or MongoDB Atlas connection URI)

### 2. Environment Setup
Copy `.env.example` to root `.env` or set environment variables:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Run Development Servers
- **Backend Server:**
  ```bash
  npm run dev:backend
  # Server starts on http://localhost:5000 (Health check: http://localhost:5000/api/v1/health)
  ```
- **Frontend Server:**
  ```bash
  npm run dev:frontend
  # Next.js app starts on http://localhost:3000
  ```

---

## 🧪 Testing

Run backend Supertest API validation & health integration tests:
```bash
npm run test:backend
```

---

## 🔐 Security & Role Authorization Matrix

| User Role | Customer Endpoints | Farmer Stall Endpoints | Admin Control Center |
| :--- | :---: | :---: | :---: |
| **CUSTOMER** | ✅ Allowed | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **FARMER** | ✅ Allowed | ✅ Allowed | ❌ Forbidden (403) |
| **ADMIN** | ✅ Allowed | ✅ Allowed | ✅ Allowed |

---

## 🛣️ Future Roadmap

1. **AI Demand Forecasting:** Predictive harvest demand based on seasonality and pre-order velocity.
2. **Batch Produce Traceability:** QR code audit trails tracking harvest source to consumer pickup.
3. **Smart Vendor Insights:** Automated inventory alerts and sales recommendations.
4. **Surplus Produce Engine:** Rule-based matching for food rescue partners and discounted bulk orders.
