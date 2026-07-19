/* ============================================================================
   THE HEIST TEAM — 2026 World Cup Bracket Data
   ============================================================================

   You only ever need to edit ONE thing as the tournament goes on: the RESULTS
   object near the bottom. Everything else (the bracket layout and each
   person's locked-in picks) is fixed.

   --- HOW TO UPDATE RESULTS -------------------------------------------------
   As each knockout match finishes, fill in the WINNER next to that match's
   number. Match numbers match the printed Sporting News bracket (74-102).
   Example: when Germany beats Paraguay in Match 74, change
       74: null,        ->     74: "Germany",
   Save the file, commit, and push. The leaderboard updates automatically.

   Team names must be spelled EXACTLY as they appear in TEAMS below
   (the scorer matches on exact text).
   ========================================================================== */


/* ---- Scoring: points per correctly predicted match winner --------------- */
const SCORING = {
  R32: 10,    // Round of 32   (16 matches)
  R16: 20,    // Round of 16   (8 matches)
  QF:  40,    // Quarterfinals (4 matches)
  SF:  80,    // Semifinals    (2 matches)
  FINAL: 160  // Final         (1 match) — picking the champion correctly
};


/* ---- The fixed bracket layout (same printed bracket everyone filled in) -- */
/* R32 matches list their two teams. Later matches "feed" from earlier ones.  */
const BRACKET = {
  // LEFT SIDE — Round of 32
  74: { round: "R32", teams: ["Germany", "Paraguay"] },
  77: { round: "R32", teams: ["France", "Sweden"] },
  73: { round: "R32", teams: ["South Africa", "Canada"] },
  75: { round: "R32", teams: ["Netherlands", "Morocco"] },
  83: { round: "R32", teams: ["Portugal", "Croatia"] },
  84: { round: "R32", teams: ["Spain", "Austria"] },
  81: { round: "R32", teams: ["United States", "Bosnia & Herzegovina"] },
  82: { round: "R32", teams: ["Belgium", "Senegal"] },
  // RIGHT SIDE — Round of 32
  76: { round: "R32", teams: ["Brazil", "Japan"] },
  78: { round: "R32", teams: ["Ivory Coast", "Norway"] },
  79: { round: "R32", teams: ["Mexico", "Ecuador"] },
  80: { round: "R32", teams: ["England", "Congo DR"] },
  86: { round: "R32", teams: ["Argentina", "Cabo Verde"] },
  88: { round: "R32", teams: ["Australia", "Egypt"] },
  85: { round: "R32", teams: ["Switzerland", "Algeria"] },
  87: { round: "R32", teams: ["Colombia", "Ghana"] },

  // Round of 16
  89: { round: "R16", feeds: [74, 77] },
  90: { round: "R16", feeds: [73, 75] },
  93: { round: "R16", feeds: [83, 84] },
  94: { round: "R16", feeds: [81, 82] },
  91: { round: "R16", feeds: [76, 78] },
  92: { round: "R16", feeds: [79, 80] },
  95: { round: "R16", feeds: [86, 88] },
  96: { round: "R16", feeds: [85, 87] },

  // Quarterfinals
  97:  { round: "QF", feeds: [89, 90] },
  98:  { round: "QF", feeds: [93, 94] },
  99:  { round: "QF", feeds: [91, 92] },
  100: { round: "QF", feeds: [95, 96] },

  // Semifinals
  101: { round: "SF", feeds: [97, 98] },
  102: { round: "SF", feeds: [99, 100] },

  // Final
  F: { round: "FINAL", feeds: [101, 102] }
};

/* Column groupings used by the renderer (left half / center / right half) */
const LAYOUT = {
  left:  { R32: [74, 77, 73, 75, 83, 84, 81, 82], R16: [89, 90, 93, 94], QF: [97, 98], SF: [101] },
  right: { R32: [76, 78, 79, 80, 86, 88, 85, 87], R16: [91, 92, 95, 96], QF: [99, 100], SF: [102] }
};


