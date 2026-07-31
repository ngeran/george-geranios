// lightbox.js — accessible vanilla-JS lightbox using <dialog>.
// Shows the enlarged image under a repeating "george geranios" watermark and
// applies friction against saving (context menu / drag disabled). NOTE: this is
// a deterrent, not absolute protection — anything a browser renders can be saved.
(function () {
  var triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length) return;

  var items = Array.prototype.slice.call(triggers);
  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML =
    '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close">' + svg("close") + "</button>" +
    '<div class="lightbox__frame">' +
    '<img class="lightbox__img" alt="" draggable="false">' +
    '<div class="lightbox__watermark" aria-hidden="true"></div>' +
    "</div>" +
    '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous">' + svg("prev") + "</button>" +
    '<button type="button" class="lightbox__btn lightbox__next" aria-label="Next">' + svg("next") + "</button>";
  document.body.appendChild(dialog);

  var img = dialog.querySelector(".lightbox__img");
  var current = 0;

  function svg(kind) {
    if (kind === "close")
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    if (kind === "prev")
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  }

  function show(i) {
    current = (i + items.length) % items.length;
    var a = items[current];
    img.src = a.getAttribute("href");
    var inner = a.querySelector("img");
    img.alt = inner ? inner.alt || "" : "";
  }

  items.forEach(function (el, i) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      show(i);
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  // download friction
  dialog.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  dialog.addEventListener("dragstart", function (e) { e.preventDefault(); });

  dialog.querySelector(".lightbox__close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
  dialog.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });

  document.addEventListener("keydown", function (e) {
    if (!dialog.open) return;
    if (e.key === "Escape") dialog.close();
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "ArrowLeft") show(current - 1);
  });
})();
