# Climate Quest - Arcade (Temp Build)
A tiny static trivia game to test the core loop. No backend required.

## Files
- `index.html` — single-page app with Home, Game, and Result screens.
- `styles.css` — white theme, mobile-first.
- `app.js` — game logic, 12 starter questions, localStorage, helpers, and optional Google Form submit.
- `assets/` — icons/OG image placeholders.

## Run locally
Open `index.html` in a browser. For best results, serve over a local web server:

- Python: `python3 -m http.server 8000`
- Node: `npx serve`

Then visit `http://localhost:8000`.

## Deploy
Works on any static host:
- Cloudflare Pages
- GitHub Pages
- Netlify
- Vercel (static)

Just upload the folder or connect your repo.

## Event leaderboard (optional)
1. Create a Google Form with fields: Event Code, Nickname, Score, Correct/Total, ISO Date.
2. Click *Get pre-filled link* to identify `entry.xxxxx` IDs, or view page source to copy them.
3. Set in `app.js`:
   ```js
   CONFIG.GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/.../formResponse";
   CONFIG.GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/...";
   ```
4. Map the `data.append("entry.XXXX", ...)` lines to your fields.

## Add more questions
Add objects to the `QUESTIONS` array in `app.js`. Keep `explain` short (1 sentence) and add a helpful `hint`.
