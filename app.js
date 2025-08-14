// Climate Quest - Arcade (Modes)
const CONFIG = {
  QUESTION_TIME: 12,
  BASE_POINTS: 100,
  TIME_BONUS_PER_SEC: 5,
  STREAK_STEP: 0.2,
  STREAK_MAX: 2.0,
  HELPERS_PER_GAME: { fifty: 1, hint: 1 },
  GOOGLE_FORM_ACTION: "", // set to your Google Form formResponse URL to submit scores
  GOOGLE_SHEET_URL: "",   // optional: link to your sheet for quick access
  SHEET_CSV_URL: ""       // publish your responses sheet as CSV and paste URL here for live leaderboard
};

// Starter questions
const QUESTIONS = [
  { id:"E1", category:"Energy", difficulty:1, type:"single",
    question:"Which appliance uses the most electricity in a typical home?",
    choices:["Fridge","LED bulb","Phone charger","Wi-Fi router"], answerIndex:0,
    hint:"It runs 24/7.", explain:"Fridges run constantly, so their total use is higher than tiny loads like LEDs or chargers."
  },
  { id:"E2", category:"Energy", difficulty:1, type:"single",
    question:"Which saves more energy over a year?",
    choices:["Switch to LED bulbs","Unplug phone charger nightly","Turn off Wi-Fi nightly","Lower fridge temp a bit more"],
    answerIndex:0, hint:"Lighting can be a big share if you have many bulbs.",
    explain:"LEDs cut lighting energy across many fixtures, beating tiny 'vampire' loads."
  },
  { id:"F1", category:"Food", difficulty:1, type:"single",
    question:"Which meal generally has the lowest carbon footprint?",
    choices:["Beef burger","Chicken wrap","Veggie bean bowl","Cheese omelette"],
    answerIndex:2, hint:"Plants usually win.", explain:"Plant-based meals, especially beans and lentils, have much lower emissions than beef."
  },
  { id:"F2", category:"Food", difficulty:2, type:"single",
    question:"Which change helps most if you eat beef often?",
    choices:["Smaller portions","Switch to chicken often","Cook with olive oil","Add dessert"],
    answerIndex:1, hint:"Swap the protein.", explain:"Shifting from beef to chicken or plant proteins cuts emissions more than small tweaks."
  },
  { id:"W1", category:"Waste", difficulty:1, type:"single",
    question:"Best way to cut plastic waste from drinks?",
    choices:["Buy bigger bottles","Use a reusable bottle","Recycle more","Crush bottles before binning"],
    answerIndex:1, hint:"Refill beats single use.", explain:"Refilling a durable bottle prevents new plastic from being made."
  },
  { id:"W2", category:"Waste", difficulty:2, type:"single",
    question:"Which item is usually NOT recyclable curbside?",
    choices:["Aluminum can","Cardboard box","Plastic film/bag","Paper newspaper"],
    answerIndex:2, hint:"It’s thin and flexible.", explain:"Plastic film often needs special drop-off; curbside programs usually reject it."
  },
  { id:"Wa1", category:"Water", difficulty:1, type:"single",
    question:"Quickest way to save water while showering?",
    choices:["Shorter showers","Switch to soap bars","Sing quietly","Lower water heater temp"],
    answerIndex:0, hint:"Time matters most.", explain:"Every minute less saves hot water and the energy to heat it."
  },
  { id:"T1", category:"Transport", difficulty:1, type:"single",
    question:"Which trip cuts the most emissions this week?",
    choices:["One carpool ride","One bike trip instead of car","One bus ride","One fast EV charge"],
    answerIndex:1, hint:"Replacing a car trip helps most.", explain:"A single bike trip replacing a short car ride can avoid noticeable CO₂."
  },
  { id:"T2", category:"Transport", difficulty:2, type:"single",
    question:"Which driving habit saves the most fuel?",
    choices:["Warm up car for 10 min","Gentle acceleration","Windows down on highway","Higher octane fuel"],
    answerIndex:1, hint:"Smooth and steady.", explain:"Gentle acceleration and steady speeds reduce fuel use."
  },
  { id:"J1", category:"Justice", difficulty:1, type:"single",
    question:"Climate justice means:",
    choices:["Fines for littering","Equal impact everywhere","Fairness so burdens don’t fall on vulnerable groups","Only planting trees"],
    answerIndex:2, hint:"Focus on fairness.", explain:"It’s about fair treatment and sharing benefits and burdens."
  },
  { id:"M1", category:"Mixed", difficulty:2, type:"single",
    question:"Which home upgrade usually saves the most energy first?",
    choices:["More insulation","New decor","Bigger TV","Louder speakers"],
    answerIndex:0, hint:"Stop heat from leaking.", explain:"Insulation reduces heating/cooling demand, often the biggest loads."
  },
  { id:"M2", category:"Mixed", difficulty:3, type:"single",
    question:"Best place to start cutting your footprint is often:",
    choices:["Guess randomly","Measure your usage","Change only on holidays","Buy more gadgets"],
    answerIndex:1, hint:"What gets measured gets managed.", explain:"Tracking energy, travel, and food habits points to the biggest wins."
  }
];

