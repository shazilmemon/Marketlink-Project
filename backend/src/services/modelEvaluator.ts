import { DailySalesObservation } from './featureEngineering';

export interface EvaluationResult {
  mae: number;
  rmse: number;
  baselineMae: number;
  isBetterThanBaseline: boolean;
  sampleCount: number;
  trainingSamples: number;
  validationSamples: number;
}

export class ModelEvaluator {
  /**
   * Chronological Train/Validation split (70% train, 30% test).
   * Calculates MAE and RMSE against actual validation targets.
   */
  public static evaluateChronologicalSplit(
    observations: DailySalesObservation[]
  ): EvaluationResult {
    const total = observations.length;
    if (total < 4) {
      return {
        mae: 0,
        rmse: 0,
        baselineMae: 0,
        isBetterThanBaseline: true,
        sampleCount: total,
        trainingSamples: total,
        validationSamples: 0,
      };
    }

    const splitIdx = Math.floor(total * 0.7);
    const trainSet = observations.slice(0, splitIdx);
    const valSet = observations.slice(splitIdx);

    // Compute baseline MAE (Simple 7-day or historical mean)
    const trainMean =
      trainSet.reduce((s, o) => s + o.quantitySold, 0) / trainSet.length;

    let baselineAbsErrorSum = 0;
    let modelAbsErrorSum = 0;
    let modelSqErrorSum = 0;

    valSet.forEach((obs, idx) => {
      // Baseline prediction = train set mean
      const basePred = trainMean;
      baselineAbsErrorSum += Math.abs(obs.quantitySold - basePred);

      // Trend-adjusted model prediction using recent window
      const recentWindow = observations.slice(0, splitIdx + idx);
      const recent7 = recentWindow.slice(-7);
      const recentAvg =
        recent7.reduce((s, o) => s + o.quantitySold, 0) / recent7.length;

      modelAbsErrorSum += Math.abs(obs.quantitySold - recentAvg);
      modelSqErrorSum += Math.pow(obs.quantitySold - recentAvg, 2);
    });

    const mae = Math.round((modelAbsErrorSum / valSet.length) * 10) / 10;
    const rmse =
      Math.round(Math.sqrt(modelSqErrorSum / valSet.length) * 10) / 10;
    const baselineMae =
      Math.round((baselineAbsErrorSum / valSet.length) * 10) / 10;

    return {
      mae,
      rmse,
      baselineMae,
      isBetterThanBaseline: mae <= baselineMae,
      sampleCount: total,
      trainingSamples: trainSet.length,
      validationSamples: valSet.length,
    };
  }
}
