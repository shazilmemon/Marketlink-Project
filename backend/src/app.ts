import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env';
import { configurePassport } from './config/passport';
import routes from './routes';
import { generalRateLimiter } from './middleware/rateLimiterMiddleware';
import { globalErrorHandler } from './middleware/errorMiddleware';
import { sendError } from './utils/response';

const app: Application = express();

// Security Headers with Helmet
app.use(helmet());

// Configurable CORS Settings
const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// Passport OAuth Strategy Initialization
configurePassport();
app.use(passport.initialize());

// Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Apply general rate limiting to all /api requests
app.use('/api', generalRateLimiter);

// API v1 Routing
app.use(`/api/${env.API_VERSION}`, routes);

// Root route redirect/info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'MarketLink API Engine',
    version: env.API_VERSION,
    health: `/api/${env.API_VERSION}/health`,
    docs: '/docs',
  });
});

// 404 Handler for Unknown Routes
app.use('*', (req: Request, res: Response) => {
  return sendError(res, `Cannot ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
});

// Global Centralized Error Handling Middleware
app.use(globalErrorHandler);

export default app;
