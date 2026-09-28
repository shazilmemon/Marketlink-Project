import { Request, Response } from 'express';
import { getDbStatus } from '../config/database';
import { env } from '../config/env';

export const getHealth = (_req: Request, res: Response) => {
  const dbStatus = getDbStatus();

  return res.status(200).json({
    success: true,
    service: 'MarketLink API',
    environment: env.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};
