
function analyseInputs(params) {
  const { state, crop, farmSize, harvestD, storage, mandiDist, soil, weather } = params;

  const cd = CROP_DATA[crop];  /* crop profile from data.js */

  return {
    score:      computeOpportunityScore(cd, params),
    spoilage:   computeSpoilageRisk(cd, params),
    harvest:    computeHarvestWindow(harvestD, weather),
    markets:    computeMarkets(state, mandiDist),
    priceBars:  computePriceBars(crop),
    preserveActions: PRESERVE_ACTIONS[crop] || PRESERVE_ACTIONS.Default,
    crop,
    state,
    storage,
    weather,
    cd,
  };
}


function computeOpportunityScore(cd, p) {
  let score = 60;
  const reasons = [];

  /* Soil quality */
  if (p.soil === 'Good')    { score += 10; reasons.push('soil health is good (+10)'); }
  if (p.soil === 'Poor')    { score -= 10; reasons.push('poor soil reduces yield quality (−10)'); }

  /* Weather */
  if (p.weather === 'Clear')    { score += 8;  reasons.push('clear weather is ideal for harvest (+8)'); }
  if (p.weather === 'Rain')     { score -= 12; reasons.push('rain increases spoilage and transit risk (−12)'); }
  if (p.weather === 'Heatwave') { score -= 8;  reasons.push('heatwave stresses perishable crops (−8)'); }

  /* Distance to mandi */
  if (p.mandiDist < 50)  { score += 7;  reasons.push('nearby mandi reduces transit loss (+7)'); }
  if (p.mandiDist > 100) { score -= 8;  reasons.push(`far mandi (${p.mandiDist} km) increases cost and risk (−8)`); }

  /* Storage facility */
  if (p.storage === 'ColdRoom') { score += 12; reasons.push('cold storage greatly protects crop value (+12)'); }
  if (p.storage === 'None')     { score -= 8;  reasons.push('no storage = must sell immediately (−8)'); }

  /* Perishable crop with no storage = double penalty */
  if (cd.perishable && p.storage === 'None') {
    score -= 6;
    reasons.push(`${p.crop} is perishable and has no storage — highest urgency (−6)`);
  }

  /* Clamp */
  score = Math.min(98, Math.max(28, score));

  return { score, reasons };
}

/* ── 2. SPOILAGE RISK ─────────────────────────────────────── */
/*
  Risk score 0–100%.
  Higher = more likely to lose produce after harvest.
*/
function computeSpoilageRisk(cd, p) {
  let risk = 0;
  const reasons = [];

  if (cd.perishable)            { risk += 35; reasons.push(`${p.crop} is highly perishable`); }
  if (p.storage === 'None')     { risk += 25; reasons.push('no storage available'); }
  if (p.storage === 'Home')     { risk += 12; reasons.push('basic home (kaccha) storage'); }
  if (p.storage === 'ColdRoom') { risk -= 20; reasons.push('cold room greatly reduces risk'); }
  if (p.weather === 'Rain')     { risk += 15; reasons.push('rain weather increases moisture levels'); }
  if (p.weather === 'Heatwave') { risk += 12; reasons.push('heatwave accelerates decay'); }
  if (p.mandiDist > 80)         { risk += 10; reasons.push(`long transit distance (${p.mandiDist} km)`); }

  risk = Math.min(95, Math.max(5, risk));

  return { risk, reasons };
}

/* ── 3. HARVEST WINDOW ────────────────────────────────────── */
/*
  Returns 4 milestone dates based on:
    - harvestD : days from now the crop will be ready
    - weather  : adjusts warnings
*/
function computeHarvestWindow(harvestD, weather) {
  const today = new Date();

  /* Optimal window starts 4 days early, ends 5 days late */
  const optStart = addDays(today, Math.max(0, harvestD - 4));
  const optEnd   = addDays(today, harvestD + 5);

  /* Last safe date — quality drops after this */
  const lastSafe = addDays(today, harvestD + 14);

  /* Weather-specific warning */
  let weatherWarn;
  if (weather === 'Rain')     weatherWarn = 'Do NOT harvest during rain — wait for 2 clear days first.';
  else if (weather === 'Heatwave') weatherWarn = 'Harvest in early morning only (before 9 AM) to prevent heat damage.';
  else                        weatherWarn = 'Avoid midday heat — 6 AM to 10 AM is the best harvest time.';

  return {
    today:      fmt(today),
    optStart:   fmt(optStart),
    optEnd:     fmt(optEnd),
    lastSafe:   fmt(lastSafe),
    weatherWarn,
    harvestD,
    weather,
  };
}

/* ── 4. MARKET RANKING ────────────────────────────────────── */
function computeMarkets(state, mandiDist) {
  const rows = MARKET_DB[state] || MARKET_DB['Punjab'];

  return rows.map(function (m, i) {
    return {
      name:    m[0],
      premium: m[1],
      dist:    m[2] + mandiDist,          /* add farmer's own distance */
      time:    i === 0 ? 'Morning (7–10 AM)' :
               i === 1 ? 'Early Week'     : 'Avoid weekend',
    };
  });
}

/* ── 5. PRICE BARS ────────────────────────────────────────── */
/*
  Returns 4 months of normalised price index (0-99).
  Uses PRICE_SEASONALITY from data.js + a base pattern.
*/
function computePriceBars(crop) {
  const BASE = [65, 78, 92, 70];
  const adj  = PRICE_SEASONALITY[crop] || [0, 0, 0, 0];
  const labels = ['This Month', 'Next Month', '+2 Months', '+3 Months'];

  const bars = BASE.map(function (b, i) {
    return {
      label: labels[i],
      pct:   Math.min(99, Math.max(20, b + adj[i])),
    };
  });

  /* Find which month has peak price */
  const peak = bars.reduce(function (best, bar, i) {
    return bar.pct > best.pct ? { pct: bar.pct, label: bar.label } : best;
  }, { pct: 0, label: '' });

  return { bars, peak };
}

/* ── UTILITY ──────────────────────────────────────────────── */
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
