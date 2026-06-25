/* Egypt World Cup 2026 path calculator
   Static client-side app. No build step needed.
*/

const GROUPS = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HTI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRI", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"],
  J: ["ARG", "DZA", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
};

const TEAMS = {
  MEX: { name: "Mexico", ar: "المكسيك" }, RSA: { name: "South Africa", ar: "جنوب أفريقيا" }, KOR: { name: "Korea Republic", ar: "كوريا الجنوبية" }, CZE: { name: "Czechia", ar: "التشيك" },
  CAN: { name: "Canada", ar: "كندا" }, BIH: { name: "Bosnia and Herzegovina", ar: "البوسنة والهرسك" }, QAT: { name: "Qatar", ar: "قطر" }, SUI: { name: "Switzerland", ar: "سويسرا" },
  BRA: { name: "Brazil", ar: "البرازيل" }, MAR: { name: "Morocco", ar: "المغرب" }, HTI: { name: "Haiti", ar: "هايتي" }, SCO: { name: "Scotland", ar: "اسكتلندا" },
  USA: { name: "United States", ar: "أمريكا" }, PAR: { name: "Paraguay", ar: "باراغواي" }, AUS: { name: "Australia", ar: "أستراليا" }, TUR: { name: "Turkiye", ar: "تركيا" },
  GER: { name: "Germany", ar: "ألمانيا" }, CUW: { name: "Curacao", ar: "كوراساو" }, CIV: { name: "Ivory Coast", ar: "ساحل العاج" }, ECU: { name: "Ecuador", ar: "الإكوادور" },
  NED: { name: "Netherlands", ar: "هولندا" }, JPN: { name: "Japan", ar: "اليابان" }, SWE: { name: "Sweden", ar: "السويد" }, TUN: { name: "Tunisia", ar: "تونس" },
  BEL: { name: "Belgium", ar: "بلجيكا" }, EGY: { name: "Egypt", ar: "مصر" }, IRI: { name: "IR Iran", ar: "إيران" }, NZL: { name: "New Zealand", ar: "نيوزيلندا" },
  ESP: { name: "Spain", ar: "إسبانيا" }, CPV: { name: "Cape Verde", ar: "الرأس الأخضر" }, KSA: { name: "Saudi Arabia", ar: "السعودية" }, URU: { name: "Uruguay", ar: "أوروجواي" },
  FRA: { name: "France", ar: "فرنسا" }, SEN: { name: "Senegal", ar: "السنغال" }, IRQ: { name: "Iraq", ar: "العراق" }, NOR: { name: "Norway", ar: "النرويج" },
  ARG: { name: "Argentina", ar: "الأرجنتين" }, DZA: { name: "Algeria", ar: "الجزائر" }, AUT: { name: "Austria", ar: "النمسا" }, JOR: { name: "Jordan", ar: "الأردن" },
  POR: { name: "Portugal", ar: "البرتغال" }, COD: { name: "Congo DR", ar: "الكونغو الديمقراطية" }, UZB: { name: "Uzbekistan", ar: "أوزبكستان" }, COL: { name: "Colombia", ar: "كولومبيا" },
  ENG: { name: "England", ar: "إنجلترا" }, CRO: { name: "Croatia", ar: "كرواتيا" }, GHA: { name: "Ghana", ar: "غانا" }, PAN: { name: "Panama", ar: "بنما" },
};

const TEAM_TO_GROUP = Object.fromEntries(Object.entries(GROUPS).flatMap(([g, teams]) => teams.map(t => [t, g])));
const WINNER_COLUMNS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];

const ALIASES = buildAliases();
let matches = [];
let originalMatches = [];
let annexMap = null;
let annexError = null;

function buildAliases() {
  const aliases = {};
  for (const [code, info] of Object.entries(TEAMS)) {
    aliases[normalize(code)] = code;
    aliases[normalize(info.name)] = code;
    aliases[normalize(info.ar)] = code;
  }
  Object.assign(aliases, {
    [normalize("IRN")]: "IRI",
    [normalize("Iran")]: "IRI",
    [normalize("IR Iran")]: "IRI",
    [normalize("Korea Republic")]: "KOR",
    [normalize("South Korea")]: "KOR",
    [normalize("Côte d'Ivoire")]: "CIV",
    [normalize("Cote dIvoire")]: "CIV",
    [normalize("Ivory Coast")]: "CIV",
    [normalize("Curaçao")]: "CUW",
    [normalize("Curacao")]: "CUW",
    [normalize("Türkiye")]: "TUR",
    [normalize("Turkiye")]: "TUR",
    [normalize("Turkey")]: "TUR",
    [normalize("United States")]: "USA",
    [normalize("USA")]: "USA",
    [normalize("Congo DR")]: "COD",
    [normalize("DR Congo")]: "COD",
    [normalize("Congo - Kinshasa")]: "COD",
    [normalize("Bosnia & Herzegovina")]: "BIH",
  });
  return aliases;
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]/g, "");
}

