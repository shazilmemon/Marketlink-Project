import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error(err.message, { stack: env.NODE_ENV === 'development' ? err.stack : undefined });

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode);
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    return sendError(res, `Duplicate value for ${field}. Please use another value.`, 409, 'DUPLICATE_KEY');
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 422, 'VALIDATION_ERROR');
  }

  // Fallback for unexpected errors
  const message = env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message;
  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
};
