# 4Patriots OAuth Dashboard Setup

This is a Next.js application that gates your HTML dashboard behind Google Workspace OAuth. Only users with @4patriots.com email addresses can access it.

## What This Does

1. **OAuth Gate**: When someone visits the site, they're redirected to Google login
2. **Email Verification**: Only @4patriots.com email addresses are allowed
3. **Session Management**: 72-hour sessions with secure cookies
4. **Your Dashboard**: After login, they see your `dashboard.html` file

## Files Overview

- `middleware.ts` - Checks authentication on every request
- `src/app/api/auth/google/route.ts` - Initiates Google OAuth
- `src/app/api/auth/callback/route.ts` - Handles OAuth callback
- `public/dashboard.html` - Your dashboard (served after auth)
- `.env.local` - Environment variables (secrets go here)

## Setup Steps

### Step 1: Create `.env.local`

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in the file with your credentials:

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
SESSION_SECRET=your-random-secret-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**For SESSION_SECRET**, generate a random string. On Mac/Linux:
```bash
openssl rand -base64 32
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard.html`. You should be redirected to Google login.

### Step 4: Deploy to Vercel

1. Create a git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push to GitHub (or connect to Vercel in another way):
```bash
git remote add origin https://github.com/YOUR_USERNAME/4patriots-dashboard.git
git push -u origin main
```

3. Go to vercel.com and import the GitHub repository
4. Add environment variables in Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET` (same random string from .env.local)
   - `NEXT_PUBLIC_BASE_URL` (your Vercel domain, e.g., `https://my-dashboard.vercel.app`)

5. Deploy

### Step 5: Update Google OAuth Redirect URI

Once Vercel gives you a domain (e.g., `https://my-dashboard.vercel.app`):

1. Go back to Google Cloud Console
2. Click on your "Vercel Dashboard" OAuth client
3. Add this redirect URI under "Authorized redirect URIs":
   ```
   https://my-dashboard.vercel.app/api/auth/callback
   ```

4. Save

### Step 6: Update Vercel Environment Variables

Update `NEXT_PUBLIC_BASE_URL` in Vercel to your actual domain:
```
https://my-dashboard.vercel.app
```

Redeploy (or Vercel will auto-redeploy if you push to GitHub).

## Testing

1. Visit your Vercel domain
2. You should be redirected to Google login
3. Sign in with your @4patriots.com email
4. You should see your dashboard
5. Session lasts 72 hours

## Troubleshooting

**"Only 4patriots.com email addresses are allowed"**
- You signed in with a non-@4patriots.com email. Use your work email.

**Redirect URI mismatch**
- Make sure the redirect URI in Google Cloud Console matches your Vercel domain exactly
- After updating Google Cloud Console, you might need to wait a minute and try again

**Session expires too quickly**
- Check that `SESSION_SECRET` is the same in `.env.local` and Vercel
- Clear your cookies and try again

## Rotating Your Secret (Important)

After deployment, go back to Google Cloud Console and regenerate your Client Secret:
1. Click on your OAuth client
2. Find the secret, click the refresh icon
3. Delete the old secret, copy the new one
4. Update it in Vercel
5. Redeploy

This is important because you shared the secret during setup.

## Support

If something breaks, check:
1. Browser console for errors (F12)
2. Vercel logs (vercel.com → your project → Deployments → View Logs)
3. Google Cloud Console for redirect URI configuration
