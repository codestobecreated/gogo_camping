// State Management
const PACKAGES = {
  1: {
    persons: 1,
    name: "1 Person Camping Tent",
    desc: "Ultra-compact, lightweight solo tent – ideal for solo campers, trekkers and bikepackers.",
    original: 3199,
    price: 2399
  },
  2: {
    persons: 2,
    name: "2 Person Camping Tent",
    desc: "Cozy, weather-resistant duo tent – perfect for couples and hiking duos seeking adventure.",
    original: 6398,
    price: 4798
  },
  3: {
    persons: 3,
    name: "3 Person Camping Tent",
    desc: "Roomy three-person tent with extra vestibule storage – great for friends and small groups.",
    original: 9597,
    price: 7197
  },
  4: {
    persons: 4,
    name: "4 Person Camping Tent",
    desc: "Spacious, durable and easy to set up – perfect for family trips, weekend getaways and outdoor adventures.",
    original: 12796,
    price: 9596
  }
};

let selectedPackage = PACKAGES[1];
let currentQuantity = 1;
let currentImageIndex = 0;

const galleryImages = [
  "tent_1.jpg",
  "tent_2.jpg",
  "tent_3.jpg",
  "tent_4.jpg",
  "tent_5.jpg"
];

// Add-ons data
const selectedAddons = new Map();

// DOM Elements
const mainGalleryImg = document.getElementById("mainGalleryImg");
const prevImageBtn = document.getElementById("prevImageBtn");
const nextImageBtn = document.getElementById("nextImageBtn");
const thumbItems = document.querySelectorAll(".thumb-item");

const productTitle = document.getElementById("productTitle");
const productDesc = document.getElementById("productDesc");
const originalPriceDisplay = document.getElementById("originalPriceDisplay");
const currentPriceDisplay = document.getElementById("currentPriceDisplay");
const capacitySpecTexts = document.querySelectorAll(".capacity-spec-text");
const pkgCards = document.querySelectorAll(".pkg-card");

const qtyDecreaseBtn = document.getElementById("qtyDecreaseBtn");
const qtyIncreaseBtn = document.getElementById("qtyIncreaseBtn");
const qtyDisplay = document.getElementById("qtyDisplay");
const totalPriceDisplay = document.getElementById("totalPriceDisplay");

const addonCards = document.querySelectorAll(".addon-card");
const bookNowBtn = document.getElementById("bookNowBtn");

// Modal elements
const bookingModal = document.getElementById("bookingModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalTentQty = document.getElementById("modalTentQty");
const modalTentSubtotal = document.getElementById("modalTentSubtotal");
const modalAddonsContainer = document.getElementById("modalAddonsContainer");
const modalGrandTotal = document.getElementById("modalGrandTotal");
const confirmRedirectBtn = document.getElementById("confirmRedirectBtn");
const tripDateInput = document.getElementById("tripDate");

// Navigation & Toast
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const loginBtn = document.getElementById("loginBtn");
const loginBtnMobile = document.getElementById("loginBtnMobile");
const loginBtnDrawer = document.getElementById("loginBtnDrawer");
const loginModal = document.getElementById("loginModal");
const closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
const loginForm = document.getElementById("loginForm");
const loginNameInput = document.getElementById("loginNameInput");
const loginPhoneInput = document.getElementById("loginPhoneInput");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const logoutBtnMobile = document.getElementById("logoutBtnMobile");
const googleModal = document.getElementById("googleModal");
const closeGoogleModalBtn = document.getElementById("closeGoogleModalBtn");
const selectGoogleUserBtn = document.getElementById("selectGoogleUserBtn");
const memberLoginBanner = document.getElementById("memberLoginBanner");
const camper1NameInput = document.getElementById("camper1NameInput");
const toast = document.getElementById("toastNotification");
const toastMessage = document.getElementById("toastMessage");

// Format Indian Rupee Currency
function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

// ===== Pricing (rental/pricing.js): group tiers per person, + GST at checkout =====
function priceQuote(n) { return window.GogoPricing.quote(n); }
function packageFor(persons) {
  const base = PACKAGES[persons] || {
    persons: persons,
    name: `${persons} Person Camping Tent`,
    desc: `Spacious, weather-resistant custom camping tent package for ${persons} people with full amenities & support.`
  };
  const q = priceQuote(persons);
  return Object.assign({}, base, { persons: persons, price: q.subtotal, original: q.baseSubtotal, rate: q.rate });
}
// Static prices on the page (package cards, tier list, GST %) – re-run when the CMS changes pricing
function renderPricingUI() {
  const cfg = window.GogoPricing.get();
  document.querySelectorAll(".gst-pct").forEach((el) => { el.textContent = cfg.gstPct; });
  document.querySelectorAll(".pkg-card").forEach((card) => {
    const n = parseInt(card.getAttribute("data-persons"), 10);
    if (!n) return;
    const q = priceQuote(n);
    const priceEl = card.querySelector(".pkg-price");
    const origEl = card.querySelector(".pkg-orig");
    if (priceEl) priceEl.textContent = formatCurrency(q.subtotal);
    if (origEl) { origEl.textContent = formatCurrency(q.baseSubtotal); origEl.classList.toggle("hidden", q.baseSubtotal <= q.subtotal); }
    card.setAttribute("data-price", q.subtotal);
    card.setAttribute("data-original", q.baseSubtotal);
  });
  const tierList = document.getElementById("tierList");
  if (tierList) {
    const current = window.GogoPricing.tierFor(camperCount, cfg);
    tierList.innerHTML = cfg.tiers.map((t) => {
      const on = camperCount >= 4 && current.min === t.min;
      return `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${on ? "bg-[#164e3f] text-white border-[#164e3f]" : "bg-white text-gray-700 border-gray-200"}">${window.GogoPricing.tierLabel(t)}: ${formatCurrency(t.rate)}</span>`;
    }).join("");
  }
  const maxDiscount = priceQuote(cfg.tiers[cfg.tiers.length - 1].min).discountPct;
  const badge = document.getElementById("pricingBadge");
  if (badge) badge.textContent = `+ ${cfg.gstPct}% GST${maxDiscount > 0 ? ` · Group discounts up to ${maxDiscount}%` : ""}`;
}

// Add-on Quantity Helper Functions
function getAddonsTotalSum() {
  let sum = 0;
  selectedAddons.forEach((item) => {
    sum += item.qty * item.unitPrice;
  });
  return sum;
}

function getAddonsTotalCount() {
  let count = 0;
  selectedAddons.forEach((item) => {
    count += item.qty;
  });
  return count;
}

function getAddonQty(id) {
  return selectedAddons.has(id) ? selectedAddons.get(id).qty : 0;
}

function changeAddonQty(id, delta, unitPrice, name, showToastMsg = true) {
  const currentItem = selectedAddons.get(id);
  let currentQty = currentItem ? currentItem.qty : 0;
  let newQty = currentQty + delta;

  // Do not allow more than the stock the admin has set in the CMS
  if (delta > 0 && window.GogoInventory) {
    const available = window.GogoInventory.available(id);
    if (newQty > available) {
      showToast(available === 0 ? `${name} is out of stock` : `Only ${available} ${name} available`);
      updateAddonCardsUI();
      return;
    }
  }

  if (newQty <= 0) {
    selectedAddons.delete(id);
    if (showToastMsg) showToast(`Removed ${name}`);
  } else {
    selectedAddons.set(id, { qty: newQty, unitPrice: unitPrice, name: name });
    if (showToastMsg) {
      if (delta > 0) {
        showToast(`Added ${name} (Qty: ${newQty}, +${formatCurrency(newQty * unitPrice)})`);
      } else {
        showToast(`Reduced ${name} to Qty: ${newQty}`);
      }
    }
  }

  updateAddonCardsUI();
  updatePrice();
  updateBookingModalTotal();
  if (typeof renderPaymentModalUI === "function") renderPaymentModalUI();
  if (typeof renderCartDrawerUI === "function") renderCartDrawerUI();
}

function updateAddonCardsUI() {
  addonCards.forEach((card) => {
    const id = card.getAttribute("data-id");
    const checkbox = card.querySelector(".addon-checkbox");
    const qtyValEl = card.querySelector(".addon-qty-val");
    const qtyDecBtn = card.querySelector(".addon-qty-dec");
    
    const qtyIncBtn = card.querySelector(".addon-qty-inc");

    const qty = getAddonQty(id);

    if (qtyValEl) qtyValEl.textContent = qty;
    if (qtyDecBtn) qtyDecBtn.disabled = (qty <= 0);

    // Stock from the CMS: grey out sold-out gear and warn when only a few are left
    if (window.GogoInventory) {
      const available = window.GogoInventory.available(id);
      const isOut = available === 0;
      let note = card.querySelector(".addon-stock-note");
      if (!note) {
        note = document.createElement("div");
        note.className = "addon-stock-note text-[10px] font-extrabold uppercase mt-1";
        const priceEl = card.querySelector(".text-xs.font-black");
        if (priceEl) priceEl.after(note);
      }
      note.textContent = isOut ? "Out of stock" : (available <= window.GogoInventory.LOW_STOCK ? `Only ${available} left` : "");
      note.classList.toggle("text-red-600", isOut);
      note.classList.toggle("text-amber-700", !isOut);
      card.classList.toggle("opacity-60", isOut && qty === 0);
      card.classList.toggle("cursor-not-allowed", isOut && qty === 0);
      if (qtyIncBtn) qtyIncBtn.disabled = qty >= available;
      if (qtyIncBtn) qtyIncBtn.classList.add("disabled:opacity-40", "disabled:cursor-not-allowed");
    }

    if (qty > 0) {
      card.classList.add("selected", "border-2", "border-[#164e3f]", "bg-emerald-50/40", "shadow-2xs");
      card.classList.remove("border-gray-200", "bg-white");
      if (checkbox) checkbox.checked = true;
    } else {
      card.classList.remove("selected", "border-2", "border-[#164e3f]", "bg-emerald-50/40", "shadow-2xs");
      card.classList.add("border-gray-200", "bg-white");
      if (checkbox) checkbox.checked = false;
    }
  });
}

// Update Total Price
function updatePrice() {
  const addonsSum = getAddonsTotalSum();
  const camperSubtotal = priceQuote(camperCount).subtotal;
  const grandTotal = camperSubtotal + addonsSum;
  if (totalPriceDisplay) totalPriceDisplay.textContent = formatCurrency(grandTotal);

  if (totalPriceDisplay) {
    totalPriceDisplay.classList.add("scale-105");
    setTimeout(() => {
      totalPriceDisplay.classList.remove("scale-105");
    }, 150);
  }
}

// Function to select package by persons count
function selectPackageByPersons(persons, triggerToast = false) {
  persons = Math.max(1, parseInt(persons, 10) || 1);

  selectedPackage = packageFor(persons);
  camperCount = selectedPackage.persons;

  // Toggle Custom Person Dropdown Container visibility & update select value
  const customPersonContainer = document.getElementById("customPersonContainer");
  const customPersonSelect = document.getElementById("customPersonSelect");
  
  const isCustomPackageSelected = persons >= 4 || !PACKAGES[persons];

  if (customPersonContainer) {
    if (isCustomPackageSelected) {
      customPersonContainer.classList.remove("hidden");
    } else {
      customPersonContainer.classList.add("hidden");
    }
  }

  if (customPersonSelect && isCustomPackageSelected && customPersonSelect.value !== persons.toString()) {
    customPersonSelect.value = persons.toString();
  }
  const customPersonTotal = document.getElementById("customPersonTotal");
  if (customPersonTotal && isCustomPackageSelected) {
    customPersonTotal.textContent = `= ${formatCurrency(selectedPackage.price)}`;
  }
  {
    const q = priceQuote(isCustomPackageSelected ? persons : 4);
    const rateEl = document.getElementById("customCardRate");
    const origEl = document.getElementById("customCardOrig");
    const saveEl = document.getElementById("customSaveBadge");
    if (rateEl) rateEl.textContent = formatCurrency(q.rate);
    if (origEl) { origEl.textContent = formatCurrency(q.baseRate); origEl.classList.toggle("hidden", q.savePerPerson <= 0); }
    if (saveEl) { saveEl.textContent = `Save ${formatCurrency(q.savePerPerson)} / person (${q.discountPct}% off)`; saveEl.classList.toggle("hidden", q.savePerPerson <= 0); }
  }

  // Update active package card styling
  const pkgCards = document.querySelectorAll(".pkg-card");
  const customCardLabel = document.getElementById("customCardLabel");

  pkgCards.forEach((c) => {
    const cardPersonsAttr = c.getAttribute("data-persons");
    const isCustomCard = cardPersonsAttr === "custom";
    const parsedCardPersons = parseInt(cardPersonsAttr, 10);
    const radio = c.querySelector(".pkg-radio");
    
    let isSelected = false;
    if (isCustomCard) {
      if (isCustomPackageSelected) {
        isSelected = true;
      }
      if (customCardLabel) {
        customCardLabel.textContent = isCustomPackageSelected ? `${persons} Person` : "Custom";
      }
    } else if (parsedCardPersons === persons) {
      isSelected = true;
    }

    if (isSelected) {
      c.classList.add("active", "border-2", "border-[#164e3f]", "bg-emerald-50/50", "shadow-xs");
      c.classList.remove("border-gray-200", "bg-white");
      if (radio) {
        radio.innerHTML = "✓";
        radio.className = "w-4 h-4 rounded-full bg-[#164e3f] flex items-center justify-center text-white text-[10px] pkg-radio";
      }
    } else {
      c.classList.remove("active", "border-2", "border-[#164e3f]", "bg-emerald-50/50", "shadow-xs");
      c.classList.add("border-gray-200", "bg-white");
      if (radio) {
        radio.innerHTML = "";
        radio.className = "w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-white text-[10px] pkg-radio";
      }
    }
  });

  // Update text & prices on page
  if (productTitle) productTitle.textContent = selectedPackage.name;
  if (productDesc) productDesc.textContent = selectedPackage.desc;
  if (originalPriceDisplay) {
    originalPriceDisplay.textContent = formatCurrency(selectedPackage.original);
    originalPriceDisplay.classList.toggle("hidden", selectedPackage.original <= selectedPackage.price);
    originalPriceDisplay.classList.toggle("block", selectedPackage.original > selectedPackage.price);
  }
  if (currentPriceDisplay) currentPriceDisplay.textContent = formatCurrency(selectedPackage.price);
  capacitySpecTexts.forEach((el) => {
    el.textContent = `${selectedPackage.persons} Person${selectedPackage.persons > 1 ? 's' : ''}`;
  });

  renderCampers();
  updatePrice();
  renderPricingUI();
  if (typeof renderBookingCalendar === "function") {
    const d = selectedTripDate();
    if (d && !window.GogoCalendar.dayStatus(d, camperCount).bookable) {
      calMessage(`${formatTripDate(d)}: ${window.GogoCalendar.dayStatus(d, camperCount).reason}. Please pick another date.`);
      setTripDate("");
    } else renderBookingCalendar();
  }
  if (typeof renderPaymentModalUI === "function") renderPaymentModalUI();
  if (typeof renderCartDrawerUI === "function") renderCartDrawerUI();
  if (triggerToast) {
    showToast(`Selected ${selectedPackage.name} (${formatCurrency(selectedPackage.price)} + GST)`);
  }
}

// Package Card Selection Listeners
const pkgCardsList = document.querySelectorAll(".pkg-card");
pkgCardsList.forEach((card) => {
  card.addEventListener("click", () => {
    const cardPersonsAttr = card.getAttribute("data-persons");
    if (cardPersonsAttr === "custom") {
      const customPersonSelect = document.getElementById("customPersonSelect");
      let selectedVal = customPersonSelect ? parseInt(customPersonSelect.value, 10) : 5;
      if (isNaN(selectedVal) || selectedVal < 4) selectedVal = 4;
      selectPackageByPersons(selectedVal, true);
    } else {
      const persons = parseInt(cardPersonsAttr, 10);
      selectPackageByPersons(persons, true);
    }
  });
});

// Custom group size: typed number box with − / + buttons (min 4)
const CUSTOM_MIN = 4, CUSTOM_MAX = 500;
const customPersonSelect = document.getElementById("customPersonSelect");
function setCustomPersons(val, toast) {
  val = Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, parseInt(val, 10) || CUSTOM_MIN));
  customPersonSelect.value = val;
  selectPackageByPersons(val, toast);
}
if (customPersonSelect) {
  // While typing: update price as soon as the number is valid, without forcing the value
  customPersonSelect.addEventListener("input", () => {
    const val = parseInt(customPersonSelect.value, 10);
    if (!isNaN(val) && val >= CUSTOM_MIN && val <= CUSTOM_MAX) selectPackageByPersons(val, false);
  });
  // When done typing (blur / Enter): fix out-of-range values
  customPersonSelect.addEventListener("change", () => setCustomPersons(customPersonSelect.value, true));
  customPersonSelect.addEventListener("keydown", (e) => { if (e.key === "Enter") customPersonSelect.blur(); });
  // Clicks inside the box must not re-trigger the card click
  ["click", "mousedown"].forEach((ev) => customPersonSelect.addEventListener(ev, (e) => e.stopPropagation()));
  const minus = document.getElementById("customPersonMinus");
  const plus = document.getElementById("customPersonPlus");
  if (minus) minus.addEventListener("click", () => setCustomPersons((parseInt(customPersonSelect.value, 10) || CUSTOM_MIN) - 1, false));
  if (plus) plus.addEventListener("click", () => setCustomPersons((parseInt(customPersonSelect.value, 10) || CUSTOM_MIN) + 1, false));
}

