import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { env } from './env';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

export const configurePassport = (): void => {
  // 1. Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          const userResult = await AuthService.handleOAuthSuccess({
            provider: 'GOOGLE',
            providerAccountId: profile.id,
            email: email || '',
            name: profile.displayName || profile.name?.givenName || 'Google User',
            avatar: profile.photos && profile.photos[0]?.value,
            username: profile.username || '',
          });
          return done(null, userResult as any);
        } catch (error) {
          logger.error('Google OAuth strategy error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // 2. GitHub OAuth Strategy (with private email fallback handling)
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          let email = profile.emails && profile.emails[0]?.value;
          // Fallback if GitHub email is private
          if (!email && profile._json && profile._json.email) {
            email = profile._json.email;
          }
          if (!email) {
            email = `${profile.username}@github.user.marketlink.internal`;
          }

          const userResult = await AuthService.handleOAuthSuccess({
            provider: 'GITHUB',
            providerAccountId: profile.id,
            email,
            name: profile.displayName || profile.username || 'GitHub User',
            avatar: profile.photos && profile.photos[0]?.value,
            username: profile.username || '',
          });
          return done(null, userResult as any);
        } catch (error) {
          logger.error('GitHub OAuth strategy error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // 3. LinkedIn OpenID Connect Strategy
  passport.use(
    'linkedin',
    new OAuth2Strategy(
      {
        authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientID: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
        callbackURL: env.LINKEDIN_CALLBACK_URL,
        scope: ['openid', 'profile', 'email'],
      },
      async (accessToken: string, _refreshToken: string, _params: any, _profile: any, done: any) => {
        try {
          // Fetch user info from LinkedIn OIDC userinfo endpoint
          const response = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.ok) {
            throw new Error(`LinkedIn userinfo request failed with status: ${response.status}`);
          }

          const userInfo = (await response.json()) as any;
          const userResult = await AuthService.handleOAuthSuccess({
            provider: 'LINKEDIN',
            providerAccountId: userInfo.sub || userInfo.id || 'linkedin_user',
            email: userInfo.email || `${userInfo.sub}@linkedin.user.marketlink.internal`,
            name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'LinkedIn User',
            avatar: userInfo.picture || '',
            username: userInfo.sub || '',
          });
          return done(null, userResult as any);
        } catch (error) {
          logger.error('LinkedIn OAuth OIDC strategy error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
};