// State
let state = {
  mode: "solo",          // solo | group | hotseat
  nickname: "Player",
  teamName: "",
  eventCode: "",
  category: "mixed",
  totalQuestions: 10,
  index: 0,
  score: 0,
  streak: 0,
  longestStreak: 0,
  timeLeft: CONFIG.QUESTION_TIME,
  timer: null,
  used: { fifty: 0, hint: 0 },
  pool: [],
  current: null,
  correctCount: 0,
  hotseat: null,         // { players:[], i:0, results:[] }
  sbTimer: null          // scoreboard auto refresh
};

// DOM helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// Screens
const S = {
  home: $("#screen-home"),
  game: $("#screen-game"),
  result: $("#screen-result"),
  sb: $("#screen-scoreboard"),
  help: $("#helpDialog")
};

// Home inputs
const modeEl = $("#mode");
const nicknameEl = $("#nickname");
const teamRow = $("#teamRow");
const teamNameEl = $("#teamName");
const playersRow = $("#playersRow");
const playersListEl = $("#playersList");
const eventCodeEl = $("#eventCode");
const categoryEl = $("#category");
const numQuestionsEl = $("#numQuestions");
const bestScoreEl = $("#bestScore");
const badgeListEl = $("#badgeList");
const topScoresLink = $("#topScoresLink");

// HUD
const hudNickname = $("#hud-nickname");
const hudCategory = $("#hud-category");
const hudTime = $("#hud-time");
const hudStreak = $("#hud-streak");
const hudScore = $("#hud-score");

// Game elems
const qText = $("#qText");
const choicesEl = $("#choices");
const btn5050 = $("#btn-5050");
const btnHint = $("#btn-hint");
const left5050 = $("#left-5050");
const leftHint = $("#left-hint");

// Results
const resScore = $("#res-score");
const resCorrect = $("#res-correct");
const resTotal = $("#res-total");
const resStreak = $("#res-streak");
const resBadges = $("#res-badges");
const resSubmitNote = $("#res-submit-note");
const hotseatSummary = $("#hotseat-summary");
const btnNextPlayer = $("#btn-next-player");

// Scoreboard
const sbEventEl = $("#sbEvent");
const sbModeEl = $("#sbMode");
const sbStatus = $("#sbStatus");
const sbTableWrap = $("#sbTableWrap");
const btnLoadSb = $("#btn-load-sb");
const btnAutoSb = $("#btn-auto-sb");

// Buttons
$("#btn-help").addEventListener("click", () => S.help.showModal());
$("#btn-close-help").addEventListener("click", () => S.help.close());
$("#btn-play").addEventListener("click", startGame);
$("#btn-open-scoreboard").addEventListener("click", () => { showScreen("sb"); });
$("#btn-home").addEventListener("click", () => showScreen("home"));
$("#btn-scoreboard-home").addEventListener("click", () => showScreen("home"));
$("#btn-play-again").addEventListener("click", () => showScreen("home"));
btnNextPlayer.addEventListener("click", nextHotseatPlayer);
btn5050.addEventListener("click", use5050);
btnHint.addEventListener("click", useHint);
btnLoadSb.addEventListener("click", loadLeaderboard);
btnAutoSb.addEventListener("click", toggleAutoSb);

// Mode UI
modeEl.addEventListener("change", () => {
  const m = modeEl.value;
  teamRow.hidden = m !== "group";
  playersRow.hidden = m !== "hotseat";
});

// Init
(function init() {
  bestScoreEl.textContent = String(+localStorage.getItem("cq_bestScore") || 0);
  nicknameEl.value = localStorage.getItem("cq_nickname") || "";
  eventCodeEl.value = localStorage.getItem("cq_eventCode") || "";
  teamNameEl.value = localStorage.getItem("cq_teamName") || "";
  const badges = JSON.parse(localStorage.getItem("cq_badges") || "[]");
  renderBadges(badges);

  if (CONFIG.GOOGLE_SHEET_URL) {
    topScoresLink.href = CONFIG.GOOGLE_SHEET_URL;
    topScoresLink.classList.remove("disabled");
  }
})();

