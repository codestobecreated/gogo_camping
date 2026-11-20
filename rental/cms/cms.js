// GOGOCamping Admin CMS & Analytics Dashboard Engine

// Initial Mock Bookings Dataset (saved to localStorage if empty)
const INITIAL_MOCK_BOOKINGS = [
  {
    id: "#GOGO-2026-89412",
    leadName: "Vijay Kumar",
    phone: "9876543210",
    email: "vijay.camper@gmail.com",
    isLoggedInUser: true,
    packageName: "2 Person Camping Tent",
    camperCount: 2,
    addons: [
      { name: "Camping Chair", qty: 2, unitPrice: 1200, total: 2400 },
      { name: "LED Lantern", qty: 1, unitPrice: 800, total: 800 }
    ],
    camperSubtotal: 4798,
    addonsSubtotal: 3200,
    grandTotal: 7998,
    paymentMethod: "Card / ATM",
    status: "Confirmed",
    date: "2026-09-19",
    tripDate: "2026-10-05"
  },
  {
    id: "#GOGO-2026-77321",
    leadName: "Anitha Ramesh",
    phone: "9123456780",
    email: "anitha.ramesh@gmail.com",
    isLoggedInUser: true,
    packageName: "4 Person Camping Tent",
    camperCount: 4,
    addons: [
      { name: "Camping Chair", qty: 4, unitPrice: 1200, total: 4800 },
      { name: "Sleeping Bag", qty: 2, unitPrice: 1500, total: 3000 },
      { name: "Rope Set", qty: 1, unitPrice: 600, total: 600 }
    ],
    camperSubtotal: 9596,
    addonsSubtotal: 8400,
    grandTotal: 17996,
    paymentMethod: "UPI / GPay",
    status: "Confirmed",
    date: "2026-09-18",
    tripDate: "2026-10-12"
  },
  {
    id: "#GOGO-2026-65109",
    leadName: "Karthik Raja",
    phone: "9443218765",
    email: "karthik.raja@yahoo.com",
    isLoggedInUser: false,
    packageName: "1 Person Camping Tent",
    camperCount: 1,
    addons: [
      { name: "Sleeping Bag", qty: 1, unitPrice: 1500, total: 1500 }
    ],
    camperSubtotal: 2399,
    addonsSubtotal: 1500,
    grandTotal: 3899,
    paymentMethod: "QR Code Pay",
    status: "Completed",
    date: "2026-09-15",
    tripDate: "2026-09-22"
  },
  {
    id: "#GOGO-2026-54890",
    leadName: "Priya Sundaram",
    phone: "9789012345",
    email: "priya.sundaram@outlook.com",
    isLoggedInUser: true,
    packageName: "3 Person Camping Tent",
    camperCount: 3,
    addons: [
      { name: "Camping Chair", qty: 3, unitPrice: 1200, total: 3600 },
      { name: "LED Lantern", qty: 2, unitPrice: 800, total: 1600 }
    ],
    camperSubtotal: 7197,
    addonsSubtotal: 5200,
    grandTotal: 12397,
    paymentMethod: "Net Banking",
    status: "Confirmed",
    date: "2026-09-17",
    tripDate: "2026-10-01"
  },
  {
    id: "#GOGO-2026-43218",
    leadName: "Suresh Babu",
    phone: "9845098765",
    email: "suresh.babu@gmail.com",
    isLoggedInUser: false,
    packageName: "2 Person Camping Tent",
    camperCount: 2,
    addons: [
      { name: "Rope Set", qty: 2, unitPrice: 600, total: 1200 }
    ],
    camperSubtotal: 4798,
    addonsSubtotal: 1200,
    grandTotal: 5998,
    paymentMethod: "Card / ATM",
    status: "Completed",
    date: "2026-09-10",
    tripDate: "2026-09-18"
  },
  {
    id: "#GOGO-2026-32109",
    leadName: "Meenakshi Nathan",
    phone: "9940123456",
    email: "meena.nathan@gmail.com",
    isLoggedInUser: true,
    packageName: "1 Person Camping Tent",
    camperCount: 1,
    addons: [],
    camperSubtotal: 2399,
    addonsSubtotal: 0,
    grandTotal: 2399,
    paymentMethod: "UPI / GPay",
    status: "Confirmed",
    date: "2026-09-19",
    tripDate: "2026-10-15"
  },
  {
    id: "#GOGO-2026-21045",
    leadName: "Rahul Dravid",
    phone: "9811223344",
    email: "rahul.d@gmail.com",
    isLoggedInUser: true,
    packageName: "2 Person Camping Tent",
    camperCount: 2,
    addons: [
      { name: "Camping Chair", qty: 2, unitPrice: 1200, total: 2400 }
    ],
    camperSubtotal: 4798,
    addonsSubtotal: 2400,
    grandTotal: 7198,
    paymentMethod: "Card / ATM",
    status: "Cancelled",
    date: "2026-09-08",
    tripDate: "2026-09-14"
  }
];

// Load Bookings from localStorage
function getBookings() {
  const stored = localStorage.getItem("gogo_bookings_db");
  if (!stored) {
    localStorage.setItem("gogo_bookings_db", JSON.stringify(INITIAL_MOCK_BOOKINGS));
    return INITIAL_MOCK_BOOKINGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_MOCK_BOOKINGS;
  }
}

// Save Bookings to localStorage
function saveBookings(bookings) {
  localStorage.setItem("gogo_bookings_db", JSON.stringify(bookings));
}

// Global Variables & Chart Instances
let bookingsData = [];
let filteredBookings = [];
let currentFilterStatus = "all";
let revenueChartInstance = null;
let packageChartInstance = null;
let addonsChartInstance = null;
let paymentChartInstance = null;