// Gallery Image Switcher
function setActiveImage(index) {
  if (index < 0) index = galleryImages.length - 1;
  if (index >= galleryImages.length) index = 0;
  
  currentImageIndex = index;
  
  // Fade effect
  mainGalleryImg.style.opacity = "0.7";
  setTimeout(() => {
    mainGalleryImg.src = galleryImages[currentImageIndex];
    mainGalleryImg.style.opacity = "1";
  }, 100);

  // Update thumbnail states
  thumbItems.forEach((thumb, i) => {
    if (i === currentImageIndex) {
      thumb.classList.add("active");
      thumb.classList.remove("opacity-80", "border-gray-200");
    } else {
      thumb.classList.remove("active");
      thumb.classList.add("opacity-80", "border-gray-200");
    }
  });
}

// Gallery Event Listeners
thumbItems.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const idx = parseInt(thumb.getAttribute("data-index"), 10);
    setActiveImage(idx);
  });
});

prevImageBtn.addEventListener("click", () => {
  setActiveImage(currentImageIndex - 1);
});

nextImageBtn.addEventListener("click", () => {
  setActiveImage(currentImageIndex + 1);
});

// Image Lightbox Popup
const imageLightbox = document.getElementById("imageLightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxThumbs = document.getElementById("lightboxThumbs");

lightboxThumbs.innerHTML = galleryImages.map((src, i) => `
  <button data-index="${i}" class="lightbox-thumb w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition">
    <img src="${src}" alt="Thumbnail ${i + 1}" class="w-full h-full object-cover">
  </button>`).join("");
const lightboxThumbItems = lightboxThumbs.querySelectorAll(".lightbox-thumb");

function showLightboxImage(index) {
  setActiveImage(index);
  lightboxImg.style.opacity = "0.4";
  setTimeout(() => {
    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxImg.style.opacity = "1";
  }, 100);
  lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
  lightboxThumbItems.forEach((thumb, i) => {
    thumb.classList.toggle("border-white", i === currentImageIndex);
    thumb.classList.toggle("border-transparent", i !== currentImageIndex);
    thumb.classList.toggle("opacity-50", i !== currentImageIndex);
  });
}

function openLightbox() {
  showLightboxImage(currentImageIndex);
  imageLightbox.classList.remove("hidden");
}

function closeLightbox() {
  imageLightbox.classList.add("hidden");
}

mainGalleryImg.addEventListener("click", openLightbox);
document.getElementById("lightboxCloseBtn").addEventListener("click", closeLightbox);
document.getElementById("lightboxPrevBtn").addEventListener("click", () => showLightboxImage(currentImageIndex - 1));
document.getElementById("lightboxNextBtn").addEventListener("click", () => showLightboxImage(currentImageIndex + 1));
lightboxThumbItems.forEach((thumb) => {
  thumb.addEventListener("click", () => showLightboxImage(parseInt(thumb.getAttribute("data-index"), 10)));
});

// Close when clicking the dark background
imageLightbox.addEventListener("click", (e) => {
  if (e.target === imageLightbox) closeLightbox();
});

// Keyboard: Esc to close, arrows to switch
document.addEventListener("keydown", (e) => {
  if (imageLightbox.classList.contains("hidden")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showLightboxImage(currentImageIndex - 1);
  if (e.key === "ArrowRight") showLightboxImage(currentImageIndex + 1);
});

// Mobile swipe
let lightboxTouchX = null;
imageLightbox.addEventListener("touchstart", (e) => { lightboxTouchX = e.touches[0].clientX; }, { passive: true });
imageLightbox.addEventListener("touchend", (e) => {
  if (lightboxTouchX === null) return;
  const diff = e.changedTouches[0].clientX - lightboxTouchX;
  if (Math.abs(diff) > 50) showLightboxImage(currentImageIndex + (diff < 0 ? 1 : -1));
  lightboxTouchX = null;
});

// Quantity Selector Handlers (if present)
if (qtyIncreaseBtn) {
  qtyIncreaseBtn.addEventListener("click", () => {
    currentQuantity++;
    if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
    if (qtyDecreaseBtn) qtyDecreaseBtn.disabled = false;
    updatePrice();
  });
}

if (qtyDecreaseBtn) {
  qtyDecreaseBtn.addEventListener("click", () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
      if (currentQuantity === 1) {
        qtyDecreaseBtn.disabled = true;
      }
      updatePrice();
    }
  });
}

// Add-on Card & Stepper Event Listeners
addonCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    // If click was on stepper buttons, skip card toggle
    if (e.target.closest(".addon-qty-inc") || e.target.closest(".addon-qty-dec")) return;

    const id = card.getAttribute("data-id");
    const name = card.getAttribute("data-name");
    const price = parseInt(card.getAttribute("data-price"), 10);
    const qty = getAddonQty(id);

    if (qty > 0) {
      changeAddonQty(id, -qty, price, name);
    } else {
      changeAddonQty(id, 1, price, name);
    }
  });
});

// Main Page Add-on Stepper Buttons (+ / -)
document.addEventListener("click", (e) => {
  const incBtn = e.target.closest(".addon-qty-inc");
  const decBtn = e.target.closest(".addon-qty-dec");

  if (incBtn) {
    e.stopPropagation();
    const id = incBtn.getAttribute("data-id");
    const card = document.querySelector(`.addon-card[data-id="${id}"]`);
    if (card) {
      const name = card.getAttribute("data-name");
      const price = parseInt(card.getAttribute("data-price"), 10);
      changeAddonQty(id, 1, price, name);
    }
  } else if (decBtn) {
    e.stopPropagation();
    const id = decBtn.getAttribute("data-id");
    const card = document.querySelector(`.addon-card[data-id="${id}"]`);
    if (card) {
      const name = card.getAttribute("data-name");
      const price = parseInt(card.getAttribute("data-price"), 10);
      changeAddonQty(id, -1, price, name);
    }
  }
});

// Toast Notification
let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  toastMessage.textContent = msg;
  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 2500);
}

// Modal Handling
// Modal Handling & Dynamic Pricing Per Camper
const passengersList = document.getElementById("passengersList");
const modalTentLabel = document.getElementById("modalTentLabel");
let camperCount = selectedPackage.persons;

function updateBookingModalTotal() {
  const addonsSum = getAddonsTotalSum();
  const q = priceQuote(camperCount);
  const camperSubtotal = q.subtotal;
  const grandTotal = q.total + addonsSum;

  if (modalTentLabel) {
    modalTentLabel.textContent = selectedPackage.name;
  }
  if (modalTentQty) {
    modalTentQty.textContent = `${camperCount} Camper${camperCount > 1 ? 's' : ''}`;
  }
  if (modalTentSubtotal) {
    modalTentSubtotal.textContent = formatCurrency(camperSubtotal);
  }
  if (modalGrandTotal) {
    modalGrandTotal.textContent = formatCurrency(grandTotal);
  }
  const modalBottomTotal = document.getElementById("modalBottomTotal");
  if (modalBottomTotal) {
    modalBottomTotal.textContent = formatCurrency(grandTotal);
  }
}

// ===== Team leader details + ID (only the primary booker; others share ID on WhatsApp 24h before check-in) =====
function onlyDigits(v) { return String(v || "").replace(/\D/g, ""); }
// Aadhaar check digit (Verhoeff)
function isValidAadhaar(num) {
  const d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  const pT = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,7,6,8,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  if (!/^[2-9]\d{11}$/.test(num)) return false;
  let c = 0;
  num.split("").reverse().forEach((ch, i) => { c = d[c][pT[i % 8][parseInt(ch, 10)]]; });
  return c === 0;
}
function tomorrowISO() {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return t.toISOString().split("T")[0];
}
// WhatsApp reminder goes out 24 hours before check-in (check-in time 12:00 noon)
function idReminderTime(tripDate) {
  const checkIn = new Date(`${tripDate}T12:00:00`);
  return new Date(checkIn.getTime() - 24 * 60 * 60 * 1000);
}

function renderCampers() {
  const nameEl = document.getElementById("camper1NameInput");
  const phoneEl = document.getElementById("contactPhone");
  const emailEl = document.getElementById("contactEmail");
  const dateEl = document.getElementById("tripDate");
  if (currentUser && currentUser.isLoggedIn) {
    if (nameEl && !nameEl.value) nameEl.value = currentUser.name || "";
    if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone || "";
    if (emailEl && !emailEl.value) emailEl.value = currentUser.email || "";
  }
  const dateText = document.getElementById("modalTripDateText");
  if (dateText) dateText.textContent = dateEl && dateEl.value ? formatTripDate(dateEl.value) : "Not selected";
  renderOtherCampers(dateEl && dateEl.value);
  updateBookingModalTotal();
}

