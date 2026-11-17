/* Tablet-only 80% zoom-out (Android tablets + iPad).
   Phones and desktop/laptop computers stay at 100%.
   Add ?zoomdebug to any page URL to see what the device reports. */
(function () {
  var ZOOM = 0.8;
  try {
    var ua = navigator.userAgent || "";
    var touchPoints = navigator.maxTouchPoints || 0;
    var isAndroid = /Android/i.test(ua);
    var isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1);
    var isMobileOS = isAndroid || isIPad || /iPhone|iPod/i.test(ua);
    var sw = screen.width, sh = screen.height;
    var shortSide = Math.min(sw, sh), longSide = Math.max(sw, sh);
    // Android tablets usually drop "Mobile" from the UA; cheap tablets that keep it
    // are caught by size (phones are under ~450px on their short side).
    var isTablet = isIPad || (isAndroid && !/Mobile/i.test(ua)) || (isMobileOS && shortSide >= 480);

    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }

    function apply() {
      var landscape = window.matchMedia && window.matchMedia("(orientation: landscape)").matches;
      var deviceW = landscape ? longSide : shortSide;
      var layoutW = Math.round(deviceW / ZOOM);
      meta.setAttribute("content", "width=" + layoutW + ", initial-scale=" + ZOOM + ", minimum-scale=" + ZOOM);
    }

    if (isTablet) {
      document.documentElement.classList.add("is-tablet");
      apply();
      window.addEventListener("orientationchange", function () { setTimeout(apply, 150); });
    }

    if (/zoomdebug/.test(location.search)) {
      window.addEventListener("load", function () {
        var d = document.createElement("div");
        d.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;background:#000;color:#0f0;font:12px monospace;padding:8px;border-radius:6px;max-width:90vw;word-break:break-all";
        d.textContent = "tablet=" + isTablet + " | screen=" + sw + "x" + sh + " | dpr=" + devicePixelRatio +
          " | innerW=" + innerWidth + " | touch=" + touchPoints + " | viewport=" + meta.content + " | UA=" + ua;
        document.body.appendChild(d);
      });
    }
  } catch (e) {}
})();
