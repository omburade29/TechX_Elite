/* ============================================================
   main.js  –  Application Entry Point
   KisanMitra – Farm-to-Market Intelligence

   This file is the "controller":
     1. Reads all user inputs from the form
     2. Validates them
     3. Shows the loader
     4. Calls engine.js to do the maths
     5. Calls render.js to show the results
   ============================================================ */

/* ── MAIN FUNCTION (called by the Analyse button) ─────────── */
function runAnalysis() {

  /* ── Step 1: Read inputs ── */
  const state     = document.getElementById('state').value;
  const crop      = document.getElementById('crop').value;
  const farmSize  = parseFloat(document.getElementById('farmSize').value);
  const harvestD  = parseInt(document.getElementById('harvestDays').value);
  const storage   = document.getElementById('storage').value;
  const mandiDist = parseInt(document.getElementById('mandiDist').value);
  const soil      = getChipVal('soilChips');      /* from chips.js */
  const weather   = getChipVal('weatherChips');   /* from chips.js */

  /* ── Step 2: Validate ── */
  if (!state || !crop) {
    alert('Please select both a State and a Crop to continue.');
    return;
  }

  /* ── Step 3: Show loader, hide old results ── */
  document.getElementById('loader').classList.add('show');
  document.getElementById('results').classList.remove('visible');

  /* ── Step 4 & 5: Wait 1.5 s (simulates data fetch), then analyse + render ── */
  setTimeout(function () {

    /* Hide loader */
    document.getElementById('loader').classList.remove('show');

    /* Run the scoring engine (engine.js) */
    const result = analyseInputs({
      state, crop, farmSize, harvestD, storage, mandiDist, soil, weather,
    });

    /* Render all result cards (render.js) */
    renderResults(result);

    /* Show results panel */
    document.getElementById('results').classList.add('visible');

    /* Scroll smoothly to results */
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  }, 1500);
}
