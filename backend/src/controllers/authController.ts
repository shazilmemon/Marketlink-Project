import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body, {
      ip: req.ip,
      ua: req.headers['user-agent'],
    });

    setAuthCookies(res, result.tokens);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body, {
      ip: req.ip,
      ua: req.headers['user-agent'],
    });

    setAuthCookies(res, result.tokens);
    return sendSuccess(res, result, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

export const refreshAuthTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required.', 401, 'UNAUTHORIZED');
    }

    const tokens = await AuthService.refreshTokens(refreshToken);
    setAuthCookies(res, tokens);
    return sendSuccess(res, { tokens }, 'Tokens refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user && user.id) {
      await AuthService.logout(user.id, {
        ip: req.ip,
        ua: req.headers['user-agent'],
      });
    }
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return sendSuccess(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const userProfile = await AuthService.getCurrentUser(user.id);
    return sendSuccess(res, { user: userProfile }, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.forgotPassword(req.body.email);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.resetPassword(req.body.token, req.body.password);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

export const getConnectedAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const accounts = await AuthService.getConnectedAccounts(user.id);
    return sendSuccess(res, { accounts }, 'Connected identity accounts retrieved');
  } catch (error) {
    next(error);
  }
};

export const applyForFarmerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    const result = await AuthService.applyForFarmerStatus(user.id, req.body.farmName, req.body.bio);
    return sendSuccess(res, result, 'Farmer stall application submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyFarmerStall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.verifyFarmerStall(req.params.id, req.body.status, req.body.notes);
    return sendSuccess(res, result, `Farmer application ${req.body.status.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
};

export const handleOAuthCallback = (req: Request, res: Response) => {
  const oauthUser = (req as any).user;
  if (!oauthUser || !oauthUser.tokens) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?reason=oauth_failed`);
  }

  setAuthCookies(res, oauthUser.tokens);

  const role = oauthUser.user?.role;
  let targetPath = '/dashboard';
  if (role === 'FARMER') targetPath = '/farmer/dashboard';
  else if (role === 'ADMIN') targetPath = '/admin/dashboard';

  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${targetPath}`);
};
