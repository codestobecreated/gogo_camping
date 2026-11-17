/* Tablet-only 80% zoom-out.
   Phones (short side < 600px) and desktops (mouse/trackpad) are left at 100%.
   Tablets get the viewport scaled to 0.8, same as pinching out to 80%. */
(function () {
  try {
    var shortSide = Math.min(screen.width, screen.height);
    var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    var isTablet = touch && shortSide >= 600 && shortSide <= 1100;
    if (!isTablet) return;
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=0.8, minimum-scale=0.8");
    document.documentElement.classList.add("is-tablet");
  } catch (e) {}
})();
