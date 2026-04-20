# 4Patriots OAuth Dashboard

A Next.js application that gates your analytics dashboard behind Google Workspace OAuth authentication.

**Features:**
- ✅ Google Workspace login required
- ✅ Only @4patriots.com emails allowed
- ✅ 72-hour sessions
- ✅ Secure, HttpOnly cookies
- ✅ Deployed on Vercel (free tier)

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

TL;DR:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm install
npm run dev
```

Visit `http://localhost:3000/dashboard.html`
