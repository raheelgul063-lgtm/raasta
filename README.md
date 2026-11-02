# Raasta (راستہ)

Free help for Pakistani students applying to German universities. The journey: **find a program** (filters for field, degree, fees, duration, intake, deadline, state) → read what you need and go to the official page → track applications and documents → motivation letter for that exact program → after admission, AI visa assistant and mock interviews.

## Status (2 Nov 2026)

| Part | Status |
|---|---|
| Supabase project `Raasta` (Frankfurt), ref `uutsrmaomrfbnewgisqs` | Live, all tables and security rules applied |
| Programs database | 36 programs seeded from DAAD MyGUIDE |
| Admin | raheelgul063@gmail.com is in the `admins` table |
| AI function `ai` | Deployed. Needs the `ANTHROPIC_API_KEY` secret (Supabase > Edge Functions > Secrets) |
| `config.js` | Already points to the live project |
| Google login | You must switch it on (section 2, Google login) |
| Hosting | Push to GitHub Pages (section 4) |

**Stack:** static site on GitHub Pages, Supabase (login, database, Edge Function), Claude API (only inside the Edge Function).

```
raasta/
  index.html, styles.css, app.js   the website (no build step)
  config.js                         your Supabase URL + anon key (already filled in)
  programs.js                       starter program database (also the offline fallback)
  data/build_programs.py            source of the program data; rebuilds programs.js and the seed SQL
  supabase/seed_programs.sql        inserts the programs into Supabase
  supabase/schema.sql               tables, security rules, daily AI limit
  supabase/functions/ai/index.ts    the AI backend (holds the Claude key)
```

## 1. Try it locally

Open the folder and run `python3 -m http.server 8000`, then visit http://localhost:8000. It uses the live database. To preview without Supabase, empty the two values in `config.js` (Demo mode).

## Adding more programs

Option A (quick): Supabase **Table Editor > programs > Insert row**. Required: university, program, degree (`Master` or `Bachelor`), field (use one of the field names already in the table), url (official page). Deadlines go in `deadline_winter` / `deadline_summer` as `MM-DD` (non EU deadline). `tuition` is EUR per semester for non EU students: `0` = free, empty = "check page".

Option B (bulk): add entries in `data/build_programs.py`, run `python3 data/build_programs.py`, then run the new `supabase/seed_programs.sql` in the SQL Editor.

Only add facts you checked on the official page, and update `verified_on`. Wrong deadlines cost students a whole semester.

## 2. Supabase: database and login (about 20 minutes)

Steps 1 to 4 are already done for the `Raasta` project. For a fresh project: create it (Frankfurt), run `supabase/schema.sql` then `supabase/seed_programs.sql` in the SQL Editor, add your email to `admins`, and copy the URL and anon key into `config.js`.

Still to do: set `CONTACT_EMAIL` in `config.js` (shown on the privacy page), then:

5. **Authentication > URL Configuration**: Site URL = your GitHub Pages address (step 4 below), and add the same address to Redirect URLs.

### Sign in with a 6 digit code (OTP)

The website asks for the email, sends a code and checks it. For the email to contain the code, set both templates in Supabase **Authentication > Emails > Templates**:
- **Magic Link**: subject `Your Raasta code`, body: the content of `supabase/email-templates/code-email.html`
- **Confirm signup**: same subject and body

### Google login

1. Go to console.cloud.google.com, create a project called Raasta.
2. **APIs & Services > OAuth consent screen**: External, app name Raasta, your email, add your privacy page link `https://YOUR_GITHUB_NAME.github.io/raasta/#/privacy`. Publish the app (otherwise only test users can log in).
3. **Credentials > Create credentials > OAuth client ID > Web application**.
   - Authorized JavaScript origins: `https://YOUR_GITHUB_NAME.github.io`
   - Authorized redirect URI: copy it from Supabase **Authentication > Sign In / Providers > Google** (looks like `https://abcdxyz.supabase.co/auth/v1/callback`).
4. Paste the Google Client ID and Client Secret into Supabase **Authentication > Sign In / Providers > Google** and enable it. The Google button then appears on the site automatically (no code change needed).

Email login links also work out of the box. Supabase's built in email sender is limited to a few emails per hour, so for the Facebook test most people should use Google. Later, connect a free Resend account under **Authentication > Emails > SMTP** for unlimited email logins.

### Where student data is stored

All in your Supabase project (Table Editor):

| Table | What |
|---|---|
| `auth.users` | Login accounts (email, Google name) |
| `profiles` | Name, city, province, field, degree level, intake |
| `applications` | Universities each student tracks |
| `checklist_items` | Ticked documents |
| `ai_usage` | AI credits used per student per day |
| `feedback` | Ratings and messages from the feedback button |
| `admins` | Emails allowed to open the admin dashboard |
| `programs` | University finder data (public, read only) |
| `saved_programs` | Each student's shortlist |

