# Climate Quest - Arcade (Modes)

This build adds three modes + a live leaderboard:
- **Single player**
- **Group live (event)** — submit scores to Google Form + show a live leaderboard from a published Google Sheet CSV
- **Pass & Play (hotseat)** — multiple players on one device, sequential rounds with a summary

## Cloudflare Pages
Deploy as a static site. No build step. Root folder should contain:
```
index.html
styles.css
app.js
assets/
.nojekyll (optional)
```

## Group live setup (Google Form + Sheet)
1. Create a **Google Form** with fields in this order and names exactly:
   - Event Code
   - Team
   - Nickname
   - Score
   - CorrectTotal
   - ISO Date
2. Get the Form `formResponse` URL and paste into `CONFIG.GOOGLE_FORM_ACTION` in `app.js`.
3. Open the linked **Google Sheet** → File → **Share** → **Publish to the web** → format **CSV** for the responses sheet. Copy the CSV link into `CONFIG.SHEET_CSV_URL`.
4. Optional: paste your Sheet view link into `CONFIG.GOOGLE_SHEET_URL` to expose a quick link in the app.
5. Finally, edit the `entry.******` IDs in `submitScoreToGoogleForm()` to match your Form field IDs.

## Scoreboard screen
- Enter the Event Code and choose **Individuals** or **Teams**, then Load.
- Use **Auto-refresh** during events.

## Pass & Play
- Choose **Pass & Play** on Home.
- Enter comma-separated names.
- Each player plays a round on the same device; a summary table shows at the end.
