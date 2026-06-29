/* The Heist Team — bracket rendering + scoring (vanilla JS, no build step) */

const ROUND_LABEL = { R32: "Round of 32", R16: "Round of 16", QF: "Quarterfinal", SF: "Semifinal", FINAL: "Final" };
const PLAYERS = Object.keys(PICKS);

/* For a given player, work out who they had playing in each match
   (R32 teams are fixed; later matches use the player's earlier winners). */
function participantsFor(picks, matchId) {
  const m = BRACKET[matchId];
  if (m.teams) return m.teams.slice();
  return m.feeds.map(f => picks[f] || null);
}

/* "correct" | "wrong" | "pending" for a player's pick at a match */
function statusFor(picks, matchId) {
  const actual = RESULTS[matchId];
  if (actual == null) return "pending";
  return picks[matchId] === actual ? "correct" : "wrong";
}

/* Total score + per-round breakdown for one player */
function scoreFor(picks) {
  const breakdown = { R32: 0, R16: 0, QF: 0, SF: 0, FINAL: 0, CHAMPION: 0 };
  let correct = 0, decided = 0;
  for (const id in BRACKET) {
    const actual = RESULTS[id];
    if (actual == null) continue;
    decided++;
    if (picks[id] === actual) {
      correct++;
      breakdown[BRACKET[id].round] += SCORING[BRACKET[id].round];
    }
  }
  // Champion bonus (on top of the Final points)
  if (RESULTS.F != null && picks.F === RESULTS.F) breakdown.CHAMPION += SCORING.CHAMPION_BONUS;
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const thirdCorrect = RESULTS.third != null && picks.third === RESULTS.third;
  return { total, breakdown, correct, decided, thirdCorrect };
}

function standings() {
  return PLAYERS.map(name => ({ name, ...scoreFor(PICKS[name]) }))
    .sort((a, b) =>
      b.total - a.total ||
      (b.thirdCorrect ? 1 : 0) - (a.thirdCorrect ? 1 : 0) ||
      a.name.localeCompare(b.name)
    );
}

/* ---------- Leaderboard ---------- */
function renderLeaderboard() {
  const rows = standings();
  const anyResults = Object.values(RESULTS).some(v => v != null);
  let leadPts = rows.length ? rows[0].total : 0;

  let html = `
    <table class="board">
      <thead><tr>
        <th>#</th><th>Name</th><th>Points</th>
        <th class="hide-sm">Hits</th><th>Champion pick</th><th class="hide-sm">3rd</th>
      </tr></thead><tbody>`;

  rows.forEach((r, i) => {
    const champ = PICKS[r.name].F;
    const champStatus = statusFor(PICKS[r.name], "F");
    const lead = anyResults && r.total === leadPts && leadPts > 0 ? " leader" : "";
    html += `
      <tr class="brow${lead}" data-player="${r.name}">
        <td class="rank">${i + 1}</td>
        <td class="pname">${r.name}${lead ? " 👑" : ""}</td>
        <td class="pts">${r.total}</td>
        <td class="hide-sm">${r.correct}/${r.decided || 0}</td>
        <td class="champ ${champStatus}">${champ}</td>
        <td class="hide-sm">${r.thirdCorrect ? "✓" : (PICKS[r.name].third || "—")}</td>
      </tr>`;
  });
  html += `</tbody></table>`;

  if (!anyResults) {
    html += `<p class="note">No match results entered yet — everyone sits at 0.
      Standings will move as results are filled in. Tap any row to see that bracket.</p>`;
  } else {
    html += `<p class="note">Tap any row to open that person's full bracket. Max possible: 1120 pts.</p>`;
  }
  document.getElementById("leaderboard").innerHTML = html;

  document.querySelectorAll(".brow").forEach(row =>
    row.addEventListener("click", () => selectPlayer(row.dataset.player)));
}

/* ---------- Per-player bracket ---------- */
function teamBox(picks, matchId, team) {
  if (!team) return `<div class="team empty">—</div>`;
  const picked = picks[matchId] === team;
  let cls = "team";
  if (picked) {
    cls += " picked " + statusFor(picks, matchId);
  }
  return `<div class="${cls}">${team}</div>`;
}

function matchBox(picks, matchId, side) {
  const [a, b] = participantsFor(picks, matchId);
  return `<div class="match ${side}" title="Match ${matchId}">
            ${teamBox(picks, matchId, a)}
            ${teamBox(picks, matchId, b)}
          </div>`;
}

function columnHTML(picks, ids, side) {
  return `<div class="col">${ids.map(id => matchBox(picks, id, side)).join("")}</div>`;
}