// ===== Team leader camping or not: decides how many "other camper" rows are needed =====
let leaderCamping = true;
function otherCamperCount() { return Math.max(0, camperCount - (leaderCamping ? 1 : 0)); }
function renderLeaderChoice() {
  document.querySelectorAll("#leaderCampingChoice .leader-opt").forEach((btn) => {
    const on = (btn.dataset.leader === "yes") === leaderCamping;
    btn.classList.toggle("border-[#164e3f]", on);
    btn.classList.toggle("bg-emerald-50", on);
    btn.classList.toggle("border-gray-200", !on);
    btn.classList.toggle("bg-white", !on);
  });
  const subs = document.querySelectorAll("#leaderCampingChoice .leader-sub");
  if (subs[0]) subs[0].textContent = `I'm 1 of the ${camperCount} camper${camperCount > 1 ? "s" : ""}`;
  if (subs[1]) subs[1].textContent = `Enter all ${camperCount} camper${camperCount > 1 ? "s" : ""} below`;
}
document.getElementById("leaderCampingChoice")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".leader-opt");
  if (!btn) return;
  captureOtherCampers();
  leaderCamping = btn.dataset.leader === "yes";
  renderLeaderChoice();
  renderOtherCampers(document.getElementById("tripDate")?.value);
});

// ===== Other campers: name, age, phone – kept while the form re-renders =====
let otherCampers = [];
function captureOtherCampers() {
  document.querySelectorAll("#otherCampersList .other-camper").forEach((row) => {
    const i = parseInt(row.dataset.index, 10);
    otherCampers[i] = {
      name: row.querySelector(".oc-name").value.trim(),
      age: row.querySelector(".oc-age").value.trim(),
      phone: onlyDigits(row.querySelector(".oc-phone").value).slice(0, 10)
    };
  });
}
function renderOtherCampers(tripDate) {
  const list = document.getElementById("otherCampersList");
  const section = document.getElementById("otherCampersSection");
  if (!list || !section) return;
  captureOtherCampers();
  renderLeaderChoice();
  const others = otherCamperCount();
  const first = leaderCamping ? 2 : 1;
  section.classList.toggle("hidden", others === 0);
  const titleEl = document.getElementById("otherCampersTitle");
  if (titleEl) titleEl.textContent = leaderCamping ? "Other campers" : "Campers";
  const subEl = document.getElementById("otherCampersSub");
  if (subEl) subEl.textContent = leaderCamping ? "Name, age and WhatsApp number of everyone else in your group." : "Name, age and WhatsApp number of every camper (the team leader is not camping).";
  const countEl = document.getElementById("otherCampersCount");
  if (countEl) countEl.textContent = `${others} camper${others === 1 ? "" : "s"}`;
  const field = "rounded-xl border border-gray-300 px-3 py-1.5 bg-white focus-within:border-[#164e3f]";
  const input = "w-full text-sm font-medium text-gray-900 focus:outline-none placeholder-gray-400 bg-transparent";
  let html = "";
  for (let i = 0; i < others; i++) {
    const v = otherCampers[i] || { name: "", age: "", phone: "" };
    const esc = (s) => String(s).replace(/"/g, "&quot;");
    html += `
      <div class="other-camper rounded-xl border border-gray-200 bg-gray-50/50 p-3" data-index="${i}">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-6 h-6 rounded-full bg-[#f7f3e8] text-[#164e3f] border border-[#164e3f]/20 flex items-center justify-center text-[11px] font-black">${i + first}</span>
          <span class="text-xs font-extrabold text-gray-800">Camper ${i + first}</span>
        </div>
        <div class="grid grid-cols-12 gap-2">
          <label class="col-span-12 sm:col-span-5 ${field}"><span class="text-[10px] text-gray-500 font-medium block leading-tight">Name</span><input type="text" class="oc-name ${input}" placeholder="Full name" value="${esc(v.name)}"></label>
          <label class="col-span-4 sm:col-span-2 ${field}"><span class="text-[10px] text-gray-500 font-medium block leading-tight">Age</span><input type="number" min="0" max="120" class="oc-age ${input}" placeholder="Age" value="${esc(v.age)}"></label>
          <label class="col-span-8 sm:col-span-5 ${field}"><span class="text-[10px] text-gray-500 font-medium block leading-tight">WhatsApp number (+91)</span><input type="tel" inputmode="numeric" maxlength="10" class="oc-phone ${input}" placeholder="10-digit mobile" value="${esc(v.phone)}"></label>
        </div>
      </div>`;
  }
  list.innerHTML = html;
  list.querySelectorAll(".oc-phone").forEach((el) => el.addEventListener("input", () => { el.value = onlyDigits(el.value).slice(0, 10); }));
  const note = document.getElementById("otherCampersNote");
  if (note && tripDate) {
    const due = idReminderTime(tripDate);
    const when = due <= new Date() ? "right after booking" : "on " + due.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    note.innerHTML = `Each camper gets a WhatsApp message <b>${when}</b> (24 hours before check-in) with a link to upload their <b>Aadhaar card photo</b>.`;
  }
}
function readOtherCampers() {
  captureOtherCampers();
  const others = otherCamperCount();
  const first = leaderCamping ? 2 : 1;
  const out = [];
  for (let i = 0; i < others; i++) {
    const v = otherCampers[i] || {};
    out.push({ no: i + first, name: v.name || "", age: v.age || "", phone: v.phone || "", idStatus: "Pending" });
  }
  return out;
}

// Read the team leader form (no validation – whatever is filled in is saved with the booking)
function readLeadDetails() {
  const name = (document.getElementById("camper1NameInput")?.value || "").trim();
  const phone = onlyDigits(document.getElementById("contactPhone")?.value);
  const alt = onlyDigits(document.getElementById("altPhone")?.value);
  const email = (document.getElementById("contactEmail")?.value || "").trim();
  const tripDate = document.getElementById("tripDate")?.value || "";
  const aadhaar = onlyDigits(document.getElementById("aadhaarInput")?.value);
  const file = document.getElementById("idUpload")?.files?.[0] || null;
  return {
    name, phone, alt, email, tripDate,
    idProof: aadhaar
      ? { type: "Aadhaar", masked: `XXXX XXXX ${aadhaar.slice(-4)}` }
      : file ? { type: "ID upload", fileName: file.name } : null
  };
}

// Aadhaar input: digits only, shown as "1234 5678 9012"
document.getElementById("aadhaarInput")?.addEventListener("input", (e) => {
  const d = onlyDigits(e.target.value).slice(0, 12);
  e.target.value = d.replace(/(\d{4})(?=\d)/g, "$1 ");
});
["contactPhone", "altPhone"].forEach((id) => document.getElementById(id)?.addEventListener("input", (e) => {
  e.target.value = onlyDigits(e.target.value).slice(0, 10);
}));
document.getElementById("idUpload")?.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  const label = document.getElementById("idUploadLabel");
  if (label) label.textContent = f ? `✓ ${f.name}` : "Upload Aadhaar / ID";
});
document.getElementById("tripDate")?.addEventListener("change", () => renderCampers());

let leadDetails = null;

// ===== Booking calendar (rental/calendar.js): 25 campers/day, weekday rule, dates opened/closed by Gopal =====
let calMonth = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
function formatTripDate(iso) {
  return window.GogoCalendar.parse(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function selectedTripDate() { return document.getElementById("tripDate")?.value || ""; }
function setTripDate(iso) {
  const el = document.getElementById("tripDate");
  if (el) el.value = iso || "";
  const pill = document.getElementById("calSelectedPill");
  if (pill) { pill.textContent = iso ? formatTripDate(iso) : ""; pill.classList.toggle("hidden", !iso); }
  const text = document.getElementById("modalTripDateText");
  if (text) text.textContent = iso ? formatTripDate(iso) : "Not selected";
  renderBookingCalendar();
  if (typeof renderOtherCampers === "function") renderOtherCampers(iso);
}
function calMessage(msg) {
  const el = document.getElementById("calMessage");
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("hidden", !msg);
}
function renderBookingCalendar() {
  const C = window.GogoCalendar;
  const grid = document.getElementById("calGrid");
  if (!C || !grid) return;
  const cfg = C.getSettings();
  const all = JSON.parse(localStorage.getItem("gogo_bookings_db") || "[]");
  const capText = document.getElementById("calCapacityText");
  if (capText) capText.textContent = cfg.dailyCapacity;
  const label = document.getElementById("calMonthLabel");
  if (label) label.textContent = calMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const now = new Date();
  const prev = document.getElementById("calPrev");
  if (prev) prev.disabled = calMonth.getFullYear() === now.getFullYear() && calMonth.getMonth() === now.getMonth();
  const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
  const days = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const sel = selectedTripDate();
  let html = "";
  for (let i = 0; i < lead; i++) html += "<span></span>";
  for (let d = 1; d <= days; d++) {
    const iso = C.iso(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
    const st = C.dayStatus(iso, camperCount, cfg, all);
    let cls, sub;
    if (st.state === "past") { cls = "bg-gray-50 text-gray-300 cursor-not-allowed"; sub = ""; }
    else if (st.state === "blocked" || st.state === "full") { cls = "bg-red-50 text-red-700 border-red-200 cursor-not-allowed"; sub = "Closed"; }
    else if (!st.bookable) { cls = "bg-amber-50 text-amber-800 border-amber-200 cursor-not-allowed"; sub = st.left + " left" + (st.minGroup > 1 && camperCount < st.minGroup ? "<span class='block text-[8px] font-extrabold opacity-80'>" + st.minGroup + "+ only</span>" : ""); }
    else { cls = "bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-[#164e3f] hover:bg-emerald-100"; sub = st.label; }
    if (iso === sel) cls = "bg-[#164e3f] text-white border-[#164e3f] ring-2 ring-[#164e3f]/30";
    html += `<button type="button" class="cal-day rounded-lg border border-transparent py-1.5 leading-tight transition ${cls}" data-date="${iso}" ${st.bookable ? "" : "aria-disabled=\"true\""} title="${st.reason}">
      <span class="block text-sm font-extrabold">${d}</span>
      <span class="block text-[9px] font-bold truncate px-0.5">${iso === sel ? "Selected" : sub}</span>
    </button>`;
  }
  grid.innerHTML = html;
}
document.getElementById("calGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".cal-day");
  if (!btn) return;
  const st = window.GogoCalendar.dayStatus(btn.dataset.date, camperCount);
  if (!st.bookable) { calMessage(`${formatTripDate(btn.dataset.date)}: ${st.reason}.`); return; }
  calMessage("");
  setTripDate(btn.dataset.date);
});
document.getElementById("calPrev")?.addEventListener("click", () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); renderBookingCalendar(); });
document.getElementById("calNext")?.addEventListener("click", () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); renderBookingCalendar(); });
document.getElementById("changeDateBtn")?.addEventListener("click", () => {
  bookingModal.classList.add("hidden");
  document.getElementById("bookingCalendarCard")?.scrollIntoView({ behavior: "smooth", block: "center" });
});
// The chosen date must still fit the group (group size changed / someone else booked / Gopal closed the day)
function requireTripDate() {
  const iso = selectedTripDate();
  const card = document.getElementById("bookingCalendarCard");
  if (!iso) {
    calMessage("Please choose a check-in date.");
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("📅 Please choose your check-in date");
    return false;
  }
  const st = window.GogoCalendar.dayStatus(iso, camperCount);
  if (!st.bookable) {
    calMessage(`${formatTripDate(iso)}: ${st.reason}. Please pick another date.`);
    setTripDate("");
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast(`📅 ${st.reason}`);
    return false;
  }
  return true;
}
window.GogoCalendar && window.GogoCalendar.onChange(() => renderBookingCalendar());