function teamName(code) {
  return TEAMS[code]?.ar || code;
}

function setStatus(msg, type = "") {
  const el = document.getElementById("sourceStatus");
  el.textContent = msg;
  el.style.color = type === "bad" ? "#ff9a9a" : type === "good" ? "#61e0b8" : "#a9bad3";
}

function seedMatches() {
  // Fallback snapshot. Online fetch replaces it when available.
  return [
    ["A","MEX","RSA",2,0,true,"2026-06-11"],["A","KOR","CZE",2,1,true,"2026-06-11"],["A","CZE","RSA",1,1,true,"2026-06-18"],["A","MEX","KOR",1,0,true,"2026-06-18"],["A","CZE","MEX",null,null,false,"2026-06-24"],["A","RSA","KOR",null,null,false,"2026-06-24"],
    ["B","CAN","BIH",1,1,true,"2026-06-12"],["B","QAT","SUI",1,1,true,"2026-06-13"],["B","SUI","BIH",4,1,true,"2026-06-18"],["B","CAN","QAT",6,0,true,"2026-06-18"],["B","SUI","CAN",2,1,true,"2026-06-24"],["B","BIH","QAT",3,1,true,"2026-06-24"],
    ["C","BRA","MAR",1,1,true,"2026-06-13"],["C","HTI","SCO",0,1,true,"2026-06-13"],["C","SCO","MAR",0,1,true,"2026-06-19"],["C","BRA","HTI",3,0,true,"2026-06-19"],["C","SCO","BRA",0,3,true,"2026-06-24"],["C","MAR","HTI",4,2,true,"2026-06-24"],
    ["D","USA","PAR",4,1,true,"2026-06-12"],["D","AUS","TUR",2,0,true,"2026-06-14"],["D","USA","AUS",2,0,true,"2026-06-19"],["D","TUR","PAR",0,1,true,"2026-06-19"],["D","TUR","USA",null,null,false,"2026-06-25"],["D","PAR","AUS",null,null,false,"2026-06-25"],
    ["E","GER","CUW",7,1,true,"2026-06-14"],["E","CIV","ECU",1,0,true,"2026-06-14"],["E","GER","CIV",2,1,true,"2026-06-20"],["E","ECU","CUW",0,0,true,"2026-06-20"],["E","ECU","GER",null,null,false,"2026-06-25"],["E","CUW","CIV",null,null,false,"2026-06-25"],
    ["F","NED","JPN",2,2,true,"2026-06-14"],["F","SWE","TUN",5,1,true,"2026-06-14"],["F","NED","SWE",5,1,true,"2026-06-20"],["F","TUN","JPN",0,4,true,"2026-06-21"],["F","TUN","NED",null,null,false,"2026-06-25"],["F","JPN","SWE",null,null,false,"2026-06-25"],
    ["G","BEL","EGY",1,1,true,"2026-06-15"],["G","IRI","NZL",2,2,true,"2026-06-15"],["G","BEL","IRI",0,0,true,"2026-06-21"],["G","NZL","EGY",1,3,true,"2026-06-21"],["G","NZL","BEL",null,null,false,"2026-06-26"],["G","EGY","IRI",null,null,false,"2026-06-26"],
    ["H","ESP","CPV",0,0,true,"2026-06-15"],["H","KSA","URU",1,1,true,"2026-06-15"],["H","ESP","KSA",4,0,true,"2026-06-21"],["H","URU","CPV",2,2,true,"2026-06-21"],["H","URU","ESP",null,null,false,"2026-06-26"],["H","CPV","KSA",null,null,false,"2026-06-26"],
    ["I","FRA","SEN",3,1,true,"2026-06-16"],["I","IRQ","NOR",1,4,true,"2026-06-16"],["I","FRA","IRQ",3,0,true,"2026-06-22"],["I","NOR","SEN",3,2,true,"2026-06-22"],["I","NOR","FRA",null,null,false,"2026-06-26"],["I","SEN","IRQ",null,null,false,"2026-06-26"],
    ["J","ARG","DZA",3,0,true,"2026-06-16"],["J","AUT","JOR",3,1,true,"2026-06-17"],["J","ARG","AUT",2,0,true,"2026-06-22"],["J","JOR","DZA",1,2,true,"2026-06-22"],["J","JOR","ARG",null,null,false,"2026-06-27"],["J","DZA","AUT",null,null,false,"2026-06-27"],
    ["K","POR","COD",1,1,true,"2026-06-17"],["K","UZB","COL",1,3,true,"2026-06-17"],["K","POR","UZB",5,0,true,"2026-06-23"],["K","COL","COD",1,0,true,"2026-06-23"],["K","COL","POR",null,null,false,"2026-06-27"],["K","COD","UZB",null,null,false,"2026-06-27"],
    ["L","ENG","CRO",4,2,true,"2026-06-17"],["L","GHA","PAN",1,0,true,"2026-06-17"],["L","ENG","GHA",0,0,true,"2026-06-23"],["L","PAN","CRO",0,1,true,"2026-06-23"],["L","PAN","ENG",null,null,false,"2026-06-27"],["L","CRO","GHA",null,null,false,"2026-06-27"],
  ].map(([group, home, away, hs, as, completed, date], idx) => ({ id: `seed-${idx}`, group, home, away, hs, as, completed, date, source: "fallback" }));
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (directErr) {
    const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxied, { cache: "no-store" });
    if (!res.ok) throw directErr;
    return await res.json();
  }
}

