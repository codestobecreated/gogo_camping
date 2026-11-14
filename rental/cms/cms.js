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
function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
  bookingsData = getBookings();
  filteredBookings = [...bookingsData];
  
  initLucideIcons();
  renderKPIs();
  renderBookingsTable();
  renderCharts();
  renderAddonInventory();
  setupEventListeners();
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
  const loggedInUsersCount = bookingsData.filter(b => b.isLoggedInUser !== false).length;
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

    const addonsText = Array.isArray(b.addons) && b.addons.length > 0
      ? b.addons.map(a => `${a.name} (${a.qty}×)`).join(", ")
      : "<span class='text-gray-400'>None</span>";

    const statusBadge = b.status === "Confirmed"
      ? `<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">Confirmed</span>`
      : b.status === "Completed"
      ? `<span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold border border-blue-200">Completed</span>`
      : `<span class="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-extrabold border border-red-200">Cancelled</span>`;

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
        <div class="text-[11px] text-gray-500 font-medium mt-0.5">📱 +91 ${b.phone} | ✉️ ${b.email}</div>
      </td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-gray-800">${b.packageName}</div>
        <div class="text-[11px] text-emerald-800 font-extrabold">${b.camperCount} Camper${b.camperCount > 1 ? 's' : ''}</div>
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
        <button type="button" onclick="toggleBookingStatus('${b.id}')" class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition font-bold" title="Toggle Status (Confirmed/Completed/Cancelled)">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
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

    const pkgCounts = { "1 Person": 0, "2 Person": 0, "3 Person": 0, "4 Person": 0 };
    bookingsData.forEach(b => {
      const name = b.packageName || "";
      if (name.includes("1 Person")) pkgCounts["1 Person"]++;
      else if (name.includes("2 Person")) pkgCounts["2 Person"]++;
      else if (name.includes("3 Person")) pkgCounts["3 Person"]++;
      else if (name.includes("4 Person")) pkgCounts["4 Person"]++;
    });

    packageChartInstance = new Chart(ctxPackage, {
      type: "doughnut",
      data: {
        labels: Object.keys(pkgCounts),
        datasets: [{
          data: Object.values(pkgCounts),
          backgroundColor: ["#10b981", "#164e3f", "#0284c7", "#f59e0b"],
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

  // Chart 3: Add-on Accessories Performance (Bar)
  const ctxAddons = document.getElementById("chartAddons")?.getContext("2d");
  if (ctxAddons) {
    if (addonsChartInstance) addonsChartInstance.destroy();

    const addonSales = { "Camping Chair": 0, "Sleeping Bag": 0, "LED Lantern": 0, "Rope Set": 0 };
    bookingsData.forEach(b => {
      if (Array.isArray(b.addons)) {
        b.addons.forEach(item => {
          if (addonSales.hasOwnProperty(item.name)) {
            addonSales[item.name] += item.qty || 1;
          }
        });
      }
    });

    addonsChartInstance = new Chart(ctxAddons, {
      type: "bar",
      data: {
        labels: Object.keys(addonSales),
        datasets: [{
          label: "Units Sold",
          data: Object.values(addonSales),
          backgroundColor: ["#164e3f", "#0d7a57", "#10b981", "#34d399"],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } }
        }
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

// Render Add-on Accessories Inventory Table
function renderAddonInventory() {
  const inventoryContainer = document.getElementById("addonInventoryGrid");
  if (!inventoryContainer) return;

  const addonsList = [
    { id: "chair", name: "Camping Chair", price: 1200, image: "../chair.jpg", stock: 45 },
    { id: "sleeping_bag", name: "Sleeping Bag", price: 1500, image: "../sleeping_bag.jpg", stock: 30 },
    { id: "lantern", name: "LED Lantern", price: 800, image: "../lantern.jpg", stock: 60 },
    { id: "rope", name: "Rope Set", price: 600, image: "../rope.jpg", stock: 80 }
  ];

  inventoryContainer.innerHTML = "";

  addonsList.forEach(item => {
    let unitsSold = 0;
    let itemRevenue = 0;

    bookingsData.forEach(b => {
      if (Array.isArray(b.addons)) {
        b.addons.forEach(a => {
          if (a.name === item.name) {
            unitsSold += (a.qty || 1);
            itemRevenue += (a.total || a.qty * a.unitPrice || item.price);
          }
        });
      }
    });

    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between gap-4";
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs">
        <div>
          <h4 class="text-sm font-extrabold text-gray-900">${item.name}</h4>
          <span class="text-xs text-gray-500 font-semibold">${formatINR(item.price)} / unit</span>
        </div>
      </div>

      <div class="text-right">
        <div class="text-sm font-black text-[#164e3f]">${unitsSold} Rented</div>
        <div class="text-xs font-bold text-gray-500">${formatINR(itemRevenue)} total</div>
      </div>
    `;

    inventoryContainer.appendChild(card);
  });
}

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

      <div class="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
        <h4 class="text-xs font-black text-gray-900 uppercase">Itemized Pricing Summary</h4>
        <div class="flex justify-between text-xs py-1 border-b border-gray-100">
          <span class="font-bold text-gray-800">${b.packageName} (${b.camperCount} Campers)</span>
          <span class="font-extrabold text-[#164e3f]">${formatINR(b.camperSubtotal || b.camperCount * 2399)}</span>
        </div>
        <div>${addonsListHTML}</div>
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

// Toggle Booking Status (Confirmed -> Completed -> Cancelled -> Confirmed)
window.toggleBookingStatus = function(id) {
  const b = bookingsData.find(item => item.id === id);
  if (b) {
    if (b.status === "Confirmed") b.status = "Completed";
    else if (b.status === "Completed") b.status = "Cancelled";
    else b.status = "Confirmed";

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
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("bg-[#164e3f]", "text-white", "shadow-2xs");
        b.classList.add("text-gray-600", "hover:bg-gray-200");
      });
      btn.classList.remove("text-gray-600", "hover:bg-gray-200");
      btn.classList.add("bg-[#164e3f]", "text-white", "shadow-2xs");

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

  if (addBookingBtn && addBookingModal) {
    addBookingBtn.addEventListener("click", () => addBookingModal.classList.remove("hidden"));
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
      const pkg = document.getElementById("newCamperPkg")?.value || "1 Person Camping Tent";
      const campers = parseInt(document.getElementById("newCamperQty")?.value || "1", 10);
      const paymentMethod = document.getElementById("newCamperPay")?.value || "Card / ATM";

      const newRecord = {
        id: `#GOGO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        leadName: name,
        phone: phone,
        email: email,
        isLoggedInUser: true,
        packageName: pkg,
        camperCount: campers,
        addons: [],
        camperSubtotal: campers * 2399,
        addonsSubtotal: 0,
        grandTotal: campers * 2399,
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