// ===== Events picked on the Events page: added to this booking (no price change) =====
// Regular camping and Events are separate: picks are used only when the visitor came from the Events page
const FROM_EVENTS = new URLSearchParams(location.search).get("from") === "events";
if (!FROM_EVENTS && window.GogoEvents) {
  try { localStorage.removeItem("gogo_selected_events"); localStorage.removeItem("gogo_selected_activities"); } catch (e) {}
}
function pickedEvents() { return FROM_EVENTS && window.GogoEvents ? window.GogoEvents.getPicked() : []; }
function pickedActivities() { return FROM_EVENTS && window.GogoEvents && window.GogoEvents.getPickedActivities ? window.GogoEvents.getPickedActivities() : []; }
function pickedNames() { return pickedEvents().map((e) => e.name).concat(pickedActivities().map((a) => a.name)); }
function renderPickedEvents() {
  const list = pickedEvents();
  const acts = pickedActivities();
  const any = list.length + acts.length > 0;
  const card = document.getElementById("pickedEventsCard");
  if (card) card.classList.toggle("hidden", !any);
  const box = document.getElementById("pickedEventsList");
  if (box) {
    box.innerHTML = acts.map((a) => `
      <span class="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-full pl-2.5 pr-1 py-1">
        <i data-lucide="${a.icon || "star"}" class="w-3.5 h-3.5 text-amber-700"></i>
        <span class="text-xs font-extrabold text-gray-900">${a.name.replace(/</g, "&lt;")}</span>
        <button type="button" class="remove-picked-activity w-5 h-5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-[11px]" data-id="${a.id}" aria-label="Remove activity">✕</button>
      </span>`).join("") + list.map((ev) => `
      <span class="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-xl pl-2 pr-1 py-1">
        <img src="${window.GogoEvents.img(ev, "../")}" class="w-8 h-8 rounded-lg object-cover" alt="">
        <span class="leading-tight">
          <span class="block text-xs font-extrabold text-gray-900">${ev.name.replace(/</g, "&lt;")}</span>
          <span class="block text-[10px] text-gray-500">${window.GogoEvents.dateRange(ev)}</span>
        </span>
        <button type="button" class="remove-picked-event w-6 h-6 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center" data-id="${ev.id}" aria-label="Remove event">✕</button>
      </span>`).join("");
  }
  const names = pickedNames().join(", ");
  const set = (id, text, rowId) => {
    const el = document.getElementById(id); if (el) el.textContent = text;
    const row = document.getElementById(rowId || id); if (row) row.classList.toggle("hidden", !any);
  };
  if (window.lucide) lucide.createIcons();
  set("payModalEvents", names, "payModalEventsRow");
  set("cartEvents", names, "cartEventsBox");
}
document.getElementById("pickedEventsList")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-picked-event");
  if (btn) window.GogoEvents.togglePicked(btn.dataset.id);
  const act = e.target.closest(".remove-picked-activity");
  if (act) window.GogoEvents.togglePickedActivity(act.dataset.id);
});
window.GogoEvents && window.GogoEvents.onChange(() => renderPickedEvents());
document.addEventListener("DOMContentLoaded", () => {
  renderPickedEvents();
  const n = pickedNames().length;
  if (n && new URLSearchParams(location.search).get("from") === "events") {
    setTimeout(() => document.getElementById("pickedEventsCard")?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    showToast(`✨ ${n} item${n > 1 ? "s" : ""} added – now choose your package & date`);
  }
});

// ===== Food preference (Veg / Non-Veg, included in the package price) =====
let selectedFood = null;
const foodCards = document.querySelectorAll(".food-card");
function setFood(food) {
  selectedFood = food;
  foodCards.forEach((card) => {
    const on = card.getAttribute("data-food") === food;
    card.classList.toggle("border-2", on);
    card.classList.toggle("border-[#164e3f]", on);
    card.classList.toggle("bg-emerald-50/50", on);
    card.classList.toggle("border-gray-200", !on);
    card.classList.toggle("bg-white", !on);
    const r = card.querySelector(".food-radio");
    if (r) {
      r.innerHTML = on ? "✓" : "";
      r.className = on
        ? "food-radio w-4 h-4 rounded-full bg-[#164e3f] flex items-center justify-center text-white text-[10px] shrink-0"
        : "food-radio w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-white text-[10px] shrink-0";
    }
  });
  const hint = document.getElementById("foodHint");
  if (hint && food) hint.classList.add("hidden");
  const label = food || "Not selected";
  ["payModalFood", "cartFoodDisplay"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = label; });
  const footer = document.getElementById("cartFoodFooter");
  if (footer) footer.textContent = food || "—";
}
foodCards.forEach((card) => card.addEventListener("click", () => setFood(card.getAttribute("data-food"))));
// ===== Children under 4: free, not part of the headcount price =====
let kidsUnder4 = 0;
const KIDS_MAX = 10;
function setKids(n) {
  kidsUnder4 = Math.max(0, Math.min(KIDS_MAX, n));
  ["kidsCount", "payModalKids", "cartKidsDisplay"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = kidsUnder4; });
  const dec = document.getElementById("kidsDecBtn");
  if (dec) dec.disabled = kidsUnder4 <= 0;
}
document.getElementById("kidsDecBtn")?.addEventListener("click", () => setKids(kidsUnder4 - 1));
document.getElementById("kidsIncBtn")?.addEventListener("click", () => setKids(kidsUnder4 + 1));

function requireFood() {
  if (selectedFood) return true;
  const hint = document.getElementById("foodHint");
  if (hint) hint.classList.remove("hidden");
  const sec = document.getElementById("foodSection");
  if (sec) sec.scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("🍽 Please choose Veg or Non-Veg food");
  return false;
}

bookNowBtn.addEventListener("click", () => {
  if (!requirePolicy()) return;
  if (!requireTripDate()) return;
  if (!requireFood()) return;
  if (!currentUser.isLoggedIn) {
    pendingAction = "booking";
    openLoginModal();
    showToast("🔒 Please login to complete your booking & receive invoice");
    return;
  }

  renderCampers();

  // Food choice (+ picked events) in booking modal summary
  modalAddonsContainer.classList.remove("hidden");
  const evNames = pickedNames().join(", ");
  modalAddonsContainer.innerHTML = `<span class="text-gray-500 block text-xs">Food</span><span class="font-bold text-gray-900">${selectedFood}</span> <span class="text-emerald-700 font-bold">· included</span>` +
    (evNames ? `<span class="text-gray-500 block text-xs mt-1">Events &amp; activities</span><span class="font-bold text-purple-800">${evNames.replace(/</g, "&lt;")}</span>` : "");

  updateBookingModalTotal();
  bookingModal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
});

closeModalBtn.addEventListener("click", () => {
  bookingModal.classList.add("hidden");
});

// Package can only be changed on the product page: close popups and scroll to the package cards
document.querySelectorAll(".change-package-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    bookingModal.classList.add("hidden");
    const drawer = document.getElementById("cartDrawer");
    if (drawer) drawer.classList.add("hidden");
    document.getElementById("packageSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

bookingModal.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    bookingModal.classList.add("hidden");
  }
});

// Dynamic Add Passenger Handler
const addPassengerBtn = document.getElementById("addPassengerBtn");

if (addPassengerBtn && passengersList) {
  addPassengerBtn.addEventListener("click", () => {
    window.changePayModalCampers(1);
  });
}

// WhatsApp toggle notification
const whatsappToggle = document.getElementById("whatsappToggle");
if (whatsappToggle) {
  whatsappToggle.addEventListener("change", () => {
    if (whatsappToggle.checked) {
      showToast("WhatsApp updates enabled");
    } else {
      showToast("WhatsApp updates disabled");
    }
  });
}

// ================= PAYMENT MODAL & CHECKOUT LOGIC =================
const paymentModal = document.getElementById("paymentModal");
const closePaymentModalBtn = document.getElementById("closePaymentModalBtn");
const payModalPackageName = document.getElementById("payModalPackageName");
const payModalPackageSubtotal = document.getElementById("payModalPackageSubtotal");
const payModalCamperCount = document.getElementById("payModalCamperCount");
const payModalCamperDec = document.getElementById("payModalCamperDec");
const payModalCamperInc = document.getElementById("payModalCamperInc");
const payModalAddonsList = document.getElementById("payModalAddonsList");
const payModalAddPicker = document.getElementById("payModalAddPicker");
const payModalTotalAmount = document.getElementById("payModalTotalAmount");
const payBtnAmount = document.getElementById("payBtnAmount");
const payNowBtn = document.getElementById("payNowBtn");
const copyUpiBtn = document.getElementById("copyUpiBtn");

// Payment Tabs & Views
const tabPayQr = document.getElementById("tabPayQr");
const tabPayUpi = document.getElementById("tabPayUpi");
const tabPayCard = document.getElementById("tabPayCard");
const tabPayNet = document.getElementById("tabPayNet");

const payViewQr = document.getElementById("payViewQr");
const payViewUpi = document.getElementById("payViewUpi");
const payViewCard = document.getElementById("payViewCard");
const payViewNet = document.getElementById("payViewNet");

// Success Modal Elements
const paymentSuccessModal = document.getElementById("paymentSuccessModal");
const successOrderId = document.getElementById("successOrderId");
const successCamperName = document.getElementById("successCamperName");
const successPackageName = document.getElementById("successPackageName");
const successCamperCount = document.getElementById("successCamperCount");
const successAddonsText = document.getElementById("successAddonsText");
const successTotalPaid = document.getElementById("successTotalPaid");
const downloadPassBtn = document.getElementById("downloadPassBtn");
const doneSuccessBtn = document.getElementById("doneSuccessBtn");

// Render Payment Modal Order Summary
// Payment summary: has the team leader's Aadhaar / ID been added? (number or uploaded image)
let idThumbUrl = null;
function renderIdVerification() {
  const row = document.getElementById("payModalIdRow");
  if (!row) return;
  const aadhaar = onlyDigits(document.getElementById("aadhaarInput")?.value);
  const file = document.getElementById("idUpload")?.files?.[0] || null;
  const icon = document.getElementById("payModalIdIcon");
  const text = document.getElementById("payModalIdText");
  const thumb = document.getElementById("payModalIdThumb");
  const add = document.getElementById("payModalIdAdd");
  const ok = !!(file || aadhaar.length === 12);
  row.className = "flex items-center justify-between gap-3 p-3 rounded-xl border shadow-2xs " + (ok ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200");
  icon.className = "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-black " + (ok ? "bg-emerald-600" : "bg-amber-500");
  icon.textContent = ok ? "✓" : "!";
  if (file) text.textContent = "Verified ✓ · image uploaded (" + file.name + ")";
  else if (aadhaar.length === 12) text.textContent = "Verified ✓ · Aadhaar XXXX XXXX " + aadhaar.slice(-4);
  else text.textContent = "Not added yet – needed at the campsite";
  if (idThumbUrl) { URL.revokeObjectURL(idThumbUrl); idThumbUrl = null; }
  if (file && /^image\//.test(file.type)) { idThumbUrl = URL.createObjectURL(file); thumb.src = idThumbUrl; thumb.classList.remove("hidden"); }
  else thumb.classList.add("hidden");
  add.classList.toggle("hidden", ok);
}
document.getElementById("payModalIdAdd")?.addEventListener("click", () => {
  paymentModal.classList.add("hidden");
  bookingModal.classList.remove("hidden");
  setTimeout(() => {
    // scroll only the form body (never the popup panel itself)
    const el = document.getElementById("aadhaarInput");
    const body = el?.closest(".overflow-y-auto");
    if (el && body) body.scrollTo({ top: el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 120, behavior: "smooth" });
    el?.focus({ preventScroll: true });
  }, 100);
});

function renderPaymentModalUI() {
  renderIdVerification();
  const addonsSum = getAddonsTotalSum();
  const q = priceQuote(camperCount);
  const camperSubtotal = q.subtotal;
  const grandTotal = q.total + addonsSum;
  const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  setText("payModalRate", `${formatCurrency(q.rate)} per person + GST (${q.tierLabel})`);
  setText("payModalSubtotalEx", formatCurrency(camperSubtotal));
  setText("payModalGst", formatCurrency(q.gst));

  if (payModalPackageName) payModalPackageName.textContent = selectedPackage.name;
  if (payModalPackageSubtotal) payModalPackageSubtotal.textContent = formatCurrency(camperSubtotal);
  if (payModalCamperCount) payModalCamperCount.textContent = `${camperCount} Person`;
  if (payModalCamperDec) payModalCamperDec.disabled = (camperCount <= 1);
  if (payModalTotalAmount) payModalTotalAmount.textContent = formatCurrency(grandTotal);

  if (payNowBtn) {
    payNowBtn.innerHTML = `
      <i data-lucide="lock" class="w-5 h-5 text-emerald-300"></i>
      <span>Pay ${formatCurrency(grandTotal)} &amp; Complete Booking</span>
      <i data-lucide="arrow-right" class="w-5 h-5"></i>
    `;
  }

  // Populate Selected Addons List with Steppers + Remove buttons
  if (payModalAddonsList) {
    payModalAddonsList.innerHTML = "";
    if (selectedAddons.size > 0) {
      selectedAddons.forEach((item, id) => {
        const itemRow = document.createElement("div");
        itemRow.className = "flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 text-xs shadow-2xs";
        itemRow.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-gray-900">${item.name}</span>
            <span class="text-[#164e3f] font-extrabold">(${item.qty} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.qty * item.unitPrice)})</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-lg border border-gray-200">
              <button type="button" class="pay-item-dec w-5 h-5 rounded bg-white hover:bg-gray-200 text-gray-800 font-extrabold flex items-center justify-center transition border border-gray-300 cursor-pointer">-</button>
              <span class="font-black text-[#164e3f] text-xs min-w-[16px] text-center select-none">${item.qty}</span>
              <button type="button" class="pay-item-inc w-5 h-5 rounded bg-[#164e3f] hover:bg-[#0f382d] text-white font-extrabold flex items-center justify-center transition cursor-pointer">+</button>
            </div>
            <button type="button" class="remove-pay-addon-btn text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition" title="Remove item">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;

        const decBtn = itemRow.querySelector(".pay-item-dec");
        const incBtn = itemRow.querySelector(".pay-item-inc");
        const removeBtn = itemRow.querySelector(".remove-pay-addon-btn");

        if (decBtn) decBtn.addEventListener("click", () => changeAddonQty(id, -1, item.unitPrice, item.name));
        if (incBtn) incBtn.addEventListener("click", () => changeAddonQty(id, 1, item.unitPrice, item.name));
        if (removeBtn) removeBtn.addEventListener("click", () => changeAddonQty(id, -item.qty, item.unitPrice, item.name));

        payModalAddonsList.appendChild(itemRow);
      });
    } else {
      payModalAddonsList.innerHTML = `
        <div class="p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center text-xs text-gray-400">
          No extra add-on accessories selected yet.
        </div>
      `;
    }
  }

  // Update Quick Add Picker Buttons State
  if (payModalAddPicker) {
    const pickerBtns = payModalAddPicker.querySelectorAll(".pay-picker-btn");
    pickerBtns.forEach((btn) => {
      const id = btn.getAttribute("data-id");
      const item = selectedAddons.get(id);
      const card = document.querySelector(`.addon-card[data-id="${id}"]`);
      const addonName = card ? card.getAttribute("data-name") : id;
      const price = card ? parseInt(card.getAttribute("data-price"), 10) : 0;

      if (item && item.qty > 0) {
        btn.className = "pay-picker-btn text-left p-2 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs flex items-center justify-between font-bold text-emerald-900 cursor-pointer";
        btn.innerHTML = `
          <span class="truncate font-bold">${addonName}</span>
          <span class="text-emerald-800 text-[11px] font-black shrink-0">Qty: ${item.qty} +</span>
        `;
      } else {
        btn.className = "pay-picker-btn text-left p-2 rounded-xl bg-white border border-gray-200 hover:border-[#164e3f] transition flex items-center justify-between text-xs group cursor-pointer";
        btn.innerHTML = `
          <span class="truncate font-semibold text-gray-800">${addonName}</span>
          <span class="text-[#164e3f] font-extrabold shrink-0">+${formatCurrency(price)}</span>
        `;
      }
    });
  }

  if (window.lucide) lucide.createIcons();
}

