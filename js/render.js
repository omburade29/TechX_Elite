/* ============================================================
   render.js  –  DOM Rendering for All Result Cards
   KisanMitra – Farm-to-Market Intelligence

   Each function below fills in one result card on the page.
   They all receive the `result` object from engine.js.
   ============================================================ */

/* ── MASTER RENDER FUNCTION ── */
/* Called from main.js once analysis is ready */
function renderResults(result) {
  renderScore(result);
  renderHarvestWindow(result);
  renderMarkets(result);
  renderPriceBars(result);
  renderSpoilage(result);
  renderPreservation(result);
  animateBars();
}

/* ── CARD 1: OVERALL SCORE ─────────────────────────────────── */
function renderScore(result) {
  const { score, reasons } = result.score;

  /* Colour ring */
  const ring = document.getElementById('scoreRing');
  ring.className = 'score-ring ' + ringClass(score, 70, 45);
  document.getElementById('scoreNum').textContent = score;

  /* Label, headline, subtext */
  const { label, headline, subtext } = scoreLabels(score);
  document.getElementById('scoreBadge').innerHTML = badge(label.text, label.cls);
  document.getElementById('scoreHeadline').textContent = headline;
  document.getElementById('scoreSubtext').textContent  = subtext;

  /* Reason text */
  document.getElementById('scoreReason').textContent =
    'Score calculated from: ' + reasons.join(', ') + '. Base score 60, adjusted by your real input signals.';

  /* Hindi summary */
  document.getElementById('hindiSummary').textContent = hindiText(score, result.crop);
}

/* ── CARD 2: HARVEST WINDOW ────────────────────────────────── */
function renderHarvestWindow(result) {
  const h = result.harvest;

  const items = [
    { label: 'Today',                    sub: h.today,                              active: false },
    { label: 'Ideal Harvest Window',     sub: h.optStart + ' → ' + h.optEnd,       active: true  },
    { label: 'Last Safe Harvest Date',   sub: h.lastSafe + ' (quality drops after)',active: false },
    { label: 'Best Harvest Time of Day', sub: h.weatherWarn,                        active: false },
  ];

  document.getElementById('harvestTimeline').innerHTML = items.map(function (item) {
    return '<div class="tl-item ' + (item.active ? 'active' : '') + '">'
      + '<div class="tl-label">' + item.label + '</div>'
      + '<div class="tl-sub">'   + item.sub   + '</div>'
      + '</div>';
  }).join('');

  /* Why reason */
  let reason = 'Based on your ' + h.harvestD + '-day estimate and ' + h.weather + ' weather. ';
  if (h.weather === 'Rain')     reason += 'Rain increases fungal risk — delay 2–3 days after rain stops. ';
  if (h.weather === 'Heatwave') reason += 'Heat damages cells — always harvest before 9 AM. ';
  reason += 'Selling outside this 9-day window typically reduces mandi price by 8–15% due to lower grading.';

  document.getElementById('harvestReason').textContent = reason;
}

/* ── CARD 3: MARKETS ───────────────────────────────────────── */
function renderMarkets(result) {
  const STARS = ['★★★', '★★☆', '★☆☆'];

  document.getElementById('marketRows').innerHTML = result.markets.map(function (m, i) {
    return '<tr>'
      + '<td><span class="rank-star">' + STARS[i] + '</span></td>'
      + '<td><strong>' + m.name + '</strong></td>'
      + '<td style="color:var(--leaf);font-weight:700">' + m.premium + ' vs MSP</td>'
      + '<td>~' + m.dist + ' km</td>'
      + '<td style="font-size:0.78rem">' + m.time + '</td>'
      + '</tr>';
  }).join('');

  document.getElementById('marketReason').textContent =
    'Markets ranked by: (1) historical price premium above MSP for ' + result.crop
    + ', (2) distance from your farm, (3) typical peak arrival timing. '
    + result.markets[0].name
    + ' has shown consistently higher prices in recent seasons based on AGMARKNET data. '
    + 'Arrive at market between 7–9 AM — commission agents pay better rates early.';
}

/* ── CARD 4: PRICE BARS ────────────────────────────────────── */
function renderPriceBars(result) {
  const { bars, peak } = result.priceBars;

  document.getElementById('priceBars').innerHTML = bars.map(function (b) {
    const color = b.pct >= 80 ? 'var(--leaf)' : b.pct >= 55 ? 'var(--risk-mid)' : 'var(--risk-high)';
    return '<div class="bar-wrap">'
      + '<div class="bar-label"><span>' + b.label + '</span>'
      + '<span style="font-weight:700;color:' + color + '">' + b.pct + '%</span></div>'
      + '<div class="bar-track"><div class="bar-fill" data-width="' + b.pct
      + '" style="width:0%;background:' + color + '"></div></div>'
      + '</div>';
  }).join('');

  document.getElementById('priceTrendReason').textContent =
    'For ' + result.crop + ' in ' + result.state
    + ', prices historically peak in the "' + peak.label + '" window. '
    + 'These bars use 5-year AGMARKNET averages adjusted for seasonal arrival patterns. '
    + 'A bar above 80% = good time to sell. Below 50% = consider storage if possible.';
}