function renderBadges(badges) {
  badgeListEl.innerHTML = "";
  const names = badges.length ? badges : ["None yet"];
  names.forEach(b => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = b;
    badgeListEl.appendChild(span);
  });
}

function showScreen(name) {
  // stop scoreboard timer if leaving
  if (name !== "sb" && state.sbTimer) {
    clearInterval(state.sbTimer);
    state.sbTimer = null;
    btnAutoSb.textContent = "Auto-refresh: Off";
  }
  [S.home, S.game, S.result, S.sb].forEach(s => s.classList.remove("active"));
  if (name === "home") S.home.classList.add("active");
  if (name === "game") S.game.classList.add("active");
  if (name === "result") S.result.classList.add("active");
  if (name === "sb") S.sb.classList.add("active");
}

// Game flow
function startGame() {
  state.mode = modeEl.value;
  state.nickname = (nicknameEl.value || "Player").trim().slice(0,18);
  state.teamName = (teamNameEl.value || "").trim().slice(0,22);
  state.eventCode = (eventCodeEl.value || "").trim().toUpperCase().slice(0,20);
  state.category = categoryEl.value;
  state.totalQuestions = +numQuestionsEl.value || 10;

  localStorage.setItem("cq_nickname", state.nickname);
  localStorage.setItem("cq_eventCode", state.eventCode);
  localStorage.setItem("cq_teamName", state.teamName);

  // Hotseat setup
  if (state.mode === "hotseat") {
    const raw = (playersListEl.value || "").split(",").map(s => s.trim()).filter(Boolean);
    if (!state.hotseat || !state.hotseat.players?.length) {
      state.hotseat = { players: raw.length ? raw : [state.nickname], i: 0, results: [] };
    }
    state.nickname = state.hotseat.players[state.hotseat.i] || state.nickname;
  } else {
    state.hotseat = null;
  }

  // Build pool
  let pool = QUESTIONS;
  if (state.category !== "mixed") pool = QUESTIONS.filter(q => q.category === state.category);
  state.pool = shuffle([...pool]).slice(0, state.totalQuestions);

  // Reset round
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.longestStreak = 0;
  state.used = { fifty: 0, hint: 0 };
  state.correctCount = 0;

  // HUD
  hudNickname.textContent = state.nickname;
  hudCategory.textContent = state.category === "mixed" ? "Mixed" : state.category;
  hudScore.textContent = "0"; hudStreak.textContent = "0";
  left5050.textContent = CONFIG.HELPERS_PER_GAME.fifty - state.used.fifty;
  leftHint.textContent = CONFIG.HELPERS_PER_GAME.hint - state.used.hint;

  showScreen("game");
  nextQuestion();
}

function nextQuestion() {
  clearInterval(state.timer);
  if (state.index >= state.pool.length) return endGame();

  state.current = state.pool[state.index++];
  state.timeLeft = CONFIG.QUESTION_TIME;

  qText.textContent = `Q${state.index}. ${state.current.question}`;
  renderChoices(state.current);

  hudTime.textContent = String(state.timeLeft);
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    hudTime.textContent = String(state.timeLeft);
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      lockChoices();
      markChoice(null);
      setTimeout(nextQuestion, 700);
    }
  }, 1000);
}

function renderChoices(q) {
  choicesEl.innerHTML = "";
  q.choices.forEach((text, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = text;
    btn.dataset.index = String(idx);
    btn.addEventListener("click", () => choose(idx));
    choicesEl.appendChild(btn);
  });
}

function lockChoices() {
  $$(".choice").forEach(c => c.disabled = true);
}

function choose(idx) {
  if (state.timeLeft <= 0) return;
  clearInterval(state.timer);
  lockChoices();
  const correct = idx === state.current.answerIndex;
  markChoice(idx);
  if (correct) {
    state.streak += 1;
    state.longestStreak = Math.max(state.longestStreak, state.streak);
    state.correctCount += 1;
    const mult = Math.min(1 + state.streak * CONFIG.STREAK_STEP, 1 + CONFIG.STREAK_MAX);
    const add = Math.round((CONFIG.BASE_POINTS + state.timeLeft * CONFIG.TIME_BONUS_PER_SEC) * mult);
    state.score += add;
  } else {
    state.streak = 0;
  }
  hudScore.textContent = String(state.score);
  hudStreak.textContent = String(state.streak);
  setTimeout(nextQuestion, 650);
}