// Quick Add Picker Click Handler inside Payment Modal
if (payModalAddPicker) {
  const pickerBtns = payModalAddPicker.querySelectorAll(".pay-picker-btn");
  pickerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const card = document.querySelector(`.addon-card[data-id="${id}"]`);
      const name = card ? card.getAttribute("data-name") : id;
      const price = card ? parseInt(card.getAttribute("data-price"), 10) : 0;
      changeAddonQty(id, 1, price, name);
    });
  });
}

// Global Camper Change Handler for All Stepper Controls
window.changePayModalCampers = function(delta) {
  if (delta === -1) {
    if (camperCount > 1) {
      camperCount--;
    } else {
      return;
    }
  } else if (delta === 1) {
    camperCount++;
  }

  // Synchronize selectedPackage based on camperCount
  selectedPackage = packageFor(camperCount);

  renderCampers();
  updateBookingModalTotal();
  renderPaymentModalUI();
  if (typeof renderCartDrawerUI === "function") renderCartDrawerUI();
  updatePrice();
  showToast(delta === 1 ? `Added Camper (${camperCount} Persons, ${formatCurrency(priceQuote(camperCount).subtotal)} + GST)` : `Reduced Campers to ${camperCount}`);
};

// Explicit Click Listeners for Camper Stepper Buttons
if (payModalCamperDec) {
  payModalCamperDec.addEventListener("click", (e) => {
    e.preventDefault();
    window.changePayModalCampers(-1);
  });
}
if (payModalCamperInc) {
  payModalCamperInc.addEventListener("click", (e) => {
    e.preventDefault();
    window.changePayModalCampers(1);
  });
}

// Payment Tabs Switcher
// Chosen payment method (QR / UPI or Card) – saved on the booking and printed on the ticket
let selectedPayMethod = "Card / ATM";
const PAY_METHOD_BY_TAB = { tabPayQr: "UPI QR Code", tabPayUpi: "UPI App", tabPayCard: "Card / ATM" };
function switchPayTab(activeTab, activeView) {
  if (activeTab && PAY_METHOD_BY_TAB[activeTab.id]) selectedPayMethod = PAY_METHOD_BY_TAB[activeTab.id];
  const allTabs = [tabPayQr, tabPayUpi, tabPayCard, tabPayNet];
  const allViews = [payViewQr, payViewUpi, payViewCard, payViewNet];

  allTabs.forEach((tab) => {
    if (!tab) return;
    if (tab === activeTab) {
      tab.className = "pay-tab active py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-[#164e3f] shadow-xs";
    } else {
      tab.className = "pay-tab py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-gray-600 hover:text-gray-900";
    }
  });

  allViews.forEach((view) => {
    if (!view) return;
    if (view === activeView) {
      view.classList.remove("hidden");
    } else {
      view.classList.add("hidden");
    }
  });
}

if (tabPayQr) tabPayQr.addEventListener("click", () => switchPayTab(tabPayQr, payViewQr));
if (tabPayUpi) tabPayUpi.addEventListener("click", () => switchPayTab(tabPayUpi, payViewUpi));
if (tabPayCard) tabPayCard.addEventListener("click", () => switchPayTab(tabPayCard, payViewCard));
if (tabPayNet) tabPayNet.addEventListener("click", () => switchPayTab(tabPayNet, payViewNet));

// Copy UPI ID button
if (copyUpiBtn) {
  copyUpiBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("gogocamping@upi");
    showToast("✓ UPI ID copied: gogocamping@upi");
  });
}

// Close Payment Modal
if (closePaymentModalBtn && paymentModal) {
  closePaymentModalBtn.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
  });
}