async function fetchEspnMatches() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=1000&dates=20260611-20260627";
  const data = await fetchJson(url);
  const found = [];
  for (const event of data.events || []) {
    const comp = event.competitions?.[0];
    const competitors = comp?.competitors || [];
    if (competitors.length < 2) continue;
    const homeC = competitors.find(c => c.homeAway === "home") || competitors[0];
    const awayC = competitors.find(c => c.homeAway === "away") || competitors[1];
    const home = mapEspnTeam(homeC.team);
    const away = mapEspnTeam(awayC.team);
    if (!home || !away) continue;
    const group = TEAM_TO_GROUP[home];
    if (!group || group !== TEAM_TO_GROUP[away]) continue;
    const statusType = event.status?.type || {};
    const officialCompleted = Boolean(statusType.completed);
    const state = String(statusType.state || "").toLowerCase();
    const description = String(statusType.description || "").toLowerCase();
    const inProgress = state === "in" || /in progress|halftime|half time|live/.test(description);
    const useScore = officialCompleted || inProgress;
    const rawHs = safeScore(homeC.score);
    const rawAs = safeScore(awayC.score);
    const hs = useScore && Number.isFinite(rawHs) ? rawHs : null;
    const as = useScore && Number.isFinite(rawAs) ? rawAs : null;
    found.push({
      id: String(event.id || `${event.date}-${home}-${away}`),
      group, home, away,
      hs,
      as,
      completed: useScore,
      officialCompleted,
      date: (event.date || "").slice(0, 10),
      status: statusType.description || "",
      source: "espn",
    });
  }
  return mergeMatches(seedMatches(), found);
}

function mapEspnTeam(team) {
  if (!team) return null;
  const candidates = [team.abbreviation, team.shortDisplayName, team.displayName, team.name, team.location];
  for (const c of candidates) {
    const mapped = ALIASES[normalize(c)];
    if (mapped) return mapped;
  }
  return null;
}