function markChoice(chosenIdx) {
  $$(".choice").forEach((btn, idx) => {
    const isCorrect = idx === state.current.answerIndex;
    if (idx === chosenIdx && isCorrect) btn.classList.add("correct");
    else if (idx === chosenIdx && !isCorrect) btn.classList.add("wrong");
    if (isCorrect) btn.classList.add("correct");
  });
  qText.textContent = state.current.explain;
}

function use5050() {
  if (state.used.fifty >= CONFIG.HELPERS_PER_GAME.fifty) return;
  if (!state.current) return;
  const wrongs = $$(".choice").filter((b, idx) => idx !== state.current.answerIndex);
  shuffle(wrongs).slice(0,2).forEach(b => { b.disabled = true; b.style.opacity = 0.5; });
  state.used.fifty += 1;
  left5050.textContent = CONFIG.HELPERS_PER_GAME.fifty - state.used.fifty;
}

function useHint() {
  if (state.used.hint >= CONFIG.HELPERS_PER_GAME.hint) return;
  if (!state.current) return;
  const prev = qText.textContent;
  qText.textContent = "Hint: " + (state.current.hint || "Think about the biggest effect.");
  setTimeout(() => { qText.textContent = prev; }, 2200);
  state.used.hint += 1;
  leftHint.textContent = CONFIG.HELPERS_PER_GAME.hint - state.used.hint;
}

function endGame() {
  clearInterval(state.timer);
  showScreen("result");

  resScore.textContent = String(state.score);
  resCorrect.textContent = String(state.correctCount);
  resTotal.textContent = String(state.pool.length);
  resStreak.textContent = String(state.longestStreak);

  // Best score
  const best = +localStorage.getItem("cq_bestScore") || 0;
  if (state.score > best) {
    localStorage.setItem("cq_bestScore", String(state.score));
    bestScoreEl.textContent = String(state.score);
  }

  // Badges
  const badges = new Set(JSON.parse(localStorage.getItem("cq_badges") || "[]"));
  if (state.category !== "mixed" && state.correctCount >= Math.ceil(state.pool.length * 0.7)) {
    badges.add(state.category + " Badge");
  }
  localStorage.setItem("cq_badges", JSON.stringify(Array.from(badges)));
  resBadges.innerHTML = "";
  Array.from(badges).forEach(name => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = name;
    resBadges.appendChild(span);
  });

  // Hotseat flow
  btnNextPlayer.style.display = "none";
  hotseatSummary.innerHTML = "";
  if (state.mode === "hotseat" && state.hotseat) {
    state.hotseat.results.push({ name: state.nickname, score: state.score, correct: state.correctCount });
    if (state.hotseat.i < state.hotseat.players.length - 1) {
      resSubmitNote.textContent = `Pass the device to ${state.hotseat.players[state.hotseat.i+1]}.`;
      btnNextPlayer.style.display = "inline-block";
    } else {
      // Show summary table
      const rows = state.hotseat.results
        .sort((a,b)=>b.score-a.score)
        .map((r,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(r.name)}</td><td>${r.score}</td><td>${r.correct}</td></tr>`)
        .join("");
      hotseatSummary.innerHTML = `<div class="table-wrap"><table><thead><tr><th>#</th><th>Player</th><th>Score</th><th>Correct</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      resSubmitNote.textContent = "Hotseat round complete.";
      // Clear after showing
      state.hotseat = null;
    }
  } else {
    // Group score submit
    if (state.mode === "group" && CONFIG.GOOGLE_FORM_ACTION && state.eventCode) {
      submitScoreToGoogleForm(state).then(ok => {
        resSubmitNote.textContent = ok ? "Score submitted to event sheet." : "Could not submit score. You can still screenshot and share.";
      });
    } else if (state.mode === "group" && state.eventCode) {
      resSubmitNote.textContent = "Event code entered, but no score form is configured yet.";
    } else {
      resSubmitNote.textContent = "Tip: Use Group mode with an event code to submit scores to a shared sheet.";
    }
  }
}

function nextHotseatPlayer() {
  if (!state.hotseat) return;
  state.hotseat.i += 1;
  startGame();
}