function renderBracket(name) {
  const picks = PICKS[name];
  const L = LAYOUT.left, R = LAYOUT.right;

  const center = `
    <div class="col center">
      <div class="final-wrap">
        <div class="final-label">FINAL</div>
        ${matchBox(picks, "F", "center")}
        <div class="champ-tag">🏆 Champion: <strong>${picks.F || "—"}</strong></div>
      </div>
      <div class="third-wrap">
        <div class="final-label">3rd place</div>
        <div class="team ${statusFor(picks, 'third') === 'correct' ? 'correct picked' : ''}">${picks.third || "—"}</div>
      </div>
    </div>`;

  const tree = `
    <div class="bracket">
      ${columnHTML(picks, L.R32, "left")}
      ${columnHTML(picks, L.R16, "left")}
      ${columnHTML(picks, L.QF, "left")}
      ${columnHTML(picks, L.SF, "left")}
      ${center}
      ${columnHTML(picks, R.SF, "right")}
      ${columnHTML(picks, R.QF, "right")}
      ${columnHTML(picks, R.R16, "right")}
      ${columnHTML(picks, R.R32, "right")}
    </div>`;

  const s = scoreFor(picks);
  const bd = s.breakdown;
  const breakdownRow = (lbl, v) => `<span class="bd"><b>${lbl}</b> ${v}</span>`;
  const summary = `
    <div class="pscore">
      <div class="ptotal">${s.total} <span>pts</span></div>
      <div class="bdwrap">
        ${breakdownRow("R32", bd.R32)}${breakdownRow("R16", bd.R16)}${breakdownRow("QF", bd.QF)}
        ${breakdownRow("SF", bd.SF)}${breakdownRow("Final", bd.FINAL)}${breakdownRow("Champ", bd.CHAMPION)}
      </div>
    </div>`;

  document.getElementById("bracketView").innerHTML = `
    <div class="pview-head">
      <img class="pphoto" src="${PHOTOS[name]}" alt="${name}'s bracket photo">
      <div>
        <h2>${name}</h2>
        ${summary}
      </div>
    </div>
    <div class="scroll-hint">← scroll to see the full bracket →</div>
    ${tree}
    <details class="photo-detail"><summary>See ${name}'s original bracket photo</summary>
      <img class="fullphoto" src="${PHOTOS[name]}" alt="${name}'s bracket"></details>`;
}

/* ---------- Actual results bracket (the real tournament) ---------- */
function actualParticipants(matchId) {
  const m = BRACKET[matchId];
  if (m.teams) return m.teams.slice();
  return m.feeds.map(f => RESULTS[f] || null);
}
function actualTeamBox(matchId, team) {
  if (!team) return `<div class="team empty">TBD</div>`;
  const won = RESULTS[matchId] === team;
  return `<div class="team${won ? " picked actual-win" : ""}">${team}</div>`;
}
function actualMatchBox(matchId, side) {
  const [a, b] = actualParticipants(matchId);
  return `<div class="match ${side}" title="Match ${matchId}">
            ${actualTeamBox(matchId, a)}${actualTeamBox(matchId, b)}
          </div>`;
}
function actualColumn(ids, side) {
  return `<div class="col">${ids.map(id => actualMatchBox(id, side)).join("")}</div>`;
}
function renderResults() {
  const L = LAYOUT.left, R = LAYOUT.right;
  const center = `
    <div class="col center">
      <div class="final-wrap">
        <div class="final-label">FINAL</div>
        ${actualMatchBox("F", "center")}
        <div class="champ-tag">🏆 Champion: <strong>${RESULTS.F || "TBD"}</strong></div>
      </div>
      <div class="third-wrap">
        <div class="final-label">3rd place</div>
        <div class="team${RESULTS.third ? " picked actual-win" : ""}">${RESULTS.third || "TBD"}</div>
      </div>
    </div>`;
  const tree = `
    <div class="bracket">
      ${actualColumn(L.R32, "left")}${actualColumn(L.R16, "left")}${actualColumn(L.QF, "left")}${actualColumn(L.SF, "left")}
      ${center}
      ${actualColumn(R.SF, "right")}${actualColumn(R.QF, "right")}${actualColumn(R.R16, "right")}${actualColumn(R.R32, "right")}
    </div>`;
  const ids = Object.keys(BRACKET);
  const played = ids.filter(id => RESULTS[id] != null).length;
  document.getElementById("resultsView").innerHTML = `
    <h2>Actual results</h2>
    <p class="note">${played} of ${ids.length} knockout matches decided. Winners are highlighted; upcoming matchups appear once both teams are known.</p>
    <div class="scroll-hint">← scroll to see the full bracket →</div>
    ${tree}`;
}

/* ---------- Navigation ---------- */
const SECTIONS = ["boardSection", "playerSection", "resultsSection"];
function show(section) {
  SECTIONS.forEach(id => document.getElementById(id).classList.toggle("hidden", id !== section));
}

function selectPlayer(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.player === name));
  show("playerSection");
  renderBracket(name);
  window.scrollTo({ top: document.getElementById("playerSection").offsetTop - 10, behavior: "smooth" });
}

function showResults() {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.classList.contains("results-tab")));
  show("resultsSection");
  renderResults();
  window.scrollTo({ top: document.getElementById("resultsSection").offsetTop - 10, behavior: "smooth" });
}

function showBoard() {
  show("boardSection");
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
}

function buildTabs() {
  const wrap = document.getElementById("tabs");
  wrap.innerHTML =
    `<button class="tab board-tab" onclick="showBoard()">🏆 Leaderboard</button>` +
    `<button class="tab results-tab" onclick="showResults()">📋 Results</button>` +
    PLAYERS.map(n => `<button class="tab" data-player="${n}" onclick="selectPlayer('${n}')">${n}</button>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  buildTabs();
  renderLeaderboard();
});