function safeScore(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mergeMatches(base, online) {
  const key = m => [m.group, m.home, m.away].sort().join("-");
  const map = new Map(base.map(m => [key(m), m]));
  for (const m of online) map.set(key(m), { ...map.get(key(m)), ...m });
  return [...map.values()].sort((a,b) => String(a.date).localeCompare(String(b.date)) || a.group.localeCompare(b.group));
}

async function loadAnnexC() {
  try {
    const url = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup_knockout_stage&prop=text&format=json&origin=*";
    const data = await fetchJson(url);
    const html = data.parse?.text?.["*"];
    if (!html) throw new Error("No parsed HTML returned");
    const doc = new DOMParser().parseFromString(html, "text/html");
    const rows = [...doc.querySelectorAll("tr")];
    const map = {};
    for (const tr of rows) {
      const text = tr.textContent.replace(/\s+/g, " ").trim();
      const tokens = text.match(/\b(?:[1-9]\d{0,2}|[A-L]|3[A-L])\b/g);
      if (!tokens || tokens.length < 17) continue;
      const no = Number(tokens[0]);
      if (!Number.isInteger(no) || no < 1 || no > 495) continue;
      const groups = tokens.slice(1, 9);
      const assignments = tokens.slice(9, 17);
      if (groups.some(g => !/^[A-L]$/.test(g)) || assignments.some(a => !/^3[A-L]$/.test(a))) continue;
      const key = groups.slice().sort().join("");
      map[key] = { no, key, groups, assignments, columns: Object.fromEntries(WINNER_COLUMNS.map((c, i) => [c, assignments[i]])) };
    }
    if (Object.keys(map).length < 400) throw new Error(`Only parsed ${Object.keys(map).length} Annex C rows`);
    annexError = null;
    return map;
  } catch (err) {
    annexError = err.message || String(err);
    return null;
  }
}

function readEditorMatches() {
  return matches.map(m => {
    const hs = safeScore(document.querySelector(`[data-score="${m.id}-h"]`)?.value);
    const as = safeScore(document.querySelector(`[data-score="${m.id}-a"]`)?.value);
    return { ...m, hs, as, completed: Number.isFinite(hs) && Number.isFinite(as) };
  });
}

function calculateStandings(sourceMatches) {
  const standings = {};
  for (const [group, teams] of Object.entries(GROUPS)) {
    standings[group] = Object.fromEntries(teams.map(code => [code, { code, group, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, tieFlag: false }]));
  }
  for (const m of sourceMatches) {
    if (!m.completed || !Number.isFinite(m.hs) || !Number.isFinite(m.as)) continue;
    const h = standings[m.group]?.[m.home];
    const a = standings[m.group]?.[m.away];
    if (!h || !a) continue;
    h.mp++; a.mp++;
    h.gf += m.hs; h.ga += m.as;
    a.gf += m.as; a.ga += m.hs;
    if (m.hs > m.as) { h.w++; a.l++; h.pts += 3; }
    else if (m.hs < m.as) { a.w++; h.l++; a.pts += 3; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  }
  for (const group of Object.keys(standings)) {
    for (const row of Object.values(standings[group])) row.gd = row.gf - row.ga;
  }
  const sorted = {};
  for (const [group, rowsObj] of Object.entries(standings)) {
    const rows = Object.values(rowsObj).sort(compareRows);
    markTieFlags(rows);
    sorted[group] = rows;
  }
  return sorted;
}

function compareRows(a, b) {
  return (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf) || a.code.localeCompare(b.code);
}

function markTieFlags(rows) {
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i], b = rows[i + 1];
    if (a.pts === b.pts && a.gd === b.gd && a.gf === b.gf) {
      a.tieFlag = true; b.tieFlag = true;
    }
  }
}

function getThirds(standings) {
  const thirds = Object.entries(standings).map(([group, rows]) => ({ ...rows[2], thirdGroup: group, thirdTeam: rows[2].code }));
  thirds.sort(compareRows);
  markTieFlags(thirds);
  return thirds;
}

function annexRowForThirds(thirds) {
  const letters = thirds.slice(0, 8).map(r => r.thirdGroup).sort().join("");
  return { letters, row: annexMap?.[letters] || null };
}

