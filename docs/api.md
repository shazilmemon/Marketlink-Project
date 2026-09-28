# MarketLink API Specification (v1)

Base URL: `/api/v1`

---

## Standard API Response Format

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": {
      "id": "6601a5b8e4b0123456789abc",
      "name": "Sarah Jenkins",
      "email": "sarah@example.com",
      "role": "FARMER"
    }
  }
}
```

### Error Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "message": "Validation error: email: Invalid email address format",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## Implemented Phase 1 Endpoints

### 1. Health Check
`GET /api/v1/health`
- **Auth Required:** No
- **Response Example:**
```json
{
  "success": true,
  "service": "MarketLink API",
  "environment": "development",
  "database": "connected",
  "timestamp": "2026-09-23T19:30:00.000Z"
}
```

### 2. User Registration
`POST /api/v1/auth/register`
- **Auth Required:** No
- **Rate Limit:** 10 requests / 15 mins
- **Body:**
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah@example.com",
  "password": "Password123!",
  "role": "FARMER",
  "farmName": "Jenkins Organic Orchards"
}
```

### 3. User Login
`POST /api/v1/auth/login`
- **Auth Required:** No
- **Rate Limit:** 10 requests / 15 mins
- **Body:**
```json
{
  "email": "sarah@example.com",
  "password": "Password123!"
}
```

### 4. Logout User
`POST /api/v1/auth/logout`
- **Auth Required:** No
- **Description:** Clears HTTP-only `token` cookie.

### 5. Get Current User Profile
`GET /api/v1/auth/me`
- **Auth Required:** Yes (`requireAuth`)
