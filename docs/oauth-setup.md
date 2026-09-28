# MarketLink OAuth Provider Setup Guide

This guide details the exact steps required to configure live OAuth 2.0 / OpenID Connect identity providers for MarketLink.

---

## 1. Google Cloud Console Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `MarketLink-OAuth`.
3. Navigate to **APIs & Services > OAuth consent screen**.
   - User Type: **External**
   - App Name: `MarketLink`
   - User Support Email: `support@marketlink.org`
   - Authorized Domains: `marketlink.org`
4. Navigate to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth client ID**.
   - Application Type: **Web application**
   - Name: `MarketLink Web Client`
   - Authorized JavaScript origins: `http://localhost:3000` (Dev) / `https://marketlink.org` (Prod)
   - Authorized redirect URIs: `http://localhost:5000/api/v1/auth/google/callback`
5. Copy the generated **Client ID** and **Client Secret** into `.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

---

## 2. GitHub Developer Settings Setup

1. Visit [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **OAuth Apps > New OAuth App**.
   - Application Name: `MarketLink eGreen Basket`
   - Homepage URL: `http://localhost:3000`
   - Application description: `MarketLink Regional Farmers Marketplace`
   - Authorization callback URL: `http://localhost:5000/api/v1/auth/github/callback`
3. Click **Register Application**.
4. Generate a new **Client Secret**.
5. Copy credentials into `.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback
```

---

## 3. LinkedIn Developer Portal (OpenID Connect) Setup

1. Visit [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
2. Click **Create app**.
   - App Name: `MarketLink`
   - LinkedIn Page: Select your verified page
   - App Logo: Upload logo
3. Under the **Products** tab, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (`openid`, `profile`, `email` scopes)
4. Under the **Auth** tab:
   - Authorized redirect URLs for your app: `http://localhost:5000/api/v1/auth/linkedin/callback`
5. Copy the **Client ID** and **Client Secret** into `.env`:
```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/v1/auth/linkedin/callback
```