function getEgyptOutcome(standings, thirds) {
  const groupG = standings.G;
  const egyptIndex = groupG.findIndex(r => r.code === "EGY");
  const egyptRow = groupG[egyptIndex];
  const position = egyptIndex + 1;
  const { letters, row } = annexRowForThirds(thirds);
  const topThirdLetters = thirds.slice(0,8).map(r => r.thirdGroup);
  const thirdByGroup = Object.fromEntries(Object.entries(standings).map(([g, rows]) => [g, rows[2]]));

  const base = { position, egyptRow, letters, row, topThirdLetters, tieFlag: Boolean(egyptRow?.tieFlag) };

  if (position === 1) {
    if (!row) return { ...base, qualifies: true, status: "warning", category: "مصر أول المجموعة G", kind: "1G", slot: "?", opponentText: "غير محدد — Annex C لم يتحمل", detail: `أفضل الثوالث حاليًا: ${letters}.` };
    const opponentSlot = row.columns["1G"];
    const oppGroup = opponentSlot.replace("3", "");
    const opp = thirdByGroup[oppGroup];
    return { ...base, qualifies: true, status: "good", category: "مصر أول المجموعة G", kind: "1G", slot: opponentSlot, opponentGroup: oppGroup, opponentCode: opp?.code, opponentText: `ثالث المجموعة ${oppGroup}: ${teamName(opp?.code)}`, detail: `الماتش الرسمي: 1G × ${opponentSlot}. رقم صف Annex C: ${row.no}.` };
  }

  if (position === 2) {
    const opp = standings.D[1];
    return { ...base, qualifies: true, status: "good", category: "مصر ثاني المجموعة G", kind: "2G", slot: "2D", opponentGroup: "D", opponentCode: opp?.code, opponentText: `وصيف المجموعة D: ${teamName(opp?.code)}`, detail: "الماتش الرسمي: 2D × 2G." };
  }

  if (position === 3) {
    const qualifies = topThirdLetters.includes("G");
    if (!qualifies) return { ...base, qualifies: false, status: "danger", category: "مصر ثالث المجموعة G", kind: "3G-out", slot: "OUT", opponentText: "خروج", detail: `مصر ليست ضمن أفضل 8 ثوالث. أفضل الثوالث: ${topThirdLetters.join(", ")}.` };
    if (!row) return { ...base, qualifies: true, status: "warning", category: "مصر ثالثة ومتأهلة", kind: "3G", slot: "?", opponentText: "غير محدد — Annex C لم يتحمل", detail: "مصر ضمن أفضل الثوالث، لكن لم أستطع تحميل صف Annex C لتحديد الخصم." };
    const entry = Object.entries(row.columns).find(([, v]) => v === "3G");
    if (!entry) return { ...base, qualifies: true, status: "warning", category: "مصر ثالثة ومتأهلة", kind: "3G", slot: "?", opponentText: "غير محدد", detail: "صف Annex C الحالي لا يحتوي 3G بشكل متوقع." };
    const winnerGroup = entry[0].replace("1", "");
    const opp = standings[winnerGroup][0];
    return { ...base, qualifies: true, status: "good", category: "مصر ثالثة ومتأهلة", kind: "3G", slot: entry[0], opponentGroup: winnerGroup, opponentCode: opp?.code, opponentText: `بطل المجموعة ${winnerGroup}: ${teamName(opp?.code)}`, detail: `مصر تدخل كـ 3G أمام ${entry[0]}. رقم صف Annex C: ${row.no}.` };
  }

  return { ...base, qualifies: false, status: "danger", category: "مصر رابع المجموعة G", kind: "out", slot: "OUT", opponentText: "خروج", detail: "مصر تخرج من دور المجموعات." };
}

function egyptPath(standings, thirds) {
  const out = getEgyptOutcome(standings, thirds);
  return {
    status: out.status,
    title: out.category,
    body: `${out.detail} ${out.opponentText && out.opponentText !== "خروج" ? "يعني: " + out.opponentText + "." : ""}${out.topThirdLetters?.length ? " أفضل الثوالث: " + out.topThirdLetters.join(", ") + "." : ""}`
  };
}

const EXACT_SCENARIO_PATTERNS = [
  { hs: 1, as: 0, label: "فوز صاحب الأرض" },
  { hs: 1, as: 1, label: "تعادل" },
  { hs: 0, as: 1, label: "فوز الضيف" },
];

const SAMPLE_SCENARIO_PATTERNS = [
  { hs: 1, as: 0 }, { hs: 2, as: 0 }, { hs: 2, as: 1 },
  { hs: 0, as: 0 }, { hs: 1, as: 1 }, { hs: 2, as: 2 },
  { hs: 0, as: 1 }, { hs: 0, as: 2 }, { hs: 1, as: 2 },
];

function seededRandom(seed = 2026) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function cloneMatches(list) {
  return list.map(m => ({ ...m }));
}

function scenarioKey(outcome) {
  return [outcome.kind, outcome.slot, outcome.opponentGroup || "", outcome.opponentCode || "", outcome.qualifies ? "Q" : "OUT"].join("|");
}

function addScenarioResult(bucket, outcome) {
  const key = scenarioKey(outcome);
  if (!bucket.has(key)) {
    bucket.set(key, {
      key,
      count: 0,
      category: outcome.category,
      status: outcome.status,
      kind: outcome.kind,
      slot: outcome.slot,
      opponentText: outcome.opponentText,
      opponentCode: outcome.opponentCode,
      opponentGroup: outcome.opponentGroup,
      qualifies: outcome.qualifies,
      examples: new Set(),
    });
  }
  const item = bucket.get(key);
  item.count++;
  if (item.examples.size < 4 && outcome.letters) item.examples.add(outcome.letters);
}

