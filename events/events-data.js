/* GOGOCamping Events – one template for every event (Astro nights, biker meets, ...).
   The admin adds/edits events in the CMS (rental/cms/events.html); the homepage banner,
   the events list (events/) and each landing page (events/event.html?e=<slug>) read them here.
   Stored in localStorage "gogo_events"; event bookings go into "gogo_bookings_db" with type "event". */
(function () {
  var KEY = "gogo_events";
  var BOOKINGS_KEY = "gogo_bookings_db";
  var CATEGORIES = ["Astro", "Biker", "Music", "Workshop", "Other"];
  var IMAGES = [
    "assests/figma/gal-telescope.jpg", "assests/figma/sky.jpg", "assests/figma/gal-bikers.jpg",
    "assests/figma/act-campfire.jpg", "assests/figma/gal-tent-sunset.jpg", "assests/figma/hero-bg.jpg",
    "assests/figma/act-kayak.jpg", "assests/figma/gal-field.jpg", "assests/figma/food-table.jpg",
    "assests/figma/act-birding.jpg", "assests/figma/gal-boat.jpg", "assests/figma/gal-lilies.jpg"
  ];
  var SAMPLE = [
    {
      id: "ev-astro-geminids", slug: "astro-night-geminids", name: "Astro Night: Geminid Meteor Shower",
      category: "Astro", startDate: "2026-12-13", endDate: "2026-12-14", ratePerPerson: 3499, seats: 40,
      tagline: "Watch up to 100 meteors an hour under the darkest skies near Chennai",
      description: "Spend the peak night of the Geminids at our high-altitude campsite. Our astronomy guide sets up telescopes, walks you through the winter constellations and keeps the campfire going till the last meteor.",
      highlights: ["Guided night-sky walk with an astronomer", "Telescope viewing of Jupiter & the Orion Nebula", "Campfire dinner + breakfast included", "Tent stay with sleeping bags"],
      image: "assests/figma/gal-telescope.jpg", featured: true, status: "Published"
    },
    {
      id: "ev-bikers-weekend", slug: "jawadhu-bikers-weekend", name: "Jawadhu Bikers' Weekend",
      category: "Biker", startDate: "2027-01-16", endDate: "2027-01-17", ratePerPerson: 2999, seats: 30,
      tagline: "Ghat roads, a campfire and a ride-out with fellow bikers",
      description: "A weekend for riding clubs and solo riders: an evening ride-in through the Jawadhu ghats, a bikers' campfire night with music, and a sunrise ride to the viewpoint.",
      highlights: ["Secure parking for bikes", "Campfire night with music", "Sunrise ride to the viewpoint", "Dinner + breakfast included"],
      image: "assests/figma/gal-bikers.jpg", featured: true, status: "Published"
    }
  ];

  function read(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? fallback : v; } catch (e) { return fallback; } }

  function all() {
    var list = read(KEY, null);
    if (!Array.isArray(list)) { list = SAMPLE.slice(); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
    return list;
  }
  function saveAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("gogo-events-change"));
  }
  function slugify(s) {
    return String(s || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "event";
  }
  function upsert(ev) {
    var list = all();
    if (!ev.id) ev.id = "ev-" + Date.now().toString(36);
    var base = slugify(ev.slug || ev.name), slug = base, n = 2;
    while (list.some(function (x) { return x.slug === slug && x.id !== ev.id; })) slug = base + "-" + (n++);
    ev.slug = slug;
    var i = list.findIndex(function (x) { return x.id === ev.id; });
    if (i >= 0) list[i] = ev; else list.push(ev);
    saveAll(list);
    return ev;
  }
  function remove(id) { saveAll(all().filter(function (x) { return x.id !== id; })); }
  function bySlug(slug) { return all().find(function (x) { return x.slug === slug; }) || null; }

  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function isUpcoming(ev) { return (ev.endDate || ev.startDate) >= todayISO(); }
  function published() {
    return all().filter(function (e) { return e.status === "Published" && isUpcoming(e); })
      .sort(function (a, b) { return a.startDate < b.startDate ? -1 : 1; });
  }
  function featured() { return published().filter(function (e) { return e.featured; }); }

  // seats taken = campers in bookings that picked this event (normal camping bookings with events added)
  function seatsBooked(eventId) {
    return read(BOOKINGS_KEY, []).filter(function (b) {
      if (b.status === "Cancelled") return false;
      if (b.type === "event") return b.eventId === eventId;
      return Array.isArray(b.events) && b.events.some(function (e) { return e.id === eventId; });
    }).reduce(function (s, b) { return s + (parseInt(b.camperCount, 10) || 1); }, 0);
  }

  // Events the visitor picked on the Events page – carried into the normal booking flow
  var PICK_KEY = "gogo_selected_events";
  function getPicked() {
    var ids = read(PICK_KEY, []);
    var list = all();
    return (Array.isArray(ids) ? ids : []).map(function (id) { return list.find(function (e) { return e.id === id; }); })
      .filter(function (e) { return e && e.status === "Published" && isUpcoming(e); });
  }
  function setPicked(ids) {
    try { localStorage.setItem(PICK_KEY, JSON.stringify(ids)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("gogo-events-change"));
  }
  function togglePicked(id) {
    var ids = getPicked().map(function (e) { return e.id; });
    var i = ids.indexOf(id);
    if (i >= 0) ids.splice(i, 1); else ids.push(id);
    setPicked(ids);
    return i < 0;
  }
  function seatsLeft(ev) { return Math.max(0, (parseInt(ev.seats, 10) || 0) - seatsBooked(ev.id)); }

  function dateRange(ev) {
    var f = function (iso, opt) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-IN", opt); };
    if (!ev.endDate || ev.endDate === ev.startDate) return f(ev.startDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    var sameMonth = ev.startDate.slice(0, 7) === ev.endDate.slice(0, 7);
    return (sameMonth ? f(ev.startDate, { day: "numeric" }) : f(ev.startDate, { day: "numeric", month: "short" })) + " – " + f(ev.endDate, { day: "numeric", month: "short", year: "numeric" });
  }
  function img(ev, base) { return (base || "") + (ev.image || IMAGES[0]); }
  function link(ev, base) { return (base || "") + "events/event.html?e=" + encodeURIComponent(ev.slug); }

  // ===== Activities (no fixed date): campfire, dance, party ... – pick as many as you like =====
  var ACT_KEY = "gogo_activities";
  var ACT_PICK_KEY = "gogo_selected_activities";
  var ACTIVITY_ICONS = ["flame", "music", "party-popper", "telescope", "mountain", "sailboat", "bird", "drumstick", "guitar", "gamepad-2", "sunrise", "tent", "camera", "bike", "fish", "trees", "heart", "star"];
  var ACTIVITY_DEFAULTS = [
    { id: "act-campfire", name: "Campfire", icon: "flame", desc: "Evening bonfire with stories" },
    { id: "act-dance", name: "Dance night", icon: "music", desc: "DJ & dance under the stars" },
    { id: "act-party", name: "Party", icon: "party-popper", desc: "Celebrations, birthdays & group fun" },
    { id: "act-stargazing", name: "Stargazing", icon: "telescope", desc: "Telescope session with a guide" },
    { id: "act-trek", name: "Sunrise trek", icon: "sunrise", desc: "Early walk to the viewpoint" },
    { id: "act-kayak", name: "Kayaking", icon: "sailboat", desc: "Paddle on the lake" },
    { id: "act-birding", name: "Bird watching", icon: "bird", desc: "Morning birding walk" },
    { id: "act-bbq", name: "BBQ", icon: "drumstick", desc: "Barbecue by the fire" },
    { id: "act-jam", name: "Music jam", icon: "guitar", desc: "Guitar & sing-along" },
    { id: "act-games", name: "Group games", icon: "gamepad-2", desc: "Team games & ice-breakers" },
    { id: "act-photo", name: "Photo walk", icon: "camera", desc: "Golden-hour photography" },
    { id: "act-nature", name: "Nature walk", icon: "trees", desc: "Forest trail with a local guide" }
  ];
  function activities() {
    var list = read(ACT_KEY, null);
    if (!Array.isArray(list)) { list = ACTIVITY_DEFAULTS.slice(); try { localStorage.setItem(ACT_KEY, JSON.stringify(list)); } catch (e) {} }
    return list;
  }
  function saveActivities(list) {
    localStorage.setItem(ACT_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("gogo-events-change"));
  }
  function addActivity(name, icon, desc) {
    var list = activities();
    var a = { id: "act-" + slugify(name) + "-" + Date.now().toString(36).slice(-4), name: String(name).trim(), icon: icon || "star", desc: String(desc || "").trim() };
    list.push(a); saveActivities(list); return a;
  }
  function removeActivity(id) { saveActivities(activities().filter(function (a) { return a.id !== id; })); }
  function getPickedActivities() {
    var ids = read(ACT_PICK_KEY, []);
    var list = activities();
    return (Array.isArray(ids) ? ids : []).map(function (id) { return list.find(function (a) { return a.id === id; }); }).filter(Boolean);
  }
  function setPickedActivities(ids) {
    try { localStorage.setItem(ACT_PICK_KEY, JSON.stringify(ids)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("gogo-events-change"));
  }
  function togglePickedActivity(id) {
    var ids = getPickedActivities().map(function (a) { return a.id; });
    var i = ids.indexOf(id);
    if (i >= 0) ids.splice(i, 1); else ids.push(id);
    setPickedActivities(ids);
    return i < 0;
  }

  function onChange(cb) {
    window.addEventListener("gogo-events-change", cb);
    window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === BOOKINGS_KEY || e.key === ACT_KEY || e.key === ACT_PICK_KEY || e.key === PICK_KEY || e.key === null) cb(); });
  }

  window.GogoEvents = {
    KEY: KEY, CATEGORIES: CATEGORIES, IMAGES: IMAGES,
    all: all, saveAll: saveAll, upsert: upsert, remove: remove, bySlug: bySlug, slugify: slugify,
    published: published, featured: featured, isUpcoming: isUpcoming,
    seatsBooked: seatsBooked, seatsLeft: seatsLeft, getPicked: getPicked, setPicked: setPicked, togglePicked: togglePicked,
    ACTIVITY_ICONS: ACTIVITY_ICONS, activities: activities, saveActivities: saveActivities, addActivity: addActivity, removeActivity: removeActivity,
    getPickedActivities: getPickedActivities, setPickedActivities: setPickedActivities, togglePickedActivity: togglePickedActivity, dateRange: dateRange, img: img, link: link, onChange: onChange
  };
})();