/* ---- Everyone's locked-in picks ----------------------------------------- */
/* For each match number, the team that person picked to win.                */
/* "F" = final winner (champion). "third" = third-place pick (tiebreaker).   */
const PICKS = {
  Alec: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Senegal",
    76:"Brazil",78:"Ivory Coast",79:"Mexico",80:"England",86:"Argentina",88:"Egypt",85:"Switzerland",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"United States",91:"Brazil",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"England",100:"Argentina",
    101:"France",102:"England",F:"France",third:"Spain"
  },
  Annika: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Croatia",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Egypt",85:"Switzerland",87:"Colombia",
    89:"Germany",90:"Netherlands",93:"Spain",94:"United States",91:"Brazil",92:"England",95:"Argentina",96:"Colombia",
    97:"Netherlands",98:"Spain",99:"Brazil",100:"Argentina",
    101:"Spain",102:"Argentina",F:"Argentina",third:"Netherlands"
  },
  Alicia: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Australia",85:"Switzerland",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"United States",91:"Brazil",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"England",100:"Argentina",
    101:"Spain",102:"Argentina",F:"Argentina",third:"France"
  },
  Chris: {
    74:"Germany",77:"France",73:"Canada",75:"Morocco",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Australia",85:"Switzerland",87:"Colombia",
    89:"France",90:"Morocco",93:"Spain",94:"United States",91:"Norway",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"Norway",100:"Argentina",
    101:"France",102:"Norway",F:"France",third:"Argentina"
  },
  Davis: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Ivory Coast",79:"Ecuador",80:"England",86:"Argentina",88:"Australia",85:"Switzerland",87:"Colombia",
    89:"Germany",90:"Netherlands",93:"Spain",94:"Belgium",91:"Brazil",92:"England",95:"Argentina",96:"Colombia",
    97:"Germany",98:"Spain",99:"Brazil",100:"Argentina",
    101:"Spain",102:"Brazil",F:"Spain",third:null
  },
  Graham: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Australia",85:"Switzerland",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"United States",91:"Norway",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"England",100:"Argentina",
    101:"France",102:"Argentina",F:"France",third:"England"
  },
  Jake: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Egypt",85:"Switzerland",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"United States",91:"Brazil",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"England",100:"Argentina",
    101:"Spain",102:"Argentina",F:"Argentina",third:"France"
  },
  Joyce: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Croatia",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Australia",85:"Switzerland",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"Belgium",91:"Brazil",92:"England",95:"Argentina",96:"Switzerland",
    97:"France",98:"Spain",99:"England",100:"Argentina",
    101:"France",102:"Argentina",F:"Argentina",third:null
  },
  Justin: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Egypt",85:"Algeria",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"United States",91:"Norway",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"England",100:"Argentina",
    101:"France",102:"England",F:"England",third:"Argentina"
  },
  Veronika: {
    74:"Germany",77:"France",73:"Canada",75:"Netherlands",83:"Portugal",84:"Spain",81:"United States",82:"Belgium",
    76:"Brazil",78:"Norway",79:"Mexico",80:"England",86:"Argentina",88:"Australia",85:"Switzerland",87:"Colombia",
    89:"France",90:"Netherlands",93:"Spain",94:"Belgium",91:"Brazil",92:"England",95:"Argentina",96:"Colombia",
    97:"France",98:"Spain",99:"Brazil",100:"Argentina",
    101:"France",102:"Argentina",F:"France",third:null
  }
};

/* Photo filename for each player (shown on their bracket view) */
const PHOTOS = {
  Alec:"Alec.JPEG",
  Annika:"Annika.jpg", Alicia:"Alicia.jpg", Chris:"Chris.jpg", Davis:"Davis.jpg",
  Graham:"Graham.png", Jake:"Jake.jpg", Joyce:"Joyce.jpg", Justin:"Justin.jpg", Veronika:"Veronika.jpg"
};


/* ============================================================================
   RESULTS — EDIT THIS as matches finish. Put the winner's name, or leave null.
   ========================================================================== */
const RESULTS = {
  // --- Round of 32 ---
  74: "Paraguay", 77: "France", 73: "Canada", 75: "Morocco", 83: "Portugal", 84: "Spain", 81: "United States", 82: "Belgium",
  76: "Brazil", 78: "Norway", 79: "Mexico", 80: "England", 86: "Argentina", 88: "Egypt", 85: "Switzerland", 87: "Colombia",
  // --- Round of 16 ---
  89: "France", 90: "Morocco", 93: "Spain", 94: "Belgium", 91: "Norway", 92: "England", 95: "Argentina", 96: "Switzerland",
  // --- Quarterfinals ---
  97: "France", 98: "Spain", 99: "England", 100: "Argentina",
  // --- Semifinals ---
  101: "Spain", 102: "Argentina",
  // --- Final (champion) ---
  F: "Spain",
  // --- Third-place match winner (tiebreaker only) ---
  third: "England"
};
