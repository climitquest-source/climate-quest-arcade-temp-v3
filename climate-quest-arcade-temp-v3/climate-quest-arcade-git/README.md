# Climate Quest - Arcade (Git Ready)

Static HTML/CSS/JS trivia game. No build step.

## Run local
- `python3 -m http.server 8000` then open http://localhost:8000
- or `npx serve`

## Cloudflare Pages (Git)
1. Create a new Pages project from your Git repo.
2. Framework preset: **None**
3. Build command: **leave blank** *(or set to `exit 0`)*
4. Build output directory: **.**
5. Root directory: **/** (repo root with `index.html`)
6. Environment variables: none
7. Deploy

If you created a project with a wrong build step: Project → Settings → Build & deploy → set **Build command** blank and **Output directory** to `.`. Re-deploy.

## Cloudflare Pages (Direct upload)
- Project → Create new deployment → **Direct upload** → upload the **files/folder**, not a zip.

## Wrangler CLI (optional)
```bash
npx wrangler login
npx wrangler pages deploy . --project-name <your-project-name>
```

## Files
- `index.html` — app shell
- `styles.css` — base styles
- `app.js` — game logic with timer, streaks, scoring, localStorage
- `assets/` — icons and og image
- `.nojekyll` — harmless; helps if you mirror to GitHub Pages

## Notes
- Paths are relative: `styles.css`, `app.js`, `assets/icon.png`.
- No SPA routing; no redirects needed.
- To add a shared leaderboard, set your Google Form URL in `CONFIG.GOOGLE_FORM_ACTION` inside `app.js` and map your `entry.*` IDs.