// Google Form submit (edit entry.* to your form field IDs)
async function submitScoreToGoogleForm(st) {
  try {
    const data = new FormData();
    // Adjust these entry.* IDs to match your Google Form fields:
    data.append("entry.1111111111", st.eventCode);          // Event Code
    data.append("entry.2222222222", st.teamName);           // Team
    data.append("entry.3333333333", st.nickname);           // Nickname
    data.append("entry.4444444444", String(st.score));      // Score
    data.append("entry.5555555555", `${st.correctCount}/${st.pool.length}`); // Correct/Total
    data.append("entry.6666666666", new Date().toISOString()); // ISO Date

    await fetch(CONFIG.GOOGLE_FORM_ACTION, { method: "POST", mode: "no-cors", body: data });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Live leaderboard (CSV from published Google Sheet)
async function loadLeaderboard() {
  const url = CONFIG.SHEET_CSV_URL;
  const event = sbEventEl.value.trim().toUpperCase();
  const viewMode = sbModeEl.value; // individuals | teams
  if (!url) { sbStatus.textContent = "Set CONFIG.SHEET_CSV_URL first."; return; }
  if (!event) { sbStatus.textContent = "Enter an event code."; return; }
  sbStatus.textContent = "Loading...";
  try {
    const res = await fetch(url, { cache: "no-store" });
    const csv = await res.text();
    const rows = parseCSV(csv);
    // Expect headers: Event Code, Team, Nickname, Score, CorrectTotal, ISO Date
    const header = rows[0].map(s=>s.trim());
    const H = Object.fromEntries(header.map((h,i)=>[h,i]));
    const data = rows.slice(1).filter(r => r[H["Event Code"]] && r[H["Event Code"]].toUpperCase() === event);

    if (viewMode === "individuals") {
      const items = data.map(r => ({
        team: r[H["Team"]] || "",
        name: r[H["Nickname"]] || "",
        score: Number(r[H["Score"]] || 0),
        ct: r[H["CorrectTotal"]] || "",
        ts: r[H["ISO Date"]] || ""
      })).sort((a,b)=>b.score-a.score).slice(0,20);

      renderTable(["#", "Name", "Team", "Score", "Correct", "Time"], items.map((it,i)=>[i+1, it.name, it.team, it.score, it.ct, new Date(it.ts).toLocaleTimeString()]));
      sbStatus.textContent = `Top ${items.length} for ${event}`;
    } else {
      // Teams aggregate
      const teams = {};
      data.forEach(r => {
        const team = (r[H["Team"]] || "—").trim();
        const score = Number(r[H["Score"]] || 0);
        const ct = (r[H["CorrectTotal"]] || "0/0");
        teams[team] = teams[team] || { team, score:0, plays:0, correct:0, total:0 };
        teams[team].score += score; teams[team].plays += 1;
        const m = ct.match(/(\d+)\s*\/\s*(\d+)/);
        if (m) { teams[team].correct += +m[1]; teams[team].total += +m[2]; }
      });
      const arr = Object.values(teams).sort((a,b)=>b.score-a.score).slice(0,20);
      renderTable(["#", "Team", "Plays", "Total Score", "Correct"], arr.map((t,i)=>[i+1, t.team, t.plays, t.score, `${t.correct}/${t.total}`]));
      sbStatus.textContent = `Teams for ${event}`;
    }
  } catch (e) {
    console.error(e);
    sbStatus.textContent = "Failed to load sheet.";
  }
}

function toggleAutoSb() {
  if (state.sbTimer) {
    clearInterval(state.sbTimer);
    state.sbTimer = null;
    btnAutoSb.textContent = "Auto-refresh: Off";
  } else {
    state.sbTimer = setInterval(loadLeaderboard, 5000);
    btnAutoSb.textContent = "Auto-refresh: On";
    loadLeaderboard();
  }
}

function renderTable(headers, rows) {
  const thead = "<thead><tr>" + headers.map(h=>`<th>${escapeHtml(h)}</th>`).join("") + "</tr></thead>";
  const tbody = "<tbody>" + rows.map(r=>"<tr>"+r.map(c=>`<td>${escapeHtml(String(c))}</td>`).join("")+"</tr>").join("") + "</tbody>";
  sbTableWrap.innerHTML = `<table>${thead}${tbody}</table>`;
}

function parseCSV(text) {
  // Tiny CSV parser supporting quoted fields with commas
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i=0;i<text.length;i++) {
    const c = text[i], n = text[i+1];
    if (inQuotes) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* ignore */ }
      else { field += c; }
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Utils
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
