# DEPLOY.md — 4patriots-dashboard

How this project gets from your laptop to the live site, and how Claude can help you push updates on demand.

---

## What this project is

A small Next.js app that puts a Google Workspace login in front of a folder of HTML reports. Anyone with a `@4patriots.com` email can sign in. Anyone else gets bounced. Sessions last 72 hours.

- **GitHub repo:** https://github.com/ericbrinker-lgtm/4patriots-dashboard
- **Vercel project:** https://vercel.com/ericbrinker-8237s-projects/4patriots-dashboard
- **Live site:** https://4patriots-dashboard.vercel.app
- **Local folder:** `/Users/eric.brinker/Library/CloudStorage/GoogleDrive-eric.brinker@4patriots.com/My Drive/Incrementality/Geo Tests 2026/4patriots-dashboard`
- **Branch:** `main` (Vercel auto-deploys on every push to `main`)

The reports themselves live in `public/`. Drop a new HTML file in there, push, and it's live at `https://4patriots-dashboard.vercel.app/<filename>`. Adding a new file to the menu means editing `public/index.html` too.

---

## On-demand update workflow

### Trigger phrase

Say **"push the dashboard"** in any Cowork chat. Claude knows what that means.

### What Claude does when you say it

1. Checks the local folder (`4patriots-dashboard/`) to see what changed since the last commit. Most updates are new or edited files in `public/`.
2. Drafts a sensible commit message based on the diff. Examples that have been used: `Update HTML files in public folder`, `Add studies menu and dashboard files`, `Add dashboard.html`.
3. Hands you the exact terminal commands to run, with the absolute path baked in. You paste them into Terminal and confirm the output.
4. After you confirm the push went through, notes that Vercel will auto-deploy in 1–2 minutes.

### Why Claude can't run `git push` for you

The repo lives in a Google Drive–synced folder. The Cowork sandbox can read and write files there, but `git` itself fails on the Drive mount with errors like "not a git repository" or "Resource deadlock avoided". The fix is simple: you run the git commands from your own Terminal, where Drive's filesystem behaves normally.

### The actual commands (in case you want to run them yourself)

```bash
cd '/Users/eric.brinker/Library/CloudStorage/GoogleDrive-eric.brinker@4patriots.com/My Drive/Incrementality/Geo Tests 2026/4patriots-dashboard'
git status
git add public/
git commit -m "Update HTML files in public folder"
git push
```

Use `git add .` instead of `git add public/` if you've also touched files outside `public/` (rare — usually only when changing app code, env files, or this DEPLOY.md).

---

## Adding a new report to the live site

1. Save the HTML file into `public/` inside the project folder.
2. Open `public/index.html` and add a card or link pointing at the new file. The menu doesn't auto-discover files; you have to add the link by hand (or ask Claude to do it).
3. Tell Claude "push the dashboard" or run the git commands above.
4. Wait ~1–2 minutes for Vercel to build and deploy.
5. Visit `https://4patriots-dashboard.vercel.app/<your-new-file>.html` to confirm it loaded. The OAuth gate will sit in front of it.

Naming follows the global convention: `YYYY-MM-DD_[description].html` or the test-name format from CLAUDE.md.

---

## Vercel deploy details

### How auto-deploy works

Vercel watches the `main` branch on GitHub. Every push triggers a build:

1. Vercel clones the repo.
2. Runs `npm install` (deps come from `package.json`).
3. Runs `next build` (per `vercel.json`).
4. Promotes the new build to the production URL once it succeeds.

Build typically finishes in 25–35 seconds. Total time from `git push` to live is usually under 2 minutes.

### Build config (`vercel.json`)

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

Standard Next.js build. No custom steps.

### Environment variables (set in Vercel, not in the repo)

| Name | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SESSION_SECRET` | Random 32-byte string used to sign session JWTs |
| `NEXT_PUBLIC_BASE_URL` | `https://4patriots-dashboard.vercel.app` |

These live in Vercel → Project → Settings → Environment Variables. They are not in git. The `.env.local.example` file shows the shape but contains no real secrets. If you need to rotate any of these, change the value in Vercel and redeploy (any push will do, or click "Redeploy" on the latest deployment).

### Google OAuth setup (one-time, already done)

- Google Cloud Console project has an OAuth 2.0 client configured.
- Authorized redirect URI: `https://4patriots-dashboard.vercel.app/api/auth/callback`
- If the Vercel URL ever changes, this URI must be updated in Google Cloud Console too, or login will break with "redirect_uri_mismatch".

### Where each piece of auth logic lives

