# MarketLink — Phase 5 AI Demand Forecasting Documentation

**Version**: 1.0.0  
**Phase**: Phase 5 — AI Demand Forecasting  
**Status**: Production-Ready

---

## 1. Executive Summary & Objective

The MarketLink AI Demand Forecasting module enables regional farmers to project upcoming produce demand for future market pickup days using historical sales transactions (`Order` items with `status: 'PICKED_UP'`).

### Core Principles & Safety
- **No Fabricated Demand**: All model training and feature extraction strictly rely on observed, completed customer pickups.
- **Data Leakage Prevention**: All training observations for target date $T$ strictly use historical transactions created before $T$ ($\text{createdAt} < T$).
- **Data Sufficiency Rule**: Requires a minimum of 3 completed historical sales observations. If insufficient data exists, the system returns `status: 'INSUFFICIENT_DATA'` with clear explanatory messages.
- **Baseline Model Evaluation**: Compares ML predictions against a Baseline Moving Average. If ML MAE (Mean Absolute Error) is worse than baseline MAE, the system automatically falls back to the validated baseline.
- **Uncertainty & Intervals**: Provides prediction lower and upper bounds using historical residual standard error margins ($1.5 \times \text{StdDev}$).

---

## 2. Architecture & Data Schemas

### Folder Structure (`backend/src/forecasting/`)
```
forecasting/
├── models/
│   └── DemandForecast.ts
├── features/
│   └── featureEngineering.ts
├── evaluation/
│   └── modelEvaluator.ts
├── providers/
│   └── DemandForecastProvider.ts
├── services/
│   └── forecastingService.ts
├── controllers/
│   └── forecastingController.ts
├── routes/
│   └── forecastingRoutes.ts
└── validators/
    └── forecastingValidator.ts
```

### `DemandForecast` Schema Fields
- `farmerProfileId`: Mongoose ObjectId linking to farmer vendor profile.
- `productId`: Mongoose ObjectId linking to produce product.
- `marketId`: Optional ObjectId linking to specific physical farmers market stall.
- `forecastDate`: Date forecast was generated.
- `targetDate`: Target market pickup date being predicted.
- `predictedQuantity`: Expected demand (in product unit, e.g. lbs, kg, jars).
- `lowerBound`: Lower prediction interval bound.
- `upperBound`: Upper prediction interval bound.
- `demandLevel`: Classification badge (`LOW`, `MEDIUM`, `HIGH`).
- `confidenceLevel`: Confidence rating (`LOW`, `MEDIUM`, `HIGH`).
- `status`: Status indicator (`VALID`, `INSUFFICIENT_DATA`, `EXPIRED`, `RETIRED`).
- `modelName`: Model provider name (`Trend-Adjusted Time-Series ML Model` or `Baseline Moving Average`).
- `modelVersion`: Version string (e.g. `1.0.0`).
- `trainingSampleCount`: Count of valid historical sales observations used.
- `evaluationMetrics`: `{ mae, rmse, baselineMae }`.
- `explanation`: Plain-language explanation generated from feature trends.
- `actualQuantity` & `absoluteError`: Fulfilled target date sales and evaluation error calculated after target date passes.

---

## 3. Measurable Rules & Methodologies

### 1. Demand Level Classification
- **`HIGH`**: $\text{Predicted Quantity} \ge 1.25 \times \text{Historical Mean}$ (Demand is 25%+ above average).
- **`LOW`**: $\text{Predicted Quantity} \le 0.75 \times \text{Historical Mean}$ (Demand is 25%+ below average).
- **`MEDIUM`**: $\text{Predicted Quantity}$ is between $0.75 \times$ and $1.25 \times$ historical mean.

### 2. Confidence Level Classification
- **`HIGH`**: $\ge 14$ sales observations available and Standard Deviation / Mean $\le 0.4$.
- **`MEDIUM`**: $\ge 7$ sales observations available.
- **`LOW`**: $< 7$ sales observations available.

### 3. Chronological Train/Validation Split
Evaluates model performance using a $70\% / 30\%$ chronological split on historical observations. Time-series data is **never** randomly shuffled to avoid temporal data leakage.

---

## 4. API Endpoints Reference

All endpoints are mounted under `/api/v1/forecasting` and require `FARMER` or `ADMIN` authentication.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/forecasting/farmer/generate` | Generate or retrieve cached demand forecast for a product |
| `POST` | `/api/v1/forecasting/farmer/generate-bulk` | Batch generate demand forecasts for up to 20 products |
| `GET` | `/api/v1/forecasting/farmer` | List farmer forecasts with optional filtering |
| `GET` | `/api/v1/forecasting/farmer/evaluations` | Historical actual vs predicted error evaluations |
| `GET` | `/api/v1/forecasting/farmer/:id` | Retrieve detailed forecast object by ID |

---

## 5. Phase 4 Smart Vendor Insights Integration

Phase 5 forecasting integrates directly with Phase 4 Smart Vendor Insights:
- **`HIGH_DEMAND_PRODUCT`**: Triggered when forecasted demand exceeds current stock with low remaining inventory.
- **`ESTIMATED_STOCK_GAP`**: Displays $\text{Predicted Quantity} - \text{Current Stock}$ as an informational stock planning indicator in the farmer UI.
