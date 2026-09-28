import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  refreshAuthTokens,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  getConnectedAccounts,
  handleOAuthCallback,
} from '../controllers/authController';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator';
import { authRateLimiter } from '../middleware/rateLimiterMiddleware';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Email / Password Endpoints
router.post('/register', authRateLimiter, validateRequest(registerSchema), registerUser);
router.post('/login', authRateLimiter, validateRequest(loginSchema), loginUser);
router.post('/refresh', refreshAuthTokens);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getMe);

// Password Reset & Email Verification Endpoints
router.post('/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.get('/connected-accounts', requireAuth, getConnectedAccounts);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/error?reason=google_denied' }),
  handleOAuthCallback
);

// GitHub OAuth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/auth/error?reason=github_denied' }),
  handleOAuthCallback
);

// LinkedIn OAuth OpenID Connect Routes
router.get('/linkedin', passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'], session: false }));
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/auth/error?reason=linkedin_denied' }),
  handleOAuthCallback
);

export default router;