// Open Payment Modal from Confirm Booking button
confirmRedirectBtn.addEventListener("click", () => {
  leadDetails = readLeadDetails();
  if (!requireTripDate()) { bookingModal.classList.add("hidden"); return; }
  if (!currentUser.isLoggedIn) {
    pendingAction = "confirm_pay";
    if (bookingModal) bookingModal.classList.add("hidden");
    openLoginModal();
    showToast("🔒 Please login to proceed with payment & receive invoice");
    return;
  }

  confirmRedirectBtn.disabled = true;
  confirmRedirectBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Securing Booking...
  `;

  setTimeout(() => {
    bookingModal.classList.add("hidden");
    confirmRedirectBtn.disabled = false;
    confirmRedirectBtn.innerHTML = `
      <span>Confirm &amp; Proceed to Pay</span>
      <i data-lucide="arrow-right" class="w-4 h-4"></i>
    `;
    if (window.lucide) lucide.createIcons();

    // Render & Show Payment Modal
    renderPaymentModalUI();
    switchPayTab(tabPayCard, payViewCard);
    paymentModal.classList.remove("hidden");
    showToast("✓ Proceeding to Payment Method...");
  }, 800);
});

// Global Pending Action Tracker for Login Redirection
let pendingAction = null; // 'booking' | 'confirm_pay'

// Pay Now Button -> Payment Success Modal
if (payNowBtn) {
  payNowBtn.addEventListener("click", () => {
    if (!currentUser.isLoggedIn) {
      pendingAction = "confirm_pay";
      if (paymentModal) paymentModal.classList.add("hidden");
      openLoginModal();
      showToast("🔒 Please login to complete payment & receive invoice");
      return;
    }

    payNowBtn.disabled = true;
    payNowBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing Secure Payment...
    `;

    setTimeout(() => {
      paymentModal.classList.add("hidden");
      payNowBtn.disabled = false;

      if (!window.GogoCalendar.dayStatus(selectedTripDate(), camperCount).bookable) {
        payNowBtn.disabled = false;
        if (paymentModal) paymentModal.classList.add("hidden");
        requireTripDate();
        return;
      }
      const payQuote = priceQuote(camperCount);
      const camperSubtotal = payQuote.subtotal;
      const totalAddonsSum = getAddonsTotalSum();
      let addonsNames = [];
      selectedAddons.forEach((item) => {
        addonsNames.push(`${item.name} (${item.qty}×)`);
      });

      const grandTotal = payQuote.total + totalAddonsSum;

      // Extract User Contact Data
      const randomOrderId = `#GOGO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const lead = leadDetails || readLeadDetails() || {};
      const leadName = lead.name || (currentUser.isLoggedIn ? currentUser.name : "Guest");
      const leadPhone = lead.phone || (currentUser.isLoggedIn && currentUser.phone ? currentUser.phone : "");
      const leadEmail = lead.email || (currentUser.isLoggedIn && currentUser.email ? currentUser.email : "");

      // Populate Success Modal Data
      const successOrderId = document.getElementById("successOrderId");
      const successCamperName = document.getElementById("successCamperName");
      const successUserPhone = document.getElementById("successUserPhone");
      const successUserEmail = document.getElementById("successUserEmail");
      const successSentPhone = document.getElementById("successSentPhone");
      const successSentEmail = document.getElementById("successSentEmail");
      const successPackageName = document.getElementById("successPackageName");
      const successCamperCount = document.getElementById("successCamperCount");
      const successAddonsText = document.getElementById("successAddonsText");
      const successTotalPaid = document.getElementById("successTotalPaid");

      if (successOrderId) successOrderId.textContent = randomOrderId;
      if (successCamperName) successCamperName.textContent = leadName;
      if (successUserPhone) successUserPhone.textContent = `+91 ${leadPhone}`;
      if (successUserEmail) successUserEmail.textContent = leadEmail;
      if (successSentPhone) successSentPhone.textContent = `+91 ${leadPhone}`;
      if (successSentEmail) successSentEmail.textContent = leadEmail;
      if (successPackageName) successPackageName.textContent = selectedPackage.name;
      if (successCamperCount) successCamperCount.textContent = `${camperCount} Person`;
      if (successAddonsText) {
        successAddonsText.textContent = `${selectedFood || "—"} (included)`;
      }
      const evPicked = pickedNames();
      const successEvents = document.getElementById("successEvents");
      if (successEvents) successEvents.textContent = evPicked.join(", ");
      document.getElementById("successEventsRow")?.classList.toggle("hidden", !evPicked.length);
      const successKids = document.getElementById("successKids");
      if (successKids) successKids.textContent = `${kidsUnder4} (free)`;
      if (successTotalPaid) successTotalPaid.textContent = formatCurrency(grandTotal);
      const setS = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
      setS("successSubtotal", formatCurrency(camperSubtotal) + "  (" + formatCurrency(payQuote.rate) + " × " + camperCount + ")");
      setS("successGst", formatCurrency(payQuote.gst));
      setS("successGstPct", payQuote.gstPct);

      // Save booking record to localStorage for CMS Admin Dashboard
      try {
        const addonsFormatted = [];
        selectedAddons.forEach((item) => {
          addonsFormatted.push({
            name: item.name,
            qty: item.qty,
            unitPrice: item.unitPrice,
            total: item.qty * item.unitPrice
          });
        });

        const newBookingRecord = {
          id: randomOrderId,
          leadName: leadName,
          phone: leadPhone,
          email: leadEmail,
          packageName: selectedPackage.name,
          camperCount: camperCount,
          food: selectedFood,
          events: pickedEvents().map((ev) => ({ id: ev.id, slug: ev.slug, name: ev.name, startDate: ev.startDate, endDate: ev.endDate })),
          activities: pickedActivities().map((a) => ({ id: a.id, name: a.name })),
          altPhone: lead.alt || "",
          leadIdProof: lead.idProof || null,
          campers: readOtherCampers(),
          leaderIsCamper: leaderCamping,
          otherCampersIdPending: otherCamperCount(),
          idReminderAt: lead.tripDate && otherCamperCount() > 0 ? idReminderTime(lead.tripDate).toISOString() : null,
          idReminderStatus: otherCamperCount() > 0 ? "Scheduled" : "Not needed",
          kidsUnder4: kidsUnder4,
          addons: addonsFormatted,
          camperSubtotal: camperSubtotal,
          addonsSubtotal: totalAddonsSum,
          ratePerPerson: payQuote.rate,
          gstRate: payQuote.gstPct,
          gstAmount: payQuote.gst,
          grandTotal: grandTotal,
          paymentMethod: selectedPayMethod,
          policyAcceptedAt: policyAcceptedAt(),
          cancellationPolicy: "No refund on cancellation – 100% of the amount is deducted.",
          status: "Confirmed",
          date: new Date().toISOString().split("T")[0],
          tripDate: (tripDateInput && tripDateInput.value) ? tripDateInput.value : "2026-10-05"
        };

        const existingBookings = JSON.parse(localStorage.getItem("gogo_bookings_db") || "[]");
        existingBookings.unshift(newBookingRecord);
        localStorage.setItem("gogo_bookings_db", JSON.stringify(existingBookings));
        if (window.GogoEvents) { window.GogoEvents.setPicked([]); window.GogoEvents.setPickedActivities([]); } // now part of this booking
        lastBooking = newBookingRecord;
        const pm = document.getElementById("successPayMethod");
        if (pm) pm.textContent = newBookingRecord.paymentMethod;
        try { sessionStorage.removeItem(POLICY_KEY); } catch (e) {} // next booking: show the policy again
      } catch (err) {
        console.error("Error saving booking to CMS database:", err);
      }

      // Open Success Modal
      if (paymentSuccessModal) paymentSuccessModal.classList.remove("hidden");
      if (window.lucide) lucide.createIcons();

      showToast(`🎉 Booking Confirmed! Invoice sent to ${leadEmail} & +91 ${leadPhone}`);

      // Restore payNowBtn text
      payNowBtn.innerHTML = `
        <i data-lucide="lock" class="w-5 h-5 text-emerald-300"></i>
        <span>Pay <span id="payBtnAmount">${formatCurrency(grandTotal)}</span> &amp; Complete Booking</span>
        <i data-lucide="arrow-right" class="w-5 h-5"></i>
      `;
      if (window.lucide) lucide.createIcons();
    }, 1200);
  });
}

// Resend Invoice & Pass Handlers
const resendEmailBtn = document.getElementById("resendEmailBtn");
const resendSmsBtn = document.getElementById("resendSmsBtn");

if (resendEmailBtn) {
  resendEmailBtn.addEventListener("click", () => {
    const email = (currentUser && currentUser.email) ? currentUser.email : "vijay.camper@gmail.com";
    showToast(`✉️ Resent PDF Tax Invoice to ${email}!`);
  });
}

if (resendSmsBtn) {
  resendSmsBtn.addEventListener("click", () => {
    const phone = (currentUser && currentUser.phone) ? currentUser.phone : "9876543210";
    showToast(`📱 Resent SMS & WhatsApp Pass to +91 ${phone}!`);
  });
}

// ===== Ticket / receipt (PDF download, WhatsApp, Email) =====
let lastBooking = null;
function ticketLines(bk) {
  const rs = (n) => "Rs. " + Number(n || 0).toLocaleString("en-IN");
  const extras = (bk.events || []).map((e) => e.name).concat((bk.activities || []).map((a) => a.name));
  return [
    ["Booking ID", bk.id],
    ["Team leader", (bk.leadName || "-") + (bk.leaderIsCamper === false ? " (booking for others, not camping)" : " (camping)")],
    ["Phone", bk.phone ? "+91 " + bk.phone + (bk.altPhone ? " / " + bk.altPhone : "") : "-"],
    ["Email", bk.email || "-"],
    ["Check-in date", bk.tripDate ? formatTripDate(bk.tripDate) + " (12:00 noon)" : "-"],
    ["Package", bk.packageName],
    ["Campers", String(bk.camperCount) + (bk.kidsUnder4 ? " + " + bk.kidsUnder4 + " child(ren) under 4 (free)" : "")],
    ["Food", (bk.food || "-") + " (included)"],
    ["Events & activities", extras.length ? extras.join(", ") : "-"],
    ["Subtotal (excl. GST)", rs(bk.camperSubtotal)],
    ["GST (" + (bk.gstRate || 18) + "%)", rs(bk.gstAmount)],
    ["Total paid", rs(bk.grandTotal)],
    ["Paid by", bk.paymentMethod],
    ["Booked on", new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })]
  ];
}
function downloadTicketPdf(bk) {
  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!JsPDF) { showToast("PDF tool did not load – please check your internet and try again"); return; }
  const doc = new JsPDF({ unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(22, 78, 63); doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("GOGOCamping", 10, 12);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Camping ticket / receipt  ·  Jawadhu Hills", 10, 19);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("CONFIRMED", W - 10, 12, { align: "right" });
  doc.setTextColor(30, 30, 30);
  let y = 36;
  ticketLines(bk).forEach(([k, v]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(110, 110, 110);
    doc.text(k, 10, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(String(v), W - 62);
    doc.text(lines, 55, y);
    y += 6 * Math.max(1, lines.length);
  });
  // cancellation caution – clearly on the ticket
  y += 3;
  doc.setDrawColor(220, 38, 38); doc.setFillColor(254, 242, 242);
  doc.roundedRect(8, y, W - 16, 20, 2, 2, "FD");
  doc.setTextColor(185, 28, 28); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("CANCELLATION POLICY: NO REFUND", 12, y + 7);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("100% of the amount is deducted on cancellation. This booking cannot be refunded.", 12, y + 13, { maxWidth: W - 24 });
  y += 28;
  doc.setTextColor(110, 110, 110); doc.setFontSize(8);
  doc.text("Show this ticket at the campsite entry with a valid Aadhaar / government ID for every camper.", 10, y, { maxWidth: W - 20 });
  doc.save(`GOGOCamping-ticket-${String(bk.id).replace(/[^A-Za-z0-9-]/g, "")}.pdf`);
  showToast("⬇ Ticket downloaded (PDF)");
}
function ticketText(bk) {
  return "GOGOCamping ticket / receipt\n" + ticketLines(bk).map(([k, v]) => `${k}: ${v}`).join("\n") +
    "\n\nCANCELLATION POLICY: No refund – 100% deduction on cancellation.";
}
if (downloadPassBtn) {
  downloadPassBtn.addEventListener("click", () => {
    if (!lastBooking) { showToast("No booking found yet"); return; }
    downloadTicketPdf(lastBooking);
  });
}
document.getElementById("resendSmsBtn")?.addEventListener("click", () => {
  if (!lastBooking) return;
  window.open(`https://wa.me/91${lastBooking.phone}?text=${encodeURIComponent(ticketText(lastBooking))}`, "_blank", "noopener");
});
document.getElementById("resendEmailBtn")?.addEventListener("click", () => {
  if (!lastBooking) return;
  location.href = `mailto:${encodeURIComponent(lastBooking.email || "")}?subject=${encodeURIComponent("GOGOCamping ticket " + lastBooking.id)}&body=${encodeURIComponent(ticketText(lastBooking))}`;
});

// ===== Booking policy: read to the end, tick agree, submit – then the booking starts =====
const POLICY_KEY = "gogo_policy_accepted";
function policyAcceptedAt() { try { return sessionStorage.getItem(POLICY_KEY); } catch (e) { return null; } }
function openPolicy() {
  const m = document.getElementById("policyModal");
  if (!m) return;
  m.classList.remove("hidden");
  const sc = document.getElementById("policyScroll");
  if (sc) sc.scrollTop = 0;
  checkPolicyScroll();
}
function checkPolicyScroll() {
  const sc = document.getElementById("policyScroll");
  if (!sc) return;
  const atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 8;
  const box = document.getElementById("policyAgree");
  const label = document.getElementById("policyAgreeLabel");
  if (atEnd && box && box.disabled) {
    box.disabled = false;
    label?.classList.remove("cursor-not-allowed", "opacity-50");
    label?.classList.add("cursor-pointer");
    document.getElementById("policyScrollHint")?.classList.add("hidden");
  }
}
document.getElementById("policyScroll")?.addEventListener("scroll", checkPolicyScroll);
document.getElementById("policyAgree")?.addEventListener("change", (e) => {
  document.getElementById("policySubmit").disabled = !e.target.checked;
});
document.getElementById("policySubmit")?.addEventListener("click", () => {
  if (!document.getElementById("policyAgree")?.checked) return;
  try { sessionStorage.setItem(POLICY_KEY, new Date().toISOString()); } catch (e) {}
  document.getElementById("policyModal")?.classList.add("hidden");
  showToast("✓ Policy accepted – let's start your booking");
});
document.addEventListener("DOMContentLoaded", () => { if (!policyAcceptedAt()) openPolicy(); });
// safety net: never start a booking without an accepted policy
function requirePolicy() {
  if (policyAcceptedAt()) return true;
  openPolicy();
  return false;
}

// Done Success Button
if (doneSuccessBtn && paymentSuccessModal) {
  doneSuccessBtn.addEventListener("click", () => {
    paymentSuccessModal.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Thank you for booking with GOGOCamping!");
  });
}

// User Session & Profile Management
let currentUser = {
  isLoggedIn: false,
  name: "",
  phone: "",
  email: "",
  initial: "C"
};

function getInitial(name) {
  if (!name) return "C";
  const str = name.trim();
  if (!str) return "C";
  const firstChar = str.charAt(0).toUpperCase();
  if (/[A-Z0-9]/.test(firstChar)) {
    return firstChar;
  }
  return "C";
}

// Every login is saved as a member account for the CMS "Logged-in Members" tab (localStorage "gogo_members_db").
// loginMethod is "Mobile" or "Google" for a login; leave it out for a profile edit (details only, no new login).
function saveMemberAccount(user, previousPhone, loginMethod) {
  let members = [];
  try {
    members = JSON.parse(localStorage.getItem("gogo_members_db") || "[]");
  } catch (e) {}
  const now = new Date().toISOString();
  const lookupPhone = previousPhone || user.phone;
  let member = members.find(m => m.phone === lookupPhone || (user.email && m.email === user.email));
  if (!member) {
    member = { firstLogin: now, loginCount: 0, loginMethod: loginMethod || "Mobile" };
    members.unshift(member);
  }
  member.name = user.name;
  member.phone = user.phone;
  member.email = user.email;
  if (loginMethod) {
    member.loginMethod = loginMethod;
    member.lastLogin = now;
    member.loginCount = (member.loginCount || 0) + 1;
  }
  localStorage.setItem("gogo_members_db", JSON.stringify(members));
}

function setUserSession(name, phone, email, loginMethod) {
  // A profile edit (no loginMethod) updates the same account even if the phone changed;
  // a new login is always looked up by the phone / email that was entered
  const previousPhone = !loginMethod && currentUser.isLoggedIn ? currentUser.phone : null;
  currentUser.isLoggedIn = true;
  currentUser.name = name ? name.trim() : "Vijay Kumar";
  currentUser.phone = phone ? phone.trim() : "9876543210";
  currentUser.email = email && email.trim() !== ""
    ? email.trim()
    : (currentUser.name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com");
  currentUser.initial = getInitial(currentUser.name);
  saveMemberAccount(currentUser, previousPhone, loginMethod);

  updateNavbarUI();
  prefillCamperDetails();

  // Resume pending action after login
  if (pendingAction === "booking") {
    pendingAction = null;
    if (bookingModal) bookingModal.classList.remove("hidden");
    renderCampers();
    updateBookingModalTotal();
    showToast(`✓ Welcome ${currentUser.name}! Resuming camper details...`);
  } else if (pendingAction === "confirm_pay") {
    pendingAction = null;
    renderPaymentModalUI();
    if (paymentModal) paymentModal.classList.remove("hidden");
    showToast(`✓ Welcome ${currentUser.name}! Proceeding to payment...`);
  }
}

function clearUserSession() {
  currentUser = {
    isLoggedIn: false,
    name: "",
    phone: "",
    email: "",
    initial: "C"
  };

  updateNavbarUI();
  showToast("Logged out successfully");
}

function prefillCamperDetails() {
  if (currentUser.isLoggedIn) {
    if (camper1NameInput && (!camper1NameInput.value || camper1NameInput.value.trim() === "")) {
      camper1NameInput.value = currentUser.name;
    }
  }
}

function updateNavbarUI() {
  const loginBtn = document.getElementById("loginBtn");
  const loginBtnMobile = document.getElementById("loginBtnMobile");
  const userProfileDropdown = document.getElementById("userProfileDropdown");
  const mobileUserProfileCard = document.getElementById("mobileUserProfileCard");
  const mobileLoginBtnContainer = document.getElementById("mobileLoginBtnContainer");

  if (currentUser.isLoggedIn) {
    const firstName = currentUser.name.split(" ")[0] || currentUser.name;

    // Desktop Navbar Button with First Letter Avatar Circle Only
    if (loginBtn) {
      loginBtn.innerHTML = currentUser.initial;
      loginBtn.className = "w-10 h-10 rounded-full bg-[#164e3f] hover:bg-[#0f382d] text-white font-extrabold text-base flex items-center justify-center transition duration-200 shadow-md border-2 border-emerald-300 ring-2 ring-emerald-400/40 active:scale-95 ml-1 select-none cursor-pointer";
    }

    // Mobile Header Button with First Letter Avatar
    if (loginBtnMobile) {
      loginBtnMobile.innerHTML = currentUser.initial;
      loginBtnMobile.className = "w-9.5 h-9.5 rounded-full bg-[#164e3f] text-white font-extrabold text-sm flex items-center justify-center shadow-xs border-2 border-emerald-300";
    }

    // Update Dropdown Menu content
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownUserName = document.getElementById("dropdownUserName");
    const dropdownUserPhone = document.getElementById("dropdownUserPhone");

    if (dropdownAvatar) dropdownAvatar.textContent = currentUser.initial;
    if (dropdownUserName) dropdownUserName.textContent = currentUser.name;
    if (dropdownUserPhone) dropdownUserPhone.textContent = currentUser.phone ? `+91 ${currentUser.phone}` : "Google Account";

    // Mobile Drawer Profile Card
    if (mobileUserProfileCard) mobileUserProfileCard.classList.remove("hidden");
    if (mobileLoginBtnContainer) mobileLoginBtnContainer.classList.add("hidden");

    const mobileMenuAvatar = document.getElementById("mobileMenuAvatar");
    const mobileMenuUserName = document.getElementById("mobileMenuUserName");
    const mobileMenuUserPhone = document.getElementById("mobileMenuUserPhone");

    if (mobileMenuAvatar) mobileMenuAvatar.textContent = currentUser.initial;
    if (mobileMenuUserName) mobileMenuUserName.textContent = currentUser.name;
    if (mobileMenuUserPhone) mobileMenuUserPhone.textContent = currentUser.phone ? `+91 ${currentUser.phone}` : "Google Account";

    // Booking section Member Banner
    if (memberLoginBanner) {
      memberLoginBanner.innerHTML = `
        <div class="flex items-center justify-between text-[#164e3f]">
          <span class="flex items-center gap-1.5 font-bold">
            <i data-lucide="user-check" class="w-4 h-4 text-emerald-600"></i>
            Logged in as ${currentUser.name}
          </span>
          <span class="bg-[#164e3f] text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Logged in</span>
        </div>
      `;
    }

  } else {
    // Reset Desktop Navbar Button
    if (loginBtn) {
      loginBtn.innerHTML = `
        <i data-lucide="user" class="w-4 h-4"></i>
        <span>Login</span>
      `;
      loginBtn.className = "flex items-center gap-2 bg-[#164e3f] hover:bg-[#0f382d] text-[#f7f3e8] px-5 py-2 rounded-full font-bold text-sm tracking-wide transition duration-200 shadow-2xs active:scale-95 ml-1";
    }

    // Reset Mobile Header Button
    if (loginBtnMobile) {
      loginBtnMobile.innerHTML = `
        <i data-lucide="user" class="w-4 h-4"></i>
      `;
      loginBtnMobile.className = "w-9.5 h-9.5 rounded-full bg-[#164e3f] text-[#f7f3e8] flex items-center justify-center shadow-xs";
    }

    if (userProfileDropdown) userProfileDropdown.classList.add("hidden");
    if (mobileUserProfileCard) mobileUserProfileCard.classList.add("hidden");
    if (mobileLoginBtnContainer) mobileLoginBtnContainer.classList.remove("hidden");

    // Reset Member Login Banner in booking
    if (memberLoginBanner) {
      memberLoginBanner.innerHTML = `
        Have an account? Click to Login &amp; fill your details
      `;
    }
  }

  lucide.createIcons();
}

// Login Modal Management
function openLoginModal() {
  if (loginModal) {
    loginModal.classList.remove("hidden");
    if (loginNameInput) {
      setTimeout(() => loginNameInput.focus(), 100);
    }
  }
}

function closeLoginModal() {
  if (loginModal) {
    loginModal.classList.add("hidden");
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentUser.isLoggedIn) {
      const userProfileDropdown = document.getElementById("userProfileDropdown");
      if (userProfileDropdown) {
        userProfileDropdown.classList.toggle("hidden");
      }
    } else {
      openLoginModal();
    }
  });
}

if (loginBtnMobile) {
  loginBtnMobile.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentUser.isLoggedIn) {
      if (mobileMenu) mobileMenu.classList.remove("hidden");
    } else {
      openLoginModal();
    }
  });
}