function applyPattern(match, pattern) {
  return { ...match, hs: pattern.hs, as: pattern.as, completed: true };
}

function simulatePossibleOpponents() {
  const out = document.getElementById("possibleOpponents");
  const details = document.getElementById("scenarioDetails");
  const modeEl = document.getElementById("scenarioMode");
  if (!out || !details) return;

  const activeMatches = readEditorMatches();
  const remainingIndexes = activeMatches
    .map((m, idx) => ({ m, idx }))
    .filter(x => !Number.isFinite(x.m.hs) || !Number.isFinite(x.m.as))
    .map(x => x.idx);

  const bucket = new Map();
  const exactLimit = 10;
  const sampleLimit = Number(document.getElementById("scenarioSamples")?.value || 30000);
  const useExact = remainingIndexes.length <= exactLimit;
  const total = useExact ? Math.pow(EXACT_SCENARIO_PATTERNS.length, remainingIndexes.length) : sampleLimit;
  const rng = seededRandom(20260625 + remainingIndexes.length);

  if (!annexMap) {
    out.innerHTML = `<div class="scenario-card warning"><strong>Annex C لم يتحمل بعد</strong><span>اضغطي تحديث النتائج الآن. بدون Annex C أقدر أحسب مركز مصر، لكن خصم أول/ثالث G لن يكون دقيقًا.</span></div>`;
    details.textContent = annexError ? `سبب محتمل: ${annexError}` : "انتظري تحميل جدول Annex C.";
    return;
  }

  for (let n = 0; n < total; n++) {
    const scenario = cloneMatches(activeMatches);
    if (useExact) {
      let x = n;
      for (const matchIdx of remainingIndexes) {
        const pattern = EXACT_SCENARIO_PATTERNS[x % EXACT_SCENARIO_PATTERNS.length];
        scenario[matchIdx] = applyPattern(scenario[matchIdx], pattern);
        x = Math.floor(x / EXACT_SCENARIO_PATTERNS.length);
      }
    } else {
      for (const matchIdx of remainingIndexes) {
        const pattern = SAMPLE_SCENARIO_PATTERNS[Math.floor(rng() * SAMPLE_SCENARIO_PATTERNS.length)];
        scenario[matchIdx] = applyPattern(scenario[matchIdx], pattern);
      }
    }
    const standings = calculateStandings(scenario);
    const thirds = getThirds(standings);
    const outcome = getEgyptOutcome(standings, thirds);
    addScenarioResult(bucket, outcome);
  }

  const items = [...bucket.values()].sort((a,b) => b.count - a.count || a.category.localeCompare(b.category));
  const qCount = items.filter(i => i.qualifies).reduce((sum, i) => sum + i.count, 0);
  const outCount = total - qCount;
  modeEl.textContent = useExact ? `حساب كامل: ${total.toLocaleString("ar-EG")} سيناريو` : `عينة: ${total.toLocaleString("ar-EG")} سيناريو`;

  out.innerHTML = items.map(item => {
    const pct = ((item.count / total) * 100).toFixed(item.count === total ? 0 : 1);
    const statusClass = item.status === "danger" ? "danger" : item.status === "warning" ? "warning" : "good";
    const examples = [...item.examples].slice(0, 3).join(" / ");
    return `<div class="scenario-card ${statusClass}">
      <div class="scenario-card__top"><strong>${item.category}</strong><span>${pct}%</span></div>
      <div class="scenario-opponent">${item.qualifies ? item.opponentText : "خروج من البطولة"}</div>
      <div class="scenario-meta">${item.slot && item.slot !== "OUT" ? `الخانة: ${item.slot}` : ""} • ${item.count.toLocaleString("ar-EG")} سيناريو</div>
      ${examples ? `<small>أمثلة أفضل ثوالث: ${examples}</small>` : ""}
    </div>`;
  }).join("");

  details.innerHTML = `
    <strong>قراءة النتيجة:</strong>
    ${useExact ? "الحساب هنا كامل على نموذج فوز/تعادل/خسارة 1-0/1-1/0-1." : "لأن عدد المباريات المتبقية كبير، استخدمت عينة كبيرة بنتائج 1-0/2-0/2-1/تعادلات/0-1/0-2/1-2، فالنسب تقريبية وليست احتمالات مراهنات."}
    ${outCount ? `يوجد ${outCount.toLocaleString("ar-EG")} سيناريو في العينة/الحساب يؤدي لخروج مصر.` : "كل السيناريوهات المحسوبة تؤهل مصر."}
    عند التعادل الكامل بين فرق، الموقع يستخدم النقاط وفارق الأهداف والأهداف فقط ثم يضع ترتيبًا حروفيًا مؤقتًا؛ FIFA قد تستخدم اللعب النظيف/التصنيف.
  `;
}

