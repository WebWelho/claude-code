#!/usr/bin/env node
// Market Scout Intelligence Dashboard Builder
// Reads reports/*.md, extracts structured data, generates docs/market-scout.html

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../../../reports');
const OUTPUT_FILE = path.join(__dirname, '../../../docs/market-scout.html');

// ── Regex patterns (matches Finnish report-compiler.md output) ──────────────
const OPP_HEADER = /^### \d+\.\s+(.+?)\s+[—\-–]+\s+(?:Pisteet|Score):\s*(\d+)\s*\/\s*10/;
const OPP_FIELD  = /^\*\*(Kategoria|Category|Mahdollisuustyyppi|Opportunity Type|Miksi nyt|Why Now|Toimenpide|Action):\*\*\s*(.+)/;
const OPP_SUMM   = /^>\s*(.+)/;
const TREND_HDR  = /^### (.+)/;
const STAT_LINE  = /^-\s+(.+?):\s*(\d+)/;
const FILE_DATE  = /(\d{4}-\d{2}-\d{2})-(\d{4})\.md$/;

// ── Normalization for cross-report duplicate detection ──────────────────────
function normalizeKey(name) {
  return name.toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/[^a-z0-9äöå ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenOverlap(a, b) {
  const ta = new Set(a.split(' ').filter(Boolean));
  const tb = new Set(b.split(' ').filter(Boolean));
  const inter = [...ta].filter(t => tb.has(t)).length;
  return inter / Math.max(ta.size, tb.size, 1);
}

// ── Section splitter ────────────────────────────────────────────────────────
function splitSections(text) {
  const lines = text.split('\n');
  const sections = { header: [], opportunities: [], trends: [], insight: [], stats: [] };
  let current = 'header';
  for (const line of lines) {
    if (/^## 🔥/.test(line)) current = 'opportunities';
    else if (/^## 📈/.test(line)) current = 'trends';
    else if (/^## 🌍/.test(line)) current = 'international';
    else if (/^## 💡/.test(line)) current = 'insight';
    else if (/^## 📊/.test(line)) current = 'stats';
    // English headers
    else if (/^## .*(Top Finland|Key Trends|International|Strategic Insight|Stats)/i.test(line)) {
      if (/Top Finland/i.test(line)) current = 'opportunities';
      else if (/Key Trends/i.test(line)) current = 'trends';
      else if (/International/i.test(line)) current = 'international';
      else if (/Strategic/i.test(line)) current = 'insight';
      else if (/Stats/i.test(line)) current = 'stats';
    }
    if (!sections[current]) sections[current] = [];
    sections[current].push(line);
  }
  return sections;
}

// ── Parse opportunities from section lines ──────────────────────────────────
function parseOpportunities(lines) {
  const opps = [];
  let cur = null;
  for (const line of (lines || [])) {
    const h = line.match(OPP_HEADER);
    if (h) {
      if (cur) opps.push(cur);
      cur = { name: h[1].trim(), score: parseInt(h[2]), category: '', type: '', why_now: '', action: '', summary: '' };
      continue;
    }
    if (!cur) continue;
    const f = line.match(OPP_FIELD);
    if (f) {
      const map = {
        'Kategoria': 'category', 'Category': 'category',
        'Mahdollisuustyyppi': 'type', 'Opportunity Type': 'type',
        'Miksi nyt': 'why_now', 'Why Now': 'why_now',
        'Toimenpide': 'action', 'Action': 'action'
      };
      if (map[f[1]]) cur[map[f[1]]] = f[2].trim();
    }
    const s = line.match(OPP_SUMM);
    if (s && !cur.summary) cur.summary = s[1].trim();
  }
  if (cur) opps.push(cur);
  return opps;
}

// ── Parse trends from section lines ─────────────────────────────────────────
function parseTrends(lines) {
  const trends = [];
  let cur = null;
  for (const line of (lines || [])) {
    const h = line.match(TREND_HDR);
    if (h) {
      if (cur) trends.push(cur);
      cur = { name: h[1].trim(), description: '' };
      continue;
    }
    if (cur && line.trim() && !line.startsWith('**')) {
      cur.description += (cur.description ? ' ' : '') + line.trim();
    }
  }
  if (cur) trends.push(cur);
  return trends;
}

// ── Parse stats ──────────────────────────────────────────────────────────────
function parseStats(lines) {
  const stats = {};
  for (const line of (lines || [])) {
    const m = line.match(STAT_LINE);
    if (m) stats[m[1].trim()] = parseInt(m[2]);
  }
  return stats;
}

// ── Date from filename ───────────────────────────────────────────────────────
function dateFromFile(filename) {
  const m = path.basename(filename).match(FILE_DATE);
  if (m) return `${m[1]}T${m[2].slice(0, 2)}:${m[2].slice(2)}`;
  // fallback: YYYY-MM-DD.md
  const d = path.basename(filename).match(/(\d{4}-\d{2}-\d{2})\.md$/);
  return d ? `${d[1]}T00:00` : '1970-01-01T00:00';
}

// ── Main data building ────────────────────────────────────────────────────────
function buildData() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.md') && f !== '.gitkeep')
    .sort();

  if (files.length === 0) {
    return null;
  }

  const allOpps = [];
  const allTrends = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8');
    if (text.includes('*Failed*') || text.includes('report failed')) continue;

    const date = dateFromFile(file);
    const secs = splitSections(text);
    const opps = parseOpportunities(secs.opportunities);
    const trends = parseTrends(secs.trends);

    for (const o of opps) {
      allOpps.push({ ...o, date, file });
    }
    for (const t of trends) {
      allTrends.push({ ...t, date });
    }
  }

  // ── Group opportunities by normalized name ─────────────────────────────────
  const groups = {};
  const keyMap = {};

  for (const opp of allOpps) {
    const key = normalizeKey(opp.name);
    // Check if overlaps with existing key
    let matched = null;
    for (const existingKey of Object.keys(groups)) {
      if (tokenOverlap(key, existingKey) >= 0.6) {
        matched = existingKey;
        break;
      }
    }
    const gKey = matched || key;
    if (!groups[gKey]) groups[gKey] = [];
    groups[gKey].push(opp);
    keyMap[key] = gKey;
  }

  // ── Build opportunity objects ──────────────────────────────────────────────
  const opportunities = Object.entries(groups).map(([key, opps]) => {
    const scores = opps.map(o => o.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const frequency = opps.length;
    // Canonical name = longest name in group
    const name = opps.reduce((a, b) => a.name.length > b.name.length ? a : b).name;
    // Latest values
    const latest = opps[opps.length - 1];

    return {
      id: key.replace(/\s+/g, '-').replace(/[^a-z0-9äöå-]/g, '').slice(0, 40),
      name,
      scores,
      avgScore: Math.round(avgScore * 10) / 10,
      maxScore,
      frequency,
      weight: Math.round(frequency * avgScore * 10) / 10,
      category: latest.category,
      type: latest.type,
      appearances: opps.map(o => ({
        date: o.date,
        file: o.file,
        score: o.score,
        action: o.action,
        why_now: o.why_now,
        summary: o.summary
      })).sort((a, b) => a.date.localeCompare(b.date)),
      trendTags: []
    };
  }).sort((a, b) => b.weight - a.weight);

  // ── Group trends by name ───────────────────────────────────────────────────
  const trendMap = {};
  for (const t of allTrends) {
    const key = normalizeKey(t.name);
    if (!trendMap[key]) trendMap[key] = { name: t.name, count: 0, dates: [], description: '' };
    trendMap[key].count++;
    trendMap[key].dates.push(t.date);
    trendMap[key].description = t.description || trendMap[key].description;
  }
  const trends = Object.values(trendMap).sort((a, b) => b.count - a.count);

  // ── Tag opportunities with trend keywords ──────────────────────────────────
  for (const opp of opportunities) {
    const text = opp.appearances.map(a => `${a.why_now} ${a.summary}`).join(' ').toLowerCase();
    opp.trendTags = trends
      .filter(t => t.name.split(' ').slice(0, 2).every(word =>
        word.length > 3 && text.includes(word.toLowerCase())
      ))
      .slice(0, 3)
      .map(t => t.name);
  }

  // ── Build connections ──────────────────────────────────────────────────────
  const connections = [];
  const connSet = new Set();

  // Same-report connections
  for (const file of files) {
    const date = dateFromFile(file);
    const inThisReport = opportunities.filter(o =>
      o.appearances.some(a => a.file === path.basename(file))
    );
    for (let i = 0; i < inThisReport.length; i++) {
      for (let j = i + 1; j < inThisReport.length; j++) {
        const a = inThisReport[i], b = inThisReport[j];
        const ckey = [a.id, b.id].sort().join('|');
        if (!connSet.has('r:' + ckey)) {
          connSet.add('r:' + ckey);
          const existing = connections.find(c =>
            (c.source === a.id && c.target === b.id) ||
            (c.source === b.id && c.target === a.id)
          );
          if (existing) {
            existing.strength++;
          } else {
            connections.push({ source: a.id, target: b.id, reason: 'same_report', label: date.slice(0, 10), strength: 1 });
          }
        }
      }
    }
  }

  // Shared-trend connections
  for (let i = 0; i < opportunities.length; i++) {
    for (let j = i + 1; j < opportunities.length; j++) {
      const a = opportunities[i], b = opportunities[j];
      const sharedTags = a.trendTags.filter(t => b.trendTags.includes(t));
      if (sharedTags.length > 0) {
        const existing = connections.find(c =>
          (c.source === a.id && c.target === b.id) ||
          (c.source === b.id && c.target === a.id)
        );
        if (existing) {
          existing.strength += sharedTags.length;
          if (existing.reason !== 'both') existing.reason = 'both';
        } else {
          connections.push({ source: a.id, target: b.id, reason: 'shared_trend', label: sharedTags[0], strength: sharedTags.length });
        }
      }
    }
  }

  const dates = files.map(dateFromFile).sort();
  return {
    generated: new Date().toISOString(),
    reportCount: files.filter(f => {
      const t = fs.readFileSync(path.join(REPORTS_DIR, f), 'utf8');
      return !t.includes('*Failed*') && !t.includes('report failed');
    }).length,
    dateRange: { first: dates[0]?.slice(0, 10), last: dates[dates.length - 1]?.slice(0, 10) },
    opportunities,
    trends: trends.slice(0, 20),
    connections
  };
}

// ── HTML generation ───────────────────────────────────────────────────────────
function generateHTML(data) {
  const dataJson = JSON.stringify(data);
  return `<!DOCTYPE html>
<html lang="fi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Market Scout — Intelligence Dashboard</title>
<style>
:root{--gold:#C9A84C;--dark:#0F0F0F;--dark-2:#1A1A1A;--dark-3:#242424;--gray:#6B6B6B;--gray-light:#A0A0A0;--green:#4CAF50;--amber:#FFA726;--red:#EF5350}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:var(--dark);color:#fff;min-height:100vh}
a{color:var(--gold);text-decoration:none}
header{padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.07);background:var(--dark-2);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
.logo{font-size:0.6rem;letter-spacing:0.25em;color:var(--gold);text-transform:uppercase;font-weight:700}
.logo span{display:block;font-size:1.1rem;letter-spacing:0;color:#fff;margin-top:0.2rem}
.stats-bar{display:flex;gap:1.5rem;flex-wrap:wrap}
.stat{text-align:center}
.stat-num{font-size:1.4rem;font-weight:700;color:var(--gold);display:block}
.stat-label{font-size:0.65rem;color:var(--gray-light);text-transform:uppercase;letter-spacing:0.1em}
nav.tabs{display:flex;border-bottom:1px solid rgba(255,255,255,0.07);background:var(--dark-2);padding:0 2rem}
.tab{background:none;border:none;color:var(--gray-light);padding:0.9rem 1.2rem;cursor:pointer;font-size:0.85rem;border-bottom:2px solid transparent;transition:all 0.2s}
.tab:hover{color:#fff}
.tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.tab-panel{display:none;padding:2rem}
.tab-panel.active{display:block}
.filters{display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap;align-items:center}
select,input{background:var(--dark-2);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:0.5rem 0.75rem;border-radius:4px;font-size:0.85rem}
select:focus,input:focus{outline:none;border-color:var(--gold)}
.opp-grid{display:grid;gap:1rem}
.opp-card{background:var(--dark-2);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:1.25rem;transition:border-color 0.2s}
.opp-card:hover{border-color:rgba(201,168,76,0.3)}
.opp-card.freq-high{border-left:3px solid var(--green)}
.opp-card.freq-med{border-left:3px solid var(--amber)}
.opp-card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:0.75rem}
.opp-name{font-size:1rem;font-weight:600}
.opp-meta{display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-top:0.4rem}
.badge{display:inline-block;padding:0.2rem 0.5rem;border-radius:3px;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
.badge-score-high{background:rgba(76,175,80,0.2);color:var(--green)}
.badge-score-mid{background:rgba(255,167,38,0.2);color:var(--amber)}
.badge-score-low{background:rgba(107,107,107,0.2);color:var(--gray-light)}
.badge-tag{background:rgba(201,168,76,0.1);color:var(--gold)}
.badge-freq{background:rgba(255,255,255,0.07);color:var(--gray-light)}
.opp-chips{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.75rem}
.chip{background:var(--dark-3);border:1px solid rgba(255,255,255,0.06);border-radius:3px;padding:0.2rem 0.5rem;font-size:0.7rem;color:var(--gray-light);cursor:default}
.chip.current{border-color:rgba(201,168,76,0.4);color:var(--gold)}
.opp-body{font-size:0.82rem;color:var(--gray-light);line-height:1.6}
.opp-action-text{margin-top:0.5rem;padding:0.5rem 0.75rem;background:rgba(201,168,76,0.07);border-radius:4px;color:#fff;font-size:0.82rem}
.opp-actions{display:flex;gap:0.5rem;margin-top:0.75rem;align-items:center}
.status-select{font-size:0.78rem;padding:0.3rem 0.6rem;border-radius:3px}
.status-select.status-0{border-color:rgba(255,255,255,0.15)}
.status-select.status-1{border-color:var(--amber);color:var(--amber)}
.status-select.status-2{border-color:#42A5F5;color:#42A5F5}
.status-select.status-3{border-color:var(--green);color:var(--green)}
.opp-toggle{background:none;border:1px solid rgba(255,255,255,0.1);color:var(--gray-light);padding:0.3rem 0.6rem;border-radius:3px;cursor:pointer;font-size:0.75rem}
.opp-toggle:hover{color:#fff;border-color:rgba(255,255,255,0.3)}
.opp-detail{display:none;margin-top:0.75rem;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.75rem;font-size:0.82rem;color:var(--gray-light);line-height:1.6}
.opp-detail.open{display:block}
#network-container{width:100%;height:600px;background:var(--dark-2);border:1px solid rgba(255,255,255,0.07);border-radius:6px;position:relative;overflow:hidden}
#network-svg{width:100%;height:100%}
.network-legend{display:flex;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap;font-size:0.8rem;color:var(--gray-light)}
.legend-item{display:flex;align-items:center;gap:0.4rem}
.legend-dot{width:10px;height:10px;border-radius:50%}
.legend-line{width:20px;height:2px}
#timeline-container{background:var(--dark-2);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:1.5rem}
#trends-container{display:grid;gap:1rem}
.trend-card{background:var(--dark-2);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:1rem;display:flex;gap:1rem;align-items:flex-start}
.trend-count{font-size:1.8rem;font-weight:700;color:var(--gold);min-width:2.5rem;text-align:center}
.trend-body h4{font-size:0.9rem;margin-bottom:0.3rem}
.trend-body p{font-size:0.8rem;color:var(--gray-light);line-height:1.5}
.trend-dates{font-size:0.7rem;color:var(--gray);margin-top:0.3rem}
.node-tooltip{position:absolute;background:var(--dark-2);border:1px solid rgba(201,168,76,0.3);border-radius:4px;padding:0.6rem 0.8rem;font-size:0.78rem;pointer-events:none;max-width:220px;z-index:10}
.node-tooltip h4{color:#fff;margin-bottom:0.3rem;font-size:0.85rem}
.empty-state{padding:3rem;text-align:center;color:var(--gray-light)}
</style>
</head>
<body>
<header>
  <div class="logo">Market Scout<span>Intelligence Dashboard</span></div>
  <div class="stats-bar">
    <div class="stat"><span class="stat-num" id="stat-reports">—</span><span class="stat-label">Raporttia</span></div>
    <div class="stat"><span class="stat-num" id="stat-opps">—</span><span class="stat-label">Mahdollisuutta</span></div>
    <div class="stat"><span class="stat-num" id="stat-recurring">—</span><span class="stat-label">Toistuvaa</span></div>
    <div class="stat"><span class="stat-num" id="stat-updated">—</span><span class="stat-label">Päivitetty</span></div>
  </div>
</header>
<nav class="tabs">
  <button class="tab active" data-tab="opportunities">Mahdollisuudet</button>
  <button class="tab" data-tab="network">Yhteydet</button>
  <button class="tab" data-tab="timeline">Aikajana</button>
  <button class="tab" data-tab="trends">Trendit</button>
</nav>

<div id="tab-opportunities" class="tab-panel active">
  <div class="filters">
    <input id="filter-search" type="text" placeholder="Hae mahdollisuutta..." style="width:220px">
    <select id="filter-status">
      <option value="">Kaikki tilat</option>
      <option value="0">Ei aloitettu</option>
      <option value="1">Otettu yhteyttä</option>
      <option value="2">Käynnissä</option>
      <option value="3">Valmis</option>
    </select>
    <select id="filter-sort">
      <option value="weight">Järjestys: Paino (toistuvuus × pisteet)</option>
      <option value="score">Järjestys: Korkein pisteet</option>
      <option value="frequency">Järjestys: Toistuvuus</option>
    </select>
  </div>
  <div id="opp-list"></div>
</div>

<div id="tab-network" class="tab-panel">
  <div class="network-legend">
    <div class="legend-item"><div class="legend-dot" style="background:var(--green)"></div> Pisteet ≥8</div>
    <div class="legend-item"><div class="legend-dot" style="background:var(--amber)"></div> Pisteet 6-7</div>
    <div class="legend-item"><div class="legend-dot" style="background:var(--gray)"></div> Pisteet &lt;6</div>
    <div class="legend-item"><div class="legend-line" style="background:var(--gold)"></div> Jaettu trendi</div>
    <div class="legend-item"><div class="legend-line" style="background:var(--gray);border-top:1px dashed var(--gray-light)"></div> Sama raportti</div>
    <small style="color:var(--gray-light)">Solmun koko = toistuvuus raportissa. Vedä solmuja siirtääksesi.</small>
  </div>
  <div id="network-container"><svg id="network-svg"></svg></div>
  <div id="node-tooltip" class="node-tooltip" style="display:none"></div>
</div>

<div id="tab-timeline" class="tab-panel">
  <div id="timeline-container"><canvas id="timeline-chart"></canvas></div>
</div>

<div id="tab-trends" class="tab-panel">
  <div id="trends-container"></div>
</div>

<script>const DATA = ${dataJson};</script>
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
// ── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab,.tab-panel').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'network') initNetwork();
    if (btn.dataset.tab === 'timeline') initTimeline();
    if (btn.dataset.tab === 'trends') initTrends();
  });
});

// ── Populate header stats ────────────────────────────────────────────────────
const recurring = DATA.opportunities.filter(o => o.frequency > 1).length;
document.getElementById('stat-reports').textContent = DATA.reportCount;
document.getElementById('stat-opps').textContent = DATA.opportunities.length;
document.getElementById('stat-recurring').textContent = recurring;
const upd = new Date(DATA.generated);
document.getElementById('stat-updated').textContent =
  upd.toLocaleDateString('fi-FI', {day:'2-digit',month:'2-digit'}) + ' ' +
  upd.toLocaleTimeString('fi-FI', {hour:'2-digit',minute:'2-digit'});

// ── LocalStorage status ──────────────────────────────────────────────────────
function getStatus(id) { return parseInt(localStorage.getItem('ms_status_' + id) || '0'); }
function setStatus(id, val) { localStorage.setItem('ms_status_' + id, val); }
const STATUS_LABELS = ['Ei aloitettu','Otettu yhteyttä','Käynnissä','Valmis'];

// ── Score color helper ───────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 8) return getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#4CAF50';
  if (s >= 6) return getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || '#FFA726';
  return '#6B6B6B';
}
function scoreBadgeClass(s) { return s >= 8 ? 'badge-score-high' : s >= 6 ? 'badge-score-mid' : 'badge-score-low'; }

// ── Opportunity list ─────────────────────────────────────────────────────────
function renderOpps() {
  const search = document.getElementById('filter-search').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  const sortBy = document.getElementById('filter-sort').value;

  let opps = [...DATA.opportunities];
  if (search) opps = opps.filter(o => o.name.toLowerCase().includes(search) || o.category.toLowerCase().includes(search));
  if (statusFilter !== '') opps = opps.filter(o => getStatus(o.id) === parseInt(statusFilter));
  if (sortBy === 'score') opps.sort((a, b) => b.maxScore - a.maxScore);
  else if (sortBy === 'frequency') opps.sort((a, b) => b.frequency - a.frequency);
  else opps.sort((a, b) => b.weight - a.weight);

  const container = document.getElementById('opp-list');
  if (opps.length === 0) {
    container.innerHTML = '<div class="empty-state">Ei tuloksia hakuehdoilla.</div>';
    return;
  }

  container.innerHTML = opps.map(o => {
    const status = getStatus(o.id);
    const freqClass = o.frequency >= 3 ? 'freq-high' : o.frequency >= 2 ? 'freq-med' : '';
    const chips = o.appearances.map(a => {
      const d = new Date(a.date);
      const label = d.toLocaleDateString('fi-FI', {day:'2-digit',month:'2-digit'}) + ' ' + d.toLocaleTimeString('fi-FI',{hour:'2-digit',minute:'2-digit'});
      const isLatest = a.date === o.appearances[o.appearances.length-1].date;
      return \`<span class="chip\${isLatest?' current':''}" title="\${a.file || ''}">\${label}</span>\`;
    }).join('');

    const trendTags = o.trendTags.map(t => \`<span class="badge badge-tag">\${t.slice(0,30)}</span>\`).join('');
    const latestAppearance = o.appearances[o.appearances.length - 1];

    return \`<div class="opp-card \${freqClass}" id="card-\${o.id}">
  <div class="opp-card-header">
    <div>
      <div class="opp-name">\${o.name}</div>
      <div class="opp-meta">
        <span class="badge \${scoreBadgeClass(o.maxScore)}">\${o.maxScore}/10</span>
        \${o.frequency > 1 ? \`<span class="badge badge-freq">×\${o.frequency} raportissa</span>\` : ''}
        \${o.category ? \`<span class="badge badge-tag">\${o.category}</span>\` : ''}
        \${trendTags}
      </div>
    </div>
  </div>
  <div class="opp-chips">\${chips}</div>
  \${latestAppearance.action ? \`<div class="opp-action-text">→ \${latestAppearance.action}</div>\` : ''}
  <div class="opp-actions">
    <select class="status-select status-\${status}" onchange="updateStatus('\${o.id}', this)">
      \${STATUS_LABELS.map((l,i) => \`<option value="\${i}" \${i===status?'selected':''}>\${l}</option>\`).join('')}
    </select>
    \${latestAppearance.why_now || latestAppearance.summary ?
      \`<button class="opp-toggle" onclick="toggleDetail('\${o.id}')">Lisätiedot ▾</button>\` : ''}
  </div>
  <div class="opp-detail" id="detail-\${o.id}">
    \${latestAppearance.why_now ? \`<p><strong>Miksi nyt:</strong> \${latestAppearance.why_now}</p>\` : ''}
    \${latestAppearance.summary ? \`<p style="margin-top:0.4rem">\${latestAppearance.summary}</p>\` : ''}
    \${o.frequency > 1 ? \`<p style="margin-top:0.5rem;color:var(--gold)">Esiintyi \${o.frequency} raportissa — pistehistoria: \${o.scores.join(', ')}</p>\` : ''}
  </div>
</div>\`;
  }).join('');
}

function updateStatus(id, sel) {
  const val = parseInt(sel.value);
  setStatus(id, val);
  sel.className = 'status-select status-' + val;
  renderOpps();
}
function toggleDetail(id) {
  const el = document.getElementById('detail-' + id);
  el.classList.toggle('open');
}

document.getElementById('filter-search').addEventListener('input', renderOpps);
document.getElementById('filter-status').addEventListener('change', renderOpps);
document.getElementById('filter-sort').addEventListener('change', renderOpps);
renderOpps();

// ── D3 Network ───────────────────────────────────────────────────────────────
let networkInited = false;
function initNetwork() {
  if (networkInited) return;
  networkInited = true;

  const container = document.getElementById('network-container');
  const W = container.clientWidth, H = container.clientHeight;
  const svg = d3.select('#network-svg').attr('viewBox', \`0 0 \${W} \${H}\`);
  const tooltip = document.getElementById('node-tooltip');

  const nodes = DATA.opportunities.map(o => ({
    id: o.id,
    label: o.name.length > 22 ? o.name.slice(0, 20) + '…' : o.name,
    fullName: o.name,
    r: Math.max(8, Math.min(28, 6 + o.frequency * 5)),
    color: scoreColor(o.avgScore),
    avgScore: o.avgScore,
    frequency: o.frequency,
    trendTags: o.trendTags
  }));

  const nodeIds = new Set(nodes.map(n => n.id));
  const links = DATA.connections
    .filter(c => nodeIds.has(c.source) && nodeIds.has(c.target))
    .map(c => ({ ...c, strength: Math.min(c.strength, 5) }));

  const g = svg.append('g');

  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

  const defs = svg.append('defs');
  defs.append('marker').attr('id','arrow').attr('viewBox','0 -3 8 6').attr('refX',12).attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
    .append('path').attr('d','M0,-3L8,0L0,3').attr('fill','rgba(255,255,255,0.15)');

  const link = g.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', d => d.reason === 'shared_trend' ? 'rgba(201,168,76,0.5)' : 'rgba(160,160,160,0.25)')
    .attr('stroke-width', d => d.strength)
    .attr('stroke-dasharray', d => d.reason === 'shared_trend' ? null : '4 3');

  const node = g.append('g').selectAll('g').data(nodes).join('g').attr('cursor','grab')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag',  (e, d) => { d.fx=e.x; d.fy=e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }));

  node.append('circle').attr('r', d => d.r)
    .attr('fill', d => d.color + '33')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 1.5);

  node.append('text').attr('text-anchor','middle').attr('dy','0.35em')
    .attr('fill','#fff').attr('font-size', d => Math.max(8, Math.min(11, d.r - 2)))
    .attr('pointer-events','none')
    .text(d => d.frequency > 1 ? d.label : '');

  node.on('mouseover', (e, d) => {
    const rect = container.getBoundingClientRect();
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
    tooltip.style.top  = (e.clientY - rect.top  - 20) + 'px';
    tooltip.innerHTML = \`<h4>\${d.fullName}</h4>Pisteet: \${d.avgScore}/10<br>Raportissa: \${d.frequency}×\${d.trendTags.length ? '<br>Trendit: ' + d.trendTags.join(', ') : ''}\`;
  }).on('mousemove', (e, d) => {
    const rect = container.getBoundingClientRect();
    tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
    tooltip.style.top  = (e.clientY - rect.top  - 20) + 'px';
  }).on('mouseout', () => { tooltip.style.display = 'none'; });

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => 140 / d.strength).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-250))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => d.r + 12))
    .on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });
}

// ── Timeline ─────────────────────────────────────────────────────────────────
let timelineInited = false;
function initTimeline() {
  if (timelineInited) return;
  timelineInited = true;

  const PALETTE = ['#C9A84C','#4CAF50','#42A5F5','#FFA726','#AB47BC','#26C6DA','#FF7043','#66BB6A','#EC407A','#8D6E63'];
  const top = DATA.opportunities.slice(0, 10);

  const datasets = top.map((opp, i) => ({
    label: opp.name,
    data: opp.appearances.map(a => ({ x: new Date(a.date).getTime(), y: a.score })),
    backgroundColor: PALETTE[i % PALETTE.length],
    borderColor: PALETTE[i % PALETTE.length],
    showLine: opp.appearances.length > 1,
    tension: 0.3,
    pointRadius: 6,
    pointHoverRadius: 8
  }));

  const ctx = document.getElementById('timeline-chart').getContext('2d');
  new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#A0A0A0', font: { size: 11 } } },
        tooltip: { callbacks: {
          title: ctx => ctx[0].dataset.label,
          label: ctx => {
            const d = new Date(ctx.parsed.x);
            return \`\${ctx.parsed.y}/10 — \${d.toLocaleDateString('fi-FI')}\`;
          }
        }}
      },
      scales: {
        x: {
          type: 'linear',
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#6B6B6B',
            callback: val => new Date(val).toLocaleDateString('fi-FI',{day:'2-digit',month:'2-digit'})
          }
        },
        y: {
          min: 0, max: 10,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#6B6B6B', stepSize: 2 },
          title: { display: true, text: 'Pisteet', color: '#6B6B6B' }
        }
      }
    }
  });
}

// ── Trends ───────────────────────────────────────────────────────────────────
function initTrends() {
  const container = document.getElementById('trends-container');
  if (container.children.length > 0) return;

  if (DATA.trends.length === 0) {
    container.innerHTML = '<div class="empty-state">Ei trendidataa vielä.</div>';
    return;
  }

  container.innerHTML = DATA.trends.slice(0, 15).map((t, i) => {
    const hue = 40 + i * 8;
    const dates = t.dates.map(d => new Date(d).toLocaleDateString('fi-FI',{day:'2-digit',month:'2-digit'})).join(', ');
    return \`<div class="trend-card">
  <div class="trend-count" style="color:hsl(\${hue},70%,55%)">\${t.count}</div>
  <div class="trend-body">
    <h4>\${t.name}</h4>
    <p>\${t.description.slice(0, 200) || '—'}</p>
    <div class="trend-dates">Esiintynyt: \${dates}</div>
  </div>
</div>\`;
  }).join('');
}
</script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const data = buildData();

if (!data) {
  // No reports yet — write placeholder
  const placeholder = `<!DOCTYPE html>
<html lang="fi">
<head><meta charset="UTF-8"><title>Market Scout</title>
<style>body{background:#0F0F0F;color:#A0A0A0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}</style>
</head>
<body><div><h1 style="color:#C9A84C">Market Scout</h1><p>Ei raportteja vielä. Ensimmäinen raportti ilmestyy seuraavan aikataulutetun ajon jälkeen.</p></div></body>
</html>`;
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, placeholder);
  console.log('Placeholder written (no reports yet)');
  process.exit(0);
}

const html = generateHTML(data);
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, html);
console.log(`Dashboard generated: ${data.reportCount} reports, ${data.opportunities.length} opportunities, ${data.connections.length} connections`);
console.log(`Output: ${OUTPUT_FILE} (${Math.round(html.length / 1024)}KB)`);
