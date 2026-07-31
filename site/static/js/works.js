// works.js — client-side Period filter + Chronological/Reference sort for the
// systematic catalogue. No-op if the catalogue isn't on the page.
(function () {
  var list = document.getElementById("work-list");
  if (!list) return;
  var period = document.getElementById("work-period");
  var sortGroup = document.getElementById("work-sort");
  var countEl = document.getElementById("work-count");
  var tmpl = countEl ? countEl.getAttribute("data-showing-template") || "SHOWING {shown} OF {total} WORKS" : "";
  var rows = Array.prototype.slice.call(list.querySelectorAll(".work-row"));
  var total = rows.length;

  function activeSort() {
    var btn = sortGroup.querySelector("button[data-sort].text-primary");
    return btn ? btn.getAttribute("data-sort") : "chrono";
  }

  function apply() {
    var era = period ? period.value : "all";
    var sort = activeSort();
    var visible = rows.filter(function (r) {
      return era === "all" || r.getAttribute("data-era") === era;
    });
    visible.sort(function (a, b) {
      if (sort === "ref") {
        return (a.getAttribute("data-ref") || "").localeCompare(
          b.getAttribute("data-ref") || "", undefined, { numeric: true }
        );
      }
      return (parseInt(b.getAttribute("data-year"), 10) || 0) -
             (parseInt(a.getAttribute("data-year"), 10) || 0);
    });
    visible.forEach(function (r) { list.appendChild(r); r.classList.remove("hidden"); });
    rows.forEach(function (r) { if (visible.indexOf(r) === -1) r.classList.add("hidden"); });
    if (countEl) countEl.textContent = tmpl.replace("{shown}", visible.length).replace("{total}", total);
  }

  if (period) period.addEventListener("change", apply);
  if (sortGroup) {
    sortGroup.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-sort]");
      if (!btn) return;
      sortGroup.querySelectorAll("button[data-sort]").forEach(function (b) {
        b.classList.remove("text-primary");
        b.classList.add("text-on-surface-variant");
      });
      btn.classList.add("text-primary");
      btn.classList.remove("text-on-surface-variant");
      apply();
    });
  }
})();