function scheduleScenarioSimulation() {
  window.clearTimeout(window.__scenarioTimer);
  window.__scenarioTimer = window.setTimeout(simulatePossibleOpponents, 500);
}

function render() {
  const activeMatches = readEditorMatches();
  const standings = calculateStandings(activeMatches);
  const thirds = getThirds(standings);
  renderEgypt(standings, thirds);
  renderThirds(thirds);
  renderGroups(standings);
  renderMatches(activeMatches);
  scheduleScenarioSimulation();
}

function renderEgypt(standings, thirds) {
  const egypt = standings.G.find(r => r.code === "EGY");
  const pos = standings.G.findIndex(r => r.code === "EGY") + 1;
  document.getElementById("egyptSummary").innerHTML = [
    ["المركز", `${pos}`], ["النقاط", egypt.pts], ["فارق الأهداف", egypt.gd > 0 ? `+${egypt.gd}` : egypt.gd], ["الأهداف", egypt.gf]
  ].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  const path = egyptPath(standings, thirds);
  const el = document.getElementById("egyptPath");
  el.className = `path-box ${path.status === "danger" ? "danger" : path.status === "warning" ? "warning" : ""}`;
  el.innerHTML = `<strong>${path.title}</strong><br>${path.body}${egypt.tieFlag ? `<br><span class="badge warn">تنبيه: ترتيب مصر فيه تعادل يحتاج كسر تعادل FIFA الكامل</span>` : ""}`;
}

function renderThirds(thirds) {
  document.getElementById("thirdsList").innerHTML = thirds.map((r, idx) => `
    <div class="third-row ${idx < 8 ? "qual" : "out"}">
      <strong>${idx + 1}</strong>
      <span>${r.thirdGroup} — ${teamName(r.code)} ${idx < 8 ? `<span class="badge good">يصعد</span>` : `<span class="badge danger">خارج</span>`}</span>
      <span>${r.pts} pts</span>
      <span>GD ${r.gd > 0 ? "+" + r.gd : r.gd}</span>
      <span>GF ${r.gf}</span>
    </div>
  `).join("");
}

