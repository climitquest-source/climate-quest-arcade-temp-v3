// Climate Quest - Arcade (Git Ready)
const CONFIG = {
  QUESTION_TIME: 12,
  BASE_POINTS: 100,
  TIME_BONUS_PER_SEC: 5,
  STREAK_STEP: 0.2,
  STREAK_MAX: 2.0,
  HELPERS_PER_GAME: { fifty: 1, hint: 1 },
  GOOGLE_FORM_ACTION: "",
  GOOGLE_SHEET_URL: ""
};

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

let state = {
  nickname: "Player",
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
  correctCount: 0
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const screenHome = $("#screen-home");
const screenGame = $("#screen-game");
const screenResult = $("#screen-result");
const helpDialog = $("#helpDialog");

const bestScoreEl = $("#bestScore");
const badgeListEl = $("#badgeList");
const topScoresLink = $("#topScoresLink");

const nicknameEl = $("#nickname");
const eventCodeEl = $("#eventCode");
const categoryEl = $("#category");
const numQuestionsEl = $("#numQuestions");

const hudNickname = $("#hud-nickname");
const hudCategory = $("#hud-category");
const hudTime = $("#hud-time");
const hudStreak = $("#hud-streak");
const hudScore = $("#hud-score");

const qText = $("#qText");
const choicesEl = $("#choices");

const resScore = $("#res-score");
const resCorrect = $("#res-correct");
const resTotal = $("#res-total");
const resStreak = $("#res-streak");
const resBadges = $("#res-badges");
const resSubmitNote = $("#res-submit-note");

const btnPlay = $("#btn-play");
const btnPlayAgain = $("#btn-play-again");
const btnHome = $("#btn-home");
const btnHelp = $("#btn-help");
const btnCloseHelp = $("#btn-close-help");
const btn5050 = $("#btn-5050");
const btnHint = $("#btn-hint");
const left5050 = $("#left-5050");
const leftHint = $("#left-hint");

function init() {
  const best = +localStorage.getItem("cq_bestScore") || 0;
  bestScoreEl.textContent = best.toString();
  nicknameEl.value = localStorage.getItem("cq_nickname") || "";
  eventCodeEl.value = localStorage.getItem("cq_eventCode") || "";
  const badges = JSON.parse(localStorage.getItem("cq_badges") || "[]");
  renderBadges(badges);

  if (CONFIG.GOOGLE_SHEET_URL) {
    topScoresLink.href = CONFIG.GOOGLE_SHEET_URL;
    topScoresLink.classList.remove("disabled");
  }

  $("#btn-help").addEventListener("click", () => helpDialog.showModal());
  $("#btn-close-help").addEventListener("click", () => helpDialog.close());

  btnPlay.addEventListener("click", startGame);
  btnPlayAgain.addEventListener("click", () => showScreen("home"));
  btnHome.addEventListener("click", () => showScreen("home"));
  btn5050.addEventListener("click", use5050);
  btnHint.addEventListener("click", useHint);
}
init();

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
  [screenHome, screenGame, screenResult].forEach(s => s.classList.remove("active"));
  if (name === "home") screenHome.classList.add("active");
  else if (name === "game") screenGame.classList.add("active");
  else if (name === "result") screenResult.classList.add("active");
}

function startGame() {
  state.nickname = (nicknameEl.value || "Player").trim().slice(0,18);
  state.eventCode = (eventCodeEl.value || "").trim().toUpperCase().slice(0,20);
  state.category = categoryEl.value;
  state.totalQuestions = +numQuestionsEl.value || 10;

  localStorage.setItem("cq_nickname", state.nickname);
  localStorage.setItem("cq_eventCode", state.eventCode);

  let pool = QUESTIONS;
  if (state.category !== "mixed") {
    pool = QUESTIONS.filter(q => q.category === state.category);
  }
  state.pool = shuffle([...pool]).slice(0, state.totalQuestions);

  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.longestStreak = 0;
  state.used = { fifty: 0, hint: 0 };
  state.correctCount = 0;

  hudNickname.textContent = state.nickname;
  hudCategory.textContent = state.category === "mixed" ? "Mixed" : state.category;
  hudScore.textContent = "0";
  hudStreak.textContent = "0";

  left5050.textContent = CONFIG.HELPERS_PER_GAME.fifty - state.used.fifty;
  leftHint.textContent = CONFIG.HELPERS_PER_GAME.hint - state.used.hint;

  showScreen("game");
  nextQuestion();
}

function nextQuestion() {
  clearInterval(state.timer);
  if (state.index >= state.pool.length) return endGame();

  state.current = state.pool[state.index];
  state.index += 1;
  state.timeLeft = CONFIG.QUESTION_TIME;

  qText.textContent = `Q${state.index}. ${state.current.question}`;
  renderChoices(state.current);

  hudTime.textContent = state.timeLeft.toString();
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    hudTime.textContent = state.timeLeft.toString();
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
  hudScore.textContent = state.score.toString();
  hudStreak.textContent = state.streak.toString();
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
  resScore.textContent = state.score.toString();
  resCorrect.textContent = state.correctCount.toString();
  resTotal.textContent = state.pool.length.toString();
  resStreak.textContent = state.longestStreak.toString();

  const best = +localStorage.getItem("cq_bestScore") || 0;
  if (state.score > best) {
    localStorage.setItem("cq_bestScore", String(state.score));
    bestScoreEl.textContent = String(state.score);
  }

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

  if (CONFIG.GOOGLE_FORM_ACTION && state.eventCode) {
    submitScoreToGoogleForm(state).then(ok => {
      resSubmitNote.textContent = ok ? 
        "Score submitted to the event sheet." : 
        "Could not submit score. You can still screenshot and share.";
    });
  } else {
    resSubmitNote.textContent = state.eventCode ? 
      "Event code entered, but no score form is configured yet." :
      "Tip: Add an event code to submit scores to a shared sheet.";
  }
}

async function submitScoreToGoogleForm(st) {
  try {
    const data = new FormData();
    data.append("entry.1111111111", st.eventCode);
    data.append("entry.2222222222", st.nickname);
    data.append("entry.3333333333", String(st.score));
    data.append("entry.4444444444", String(st.correctCount) + "/" + String(st.pool.length));
    data.append("entry.5555555555", new Date().toISOString());

    await fetch(CONFIG.GOOGLE_FORM_ACTION, { method: "POST", mode: "no-cors", body: data });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
