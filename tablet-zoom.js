/* 80% zoom-out for tablet-size screens, so they show the laptop layout.
   1) Real tablets (Android / iPad): the viewport is scaled to 0.8, like pinching out.
   2) Any other screen whose width is 768-1399px (small laptops, browser windows,
      DevTools "Responsive" mode): the page is drawn with CSS zoom 0.8.
   Phones (< 768px) and laptops/desktops 1400px+ stay at 100%.
   Add ?zoomdebug to any page URL to see what the device reports. */
(function () {
  var ZOOM = 0.8;
  var MIN_W = 768, MAX_W = 1399;
  var html = document.documentElement;
  try {
    var ua = navigator.userAgent || "";
    var touchPoints = navigator.maxTouchPoints || 0;
    var isAndroid = /Android/i.test(ua);
    var isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1);
    var isMobileOS = isAndroid || isIPad || /iPhone|iPod/i.test(ua);
    var sw = screen.width, sh = screen.height;
    var shortSide = Math.min(sw, sh), longSide = Math.max(sw, sh);
    var isTablet = isIPad || (isAndroid && !/Mobile/i.test(ua)) || (isMobileOS && shortSide >= 480);

    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }

    if (isTablet) {
      var applyMeta = function () {
        var landscape = window.matchMedia("(orientation: landscape)").matches;
        var layoutW = Math.round((landscape ? longSide : shortSide) / ZOOM);
        meta.setAttribute("content", "width=" + layoutW + ", initial-scale=" + ZOOM + ", minimum-scale=" + ZOOM);
      };
      html.classList.add("is-tablet");
      applyMeta();
      window.addEventListener("orientationchange", function () { setTimeout(applyMeta, 150); });
    } else {
      // Screen-height units (svh/vh) shrink with CSS zoom, so scale them back up.
      var k = (1 / ZOOM);
      var css =
        'html.gg-zoom{zoom:' + ZOOM + '}' +
        'html.gg-zoom [class~="h-[100svh]"]{height:' + (100 * k) + 'svh}' +
        'html.gg-zoom [class~="pt-[clamp(96px,15svh,140px)]"]{padding-top:clamp(96px,' + (15 * k) + 'svh,140px)}' +
        'html.gg-zoom [class~="pb-[clamp(36px,7svh,90px)]"]{padding-bottom:clamp(36px,' + (7 * k) + 'svh,90px)}' +
        'html.gg-zoom [class~="h-[clamp(160px,calc(100svh_-_560px),402px)]"]{height:clamp(160px,calc(' + (100 * k) + 'svh - 560px),402px)}' +
        'html.gg-zoom [class~="mb-[clamp(20px,4svh,56px)]"]{margin-bottom:clamp(20px,' + (4 * k) + 'svh,56px)}' +
        'html.gg-zoom [class~="mb-[clamp(16px,3svh,32px)]"]{margin-bottom:clamp(16px,' + (3 * k) + 'svh,32px)}' +
        'html.gg-zoom [class~="max-h-[78vh]"]{max-height:' + (78 * k) + 'vh}' +
        'html.gg-zoom [class~="max-h-[90vh]"]{max-height:' + (90 * k) + 'vh}' +
        'html.gg-zoom [class~="max-h-[92vh]"]{max-height:' + (92 * k) + 'vh}';
      var style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);

      var mq = window.matchMedia("(min-width: " + MIN_W + "px) and (max-width: " + MAX_W + "px)");
      var sync = function () {
        html.classList.toggle("gg-zoom", mq.matches);
        window.dispatchEvent(new Event("gg-zoom-change"));
      };
      sync();
      if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
    }

    if (/zoomdebug/.test(location.search)) {
      window.addEventListener("load", function () {
        var d = document.createElement("div");
        d.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;background:#000;color:#0f0;font:12px monospace;padding:8px;border-radius:6px;max-width:90vw;word-break:break-all";
        d.textContent = "tablet=" + isTablet + " | cssZoom=" + html.classList.contains("gg-zoom") + " | screen=" + sw + "x" + sh +
          " | dpr=" + devicePixelRatio + " | innerW=" + innerWidth + " | touch=" + touchPoints + " | viewport=" + meta.content + " | UA=" + ua;
        document.body.appendChild(d);
      });
    }
  } catch (e) {}
})();
