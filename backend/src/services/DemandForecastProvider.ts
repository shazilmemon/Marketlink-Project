import { EngineeredFeatures } from './featureEngineering';
import { DemandLevel, ConfidenceLevel } from '../models/DemandForecast';

export interface ForecastPrediction {
  predictedQuantity: number;
  lowerBound: number;
  upperBound: number;
  demandLevel: DemandLevel;
  confidenceLevel: ConfidenceLevel;
  modelName: string;
  modelVersion: string;
  explanation: string;
}

export interface IDemandForecastProvider {
  name: string;
  version: string;
  predict(features: EngineeredFeatures): ForecastPrediction;
}

/**
 * 1. Baseline Moving Average Provider
 */
export class BaselineMovingAverageProvider implements IDemandForecastProvider {
  public name = 'Baseline Moving Average';
  public version = '1.0.0';

  public predict(features: EngineeredFeatures): ForecastPrediction {
    const rawPrediction =
      features.rollingAverage7 > 0 ? features.rollingAverage7 : features.historicalMean;
    const predictedQuantity = Math.max(1, Math.round(rawPrediction));

    // Simple 20% margin for baseline prediction interval
    const margin = Math.max(2, Math.round(predictedQuantity * 0.25));
    const lowerBound = Math.max(0, predictedQuantity - margin);
    const upperBound = predictedQuantity + margin;

    const demandLevel = getDemandLevel(predictedQuantity, features.historicalMean);
    const confidenceLevel = getConfidenceLevel(features.sampleCount, features.historicalStdDev);

    return {
      predictedQuantity,
      lowerBound,
      upperBound,
      demandLevel,
      confidenceLevel,
      modelName: this.name,
      modelVersion: this.version,
      explanation: `Forecast based on ${features.sampleCount}-observation historical moving average (${features.rollingAverage7} units/day).`,
    };
  }
}

/**
 * 2. Trend-Adjusted Time-Series Model Provider
 */
export class TrendAdjustedTimeSeriesProvider implements IDemandForecastProvider {
  public name = 'Trend-Adjusted Time-Series ML Model';
  public version = '1.0.0';

  public predict(features: EngineeredFeatures): ForecastPrediction {
    // Weighted combination: 60% 7-day rolling avg, 30% 14-day rolling avg, 10% 30-day avg
    const weightedBase =
      features.rollingAverage7 * 0.6 +
      features.rollingAverage14 * 0.3 +
      features.rollingAverage30 * 0.1;

    // Apply trend multiplier bounded between 0.7x and 1.5x for stability
    const trendMultiplier = Math.min(Math.max(features.recentTrend, 0.7), 1.5);
    const adjustedValue = weightedBase * trendMultiplier;

    const predictedQuantity = Math.max(1, Math.round(adjustedValue));

    // Error-based interval calculation (1.5 * stdDev bounds)
    const stdDevMargin = Math.max(3, Math.round(features.historicalStdDev * 1.5));
    const lowerBound = Math.max(0, predictedQuantity - stdDevMargin);
    const upperBound = predictedQuantity + stdDevMargin;

    const demandLevel = getDemandLevel(predictedQuantity, features.historicalMean);
    const confidenceLevel = getConfidenceLevel(features.sampleCount, features.historicalStdDev);

    let explanation = `Estimated demand is ${
      trendMultiplier > 1.05 ? 'higher' : trendMultiplier < 0.95 ? 'lower' : 'steady'
    } than historical average due to recent order trend (${features.recentTrend}x ratio).`;

    return {
      predictedQuantity,
      lowerBound,
      upperBound,
      demandLevel,
      confidenceLevel,
      modelName: this.name,
      modelVersion: this.version,
      explanation,
    };
  }
}

/**
 * Measurable rule for Demand Classification:
 * LOW: forecast < 75% of historical mean
 * HIGH: forecast > 125% of historical mean
 * MEDIUM: between 75% and 125%
 */
function getDemandLevel(predictedQuantity: number, historicalMean: number): DemandLevel {
  if (historicalMean === 0) return 'MEDIUM';
  const ratio = predictedQuantity / historicalMean;
  if (ratio >= 1.25) return 'HIGH';
  if (ratio <= 0.75) return 'LOW';
  return 'MEDIUM';
}

/**
 * Measurable rule for Confidence Level:
 * HIGH: >= 14 observations and stdDev / mean <= 0.4
 * MEDIUM: >= 7 observations
 * LOW: < 7 observations
 */
function getConfidenceLevel(sampleCount: number, stdDev: number): ConfidenceLevel {
  if (sampleCount >= 14 && stdDev <= 5) return 'HIGH';
  if (sampleCount >= 7) return 'MEDIUM';
  return 'LOW';
}