- `middleware.ts` — runs on every request, checks the session cookie, redirects to `/api/auth/google` if missing or invalid.
- `src/app/api/auth/google/route.ts` — kicks off the OAuth handshake.
- `src/app/api/auth/callback/route.ts` — receives Google's response, validates the email ends in `@4patriots.com`, mints a 72-hour JWT, sets a secure HttpOnly cookie, and redirects to `/index.html`.
- `src/app/page.tsx` — the homepage; verifies the session and redirects to `/index.html` (the menu).

---

## Troubleshooting

### Push gets rejected for "secret scanning"

GitHub blocks pushes that contain secrets. If this happens, the offending file (usually `.env.local.example` accidentally containing real values) needs to be cleaned up. Edit the file to use placeholders only, then `git commit --amend` and `git push --force`. This already happened during initial setup and is unlikely to recur unless secrets get pasted into a tracked file by mistake.

### Vercel builds the old commit

The Vercel webhook usually fires within seconds, but occasionally it lags. If you see Vercel still building the previous commit a few minutes after pushing:

1. Refresh the Vercel deployments page.
2. If still stale, click the three dots on the latest deployment and choose "Redeploy".

### Login redirects to a 404

Likely cause: the post-login redirect target was renamed or deleted. The callback redirects to `/index.html` by default. If `public/index.html` is missing or renamed, login will land on a 404. Restore or recreate the menu file and push.

### "Only 4patriots.com email addresses are allowed"

You signed in with the wrong Google account. Sign out of all Google accounts in the browser, or use an incognito window, and sign in with your `@4patriots.com` work email.

### TypeScript build errors on Vercel

Already happened once during initial setup (`moduleResolution=node10` deprecation). Fix is to update `tsconfig.json` and push. If a new TypeScript error appears, the build log on Vercel will name the exact file and line.

### Sandbox can't run `git` on the Drive path

Expected and documented above. Run git from Terminal instead.

---

## File map

```
4patriots-dashboard/
├── public/                          ← drop new HTML reports here
│   ├── index.html                   ← the menu (edit when adding reports)
│   ├── demand_gen_heavyupdate-*.html
│   ├── search_pmax_holdout_update-*.html
│   ├── audiohook_holdout_*.html
│   └── ...
├── src/app/
│   ├── page.tsx                     ← homepage (redirects to /index.html)
│   ├── layout.tsx
│   ├── api/auth/google/route.ts     ← OAuth start
│   └── api/auth/callback/route.ts   ← OAuth finish, sets cookie
├── middleware.ts                    ← auth gate on every request
├── package.json                     ← Next.js 14, jose for JWTs
├── vercel.json                      ← build config
├── tsconfig.json
├── .env.local.example               ← shape only, no real secrets
├── .env.local                       ← gitignored, real secrets for local dev
├── .gitignore
├── README.md                        ← short intro
├── SETUP.md                         ← original setup walkthrough
└── DEPLOY.md                        ← this file
```

---

## Initial setup history (reference)

- **2026-04-20** — Project scaffolded as a Next.js 14 app with Google Workspace OAuth, gated to `@4patriots.com`. Initial commit pushed to GitHub. Vercel imported the repo and deployed.
- Same day — Fixed a TypeScript deprecation warning that broke the first Vercel build, added the studies menu (`public/index.html`), changed the post-login redirect from `/dashboard.html` to `/index.html`, and removed the unused `src/app/dashboard/` route.
- Since then — Updates have been small: new HTML reports added to `public/`, menu updated, push, Vercel auto-deploys.

The full setup conversation is in Cowork session `local_9b197aaf-295b-4738-b64c-fdc456c9c00e` ("Find free web hosting for HTML files"), and the first proper update push is in `local_e52a2f13-7c2c-4753-9379-77568e886ff3` ("Publish dashboard to repository"). Worth a glance if you ever need to reconstruct why something is the way it is.

---

## Quick reference card

| What you want to do | What to say or run |
|---|---|
| Push your local changes live | "push the dashboard" |
| Add a new report | Drop HTML in `public/`, edit `public/index.html`, then "push the dashboard" |
| Rotate the OAuth secret | Update in Google Cloud Console → update in Vercel → trigger any push to redeploy |
| Change the live URL | Update `NEXT_PUBLIC_BASE_URL` in Vercel + add new redirect URI in Google Cloud Console |
| See what's about to be pushed | `cd` into the folder and run `git status` |

---

*Last updated: 2026-04-27*
*Maintained by: Eric Brinker, Director of Advertising, Channel Strategy & Innovation*