if (loginBtnDrawer) {
  loginBtnDrawer.addEventListener("click", () => {
    if (mobileMenu) mobileMenu.classList.add("hidden");
    openLoginModal();
  });
}

if (memberLoginBanner) {
  memberLoginBanner.addEventListener("click", () => {
    if (!currentUser.isLoggedIn) {
      openLoginModal();
    }
  });
}

if (closeLoginModalBtn) closeLoginModalBtn.addEventListener("click", closeLoginModal);
if (loginModal) {
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });
}

// Close Dropdown Menu on Outside Click
document.addEventListener("click", (e) => {
  const userProfileContainer = document.getElementById("userProfileContainer");
  const userProfileDropdown = document.getElementById("userProfileDropdown");
  if (userProfileContainer && !userProfileContainer.contains(e.target)) {
    if (userProfileDropdown) {
      userProfileDropdown.classList.add("hidden");
    }
  }
});

// Logout Handlers
if (logoutBtn) logoutBtn.addEventListener("click", clearUserSession);
if (logoutBtnMobile) {
  logoutBtnMobile.addEventListener("click", () => {
    clearUserSession();
    if (mobileMenu) mobileMenu.classList.add("hidden");
  });
}

// Login Form Submit (Name + Phone Number + Email)
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = loginNameInput ? loginNameInput.value.trim() : "";
    const phone = loginPhoneInput ? loginPhoneInput.value.trim() : "";
    const loginEmailInput = document.getElementById("loginEmailInput");
    const email = loginEmailInput ? loginEmailInput.value.trim() : "";

    if (!name) {
      showToast("Please enter your full name");
      return;
    }

    if (phone.length < 10) {
      showToast("Please enter a valid 10-digit mobile number");
      return;
    }

    if (sendOtpBtn) {
      sendOtpBtn.disabled = true;
      sendOtpBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying Details...
        </span>
      `;
    }

    setTimeout(() => {
      if (sendOtpBtn) {
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = `
          <span>Verify &amp; Login</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        `;
        if (window.lucide) lucide.createIcons();
      }

      setUserSession(name, phone, email, "Mobile");
      closeLoginModal();
    }, 900);
  });
}

// Google Login Handler
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    const enteredName = loginNameInput ? loginNameInput.value.trim() : "";
    
    // If user already typed name in login modal, use it!
    if (enteredName) {
      closeLoginModal();
      setUserSession(enteredName, "9876543210", "", "Google");
      showToast(`✓ Signed in with Google as ${enteredName}!`);
      return;
    }

    // Otherwise show Google account picker modal
    closeLoginModal();
    if (googleModal) {
      const googleUserDisplayName = document.getElementById("googleUserDisplayName");
      if (googleUserDisplayName) googleUserDisplayName.textContent = "Vijay Kumar";
      googleModal.classList.remove("hidden");
    }
  });
}

if (closeGoogleModalBtn && googleModal) {
  closeGoogleModalBtn.addEventListener("click", () => {
    googleModal.classList.add("hidden");
  });
}

if (selectGoogleUserBtn) {
  selectGoogleUserBtn.addEventListener("click", () => {
    if (googleModal) googleModal.classList.add("hidden");
    setUserSession("Vijay Kumar", "9876543210", "vijay.camper@gmail.com", "Google");
    showToast("✓ Welcome Vijay Kumar! Signed in with Google. 3 Booking records loaded.");
  });
}

// ================= DUMMY BOOKINGS & HISTORY LOGIC =================
const DUMMY_BOOKINGS = [
  {
    id: "#GOGO-2026-98241",
    packageName: "4 Person Camping Tent",
    camperCount: 4,
    addons: [
      { name: "Camping Chair", qty: 2, unitPrice: 1200, total: 2400 },
      { name: "LED Lantern", qty: 1, unitPrice: 800, total: 800 }
    ],
    camperSubtotal: 9596,
    addonsSubtotal: 3200,
    grandTotal: 12796,
    paymentMethod: "UPI / GPay",
    status: "Upcoming",
    date: "2026-09-24",
    tripDate: "2026-10-15"
  },
  {
    id: "#GOGO-2026-84920",
    packageName: "2 Person Camping Tent",
    camperCount: 2,
    addons: [
      { name: "Sleeping Bag", qty: 2, unitPrice: 1500, total: 3000 }
    ],
    camperSubtotal: 4798,
    addonsSubtotal: 3000,
    grandTotal: 7798,
    paymentMethod: "Card / ATM",
    status: "Completed",
    date: "2026-08-12",
    tripDate: "2026-08-20"
  },
  {
    id: "#GOGO-2026-71239",
    packageName: "1 Person Camping Tent",
    camperCount: 1,
    addons: [],
    camperSubtotal: 2399,
    addonsSubtotal: 0,
    grandTotal: 2399,
    paymentMethod: "UPI QR Code",
    status: "Completed",
    date: "2026-07-05",
    tripDate: "2026-07-10"
  }
];

function getCombinedBookings() {
  const localBookings = JSON.parse(localStorage.getItem("gogo_bookings_db") || "[]");
  return [...localBookings, ...DUMMY_BOOKINGS];
}

function renderBookingHistory(filter = 'all') {
  const historyListContainer = document.getElementById("historyListContainer");
  if (!historyListContainer) return;

  const allBookings = getCombinedBookings();
  const filteredBookings = allBookings.filter((b) => {
    if (filter === 'upcoming') return b.status.toLowerCase().includes('upcoming') || b.status.toLowerCase().includes('confirmed');
    if (filter === 'completed') return b.status.toLowerCase().includes('completed');
    return true;
  });

  historyListContainer.innerHTML = "";

  if (filteredBookings.length === 0) {
    historyListContainer.innerHTML = `
      <div class="p-6 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
        <p class="text-xs text-gray-500 font-medium">No bookings found for this filter.</p>
      </div>
    `;
    return;
  }

  filteredBookings.forEach((b) => {
    const isUpcoming = b.status.toLowerCase().includes('upcoming') || b.status.toLowerCase().includes('confirmed');
    const card = document.createElement("div");
    card.className = "p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs hover:border-[#164e3f]/40 transition space-y-3";

    let addonsText = b.food ? `Food: ${b.food} (included)${b.kidsUnder4 ? ` · ${b.kidsUnder4} child${b.kidsUnder4 > 1 ? "ren" : ""} under 4 (free)` : ""}` : (b.addons && b.addons.length > 0 
      ? b.addons.map(a => `${a.name} (${a.qty}×)`).join(", ") 
      : "No Extra Gear");

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black text-gray-900">${b.id}</span>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isUpcoming ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-800'} flex items-center gap-1">
            ${isUpcoming ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>' : ''}
            <span>${b.status}</span>
          </span>
        </div>
        <span class="text-xs font-black text-[#164e3f]">${formatCurrency(b.grandTotal)}</span>
      </div>

      <div class="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
        <div class="flex justify-between items-center text-xs font-bold text-gray-800">
          <span>⛺ ${b.packageName}</span>
          <span class="text-[11px] text-gray-500">${b.camperCount} Camper${b.camperCount > 1 ? 's' : ''}</span>
        </div>
        <p class="text-[11px] text-gray-500 truncate">Gear: ${addonsText}</p>
        <p class="text-[10px] text-gray-400">Trip Date: ${b.tripDate} • Paid via ${b.paymentMethod}</p>
      </div>

      <div class="flex items-center justify-between text-xs pt-1">
        <span class="text-[11px] text-gray-400 font-medium">Booked on ${b.date}</span>
        <div class="flex items-center gap-2">
          <button type="button" class="view-history-pass-btn text-[11px] font-bold text-[#164e3f] hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-[#164e3f]/30 transition" data-id="${b.id}">
            📄 Tax Invoice
          </button>
          <button type="button" class="view-history-qr-btn text-[11px] font-bold text-white bg-[#164e3f] hover:bg-[#0f382d] px-2.5 py-1 rounded-lg transition shadow-2xs" data-id="${b.id}">
            🎫 Entry Pass
          </button>
        </div>
      </div>
    `;

    const invoiceBtn = card.querySelector(".view-history-pass-btn");
    const qrBtn = card.querySelector(".view-history-qr-btn");

    if (invoiceBtn) {
      invoiceBtn.addEventListener("click", () => {
        showToast(`📄 Tax Invoice downloaded for ${b.id}`);
      });
    }
    if (qrBtn) {
      qrBtn.addEventListener("click", () => {
        showToast(`🎫 Entry Pass QR code verified for ${b.id}`);
      });
    }

    historyListContainer.appendChild(card);
  });
}

// History Filter Tabs Handlers
const historyTabAll = document.getElementById("historyTabAll");
const historyTabActive = document.getElementById("historyTabActive");
const historyTabCompleted = document.getElementById("historyTabCompleted");

function setHistoryTab(activeTab, filter) {
  [historyTabAll, historyTabActive, historyTabCompleted].forEach((t) => {
    if (!t) return;
    if (t === activeTab) {
      t.className = "history-tab active flex-1 py-1.5 text-xs font-bold rounded-lg transition bg-white text-[#164e3f] shadow-2xs";
    } else {
      t.className = "history-tab flex-1 py-1.5 text-xs font-bold rounded-lg transition text-gray-600 hover:text-gray-900";
    }
  });
  renderBookingHistory(filter);
}

if (historyTabAll) historyTabAll.addEventListener("click", () => setHistoryTab(historyTabAll, 'all'));
if (historyTabActive) historyTabActive.addEventListener("click", () => setHistoryTab(historyTabActive, 'upcoming'));
if (historyTabCompleted) historyTabCompleted.addEventListener("click", () => setHistoryTab(historyTabCompleted, 'completed'));

// Open History Modal Handlers
const dropdownHistoryBtn = document.getElementById("dropdownHistoryBtn");
const mobileHistoryBtn = document.getElementById("mobileHistoryBtn");
const bookingHistoryModal = document.getElementById("bookingHistoryModal");
const closeHistoryModalBtn = document.getElementById("closeHistoryModalBtn");

function openBookingHistoryModal() {
  if (bookingHistoryModal) {
    renderBookingHistory('all');
    bookingHistoryModal.classList.remove("hidden");
    const userProfileDropdown = document.getElementById("userProfileDropdown");
    if (userProfileDropdown) userProfileDropdown.classList.add("hidden");
    if (mobileMenu) mobileMenu.classList.add("hidden");
    if (window.lucide) lucide.createIcons();
  }
}