// Currency Formatter
// ===== Pricing & GST panel (saved via rental/pricing.js -> booking page updates live) =====
function renderPricingPanel() {
  const P = window.GogoPricing;
  const wrap = document.getElementById("pricingTierInputs");
  if (!P || !wrap) return;
  const cfg = P.get();
  const field = (label, sub, id, value, prefix) => `
    <label class="block bg-gray-50 border border-gray-200 rounded-xl p-3">
      <span class="block text-[11px] font-extrabold text-gray-800">${label}</span>
      <span class="block text-[10px] text-gray-500 mb-1.5">${sub}</span>
      <span class="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 focus-within:border-[#164e3f]">
        <span class="text-xs font-bold text-gray-500">${prefix}</span>
        <input type="number" min="1" step="1" id="${id}" value="${value}" class="pricing-input w-full py-1.5 text-sm font-black text-[#164e3f] focus:outline-none bg-transparent">
      </span>
    </label>`;
  wrap.innerHTML = cfg.tiers.map((t, i) => {
    const disc = i > 0 && cfg.tiers[0].rate > t.rate ? `${Math.round((1 - t.rate / cfg.tiers[0].rate) * 100)}% off` : "base rate";
    return field(P.tierLabel(t), `per person + GST · ${disc}`, `tierRate${i}`, t.rate, "₹");
  }).join("") + field("GST", "added at checkout", "gstPctInput", cfg.gstPct, "%");
  wrap.querySelectorAll(".pricing-input").forEach((inp) => inp.addEventListener("input", updatePricingPreview));
  const badge = document.getElementById("pricingUpdatedBadge");
  if (badge) badge.textContent = cfg.updatedAt ? `Updated ${new Date(cfg.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : "Default prices";
  updatePricingPreview();
  syncPackageOptionLabels();
}

function readPricingInputs() {
  const cfg = window.GogoPricing.get();
  cfg.tiers.forEach((t, i) => { t.rate = Math.round(Number(document.getElementById(`tierRate${i}`)?.value)); });
  cfg.gstPct = Number(document.getElementById("gstPctInput")?.value);
  return cfg;
}

function updatePricingPreview() {
  const el = document.getElementById("pricingPreview");
  if (!el) return;
  const cfg = readPricingInputs();
  const r = cfg.tiers[0].rate, g = Math.round(r * cfg.gstPct / 100);
  el.innerHTML = Number.isFinite(r) && r > 0 && Number.isFinite(g)
    ? `Example: 1 person = <b>${formatINR(r)}</b> + ${formatINR(g)} GST (${cfg.gstPct}%) = <b>${formatINR(r + g)}</b>`
    : `<span class="text-red-600 font-bold">Enter valid prices</span>`;
}

function syncPackageOptionLabels() {
  const sel = document.getElementById("newCamperPkg");
  if (!sel || !window.GogoPricing) return;
  [...sel.options].forEach((o) => {
    const n = parseInt(o.dataset.persons, 10);
    if (n) o.textContent = `${n} Person Camping Tent (${formatINR(window.GogoPricing.quote(n).subtotal)} + GST)`;
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#savePricingBtn")) {
    try {
      window.GogoPricing.save(readPricingInputs());
      renderPricingPanel();
      showToast("✓ Pricing saved – booking page updated");
    } catch (err) {
      showToast("Please enter valid prices (GST 0–50%)");
    }
  }
  if (e.target.closest("#resetPricingBtn")) {
    window.GogoPricing.reset();
    renderPricingPanel();
    showToast("Pricing reset to default");
  }
});
if (window.GogoPricing) window.GogoPricing.onChange(() => renderPricingPanel());

// ID verification: team leader ID at booking; every other camper gets a WhatsApp link
// (24h before check-in) to upload their Aadhaar photo on rental/id-upload.html
const ID_UPLOADS_KEY = "gogo_id_uploads";
function getIdUploads() {
  try { return JSON.parse(localStorage.getItem(ID_UPLOADS_KEY) || "{}"); } catch (e) { return {}; }
}
function idUploadLink(b, camper) {
  const u = new URL("/rental/id-upload.html", location.origin);
  u.searchParams.set("b", b.id);
  u.searchParams.set("c", camper.no);
  if (camper.name) u.searchParams.set("n", camper.name);
  if (b.tripDate) u.searchParams.set("d", b.tripDate);
  return u.toString();
}
function camperIdMessage(b, camper) {
  return `Hi ${camper.name || "Camper"}, this is GOGOCamping. You are camping with ${b.leadName} on ${b.tripDate} (booking ${b.id}). ` +
    `Aadhaar is mandatory for campsite entry – please upload a photo of your Aadhaar card here: ${idUploadLink(b, camper)}`;
}
function bookingCampersWithStatus(b) {
  const uploads = getIdUploads();
  const list = Array.isArray(b.campers) && b.campers.length
    ? b.campers
    : Array.from({ length: b.otherCampersIdPending || 0 }, (_, i) => ({ no: i + 2, name: "", age: "", phone: "" }));
  return list.map((cp) => {
    const up = uploads[`${b.id}|${cp.no}`];
    return Object.assign({}, cp, { upload: up || null, idStatus: up ? "Uploaded" : (cp.reminderSentAt ? "Link sent" : "Pending") });
  });
}
function idStatusBadge(b) {
  if (!b.leadIdProof && !b.idReminderStatus) return "";
  const lead = b.leadIdProof
    ? `<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Leader ID ✓</span>`
    : `<span class="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Leader ID missing</span>`;
  const campers = bookingCampersWithStatus(b);
  let rest = "";
  if (campers.length) {
    const done = campers.filter(x => x.upload).length;
    const due = b.idReminderAt ? new Date(b.idReminderAt) : null;
    const when = done === campers.length ? "all uploaded" : due && due <= new Date() ? "WhatsApp due now" : `WhatsApp ${due ? due.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "24h before"}`;
    rest = `<span class="px-1.5 py-0.5 rounded border ${done === campers.length ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}">${done}/${campers.length} camper IDs · ${when}</span>`;
  }
  return `<div class="flex flex-wrap gap-1 mt-1 text-[10px] font-bold">${lead}${rest}</div>`;
}

window.markCamperLinkSent = function (bookingId, no) {
  const rec = bookingsData.find(x => x.id === bookingId);
  if (!rec) return;
  if (!Array.isArray(rec.campers) || !rec.campers.length) rec.campers = bookingCampersWithStatus(rec).map(({ upload, idStatus, ...cp }) => cp);
  const cp = rec.campers.find(x => x.no === no);
  if (cp) cp.reminderSentAt = new Date().toISOString();
  if (rec.campers.every(x => x.reminderSentAt)) { rec.idReminderStatus = "Sent"; rec.idReminderSentAt = new Date().toISOString(); }
  saveBookings(bookingsData);
  filterAndRender();
  const idx = filteredBookings.findIndex(x => x.id === bookingId);
  if (idx >= 0) viewBookingDetails(idx);
};

window.openIdImage = function (key) {
  const up = getIdUploads()[key];
  if (!up) return;
  const w = window.open("", "_blank");
  if (w) { w.document.title = up.fileName || "Aadhaar"; w.document.body.style.margin = "0"; w.document.body.innerHTML = `<img src="${up.dataUrl}" style="max-width:100%;display:block;margin:auto">`; }
};

function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
  renderPricingPanel();
  bookingsData = getBookings();
  filteredBookings = [...bookingsData];
  
  initLucideIcons();
  renderKPIs();
  renderBookingsTable();
  renderCharts();
  renderAddonInventory();
  renderInsights();
  setupEventListeners();
});

// A login or booking on the booking site (another tab) shows up here without a manual refresh
window.addEventListener("storage", (e) => {
  if (e.key === "gogo_members_db") filterAndRender();
  if (e.key === "gogo_bookings_db") {
    bookingsData = getBookings();
    filterAndRender();
  }
});

function initLucideIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Render Top KPI Metrics & Bookings Summary Badges
function renderKPIs() {
  const totalRevenue = bookingsData.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
  const totalBookings = bookingsData.length;
  const confirmedBookings = bookingsData.filter(b => b.status === "Confirmed").length;
  const completedBookings = bookingsData.filter(b => b.status === "Completed").length;
  const cancelledBookings = bookingsData.filter(b => b.status === "Cancelled").length;
  const loggedInUsersCount = getMembers().length; // every account that logged in, booked or not
  const totalCampers = bookingsData.reduce((acc, b) => acc + (b.camperCount || 1), 0);
  const totalAddonsRevenue = bookingsData.reduce((acc, b) => acc + (b.addonsSubtotal || 0), 0);

  // Update Top First Section Badges
  const kpiTotal = document.getElementById("kpiTotalBookings");
  const kpiConf = document.getElementById("kpiConfirmedBookings");
  const kpiComp = document.getElementById("kpiCompletedBookings");
  const kpiCanc = document.getElementById("kpiCancelledBookings");
  const kpiLog = document.getElementById("kpiLoggedInUsers");
  const kpiRev = document.getElementById("kpiTotalRevenue");

  if (kpiTotal) kpiTotal.textContent = totalBookings;
  if (kpiConf) kpiConf.textContent = confirmedBookings;
  if (kpiComp) kpiComp.textContent = completedBookings;
  if (kpiCanc) kpiCanc.textContent = cancelledBookings;
  if (kpiLog) kpiLog.textContent = loggedInUsersCount;
  if (kpiRev) kpiRev.textContent = formatINR(totalRevenue);

  const kpiCampers = document.getElementById("kpiTotalCampers");
  const kpiAddons = document.getElementById("kpiAddonsRevenue");
  if (kpiCampers) kpiCampers.textContent = totalCampers + " Campers";
  if (kpiAddons) kpiAddons.textContent = formatINR(totalAddonsRevenue);
}

