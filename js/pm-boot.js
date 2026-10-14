/* Valois Pro Motion - boot (runs in <head>, before first paint).
   Marks the document so CSS can cover the page with the intro curtain
   and hold hero animations until the preloader has opened. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    root.classList.add('pm-loaded');
    return;
  }
  root.classList.add('pm-ready', 'pm-preload');
  // Failsafe: never leave the visitor staring at a curtain if the main script fails.
  setTimeout(function () {
    root.classList.remove('pm-preload');
    root.classList.add('pm-loaded');
    var el = document.getElementById('pm-preloader');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }, 6000);
})();
