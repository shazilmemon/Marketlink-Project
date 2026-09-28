import mongoose, { Schema, Document } from 'mongoose';

export type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ForecastStatus = 'VALID' | 'INSUFFICIENT_DATA' | 'EXPIRED' | 'RETIRED';

export interface IDemandForecast extends Document {
  farmerProfileId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  marketId?: mongoose.Types.ObjectId;
  forecastDate: Date;
  targetDate: Date;
  horizonDays: number;
  predictedQuantity: number;
  lowerBound: number;
  upperBound: number;
  demandLevel: DemandLevel;
  confidenceLevel: ConfidenceLevel;
  status: ForecastStatus;
  insufficientDataReason?: string;
  modelName: string;
  modelVersion: string;
  trainingDataStart?: Date;
  trainingDataEnd?: Date;
  trainingSampleCount: number;
  evaluationMetrics?: {
    mae: number;
    rmse: number;
    baselineMae: number;
  };
  featureSummary?: Record<string, any>;
  explanation: string;
  actualQuantity?: number;
  absoluteError?: number;
  generatedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DemandForecastSchema = new Schema<IDemandForecast>(
  {
    farmerProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      index: true,
    },
    forecastDate: { type: Date, required: true, default: Date.now },
    targetDate: { type: Date, required: true, index: true },
    horizonDays: { type: Number, default: 7 },
    predictedQuantity: { type: Number, required: true, default: 0 },
    lowerBound: { type: Number, required: true, default: 0 },
    upperBound: { type: Number, required: true, default: 0 },
    demandLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      index: true,
    },
    confidenceLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['VALID', 'INSUFFICIENT_DATA', 'EXPIRED', 'RETIRED'],
      default: 'VALID',
      index: true,
    },
    insufficientDataReason: { type: String, default: '' },
    modelName: { type: String, required: true, default: 'Trend-Adjusted Moving Average' },
    modelVersion: { type: String, required: true, default: '1.0.0' },
    trainingDataStart: { type: Date },
    trainingDataEnd: { type: Date },
    trainingSampleCount: { type: Number, default: 0 },
    evaluationMetrics: {
      mae: { type: Number, default: 0 },
      rmse: { type: Number, default: 0 },
      baselineMae: { type: Number, default: 0 },
    },
    featureSummary: { type: Schema.Types.Mixed, default: {} },
    explanation: { type: String, required: true, default: '' },
    actualQuantity: { type: Number },
    absoluteError: { type: Number },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

DemandForecastSchema.index({ farmerProfileId: 1, productId: 1, targetDate: 1 });

export const DemandForecast = mongoose.model<IDemandForecast>(
  'DemandForecast',
  DemandForecastSchema
);
