/* GOGOCamping booking calendar rules – shared by the booking page, the CMS and Gopal's Calendar Control.
   - Daily capacity (default 25 campers per day). A full day shows "Closed".
   - Weekday rule (Mon–Fri): open to all, only groups of N+ (default 25), or blocked.
   - Date overrides set by the calendar admin: "blocked" (closed) or "open" (e.g. a public holiday,
     treated like a weekend day).
   Settings live in localStorage "gogo_calendar"; bookings come from "gogo_bookings_db". */
(function () {
  var KEY = "gogo_calendar";
  var BOOKINGS_KEY = "gogo_bookings_db";
  var DEFAULTS = { dailyCapacity: 50, weekdayMode: "min", weekdayMinGroup: 25, overrides: {} };

  // Admin roles (static site: no real login – the page shows who it is for)
  var ADMINS = {
    gopal: { id: "gopal", name: "Gopal", role: "Calendar Admin", permissions: ["calendar", "bookings:view"] }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? fallback : v; } catch (e) { return fallback; } }

  function getSettings() {
    var s = read(KEY, null);
    var out = clone(DEFAULTS);
    if (s && typeof s === "object") {
      if (s.dailyCapacity > 0) out.dailyCapacity = Math.round(s.dailyCapacity);
      if (["open", "min", "blocked"].indexOf(s.weekdayMode) >= 0) out.weekdayMode = s.weekdayMode;
      if (s.weekdayMinGroup > 0) out.weekdayMinGroup = Math.round(s.weekdayMinGroup);
      if (s.overrides && typeof s.overrides === "object") out.overrides = s.overrides;
      out.updatedAt = s.updatedAt || null;
      out.updatedBy = s.updatedBy || null;
    }
    return out;
  }

  function saveSettings(s, by) {
    var cur = getSettings();
    var next = Object.assign(cur, s, { updatedAt: new Date().toISOString(), updatedBy: by || cur.updatedBy || null });
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("gogo-calendar-change"));
    return next;
  }

  function setOverride(date, value, by) {
    var s = getSettings();
    if (value === "open" || value === "blocked") s.overrides[date] = value; else delete s.overrides[date];
    return saveSettings({ overrides: s.overrides }, by);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayISO() { return iso(new Date()); }
  function parse(dateStr) { var p = dateStr.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function isWeekday(dateStr) { var d = parse(dateStr).getDay(); return d >= 1 && d <= 5; }

  function bookings() { return read(BOOKINGS_KEY, []); }
  function bookingsOn(dateStr, list) {
    return (list || bookings()).filter(function (b) { return b.tripDate === dateStr && b.status !== "Cancelled" && b.type !== "event"; });
  }
  function bookedOn(dateStr, list) {
    return bookingsOn(dateStr, list).reduce(function (s, b) { return s + (parseInt(b.camperCount, 10) || 1); }, 0);
  }

  /* Status of a date for a group of `group` campers:
     state: "past" | "blocked" | "full" | "open" ; plus `bookable` for this group and a `reason`. */
  function dayStatus(dateStr, group, cfg, list) {
    cfg = cfg || getSettings();
    group = Math.max(1, parseInt(group, 10) || 1);
    var booked = bookedOn(dateStr, list);
    var cap = cfg.dailyCapacity;
    var left = Math.max(0, cap - booked);
    var ov = cfg.overrides[dateStr] || null;
    var weekday = isWeekday(dateStr);
    var res = { date: dateStr, booked: booked, capacity: cap, left: left, override: ov, weekday: weekday, minGroup: 1 };

    if (dateStr < todayISO()) return Object.assign(res, { state: "past", bookable: false, label: "Past", reason: "This date has passed" });
    if (ov === "blocked") return Object.assign(res, { state: "blocked", bookable: false, label: "Closed", reason: "Closed by GOGOCamping" });
    if (left <= 0) return Object.assign(res, { state: "full", bookable: false, label: "Closed", reason: "Fully booked (" + cap + " campers)" });
    if (weekday && ov !== "open") {
      if (cfg.weekdayMode === "blocked") return Object.assign(res, { state: "blocked", bookable: false, label: "Closed", reason: "Weekdays are closed" });
      if (cfg.weekdayMode === "min") {
        res.minGroup = cfg.weekdayMinGroup;
        if (group < cfg.weekdayMinGroup) return Object.assign(res, { state: "open", bookable: false, label: cfg.weekdayMinGroup + "+ only", reason: "Weekdays are only for groups of " + cfg.weekdayMinGroup + "+ campers" });
      }
    }
    if (group > left) return Object.assign(res, { state: "open", bookable: false, label: left + " left", reason: "Only " + left + " spot" + (left === 1 ? "" : "s") + " left on this day" });
    return Object.assign(res, { state: "open", bookable: true, label: left + " left", reason: "Open" });
  }

  /* Demo data (runs once per browser): sample bookings on the coming days so every date shows a
     different number of free slots – e.g. 2, 50, 45, 26 left – with 50 campers per day.
     Demo bookings are named "Demo booking" and can be deleted from the CMS. */
  var DEMO_FLAG = "gogo_calendar_demo_v1";
  var DEMO_BOOKED = [48, 0, 5, 24, 30, 12, 40, 0, 20, 45, 8, 35, 18, 0, 27, 3, 44, 10, 0, 33, 15];
  function seedDemo() {
    try {
      if (localStorage.getItem(DEMO_FLAG)) return;
      var s = read(KEY, null);
      if (!s || !(s.dailyCapacity >= 50)) {
        s = s && typeof s === "object" ? s : {};
        s.dailyCapacity = 50;
        localStorage.setItem(KEY, JSON.stringify(s));
      }
      var list = read(BOOKINGS_KEY, []);
      var today = new Date();
      for (var i = 0; i < 45; i++) {
        var n = DEMO_BOOKED[i % DEMO_BOOKED.length];
        if (!n) continue;
        var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        var date = iso(d);
        list.push({
          id: "#GOGO-DEMO-" + date.replace(/-/g, ""), demo: true,
          leadName: "Demo booking", phone: "9000000000", email: "", isLoggedInUser: false,
          packageName: n + " Person Camping Tent", camperCount: n, addons: [],
          food: i % 2 ? "Veg" : "Non-Veg", camperSubtotal: n * 2499, gstRate: 18, gstAmount: Math.round(n * 2499 * 0.18),
          grandTotal: n * 2499 + Math.round(n * 2499 * 0.18), paymentMethod: "UPI QR Code", status: "Confirmed",
          date: todayISO(), tripDate: date
        });
      }
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
      localStorage.setItem(DEMO_FLAG, new Date().toISOString());
    } catch (e) {}
  }
  seedDemo();

  function onChange(cb) {
    window.addEventListener("gogo-calendar-change", cb);
    window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === BOOKINGS_KEY || e.key === null) cb(); });
  }

  window.GogoCalendar = {
    KEY: KEY, DEFAULTS: clone(DEFAULTS), ADMINS: ADMINS,
    getSettings: getSettings, saveSettings: saveSettings, setOverride: setOverride,
    iso: iso, parse: parse, todayISO: todayISO, isWeekday: isWeekday,
    bookingsOn: bookingsOn, bookedOn: bookedOn, dayStatus: dayStatus, onChange: onChange
  };
})();
