/* GOGOCamping pricing – shared by the rental page and the CMS.
   Prices are per person and shown EXCLUDING GST ("+ GST"); GST is added at checkout.
   The CMS "Pricing & GST" panel saves changes here (localStorage "gogo_pricing"),
   and every open rental page updates automatically. */
(function () {
  var KEY = "gogo_pricing";
  var DEFAULTS = {
    gstPct: 18,
    tiers: [
      { min: 1, max: 25, rate: 2499 },
      { min: 26, max: 50, rate: 2399 },
      { min: 51, max: 100, rate: 2199 },
      { min: 101, max: null, rate: 1999 }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function valid(cfg) {
    return cfg && Array.isArray(cfg.tiers) && cfg.tiers.length === DEFAULTS.tiers.length &&
      cfg.tiers.every(function (t) { return t && isFinite(t.rate) && t.rate > 0; }) &&
      isFinite(cfg.gstPct) && cfg.gstPct >= 0 && cfg.gstPct <= 50;
  }

  function get() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (valid(saved)) {
        // tier boundaries are fixed; only rates + GST are editable
        var cfg = clone(DEFAULTS);
        cfg.gstPct = Number(saved.gstPct);
        cfg.tiers.forEach(function (t, i) { t.rate = Math.round(Number(saved.tiers[i].rate)); });
        cfg.updatedAt = saved.updatedAt || null;
        return cfg;
      }
    } catch (e) {}
    return clone(DEFAULTS);
  }

  function save(cfg) {
    if (!valid(cfg)) throw new Error("Invalid pricing");
    var out = { gstPct: Number(cfg.gstPct), tiers: cfg.tiers.map(function (t, i) {
      return { min: DEFAULTS.tiers[i].min, max: DEFAULTS.tiers[i].max, rate: Math.round(Number(t.rate)) };
    }), updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(out));
    window.dispatchEvent(new CustomEvent("gogo-pricing-change"));
    return out;
  }

  function reset() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("gogo-pricing-change"));
  }

  function tierLabel(t) { return t.max ? (t.min + "–" + t.max + " people") : (t.min + "+ people"); }

  function tierFor(n, cfg) {
    cfg = cfg || get();
    n = Math.max(1, parseInt(n, 10) || 1);
    for (var i = 0; i < cfg.tiers.length; i++) {
      var t = cfg.tiers[i];
      if (n >= t.min && (t.max === null || n <= t.max)) return t;
    }
    return cfg.tiers[cfg.tiers.length - 1];
  }

  /* Full price breakdown for n people:
     rate (per person, ex-GST), subtotal (ex-GST), gst, total (incl. GST),
     baseRate / baseSubtotal (1–25 rate, for the "was" price), savePerPerson, discountPct */
  function quote(n) {
    var cfg = get();
    n = Math.max(1, parseInt(n, 10) || 1);
    var tier = tierFor(n, cfg);
    var baseRate = cfg.tiers[0].rate;
    var subtotal = tier.rate * n;
    var gst = Math.round(subtotal * cfg.gstPct / 100);
    return {
      persons: n,
      rate: tier.rate,
      tier: tier,
      tierLabel: tierLabel(tier),
      subtotal: subtotal,
      gstPct: cfg.gstPct,
      gst: gst,
      total: subtotal + gst,
      baseRate: baseRate,
      baseSubtotal: baseRate * n,
      savePerPerson: Math.max(0, baseRate - tier.rate),
      discountPct: baseRate > tier.rate ? Math.round((1 - tier.rate / baseRate) * 100) : 0
    };
  }

  function onChange(cb) {
    window.addEventListener("gogo-pricing-change", cb);
    window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === null) cb(); });
  }

  window.GogoPricing = {
    KEY: KEY, DEFAULTS: clone(DEFAULTS),
    get: get, save: save, reset: reset,
    tierFor: tierFor, tierLabel: tierLabel, quote: quote, onChange: onChange
  };
})();
