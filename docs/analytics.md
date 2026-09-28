# MarketLink — Phase 4 Analytics & Smart Vendor Insights Documentation

**Version**: 1.0.0  
**Phase**: Phase 4 — Analytics + Smart Vendor Insights  
**Status**: Production-Ready

---

## 1. Overview & Architecture

The MarketLink Phase 4 Analytics module computes real-time business performance metrics directly from MongoDB transactional collections (`orders`, `products`, `inventories`, `reviews`, `marketstalls`).

### Key Principles
- **No Mock or Hardcoded Numbers**: All metrics are calculated dynamically using MongoDB Aggregation Pipelines.
- **Deterministic Smart Vendor Insights**: Business insights evaluate real quantitative rules (demand velocity, remaining stock, revenue shifts, cancellation rates). No fake LLM hallucinations.
- **Separation of Concerns**: Analytics aggregation pipelines and controllers operate independently of transactional checkout loops.
- **Privacy-Conscious Aggregation**: Customer analytics report high-level aggregate figures (unique buyers, repeat rate, average order value) without exposing private customer emails or identities.

---

## 2. API Endpoints Reference

All endpoints are mounted under `/api/v1/analytics` and require authenticated session tokens (`requireAuth`) with `FARMER` or `ADMIN` role scope (`requireRole('FARMER', 'ADMIN')`).

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/farmer/overview` | High-level KPIs & period comparisons | `preset`, `from`, `to` |
| `GET` | `/api/v1/analytics/farmer/sales` | Time-series sales data for charts | `preset`, `from`, `to`, `groupBy` (`day`/`week`/`month`) |
| `GET` | `/api/v1/analytics/farmer/orders` | Order status distribution breakdown | `preset`, `from`, `to` |
| `GET` | `/api/v1/analytics/farmer/products` | Top revenue produce & low-velocity items | `preset`, `from`, `to`, `limit` |
| `GET` | `/api/v1/analytics/farmer/inventory` | Stock-out frequency & low stock alerts | `preset`, `from`, `to` |
| `GET` | `/api/v1/analytics/farmer/customers` | Unique & repeat buyer metrics | `preset`, `from`, `to` |
| `GET` | `/api/v1/analytics/farmer/reviews` | 1-5 star review rating distribution | None |
| `GET` | `/api/v1/analytics/farmer/markets` | Revenue & sales breakdown per market stall | `preset`, `from`, `to` |
| `GET` | `/api/v1/analytics/farmer/insights` | Deterministic Smart Vendor Insights list | `preset`, `from`, `to` |
| `GET` | `/api/v1/analytics/farmer/export` | CSV report file download | `preset`, `from`, `to` |

---

## 3. Date Range Filtering & Period Comparisons

### Supported Preset Parameters (`preset`)
- `today`: 00:00:00 to 23:59:59 today.
- `yesterday`: 00:00:00 to 23:59:59 yesterday.
- `7d`: Last 7 rolling days.
- `30d`: Last 30 rolling days (Default).
- `90d`: Last 90 rolling days.
- `this_month`: 1st of current month to today.
- `previous_month`: 1st day of prior month to last day of prior month.
- `custom`: Custom bounds via `from` and `to` ISO strings.

### Period Comparison Math
For any selected period, the system calculates an equivalent prior period duration:
$$\text{Change \%} = \left( \frac{\text{Current Metric} - \text{Previous Metric}}{\text{Previous Metric}} \right) \times 100$$
If the previous period metric is $0$, the change percentage is returned as `null` ("New period baseline") to prevent division-by-zero errors or misleading infinite percentages.

---

## 4. Deterministic Smart Vendor Insights Rules

Smart Vendor Insights are computed deterministically via `SmartInsightService`:

1. **`SALES_GROWTH`**: Triggered when revenue in current period is $\ge 10\%$ higher than previous period.
2. **`SALES_DECLINE`**: Triggered when revenue drops by $\ge 10\%$ vs previous period.
3. **`HIGH_DEMAND_PRODUCT`**: Triggered when a product has sold $\ge 10$ units recently and remaining stock is $\le 15$.
4. **`LOW_STOCK_RISK`**: Triggered when `quantityAvailable` is $\le$ `lowStockThreshold`.
5. **`OUT_OF_STOCK`**: Triggered when `quantityAvailable` $= 0$.
6. **`CANCELLATION_RATE_HIGH`**: Triggered when cancelled/rejected order rate is $\ge 15\%$ across $\ge 5$ total orders.
7. **`LOW_PERFORMING_PRODUCT`**: Triggered when an active produce item has sold $\le 2$ units in period.
8. **`HIGH_RATING_PRODUCT`**: Triggered when a product holds an average rating $\ge 4.8$ with $\ge 2$ verified reviews.
9. **`REPEAT_CUSTOMER_GROWTH`**: Triggered when repeat customer rate is $\ge 25\%$ with $\ge 3$ unique buyers.

---

## 5. Security & Authorization

- **Farmer Isolation**: Farmers can **only** view analytics for their own `farmerProfileId`. The user identity is extracted securely from the JWT session token (`req.user.id`).
- **RBAC Guards**: `CUSTOMER` users attempting to access `/api/v1/analytics/*` receive a `403 Forbidden` error.
- **Input Validation**: Server-side Zod validation ensures query parameters are valid.