if (dropdownHistoryBtn) dropdownHistoryBtn.addEventListener("click", openBookingHistoryModal);
if (mobileHistoryBtn) mobileHistoryBtn.addEventListener("click", openBookingHistoryModal);
if (closeHistoryModalBtn && bookingHistoryModal) {
  closeHistoryModalBtn.addEventListener("click", () => bookingHistoryModal.classList.add("hidden"));
}
if (bookingHistoryModal) {
  bookingHistoryModal.addEventListener("click", (e) => {
    if (e.target === bookingHistoryModal) bookingHistoryModal.classList.add("hidden");
  });
}

// Edit Profile Modal Handlers
const dropdownEditProfileBtn = document.getElementById("dropdownEditProfileBtn");
const mobileEditProfileBtn = document.getElementById("mobileEditProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");
const closeEditProfileModalBtn = document.getElementById("closeEditProfileModalBtn");
const cancelEditProfileBtn = document.getElementById("cancelEditProfileBtn");
const editProfileForm = document.getElementById("editProfileForm");
const profileEditName = document.getElementById("profileEditName");
const profileEditPhone = document.getElementById("profileEditPhone");
const profileEditEmail = document.getElementById("profileEditEmail");
const profileEditState = document.getElementById("profileEditState");

function openEditProfileModal() {
  if (editProfileModal) {
    if (profileEditName) profileEditName.value = currentUser.name || "Vijay Kumar";
    if (profileEditPhone) profileEditPhone.value = currentUser.phone || "9876543210";
    if (profileEditEmail) profileEditEmail.value = currentUser.email || "vijay.camper@gmail.com";
    
    editProfileModal.classList.remove("hidden");
    const userProfileDropdown = document.getElementById("userProfileDropdown");
    if (userProfileDropdown) userProfileDropdown.classList.add("hidden");
    if (mobileMenu) mobileMenu.classList.add("hidden");
  }
}

if (dropdownEditProfileBtn) dropdownEditProfileBtn.addEventListener("click", openEditProfileModal);
if (mobileEditProfileBtn) mobileEditProfileBtn.addEventListener("click", openEditProfileModal);

if (closeEditProfileModalBtn && editProfileModal) {
  closeEditProfileModalBtn.addEventListener("click", () => editProfileModal.classList.add("hidden"));
}
if (cancelEditProfileBtn && editProfileModal) {
  cancelEditProfileBtn.addEventListener("click", () => editProfileModal.classList.add("hidden"));
}
if (editProfileModal) {
  editProfileModal.addEventListener("click", (e) => {
    if (e.target === editProfileModal) editProfileModal.classList.add("hidden");
  });
}

if (editProfileForm) {
  editProfileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newName = profileEditName ? profileEditName.value.trim() : currentUser.name;
    const newPhone = profileEditPhone ? profileEditPhone.value.trim() : currentUser.phone;
    const newEmail = profileEditEmail ? profileEditEmail.value.trim() : currentUser.email;

    setUserSession(newName, newPhone, newEmail);
    if (editProfileModal) editProfileModal.classList.add("hidden");
    showToast("✓ Profile updated successfully!");
  });
}

// Saved Campers Modal Handlers
const dropdownSavedCampersBtn = document.getElementById("dropdownSavedCampersBtn");
const savedCampersModal = document.getElementById("savedCampersModal");
const closeSavedCampersModalBtn = document.getElementById("closeSavedCampersModalBtn");
const addNewCamperBtn = document.getElementById("addNewCamperBtn");

if (dropdownSavedCampersBtn && savedCampersModal) {
  dropdownSavedCampersBtn.addEventListener("click", () => {
    savedCampersModal.classList.remove("hidden");
    const userProfileDropdown = document.getElementById("userProfileDropdown");
    if (userProfileDropdown) userProfileDropdown.classList.add("hidden");
    if (window.lucide) lucide.createIcons();
  });
}

if (closeSavedCampersModalBtn && savedCampersModal) {
  closeSavedCampersModalBtn.addEventListener("click", () => savedCampersModal.classList.add("hidden"));
}
if (savedCampersModal) {
  savedCampersModal.addEventListener("click", (e) => {
    if (e.target === savedCampersModal) savedCampersModal.classList.add("hidden");
  });
}
if (addNewCamperBtn) {
  addNewCamperBtn.addEventListener("click", () => {
    showToast("✓ New saved camper profile created for 1-click checkout!");
  });
}

// Mobile menu toggle
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// Search bar interaction
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      showToast(`Searching for "${searchInput.value}"...`);
    }
  });
}

// ================= CART DRAWER LOGIC =================
const cartBtn = document.getElementById("cartBtn");
const cartBtnMobile = document.getElementById("cartBtnMobile");
const cartBadge = document.getElementById("cartBadge");
const cartBadgeMobile = document.getElementById("cartBadgeMobile");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartDrawerItemCount = document.getElementById("cartDrawerItemCount");

const cartPkgTitle = document.getElementById("cartPkgTitle");
const cartPkgSubtotal = document.getElementById("cartPkgSubtotal");
const cartPkgDecBtn = document.getElementById("cartPkgDecBtn");
const cartPkgIncBtn = document.getElementById("cartPkgIncBtn");
const cartPkgQtyDisplay = document.getElementById("cartPkgQtyDisplay");

const cartAddonsCountBadge = document.getElementById("cartAddonsCountBadge");
const cartAddonsContainer = document.getElementById("cartAddonsContainer");
const cartQuickAddPicker = document.getElementById("cartQuickAddPicker");

const cartDrawerPkgTotal = document.getElementById("cartDrawerPkgTotal");
const cartDrawerAddonsTotal = document.getElementById("cartDrawerAddonsTotal");
const cartDrawerGrandTotal = document.getElementById("cartDrawerGrandTotal");
const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");

function renderCartDrawerUI() {
  const addonsTotalCount = getAddonsTotalCount();
  const totalItemCount = 1 + addonsTotalCount;
  if (cartBadge) cartBadge.textContent = totalItemCount;
  if (cartBadgeMobile) cartBadgeMobile.textContent = totalItemCount;
  if (cartDrawerItemCount) cartDrawerItemCount.textContent = `${totalItemCount} Item${totalItemCount > 1 ? 's' : ''}`;

  const cartQuote = priceQuote(camperCount);
  const camperSubtotal = cartQuote.subtotal;
  const cartRateEl = document.getElementById("cartPkgRate");
  if (cartRateEl) cartRateEl.textContent = `${formatCurrency(cartQuote.rate)} per person + GST`;
  const cartGstEl = document.getElementById("cartDrawerGst");
  if (cartGstEl) cartGstEl.textContent = formatCurrency(cartQuote.gst);

  if (cartPkgTitle) cartPkgTitle.textContent = selectedPackage.name;
  if (cartPkgSubtotal) cartPkgSubtotal.textContent = formatCurrency(camperSubtotal);
  if (cartPkgQtyDisplay) cartPkgQtyDisplay.textContent = `${camperCount} Person`;
  if (cartPkgDecBtn) cartPkgDecBtn.disabled = (camperCount <= 1);

  const totalAddonsSum = getAddonsTotalSum();
  if (cartAddonsContainer) {
    cartAddonsContainer.innerHTML = "";
    if (selectedAddons.size > 0) {
      if (cartAddonsCountBadge) cartAddonsCountBadge.textContent = `${addonsTotalCount} Item${addonsTotalCount > 1 ? 's' : ''}`;

      selectedAddons.forEach((item, id) => {
        const row = document.createElement("div");
        row.className = "flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs";
        row.innerHTML = `
          <div>
            <span class="font-extrabold text-gray-900 block">${item.name}</span>
            <span class="text-[#164e3f] font-bold">${item.qty} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.qty * item.unitPrice)}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-gray-200 shadow-2xs">
              <button type="button" class="cart-item-dec w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold flex items-center justify-center transition border border-gray-300 cursor-pointer">-</button>
              <span class="font-black text-[#164e3f] text-xs min-w-[16px] text-center select-none">${item.qty}</span>
              <button type="button" class="cart-item-inc w-5 h-5 rounded bg-[#164e3f] hover:bg-[#0f382d] text-white font-extrabold flex items-center justify-center transition cursor-pointer">+</button>
            </div>
            <button type="button" class="remove-cart-item-btn text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition" title="Remove item">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;

        const decBtn = row.querySelector(".cart-item-dec");
        const incBtn = row.querySelector(".cart-item-inc");
        const removeBtn = row.querySelector(".remove-cart-item-btn");

        if (decBtn) decBtn.addEventListener("click", () => changeAddonQty(id, -1, item.unitPrice, item.name));
        if (incBtn) incBtn.addEventListener("click", () => changeAddonQty(id, 1, item.unitPrice, item.name));
        if (removeBtn) removeBtn.addEventListener("click", () => changeAddonQty(id, -item.qty, item.unitPrice, item.name));

        cartAddonsContainer.appendChild(row);
      });
    } else {
      if (cartAddonsCountBadge) cartAddonsCountBadge.textContent = "0 Items";
      cartAddonsContainer.innerHTML = `
        <div class="p-3.5 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center text-xs text-gray-400">
          No add-on gear selected yet. Tap below to add extra gear!
        </div>
      `;
    }
  }

  // Quick picker button state inside Cart Drawer
  if (cartQuickAddPicker) {
    const btns = cartQuickAddPicker.querySelectorAll(".cart-picker-btn");
    btns.forEach((btn) => {
      const id = btn.getAttribute("data-id");
      const item = selectedAddons.get(id);
      const card = document.querySelector(`.addon-card[data-id="${id}"]`);
      const addonName = card ? card.getAttribute("data-name") : id;
      const price = card ? parseInt(card.getAttribute("data-price"), 10) : 0;

      if (item && item.qty > 0) {
        btn.className = "cart-picker-btn text-left p-2 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs flex items-center justify-between font-bold text-emerald-900 cursor-pointer";
        btn.innerHTML = `
          <span class="truncate font-bold">${addonName}</span>
          <span class="text-emerald-800 text-[11px] font-black shrink-0">Qty: ${item.qty} +</span>
        `;
      } else {
        btn.className = "cart-picker-btn text-left p-2 rounded-xl bg-white border border-gray-200 hover:border-[#164e3f] transition flex items-center justify-between text-xs group cursor-pointer";
        btn.innerHTML = `
          <span class="truncate font-semibold text-gray-800">${addonName}</span>
          <span class="text-[#164e3f] font-extrabold shrink-0">+${formatCurrency(price)}</span>
        `;
      }
    });
  }

  const grandTotal = cartQuote.total + totalAddonsSum;
  if (cartDrawerPkgTotal) cartDrawerPkgTotal.textContent = formatCurrency(camperSubtotal);
  if (cartDrawerAddonsTotal) cartDrawerAddonsTotal.textContent = formatCurrency(totalAddonsSum);
  if (cartDrawerGrandTotal) cartDrawerGrandTotal.textContent = formatCurrency(grandTotal);

  if (window.lucide) lucide.createIcons();
}

// Quick Add button inside Cart Drawer
if (cartQuickAddPicker) {
  const btns = cartQuickAddPicker.querySelectorAll(".cart-picker-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const card = document.querySelector(`.addon-card[data-id="${id}"]`);
      const name = card ? card.getAttribute("data-name") : id;
      const price = card ? parseInt(card.getAttribute("data-price"), 10) : 0;
      changeAddonQty(id, 1, price, name);
    });
  });
}

// Package Camper count buttons inside Cart Drawer
if (cartPkgDecBtn) {
  cartPkgDecBtn.addEventListener("click", () => {
    window.changePayModalCampers(-1);
  });
}

if (cartPkgIncBtn) {
  cartPkgIncBtn.addEventListener("click", () => {
    window.changePayModalCampers(1);
  });
}

// Open Cart Drawer
function openCartDrawer() {
  renderCartDrawerUI();
  if (cartDrawer) cartDrawer.classList.remove("hidden");
}

if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
if (cartBtnMobile) cartBtnMobile.addEventListener("click", openCartDrawer);

if (closeCartBtn && cartDrawer) {
  closeCartBtn.addEventListener("click", () => {
    cartDrawer.classList.add("hidden");
  });
}

if (cartDrawer) {
  cartDrawer.addEventListener("click", (e) => {
    if (e.target === cartDrawer) {
      cartDrawer.classList.add("hidden");
    }
  });
}

// Cart Checkout Button -> Opens Booking Modal
if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener("click", () => {
    if (cartDrawer) cartDrawer.classList.add("hidden");
    // Same path as "Book Now": needs a food choice (and login) first
    bookNowBtn.click();
  });
}

// Pricing changed in the CMS -> refresh every price on this page
window.GogoPricing.onChange(() => {
  selectPackageByPersons(camperCount, false);
  updateBookingModalTotal();
});

// Initialize page state
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  if (qtyDecreaseBtn) qtyDecreaseBtn.disabled = (currentQuantity <= 1);
  selectPackageByPersons(1, false);
  renderCartDrawerUI();
  updateAddonCardsUI();
});

// Stock or bookings changed in another tab (e.g. admin updated stock in the CMS)
window.addEventListener("storage", (e) => {
  if (e.key === "gogo_inventory_stock" || e.key === "gogo_bookings_db") updateAddonCardsUI();
});

if (window.lucide) {
  lucide.createIcons();
}
