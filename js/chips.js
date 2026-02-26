/* ============================================================
   chips.js  –  Chip Toggle Buttons (Soil Health & Weather)
   KisanMitra – Farm-to-Market Intelligence

   This file handles the click logic for the "chip" buttons.
   Clicking a chip makes it active and deactivates others in
   the same group.
   ============================================================ */

/* Run after DOM is ready */
document.addEventListener('DOMContentLoaded', function () {

  /* Find all chips inside #soilChips and #weatherChips */
  const allChips = document.querySelectorAll('#soilChips .chip, #weatherChips .chip');

  allChips.forEach(function (chip) {
    chip.addEventListener('click', function () {

      /* Get the parent .chips container */
      const group = this.closest('.chips');

      /* Remove active from every chip in this group */
      group.querySelectorAll('.chip').forEach(function (c) {
        c.classList.remove('active');
      });

      /* Mark the clicked chip as active */
      this.classList.add('active');
    });
  });

});

/* ── HELPER: Read the active chip value from a container ── */
/*
  Usage: getChipVal('soilChips')   → returns 'Good', 'Average', or 'Poor'
         getChipVal('weatherChips') → returns 'Clear', 'Cloudy', 'Rain', or 'Heatwave'
*/
function getChipVal(containerId) {
  const active = document.querySelector('#' + containerId + ' .chip.active');
  return active ? active.dataset.val : '';
}