// Render Main Bookings Directory Table
function renderBookingsTable() {
  const tbody = document.getElementById("bookingsTableBody");
  const countBadge = document.getElementById("tableBookingCount");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (countBadge) countBadge.textContent = `${filteredBookings.length} Record${filteredBookings.length !== 1 ? 's' : ''}`;

  if (filteredBookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-10 text-gray-400 text-sm font-medium">
          No booking records matching search filter.
        </td>
      </tr>
    `;
    return;
  }

  filteredBookings.forEach((b, index) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50/80 transition duration-150 text-xs border-b border-gray-100";

    const kidsBadge = b.kidsUnder4 ? `<span class='inline-block mr-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800'>+${b.kidsUnder4} kid${b.kidsUnder4 > 1 ? "s" : ""} &lt;4</span>` : "";
    const addonsText = kidsBadge + `${b.food ? `<span class='inline-block mr-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${b.food === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}'>${b.food}</span>` : ''}` + (Array.isArray(b.addons) && b.addons.length > 0
      ? b.addons.map(a => `${a.name} (${a.qty}×)`).join(", ")
      : (b.food ? "" : "<span class='text-gray-400'>None</span>"));

    // Status dropdown, coloured like the old badge (green / blue / red)
    const statusColors = {
      Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Completed: "bg-blue-100 text-blue-800 border-blue-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    const statusBadge = `
      <div class="relative inline-flex items-center">
        <select onchange="setBookingStatus('${b.id}', this.value)" aria-label="Booking status for ${b.id}"
          class="appearance-none cursor-pointer pl-2.5 pr-7 py-1 rounded-full text-[11px] font-extrabold border focus:outline-none focus:ring-2 focus:ring-[#164e3f]/30 ${statusColors[b.status] || statusColors.Confirmed}">
          ${["Confirmed", "Completed", "Cancelled"].map(s => `<option value="${s}" ${s === b.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <i data-lucide="chevron-down" class="w-3.5 h-3.5 absolute right-2 pointer-events-none opacity-70"></i>
      </div>`;

    const userBadge = b.isLoggedInUser !== false
      ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 ml-1.5"><i data-lucide="user-check" class="w-3 h-3"></i> Member</span>`
      : `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-semibold ml-1.5">Guest</span>`;

    tr.innerHTML = `
      <td class="py-3.5 px-4 font-black text-gray-900">${b.id}</td>
      <td class="py-3.5 px-4">
        <div class="flex items-center">
          <span class="font-extrabold text-gray-900">${b.leadName}</span>
          ${userBadge}
        </div>
        <div class="text-[11px] text-gray-500 font-medium mt-0.5">📱 +91 ${b.phone}${b.altPhone ? ` / ${b.altPhone}` : ""} | ✉️ ${b.email}</div>
        ${idStatusBadge(b)}
      </td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-gray-800">${b.type === "event" ? `<span class="inline-block mr-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-extrabold align-middle">EVENT</span>` : ""}${b.packageName}</div>
        <div class="text-[11px] text-emerald-800 font-extrabold">${b.camperCount} Camper${b.camperCount > 1 ? 's' : ''}</div>
        ${(b.events || []).length || (b.activities || []).length ? `<div class="flex flex-wrap gap-1 mt-1">${(b.events || []).map(ev => `<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-extrabold">✨ ${ev.name}</span>`).join("")}${(b.activities || []).map(a => `<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">${a.name}</span>`).join("")}</div>` : ""}
      </td>
      <td class="py-3.5 px-4 text-gray-700 font-medium max-w-[180px] truncate">${addonsText}</td>
      <td class="py-3.5 px-4 font-black text-[#164e3f] text-sm">${formatINR(b.grandTotal)}</td>
      <td class="py-3.5 px-4">
        <span class="font-semibold text-gray-700 block">${b.paymentMethod || 'Card / ATM'}</span>
        <span class="text-[10px] text-gray-400">${b.date || '2026-09-19'}</span>
      </td>
      <td class="py-3.5 px-4">${statusBadge}</td>
      <td class="py-3.5 px-4 text-right space-x-1">
        <button type="button" onclick="viewBookingDetails(${index})" class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#164e3f] transition font-bold" title="View Details">
          <i data-lucide="eye" class="w-4 h-4"></i>
        </button>
        <button type="button" onclick="deleteBooking('${b.id}')" class="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition font-bold" title="Delete Record">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  initLucideIcons();
}

// Render Chart.js Analytics Visualizations
function renderCharts() {
  // Chart 1: Monthly / Recent Revenue Trend
  const ctxRevenue = document.getElementById("chartRevenue")?.getContext("2d");
  if (ctxRevenue) {
    if (revenueChartInstance) revenueChartInstance.destroy();

    const dateMap = {};
    bookingsData.forEach(b => {
      const d = b.date || "2026-09-19";
      dateMap[d] = (dateMap[d] || 0) + b.grandTotal;
    });

    const dates = Object.keys(dateMap).sort();
    const revenues = dates.map(d => dateMap[d]);

    revenueChartInstance = new Chart(ctxRevenue, {
      type: "line",
      data: {
        labels: dates.length > 0 ? dates : ["2026-09-15", "2026-09-17", "2026-09-18", "2026-09-19"],
        datasets: [{
          label: "Revenue (₹)",
          data: revenues.length > 0 ? revenues : [3899, 12397, 17996, 10397],
          borderColor: "#164e3f",
          backgroundColor: "rgba(22, 78, 63, 0.12)",
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: "#164e3f",
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Revenue: ₹${ctx.parsed.y.toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (val) => "₹" + val
            },
            grid: { color: "#f1f5f9" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Chart 2: Tent Package Popularity (Donut)
  const ctxPackage = document.getElementById("chartPackages")?.getContext("2d");
  if (ctxPackage) {
    if (packageChartInstance) packageChartInstance.destroy();

    const pkgCounts = { "1 Person": 0, "2 Person": 0, "3 Person": 0, "4 Person": 0, "Group (5+)": 0 };
    bookingsData.forEach(b => {
      const persons = b.camperCount || parseInt(b.packageName, 10) || 1;
      if (persons >= 5) pkgCounts["Group (5+)"]++;
      else pkgCounts[`${persons} Person`]++;
    });

    packageChartInstance = new Chart(ctxPackage, {
      type: "doughnut",
      data: {
        labels: Object.keys(pkgCounts),
        datasets: [{
          data: Object.values(pkgCounts),
          backgroundColor: ["#10b981", "#164e3f", "#0284c7", "#f59e0b", "#a8462d"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 } } }
        },
        cutout: "68%"
      }
    });
  }

  // Chart 3: Food preference (campers per Veg / Non-Veg)
  const ctxAddons = document.getElementById("chartAddons")?.getContext("2d");
  if (ctxAddons) {
    if (addonsChartInstance) addonsChartInstance.destroy();
    const food = { "Veg": 0, "Non-Veg": 0, "Not recorded": 0 };
    bookingsData.forEach(b => {
      if (b.status === "Cancelled") return;
      const key = b.food === "Veg" || b.food === "Non-Veg" ? b.food : "Not recorded";
      food[key] += b.camperCount || 1;
    });
    addonsChartInstance = new Chart(ctxAddons, {
      type: "doughnut",
      data: {
        labels: Object.keys(food),
        datasets: [{ data: Object.values(food), backgroundColor: ["#16a34a", "#b91c1c", "#d1d5db"], borderWidth: 2 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
        cutout: "68%"
      }
    });
  }

  // Chart 4: Payment Methods Distribution (Pie)
  const ctxPayment = document.getElementById("chartPayment")?.getContext("2d");
  if (ctxPayment) {
    if (paymentChartInstance) paymentChartInstance.destroy();

    const payCounts = { "Card / ATM": 0, "UPI / GPay": 0, "QR Code Pay": 0, "Net Banking": 0 };
    bookingsData.forEach(b => {
      const pm = b.paymentMethod || "Card / ATM";
      payCounts[pm] = (payCounts[pm] || 0) + 1;
    });

    paymentChartInstance = new Chart(ctxPayment, {
      type: "pie",
      data: {
        labels: Object.keys(payCounts),
        datasets: [{
          data: Object.values(payCounts),
          backgroundColor: ["#164e3f", "#0284c7", "#8b5cf6", "#f59e0b"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 } } }
        }
      }
    });
  }
}

// Sample login-only accounts (dummy data), added once alongside any real logins
const SAMPLE_MEMBERS = [
  { name: "Deepika Raman", phone: "9840011223", email: "deepika.raman@gmail.com", loginMethod: "Google", firstLogin: "2026-11-02T09:14:00", lastLogin: "2026-11-16T20:41:00", loginCount: 4 },
  { name: "Harish Kannan", phone: "9003344556", email: "harish.k@yahoo.com", loginMethod: "Mobile", firstLogin: "2026-11-10T18:05:00", lastLogin: "2026-11-15T11:22:00", loginCount: 2 },
  { name: "Sneha Iyer", phone: "9884455667", email: "sneha.iyer@outlook.com", loginMethod: "Google", firstLogin: "2026-11-14T07:48:00", lastLogin: "2026-11-14T07:48:00", loginCount: 1 },
  { name: "Mohammed Riyaz", phone: "9566778899", email: "riyaz.m@gmail.com", loginMethod: "Mobile", firstLogin: "2026-10-28T21:30:00", lastLogin: "2026-11-12T19:05:00", loginCount: 6 },
  { name: "Lakshmi Prabhu", phone: "9442233445", email: "lakshmi.prabhu@gmail.com", loginMethod: "Mobile", firstLogin: "2026-11-08T13:10:00", lastLogin: "2026-11-09T16:55:00", loginCount: 3 },
  { name: "Arjun Mehta", phone: "9176655443", email: "arjun.mehta@gmail.com", loginMethod: "Google", firstLogin: "2026-11-05T10:02:00", lastLogin: "2026-11-05T10:02:00", loginCount: 1 }
];

function seedSampleMembers() {
  if (localStorage.getItem("gogo_members_seeded")) return;
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("gogo_members_db") || "[]");
  } catch (e) {}
  SAMPLE_MEMBERS.forEach(s => {
    if (!saved.some(m => m.phone === s.phone)) saved.push(s);
  });
  localStorage.setItem("gogo_members_db", JSON.stringify(saved));
  localStorage.setItem("gogo_members_seeded", "1");
}

// Logged-in members: accounts that logged in on the booking site ("gogo_members_db")
// but have not made a single booking yet (matched to bookings by phone or email).
function getMembers() {
  seedSampleMembers();
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("gogo_members_db") || "[]");
  } catch (e) {}
  const sameMember = (m, b) => (m.phone && m.phone === b.phone) || (m.email && m.email === b.email);
  return saved
    .filter(m => !bookingsData.some(b => sameMember(m, b)))
    .sort((a, b) => String(b.lastLogin || "").localeCompare(String(a.lastLogin || "")));
}

function formatDateShort(value) {
  if (!value) return "&ndash;";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
}

function renderMembersTable(members) {
  const tbody = document.getElementById("membersTableBody");
  if (!tbody) return;
  if (!members.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400 text-sm font-medium">No logged-in accounts without a booking.</td></tr>`;
    return;
  }
  const methodBadge = {
    Google: "bg-blue-50 text-blue-700 border-blue-200",
    Mobile: "bg-emerald-50 text-emerald-800 border-emerald-200"
  };
  tbody.innerHTML = members.map(m => `
      <tr class="border-b border-gray-100 hover:bg-purple-50/40 transition text-xs">
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-black flex items-center justify-center">${(m.name || "?").trim().charAt(0).toUpperCase()}</span>
            <span class="font-extrabold text-gray-900">${m.name || "&ndash;"}</span>
          </div>
        </td>
        <td class="py-3.5 px-4 text-gray-600 font-medium">
          <div>📱 +91 ${m.phone || "&ndash;"}</div>
          <div class="text-[11px] text-gray-500">✉️ ${m.email || "&ndash;"}</div>
        </td>
        <td class="py-3.5 px-4"><span class="px-2 py-0.5 rounded border text-[10px] font-bold ${methodBadge[m.loginMethod] || methodBadge.Mobile}">${m.loginMethod || "Mobile"}</span></td>
        <td class="py-3.5 px-4 text-gray-700 font-semibold">${formatDateShort(m.firstLogin)}</td>
        <td class="py-3.5 px-4 text-gray-700 font-semibold">${formatDateShort(m.lastLogin)}</td>
        <td class="py-3.5 px-4 font-black text-gray-900">${m.loginCount || 1}</td>
        <td class="py-3.5 px-4"><span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold">No booking yet</span></td>
      </tr>`).join("");
}

// Insight panels under the Add-on and Payment charts.
// Revenue and averages leave out cancelled bookings; the cancellation rate counts every booking.
function renderInsights() {
  const all = bookingsData;
  const active = all.filter(b => b.status !== "Cancelled");
  const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
  const tile = (label, value, sub) => `
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <div class="text-[10px] font-bold uppercase tracking-wide text-gray-500">${label}</div>
      <div class="text-base font-black text-gray-900 mt-0.5 leading-tight">${value}</div>
      <div class="text-[11px] text-gray-500 font-semibold mt-0.5">${sub}</div>
    </div>`;
  const bar = (label, value, share, color) => `
    <div>
      <div class="flex justify-between text-[11px] font-bold text-gray-700 mb-1">
        <span>${label}</span><span>${value} <span class="text-gray-400 font-semibold">&middot; ${share}%</span></span>
      </div>
      <div class="h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full" style="width:${share}%;background:${color}"></div></div>
    </div>`;

  // ---- Guest insights (food + children under 4) ----
  const totalRevenue = active.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const campersOf = (f) => active.filter(b => b.food === f).reduce((s, b) => s + (b.camperCount || 1), 0);
  const veg = campersOf("Veg"), nonVeg = campersOf("Non-Veg");
  const recorded = veg + nonVeg;
  const kids = active.reduce((s, b) => s + (b.kidsUnder4 || 0), 0);
  const withKids = active.filter(b => (b.kidsUnder4 || 0) > 0).length;
  const gstCollected = active.reduce((s, b) => s + (b.gstAmount || 0), 0);
  const addonTiles = document.getElementById("addonInsightTiles");
  if (addonTiles) {
    addonTiles.innerHTML =
      tile("Veg campers", `${pct(veg, recorded)}%`, `${veg} of ${recorded} campers`) +
      tile("Non-Veg campers", `${pct(nonVeg, recorded)}%`, `${nonVeg} of ${recorded} campers`) +
      tile("Children under 4", `${kids}`, `free · in ${withKids} booking${withKids === 1 ? "" : "s"}`) +
      tile("GST collected", formatINR(gstCollected), "from online bookings");
  }
  const addonBars = document.getElementById("addonRevenueBars");
  if (addonBars) {
    addonBars.innerHTML = recorded
      ? bar("Veg", `${veg} campers`, pct(veg, recorded), "#16a34a") + bar("Non-Veg", `${nonVeg} campers`, pct(nonVeg, recorded), "#b91c1c")
      : `<p class="text-xs text-gray-400">No food choices recorded yet</p>`;
  }

  // ---- Booking insights ----
  const campers = active.reduce((s, b) => s + (b.camperCount || 1), 0);
  const cancelled = all.filter(b => b.status === "Cancelled").length;
  const members = active.filter(b => b.isLoggedInUser !== false).length;

  const bookingTiles = document.getElementById("bookingInsightTiles");
  if (bookingTiles) {
    bookingTiles.innerHTML =
      tile("Avg booking value", formatINR(active.length ? Math.round(totalRevenue / active.length) : 0), `${active.length} paid bookings`) +
      tile("Avg group size", `${active.length ? (campers / active.length).toFixed(1) : 0} campers`, `${campers} campers in total`) +
      tile("Cancellation rate", `${pct(cancelled, all.length)}%`, `${cancelled} of ${all.length} bookings`) +
      tile("Member bookings", `${pct(members, active.length)}%`, `${active.length - members} guest bookings`);
  }
  const methodColors = { "Card / ATM": "#164e3f", "UPI / GPay": "#0284c7", "QR Code Pay": "#8b5cf6", "Net Banking": "#f59e0b" };
  const byMethod = {};
  active.forEach(b => {
    const m = b.paymentMethod || "Card / ATM";
    byMethod[m] = byMethod[m] || { count: 0, revenue: 0 };
    byMethod[m].count++;
    byMethod[m].revenue += b.grandTotal || 0;
  });
  const paymentBars = document.getElementById("paymentRevenueBars");
  if (paymentBars) {
    paymentBars.innerHTML = Object.entries(byMethod)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([m, v]) => bar(`${m} <span class="text-gray-400 font-semibold">(${v.count})</span>`, formatINR(v.revenue), pct(v.revenue, totalRevenue), methodColors[m] || "#6b7280"))
      .join("") || `<p class="text-xs text-gray-400">No paid bookings yet</p>`;
  }

  initLucideIcons();
}

// Render Add-on Accessories Inventory Table
function renderAddonInventory() {
  const inventoryContainer = document.getElementById("addonInventoryGrid");
  if (!inventoryContainer) return;

  const inventory = window.GogoInventory;
  const stock = inventory.getStock();
  // Product images live in the rental folder: "../" from cms/index.html, "" from cms.html
  const imageBase = location.pathname.includes("/cms/") ? "../" : "";
  let outOfStockCount = 0;

  inventoryContainer.innerHTML = "";

  inventory.ITEMS.forEach(item => {
    let unitsSold = 0;
    let itemRevenue = 0;

    bookingsData.forEach(b => {
      // Cancelled bookings never took the gear, so they are not counted as rented
      if (b.status === "Cancelled") return;
      if (Array.isArray(b.addons)) {
        b.addons.forEach(a => {
          if (a.name === item.name) {
            unitsSold += (a.qty || 1);
            itemRevenue += (a.total || a.qty * a.unitPrice || item.price);
          }
        });
      }
    });

    const inUse = inventory.inUse(item.id, bookingsData);
    const available = Math.max(0, stock[item.id] - inUse);
    const isOut = available === 0;
    const isLow = !isOut && available <= inventory.LOW_STOCK;
    if (isOut) outOfStockCount++;

    const badge = isOut
      ? `<span class="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">Out of stock</span>`
      : isLow
        ? `<span class="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Low stock</span>`
        : `<span class="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">In stock</span>`;

    const card = document.createElement("div");
    card.className = `p-4 rounded-2xl border shadow-2xs space-y-3 ${isOut ? "bg-red-50/60 border-red-200" : "bg-white border-gray-200"}`;
    card.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <img src="${imageBase}${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs ${isOut ? "grayscale opacity-60" : ""}">
          <div>
            <h4 class="text-sm font-extrabold text-gray-900 flex items-center gap-2">${item.name} ${badge}</h4>
            <span class="text-xs text-gray-500 font-semibold">${formatINR(item.price)} / unit</span>
          </div>
        </div>

        <div class="text-right">
          <div class="text-sm font-black text-[#164e3f]">${unitsSold} Rented</div>
          ${unitsSold > inUse ? `<div class="text-[11px] font-semibold text-gray-500">${inUse} out now &middot; ${unitsSold - inUse} returned</div>` : ""}
          <div class="text-xs font-bold text-gray-500">${formatINR(itemRevenue)} total</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <label class="flex items-center gap-2 text-xs font-bold text-gray-600">
          Stock
          <span class="flex items-center gap-1 bg-gray-100 px-1.5 py-1 rounded-lg border border-gray-200">
            <button type="button" class="stock-step w-6 h-6 rounded bg-white border border-gray-300 font-extrabold text-gray-800 hover:bg-gray-200" data-id="${item.id}" data-step="-1" title="Decrease stock">-</button>
            <input type="number" min="0" value="${stock[item.id]}" class="stock-input w-14 text-center text-sm font-black text-gray-900 bg-transparent focus:outline-none" data-id="${item.id}" aria-label="${item.name} stock">
            <button type="button" class="stock-step w-6 h-6 rounded bg-[#164e3f] text-white font-extrabold hover:bg-[#0f382d]" data-id="${item.id}" data-step="1" title="Increase stock">+</button>
          </span>
        </label>
        <div class="text-xs font-bold text-gray-500">
          In use: <span class="text-gray-900">${inUse}</span>
          <span class="mx-1.5 text-gray-300">|</span>
          Available: <span class="${isOut ? "text-red-600" : isLow ? "text-amber-700" : "text-[#164e3f]"} font-black">${isOut ? "0 &middot; Out of stock" : available}</span>
        </div>
      </div>
    `;

    inventoryContainer.appendChild(card);
  });

  // Header badge: overall stock state
  const statusBadge = document.getElementById("inventoryStatusBadge");
  if (statusBadge) {
    statusBadge.textContent = outOfStockCount ? `${outOfStockCount} out of stock` : "In stock";
    statusBadge.className = outOfStockCount
      ? "text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded"
      : "text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded";
  }
}

// Admin sets the stock for each gear item (− / + buttons or typing a number)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".stock-step");
  if (!btn) return;
  const id = btn.dataset.id;
  window.GogoInventory.setStock(id, window.GogoInventory.getStock()[id] + Number(btn.dataset.step));
  renderAddonInventory();
});

document.addEventListener("change", (e) => {
  const input = e.target.closest(".stock-input");
  if (!input) return;
  window.GogoInventory.setStock(input.dataset.id, input.value);
  renderAddonInventory();
});

// View Details Modal Popup
window.viewBookingDetails = function(index) {
  const b = filteredBookings[index];
  if (!b) return;

  const modal = document.getElementById("bookingDetailModal");
  const modalContent = document.getElementById("bookingDetailContent");
  if (!modal || !modalContent) return;

  const addonsListHTML = Array.isArray(b.addons) && b.addons.length > 0
    ? b.addons.map(a => `<div class="flex justify-between text-xs py-1 border-b border-gray-100">
        <span class="font-bold text-gray-800">${a.name} (Qty: ${a.qty})</span>
        <span class="font-extrabold text-[#164e3f]">${formatINR(a.total || a.qty * a.unitPrice)}</span>
      </div>`).join("")
    : "<div class='text-xs text-gray-400 italic'>No extra accessories ordered</div>";

  modalContent.innerHTML = `
    <div class="space-y-4 text-left">
      <div class="bg-[#164e3f] text-white p-4 rounded-2xl flex justify-between items-center shadow-xs">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">BOOKING RECEIPT</span>
          <h3 class="text-xl font-black">${b.id}</h3>
        </div>
        <span class="px-3 py-1 bg-white text-[#164e3f] text-xs font-black rounded-full">${b.status}</span>
      </div>

      <div class="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Lead Camper:</span><span class="font-black text-gray-900">${b.leadName} ${b.isLoggedInUser !== false ? '✓ (Logged in Member)' : ''}</span></div>
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Mobile Phone:</span><span class="font-bold text-gray-900">+91 ${b.phone}</span></div>
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Email Address:</span><span class="font-bold text-gray-900">${b.email}</span></div>
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Trip Date:</span><span class="font-bold text-emerald-800">${b.tripDate || '2026-10-05'}</span></div>
      </div>

      ${(b.leadIdProof || b.idReminderStatus) ? `
      <div class="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
        <h4 class="text-xs font-black text-gray-900 uppercase">Campers &amp; ID Verification</h4>
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Alternate number:</span><span class="font-bold text-gray-900">${b.altPhone ? "+91 " + b.altPhone : "–"}</span></div>
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Team leader camping:</span><span class="font-bold text-gray-900">${b.leaderIsCamper === false ? "No – booked for others" : "Yes"}</span></div>
        <div class="flex justify-between"><span class="text-gray-500 font-medium">Team leader ID:</span><span class="font-bold text-gray-900">${b.leadIdProof ? (b.leadIdProof.type === "Aadhaar" ? "Aadhaar " + b.leadIdProof.masked : "Uploaded: " + b.leadIdProof.fileName) : "Not given"}</span></div>
        ${bookingCampersWithStatus(b).length ? `
        <div class="flex justify-between"><span class="text-gray-500 font-medium">WhatsApp upload links:</span><span class="font-bold text-amber-700">${b.idReminderAt ? "Due " + new Date(b.idReminderAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "24h before check-in"}</span></div>
        <div class="divide-y divide-gray-100 border border-gray-100 rounded-lg">
          ${bookingCampersWithStatus(b).map(cp => `
          <div class="p-2.5 flex flex-wrap items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#f7f3e8] text-[#164e3f] flex items-center justify-center text-[11px] font-black">${cp.no}</span>
            <div class="flex-1 min-w-[140px]">
              <div class="font-bold text-gray-900">${cp.name || "Camper " + cp.no}${cp.age ? `<span class="text-gray-500 font-medium"> · ${cp.age} yrs</span>` : ""}</div>
              <div class="text-[11px] text-gray-500">${cp.phone ? "📱 +91 " + cp.phone : "No phone given"}</div>
            </div>
            ${cp.upload
              ? `<button type="button" onclick="openIdImage('${b.id}|${cp.no}')" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold"><img src="${cp.upload.dataUrl}" class="w-8 h-6 object-cover rounded"> Aadhaar ✓</button>`
              : `<span class="px-2 py-0.5 rounded-full font-bold ${cp.idStatus === "Link sent" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-800"}">${cp.idStatus}</span>
                 ${cp.phone ? `<a href="https://wa.me/91${cp.phone}?text=${encodeURIComponent(camperIdMessage(b, cp))}" target="_blank" rel="noopener" onclick="setTimeout(() => markCamperLinkSent('${b.id}', ${cp.no}), 300)" class="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white font-extrabold">Send link</a>` : ""}
                 <button type="button" onclick="navigator.clipboard && navigator.clipboard.writeText('${idUploadLink(b, cp)}'); showToast('Upload link copied')" class="px-2 py-1 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50">Copy link</button>`}
          </div>`).join("")}
        </div>` : `<div class="text-gray-500">Solo booking – no other camper IDs needed.</div>`}
      </div>` : ""}

      <div class="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
        <h4 class="text-xs font-black text-gray-900 uppercase">Itemized Pricing Summary</h4>
        <div class="flex justify-between text-xs py-1 border-b border-gray-100">
          <span class="font-bold text-gray-800">${b.packageName} (${b.camperCount} Campers)</span>
          <span class="font-extrabold text-[#164e3f]">${formatINR(b.camperSubtotal || b.camperCount * 2399)}</span>
        </div>
        ${b.gstAmount ? `<div class="flex justify-between text-xs py-1 border-b border-gray-100"><span class="font-bold text-gray-800">GST (${b.gstRate}%)</span><span class="font-extrabold text-gray-900">${formatINR(b.gstAmount)}</span></div>` : ''}
        ${b.food ? `<div class="flex justify-between text-xs py-1 border-b border-gray-100"><span class="font-bold text-gray-800">Food: ${b.food}</span><span class="font-extrabold text-emerald-700">Included</span></div>` : ''}
        ${b.kidsUnder4 ? `<div class="flex justify-between text-xs py-1 border-b border-gray-100"><span class="font-bold text-gray-800">Children under 4: ${b.kidsUnder4}</span><span class="font-extrabold text-emerald-700">Free</span></div>` : ''}
        ${Array.isArray(b.events) && b.events.length ? b.events.map(ev => `<div class="flex justify-between text-xs py-1 border-b border-gray-100"><span class="font-bold text-purple-800">Event: ${ev.name}</span><span class="font-extrabold text-emerald-700">Included</span></div>`).join("") : ''}
        ${Array.isArray(b.activities) && b.activities.length ? `<div class="flex justify-between gap-3 text-xs py-1 border-b border-gray-100"><span class="font-bold text-amber-800">Activities: ${b.activities.map(a => a.name).join(", ")}</span><span class="font-extrabold text-emerald-700 shrink-0">Included</span></div>` : ''}
        <div>${(b.food && !(b.addons || []).length) ? '' : addonsListHTML}</div>
        ${b.policyAcceptedAt ? `<div class="flex justify-between text-[11px] py-1 border-b border-gray-100"><span class="font-bold text-gray-600">Policy accepted</span><span class="font-bold text-gray-700">${new Date(b.policyAcceptedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span></div>` : ''}
        <div class="text-[11px] font-extrabold text-red-700 py-1">No refund on cancellation (100% deduction)</div>
        <div class="flex justify-between text-sm pt-2 border-t border-gray-200 font-black">
          <span>Total Paid (${b.paymentMethod || 'Card / ATM'}):</span>
          <span class="text-[#164e3f]">${formatINR(b.grandTotal)}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  initLucideIcons();
};

// Set Booking Status from the status dropdown (Confirmed / Completed / Cancelled)
window.setBookingStatus = function(id, status) {
  const b = bookingsData.find(item => item.id === id);
  if (b && b.status !== status) {
    b.status = status;

    saveBookings(bookingsData);
    filterAndRender();
    showToast(`Status updated for ${id} to ${b.status}`);
  }
};

// Delete Booking
window.deleteBooking = function(id) {
  if (confirm(`Are you sure you want to delete booking ${id}?`)) {
    bookingsData = bookingsData.filter(item => item.id !== id);
    saveBookings(bookingsData);
    filterAndRender();
    showToast(`Booking ${id} deleted`);
  }
};

// Filter & Search Logic
function filterAndRender() {
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";

  filteredBookings = bookingsData.filter(b => {
    let matchesStatus = true;
    if (currentFilterStatus === "confirmed") matchesStatus = b.status === "Confirmed";
    else if (currentFilterStatus === "completed") matchesStatus = b.status === "Completed";
    else if (currentFilterStatus === "cancelled") matchesStatus = b.status === "Cancelled";
    else if (currentFilterStatus === "loggedin") matchesStatus = b.isLoggedInUser !== false;

    const matchesSearch = !searchTerm || 
      b.id.toLowerCase().includes(searchTerm) ||
      b.leadName.toLowerCase().includes(searchTerm) ||
      b.phone.includes(searchTerm) ||
      b.email.toLowerCase().includes(searchTerm) ||
      b.packageName.toLowerCase().includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  renderKPIs();
  renderBookingsTable();
  renderCharts();
  renderAddonInventory();
  renderInsights();

  // "Logged-in Members" tab shows the members table instead of the bookings table
  const showMembers = currentFilterStatus === "loggedin";
  document.getElementById("bookingsTableWrap")?.classList.toggle("hidden", showMembers);
  document.getElementById("membersTableWrap")?.classList.toggle("hidden", !showMembers);
  if (showMembers) {
    const members = getMembers().filter(m => !searchTerm ||
      (m.name || "").toLowerCase().includes(searchTerm) ||
      (m.phone || "").includes(searchTerm) ||
      (m.email || "").toLowerCase().includes(searchTerm));
    renderMembersTable(members);
    const countBadge = document.getElementById("tableBookingCount");
    if (countBadge) countBadge.textContent = `${members.length} Member${members.length !== 1 ? "s" : ""}`;
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Search Input listener
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRender);
  }

  // Filter Status Buttons
  const filterBtns = document.querySelectorAll(".table-filter-btn");
  // Remember each tab's own colours (e.g. red Cancelled, purple Members) so they come back when not selected
  filterBtns.forEach(btn => {
    if (!btn.dataset.baseClass) {
      const base = btn.className.split(/\s+/).filter(c => !["bg-[#164e3f]", "text-white", "shadow-2xs"].includes(c));
      // the tab that starts selected ("All Bookings") has no colours of its own yet
      if (!base.some(c => /^text-/.test(c))) base.push("text-gray-600", "hover:bg-gray-200");
      btn.dataset.baseClass = base.join(" ");
    }
  });
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.className = b.dataset.baseClass;
      });
      // Selected tab: drop its own text / hover colours so the white text stays readable
      btn.className = btn.dataset.baseClass
        .split(/\s+/)
        .filter(c => !/^(text-(gray|red|purple)-\d+|hover:bg-\S+)$/.test(c))
        .concat(["bg-[#164e3f]", "text-white", "shadow-2xs"])
        .join(" ");

      currentFilterStatus = btn.getAttribute("data-status");
      filterAndRender();
    });
  });

  // Modal Close buttons
  const closeDetailModalBtn = document.getElementById("closeDetailModalBtn");
  const detailModal = document.getElementById("bookingDetailModal");
  if (closeDetailModalBtn && detailModal) {
    closeDetailModalBtn.addEventListener("click", () => detailModal.classList.add("hidden"));
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) detailModal.classList.add("hidden");
    });
  }

  // Add Manual Booking Form modal
  const addBookingBtn = document.getElementById("addBookingBtn");
  const addBookingModal = document.getElementById("addBookingModal");
  const closeAddBookingModalBtn = document.getElementById("closeAddBookingModalBtn");
  const addBookingForm = document.getElementById("addBookingForm");

  // Package -> camper count: fixed packages set the count, "Custom / Group" lets the admin type 5 or more
  const pkgSelect = document.getElementById("newCamperPkg");
  const qtyInput = document.getElementById("newCamperQty");
  const qtyHint = document.getElementById("newCamperQtyHint");
  const totalEl = document.getElementById("newBookingTotal");
  // enforceMin: false while the admin is typing, so "12" can be typed (it passes through "" and "1")
  function syncAddBookingForm(enforceMin = true) {
    if (!pkgSelect || !qtyInput) return;
    const isCustom = pkgSelect.value === "custom";
    if (isCustom) {
      qtyInput.readOnly = false;
      qtyInput.min = 5;
      if (enforceMin && !(parseInt(qtyInput.value, 10) >= 5)) qtyInput.value = 5;
      if (qtyHint) qtyHint.textContent = "(5 or more)";
    } else {
      qtyInput.readOnly = true;
      qtyInput.min = 1;
      qtyInput.value = pkgSelect.selectedOptions[0].dataset.persons;
      if (qtyHint) qtyHint.textContent = "(set by package)";
    }
    const campers = parseInt(qtyInput.value, 10) || 0;
    if (!totalEl) return;
    const q = window.GogoPricing.quote(Math.max(1, campers));
    totalEl.textContent = isCustom && campers < 5
      ? "Enter 5 or more campers"
      : `${formatINR(q.subtotal)} + ${formatINR(q.gst)} GST = ${formatINR(q.total)}${isCustom ? ` (${campers} × ${formatINR(q.rate)})` : ""}`;
  }
  if (pkgSelect) pkgSelect.addEventListener("change", () => syncAddBookingForm());
  if (qtyInput) {
    qtyInput.addEventListener("input", () => syncAddBookingForm(false));
    qtyInput.addEventListener("change", () => syncAddBookingForm());
  }
  syncAddBookingForm();

  if (addBookingBtn && addBookingModal) {
    addBookingBtn.addEventListener("click", () => {
      syncAddBookingForm();
      addBookingModal.classList.remove("hidden");
    });
  }
  if (closeAddBookingModalBtn && addBookingModal) {
    closeAddBookingModalBtn.addEventListener("click", () => addBookingModal.classList.add("hidden"));
  }

  if (addBookingForm) {
    addBookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("newCamperName")?.value || "Camper Guest";
      const phone = document.getElementById("newCamperPhone")?.value || "9876543210";
      const email = document.getElementById("newCamperEmail")?.value || "guest@gogocamping.in";
      const pkgValue = document.getElementById("newCamperPkg")?.value || "1 Person Camping Tent";
      const campers = Math.max(1, parseInt(document.getElementById("newCamperQty")?.value || "1", 10) || 1);
      if (pkgValue === "custom" && campers < 5) {
        showToast("Custom / Group booking needs 5 or more campers");
        return;
      }
      // Same package name the rental page uses for group bookings, e.g. "6 Person Camping Tent"
      const pkg = pkgValue === "custom" ? `${campers} Person Camping Tent` : pkgValue;
      const paymentMethod = document.getElementById("newCamperPay")?.value || "Card / ATM";

      const newRecord = {
        id: `#GOGO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        leadName: name,
        phone: phone,
        email: email,
        isLoggedInUser: true,
        packageName: pkg,
        camperCount: campers,
        food: document.getElementById("newCamperFood")?.value || "Veg",
        kidsUnder4: Math.max(0, Math.min(10, parseInt(document.getElementById("newCamperKids")?.value || "0", 10) || 0)),
        addons: [],
        camperSubtotal: window.GogoPricing.quote(campers).subtotal,
        addonsSubtotal: 0,
        ratePerPerson: window.GogoPricing.quote(campers).rate,
        gstRate: window.GogoPricing.quote(campers).gstPct,
        gstAmount: window.GogoPricing.quote(campers).gst,
        grandTotal: window.GogoPricing.quote(campers).total,
        paymentMethod: paymentMethod,
        status: "Confirmed",
        date: new Date().toISOString().split("T")[0],
        tripDate: "2026-10-05"
      };

      bookingsData.unshift(newRecord);
      saveBookings(bookingsData);
      filterAndRender();
      if (addBookingModal) addBookingModal.classList.add("hidden");
      addBookingForm.reset();
      syncAddBookingForm();
      showToast(`✓ New offline booking added for ${name}`);
    });
  }

  // Export CSV Handler
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", exportBookingsCSV);
  }
}

// Export Bookings to CSV file download
function exportBookingsCSV() {
  if (bookingsData.length === 0) {
    showToast("No data to export");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Order ID,Lead Camper,Phone,Email,Member Status,Package,Campers,Addons,Total Paid,Payment Method,Status,Booking Date\n";

  bookingsData.forEach(b => {
    const addonsStr = Array.isArray(b.addons) ? b.addons.map(a => `${a.name}(x${a.qty})`).join(";") : "";
    const memberStr = b.isLoggedInUser !== false ? "LoggedIn Member" : "Guest";
    csvContent += `"${b.id}","${b.leadName}","${b.phone}","${b.email}","${memberStr}","${b.packageName}",${b.camperCount},"${addonsStr}",${b.grandTotal},"${b.paymentMethod}","${b.status}","${b.date}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `GOGOCamping_Bookings_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("⬇ Exported Bookings CSV report!");
}

// Toast Helper
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("cmsToast");
  const toastText = document.getElementById("cmsToastText");
  if (!toast || !toastText) return;

  clearTimeout(toastTimer);
  toastText.textContent = msg;
  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  toastTimer = setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 2500);
}