Chat messages and letters are **not** stored, by design (privacy and cost).

## 3. AI function

The function is already deployed. Only the key is missing:

1. Get a Claude API key at console.anthropic.com and set a monthly spend limit there (start with $20).
2. Supabase **Edge Functions > Secrets > Add secret**: name `ANTHROPIC_API_KEY`, value your key. Optionally add `ALLOWED_ORIGIN` = `https://YOUR_GITHUB_NAME.github.io`.
3. Open `#/admin` on your site: "AI assistant" should show **Live**.

To redeploy after editing the function, with the Supabase CLI from the `raasta` folder:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set ALLOWED_ORIGIN=https://YOUR_GITHUB_NAME.github.io
supabase functions deploy ai
```

Optional secrets: `DAILY_CREDITS` (default 30 per student per day; a chat message costs 1, a letter costs 5), `MODEL_FAST` (default `claude-haiku-5-5`), `MODEL_WRITER` (default `claude-sonnet-5-5`).

## 4. GitHub Pages

1. Create a public repo, e.g. `raasta`, and push these files (the `supabase` folder can stay in the repo, it contains no secrets).
2. **Settings > Pages > Deploy from branch > main / root**.
3. Your site is live at `https://YOUR_GITHUB_NAME.github.io/raasta/`. Put this address into Supabase (step 2.3) and `ALLOWED_ORIGIN` (step 3).

## 5. Check the current state of the product

Open `https://YOUR_GITHUB_NAME.github.io/raasta/#/admin` and log in with your admin email. It shows:
- System status: database, login, and whether the AI assistant is live (API key set)
- Students, profiles completed, AI users today, AI credits this week, universities tracked, feedback with average rating
- Sign ups for the last 14 days, fields, provinces, top universities
- Latest feedback and newest students

Only emails in the `admins` table can see it. Everyone else gets "not an admin".

## 6. Facebook group test

- Share the link with a short post: what it does, that it's free, and ask for feedback in the comments.
- Watch everything on the admin dashboard (step 5). Ask people to use the yellow Feedback button.
- Rough cost: a visa chat message on Haiku costs well under one cent; a letter on Sonnet a few cents. 500 active students per day at full limit is the worst case; real use is far lower. The Anthropic spend limit is your safety net.

## Keeping it accurate

Visa facts live in one place: `VISA_FACTS` in `supabase/functions/ai/index.ts`, plus the checklist and roadmap at the top of `app.js`. Check the official page monthly and redeploy with `supabase functions deploy ai`:
https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104

## Notes and next steps

German law: a public site run from Germany usually needs an Impressum (legal notice). Add one before you promote it widely.

Grow the program database toward the full DAAD list (about 2,000 English taught programs). Urdu interface toggle, deadline reminder emails, blocked account and insurance partner links for revenue.

## Security

What protects student data today:
- **Row Level Security on every table.** A student can only read and change their own rows. Tested: a logged in attacker cannot read or write other students' data, cannot call the admin stats, cannot edit programs and cannot read the admin list.
- **Secrets stay on the server.** The Claude API key is only a Supabase secret. The anon key in `config.js` is public by design and only allows what the security rules allow.
- **Abuse limits.** 30 AI credits per student per day, max 40 tracked universities, 100 saved programs and 20 feedback messages per day per student. Feedback needs login.
- **Website hardening.** Content Security Policy (only our own scripts run), Supabase library bundled in `/vendor` (no third party CDN at runtime), all user text escaped, links limited to http(s).
- **Privacy by design.** No passwords stored (email link login), no chat or letter text stored, data hosted in the EU (Frankfurt).

What you should do:
1. Turn on two factor login for your **GitHub**, **Supabase** and **Anthropic** accounts. These three accounts are the keys to everything.
2. Never share the Supabase `service_role` key or database password with anyone, and never put them in this repo.
3. Supabase **Authentication > Attack Protection**: enable CAPTCHA (Cloudflare Turnstile is free) before you promote widely, to stop bot sign ups.
4. Supabase **Authentication > Emails > SMTP**: connect a sender (Resend free tier). The built in sender only allows a few login emails per hour.
5. Keep the Anthropic monthly spend limit on.


## Program catalog (DAAD import)

About 2,100 international Bachelor's and Master's programs come from the DAAD International Programmes database (all teaching languages).
- Importer: `supabase/functions/daad-import` (no JWT; protected by a private token stored in `public.app_secrets`, readable only by the service role).
- It is run from a browser tab on www2.daad.de (the DAAD search API only answers same-origin requests). Hand-checked programs (`curated = true`) are never overwritten.
- After a full run, call the function with `{ action: "finish", since: "<run date>" }` to deactivate programs DAAD no longer lists.
- The AI advisor gets only the 40 most relevant programs per question through `public.match_programs(q, lim)` (full text search).