function renderGroups(standings) {
  document.getElementById("groupsTables").innerHTML = Object.entries(standings).map(([group, rows]) => `
    <div class="group-card">
      <div class="group-title"><span>Group ${group}</span><span>${rows.filter(r => r.mp === 3).length}/4 مكتمل</span></div>
      <table>
        <thead><tr><th>#</th><th>Team</th><th>Pts</th><th>MP</th><th>GD</th><th>GF</th></tr></thead>
        <tbody>${rows.map((r, i) => `
          <tr class="${r.code === "EGY" ? "egypt-row" : ""}">
            <td>${i + 1}</td><td><span class="team-name">${r.code} - ${teamName(r.code)}</span> ${r.tieFlag ? `<span class="badge warn">tie</span>` : ""}</td><td>${r.pts}</td><td>${r.mp}</td><td>${r.gd > 0 ? "+" + r.gd : r.gd}</td><td>${r.gf}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>
  `).join("");
}

function renderMatches(activeMatches = matches) {
  matches = activeMatches;
  document.getElementById("matchesEditor").innerHTML = matches.map(m => `
    <div class="match">
      <div class="match__top"><span>Group ${m.group}</span><span>${m.date || ""} • ${m.completed ? (m.officialCompleted === false ? "مباشر/يدوي مؤقت" : "دخلت في الحساب") : "لم تدخل بعد"}</span></div>
      <div class="score-line">
        <span class="home">${m.home} ${teamName(m.home)}</span>
        <input type="number" min="0" max="20" data-score="${m.id}-h" value="${Number.isFinite(m.hs) ? m.hs : ""}" />
        <span class="dash">-</span>
        <input type="number" min="0" max="20" data-score="${m.id}-a" value="${Number.isFinite(m.as) ? m.as : ""}" />
        <span class="away">${teamName(m.away)} ${m.away}</span>
      </div>
    </div>
  `).join("");
  document.querySelectorAll("[data-score]").forEach(inp => inp.addEventListener("input", () => {
    window.clearTimeout(window.__calcTimer);
    window.__calcTimer = window.setTimeout(render, 250);
  }));
}

function manualAnnex() {
  const value = document.getElementById("manualThirdLetters").value.toUpperCase();
  const letters = [...new Set((value.match(/[A-L]/g) || []))].sort();
  const out = document.getElementById("manualThirdResult");
  if (letters.length !== 8) {
    out.innerHTML = `لازم تدخلي 8 حروف مختلفة من A إلى L. الحالي: ${letters.join(", ") || "لا شيء"}`;
    return;
  }
  const key = letters.join("");
  const row = annexMap?.[key];
  if (!row) {
    out.innerHTML = `لم أجد الصف ${key}. ${annexError ? "سبب محتمل: " + annexError : "تأكدي أن Annex C تم تحميله."}`;
    return;
  }
  const slot = row.columns["1G"];
  out.innerHTML = `الصف رقم <strong>${row.no}</strong>. لو مصر أول G، الخصم هو <strong>${slot}</strong>، أي ثالث المجموعة <strong>${slot.replace("3", "")}</strong>.`;
}

function quickEgyptScenario(kind) {
  const i = matches.findIndex(m => (m.home === "EGY" && m.away === "IRI") || (m.home === "IRI" && m.away === "EGY"));
  if (i < 0) return;
  const m = { ...matches[i] };
  if (kind === "clear") { m.hs = null; m.as = null; m.completed = false; }
  else {
    const egyptHome = m.home === "EGY";
    if (kind === "win") { m.hs = egyptHome ? 2 : 0; m.as = egyptHome ? 0 : 2; }
    if (kind === "draw") { m.hs = 1; m.as = 1; }
    if (kind === "lose") { m.hs = egyptHome ? 0 : 2; m.as = egyptHome ? 2 : 0; }
    m.completed = true;
  }
  matches[i] = m;
  renderMatches(matches);
  render();
}

async function refreshOnline() {
  setStatus("جاري تحميل النتائج و Annex C...", "");
  document.getElementById("refreshBtn").disabled = true;
  try {
    const [online, annex] = await Promise.allSettled([fetchEspnMatches(), loadAnnexC()]);
    if (online.status === "fulfilled") {
      matches = online.value;
      originalMatches = structuredClone(matches);
      setStatus("تم تحميل النتائج من ESPN. إذا لاحظت نتيجة ناقصة، عدليها يدويًا.", "good");
    } else {
      matches = seedMatches();
      originalMatches = structuredClone(matches);
      setStatus("فشل تحديث ESPN؛ تم استخدام نسخة احتياطية قابلة للتعديل يدويًا.", "bad");
    }
    if (annex.status === "fulfilled" && annex.value) annexMap = annex.value;
    else if (!annexMap) annexMap = null;
    renderMatches(matches);
    render();
    document.getElementById("lastUpdated").textContent = `آخر تحديث: ${new Date().toLocaleString("ar-EG")}`;
    if (!annexMap) setStatus(`النتائج جاهزة، لكن Annex C لم يتحمل: ${annexError || "unknown error"}`, "bad");
  } finally {
    document.getElementById("refreshBtn").disabled = false;
  }
}

function init() {
  matches = seedMatches();
  originalMatches = structuredClone(matches);
  renderMatches(matches);
  render();
  refreshOnline();
  document.getElementById("refreshBtn").addEventListener("click", refreshOnline);
  document.getElementById("recalcBtn").addEventListener("click", render);
  document.getElementById("resetBtn").addEventListener("click", () => { matches = structuredClone(originalMatches); renderMatches(matches); render(); });
  document.getElementById("manualThirdBtn").addEventListener("click", manualAnnex);
  document.getElementById("simulateBtn").addEventListener("click", simulatePossibleOpponents);
  document.getElementById("scenarioSamples").addEventListener("change", simulatePossibleOpponents);
  document.querySelectorAll("[data-egypt]").forEach(btn => btn.addEventListener("click", e => quickEgyptScenario(e.currentTarget.dataset.egypt)));
}

init();
