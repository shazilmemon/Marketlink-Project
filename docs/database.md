# MarketLink Database Model Documentation

Database Engine: MongoDB via Mongoose ODM

---

## 1. Core Schemas & Indexing Strategy

### A. User Schema (`User`)
- `name` (String, required)
- `email` (String, unique, lowercased, indexed)
- `passwordHash` (String, `select: false` by default for zero leakage)
- `role` (Enum: `CUSTOMER`, `FARMER`, `ADMIN`, `PARTNER`)
- `authProviders` (Array of provider objects: `email`, `google`, `github`, `linkedin`)
- `isActive` (Boolean, default: true)
- `isEmailVerified` (Boolean, default: false)
- **Indexes:** `{ email: 1 }`, `{ email: 1, role: 1 }`

### B. Farmer Profile Schema (`FarmerProfile`)
- `userId` (ObjectId ref User, unique, indexed)
- `farmName` (String, required)
- `bio` (String)
- `verificationStatus` (Enum: `PENDING`, `VERIFIED`, `REJECTED`, indexed)
- `stallNumber` (String)
- `marketId` (ObjectId ref Market, indexed)
- `location` (GeoJSON Point: `[longitude, latitude]`)
- **Indexes:** `{ location: '2dsphere' }`, `{ verificationStatus: 1, marketId: 1 }`

### C. Market Schema (`Market`)
- `name` (String, required)
- `slug` (String, unique, lowercased)
- `address` (String, required)
- `city` (String, required, indexed)
- `location` (GeoJSON Point: `[longitude, latitude]`)
- `operatingHours` (String)
- **Indexes:** `{ location: '2dsphere' }`

### D. Product Schema (`Product`)
- `farmerId` (ObjectId ref User, required, indexed)
- `marketId` (ObjectId ref Market, indexed)
- `name` (String, required)
- `slug` (String)
- `category` (String, indexed)
- `price` (Number, min: 0)
- `unit` (String, e.g. kg, lb, jar, dozen)
- `inventoryQuantity` (Number, min: 0)
- `isSurplus` (Boolean, default: false, indexed)
- **Indexes:** `{ farmerId: 1, category: 1, isActive: 1 }`, `{ name: 'text', description: 'text' }`

### E. Audit Log Schema (`AuditLog`)
- `userId` (ObjectId ref User, indexed)
- `action` (String, required, indexed)
- `category` (String, required)
- `details` (Mixed)
- `ipAddress` (String)
- `userAgent` (String)
- **Indexes:** `{ createdAt: -1 }`