/* ── CARD 5: SPOILAGE RISK ─────────────────────────────────── */
function renderSpoilage(result) {
  const { risk, reasons } = result.spoilage;
  const cd = result.cd;

  const sRing = document.getElementById('spoilRing');
  sRing.className = 'score-ring ' + ringClass(risk, 60, 30, true);
  document.getElementById('spoilNum').textContent = risk + '%';

  const { label, headline, subtext } = spoilLabels(risk);
  document.getElementById('spoilBadge').innerHTML   = badge(label.text, label.cls);
  document.getElementById('spoilHeadline').textContent = headline;
  document.getElementById('spoilSubtext').textContent  = subtext;

  document.getElementById('spoilReason').textContent =
    'Risk factors found: ' + reasons.join(', ') + '. '
    + result.crop + ' has a shelf life of ~' + cd.shelf
    + ' days under ideal conditions (' + cd.ideal_temp
    + ', moisture ' + cd.moisture + '). '
    + 'Your current storage (' + result.storage + ') and weather ('
    + result.weather + ') shift this significantly.';
}

/* ── CARD 6: PRESERVATION ACTIONS ─────────────────────────── */
function renderPreservation(result) {
  const RANK_CLASSES = ['rank-1', 'rank-2', 'rank-3', 'rank-4'];

  document.getElementById('preserveList').innerHTML = result.preserveActions.map(function (a, i) {
    return '<div class="preserve-item">'
      + '<div class="preserve-rank ' + RANK_CLASSES[i] + '">#' + a.rank + '</div>'
      + '<div>'
      + '<div class="preserve-title">' + a.title + '</div>'
      + '<div class="preserve-meta">'  + a.detail + '</div>'
      + '<div style="margin-top:5px">'
      + '<span class="cost-pill ' + a.costClass + '">💰 Cost: ' + a.cost + '</span>'
      + '&nbsp;<span style="font-size:0.72rem;color:var(--leaf);font-weight:600">✅ ' + a.eff + '</span>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

/* ── BAR ANIMATION ─────────────────────────────────────────── */
/* Small delay so the CSS transition fires visibly */
function animateBars() {
  setTimeout(function () {
    document.querySelectorAll('.bar-fill[data-width]').forEach(function (bar) {
      bar.style.width = bar.dataset.width + '%';
    });
  }, 120);
}

/* ══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS (private to this file)
   ══════════════════════════════════════════════════════════════ */

/* Returns CSS ring class.
   forRisk=true flips green/red (high % = bad for risk) */
function ringClass(value, highThresh, midThresh, forRisk) {
  if (!forRisk) {
    return value >= highThresh ? 'ring-green' : value >= midThresh ? 'ring-yellow' : 'ring-red';
  } else {
    return value >= highThresh ? 'ring-red' : value >= midThresh ? 'ring-yellow' : 'ring-green';
  }
}

/* Returns HTML badge string */
function badge(text, cls) {
  return '<span class="badge ' + cls + '">' + text + '</span>';
}

/* Returns score label set for overall opportunity card */
function scoreLabels(score) {
  if (score >= 70) return {
    label:    { text: '✅ Good Opportunity', cls: 'badge-green' },
    headline: 'Good time to harvest and sell!',
    subtext:  'Conditions are mostly in your favour this season.',
  };
  if (score >= 45) return {
    label:    { text: '⚠️ Moderate — Act Carefully', cls: 'badge-yellow' },
    headline: 'Possible, but take precautions.',
    subtext:  'Some risks present. Follow our suggestions closely.',
  };
  return {
    label:    { text: '❌ High Risk Season', cls: 'badge-red' },
    headline: 'Consider delaying or finding alternate buyers.',
    subtext:  'Multiple risk factors detected. Read all recommendations.',
  };
}

/* Returns spoilage label set */
function spoilLabels(risk) {
  if (risk >= 60) return {
    label:    { text: '🔴 High Spoilage Risk', cls: 'badge-red' },
    headline: 'Act within 1–2 days after harvest!',
    subtext:  'Significant loss possible without immediate action.',
  };
  if (risk >= 30) return {
    label:    { text: '🟡 Moderate Risk', cls: 'badge-yellow' },
    headline: 'Manageable with precautions.',
    subtext:  'Follow preservation steps to protect your crop.',
  };
  return {
    label:    { text: '🟢 Low Risk', cls: 'badge-green' },
    headline: 'Your crop is relatively safe.',
    subtext:  'Standard care is sufficient for this season.',
  };
}

/* Hindi summary text based on score tier */
function hindiText(score, crop) {
  if (score >= 70) {
    return 'आपकी फसल (' + crop + ') की स्थिति अच्छी है। मौसम और मिट्टी दोनों आपके पक्ष में हैं। जल्दी से नजदीकी मंडी में बेचें और अच्छा दाम पाएं।';
  }
  if (score >= 45) {
    return 'सावधानी जरूरी है। कुछ जोखिम हैं — नीचे दी गई सलाह ध्यान से पढ़ें। सही मंडी चुनें और फसल को ठीक से रखें।';
  }
  return 'इस समय फसल बेचने में खतरा है। देर करें या नजदीकी खरीदार से सीधा सौदा करें। भंडारण की व्यवस्था करें।';
}
