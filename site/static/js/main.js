// main.js — minimal site behaviour (no framework).
(function () {
  // Home: reveal a single random hero candidate per visit.
  var candidates = document.querySelectorAll(".hero-candidate");
  if (candidates.length > 1) {
    candidates.forEach(function (el) { el.classList.add("hidden"); });
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    pick.classList.remove("hidden");
  }
})();
