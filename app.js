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
    
    const qty = getAddonQty(id);

    if (qtyValEl) qtyValEl.textContent = qty;
    if (qtyDecBtn) qtyDecBtn.disabled = (qty <= 0);

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
  const camperSubtotal = camperCount * 2399;
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

  if (PACKAGES[persons]) {
    selectedPackage = PACKAGES[persons];
  } else {
    selectedPackage = {
      persons: persons,
      name: `${persons} Person Camping Tent`,
      desc: `Spacious, weather-resistant custom camping tent package for ${persons} people with full amenities & support.`,
      original: persons * 3199,
      price: persons * 2399
    };
  }
  camperCount = selectedPackage.persons;

  // Toggle Custom Person Dropdown Container visibility & update select value
  const customPersonContainer = document.getElementById("customPersonContainer");
  const customPersonSelect = document.getElementById("customPersonSelect");
  
  const isCustomPackageSelected = persons > 4 || !PACKAGES[persons];

  if (customPersonContainer) {
    if (isCustomPackageSelected) {
      customPersonContainer.classList.remove("hidden");
    } else {
      customPersonContainer.classList.add("hidden");
    }
  }

  if (customPersonSelect) {
    if (isCustomPackageSelected) {
      customPersonSelect.value = persons.toString();
      // If select doesn't have this value, fallback or append option
      if (customPersonSelect.value !== persons.toString()) {
        const newOpt = document.createElement("option");
        newOpt.value = persons.toString();
        newOpt.textContent = `${persons} Persons (${formatCurrency(persons * 2399)})`;
        customPersonSelect.appendChild(newOpt);
        customPersonSelect.value = persons.toString();
      }
    }
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
  if (originalPriceDisplay) originalPriceDisplay.textContent = formatCurrency(selectedPackage.original);
  if (currentPriceDisplay) currentPriceDisplay.textContent = formatCurrency(selectedPackage.price);
  capacitySpecTexts.forEach((el) => {
    el.textContent = `${selectedPackage.persons} Person${selectedPackage.persons > 1 ? 's' : ''}`;
  });

  renderCampers();
  updatePrice();
  if (typeof renderPaymentModalUI === "function") renderPaymentModalUI();
  if (typeof renderCartDrawerUI === "function") renderCartDrawerUI();
  if (triggerToast) {
    showToast(`Selected ${selectedPackage.name} (${formatCurrency(selectedPackage.price)}, 25% OFF)`);
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
      if (isNaN(selectedVal) || selectedVal < 5) selectedVal = 5;
      selectPackageByPersons(selectedVal, true);
    } else {
      const persons = parseInt(cardPersonsAttr, 10);
      selectPackageByPersons(persons, true);
    }
  });
});

// Custom Person Dropdown Listener
const customPersonSelect = document.getElementById("customPersonSelect");
if (customPersonSelect) {
  customPersonSelect.addEventListener("change", () => {
    const val = parseInt(customPersonSelect.value, 10);
    if (!isNaN(val) && val >= 1) {
      selectPackageByPersons(val, true);
    }
  });
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
  const camperSubtotal = camperCount * 2399;
  const grandTotal = camperSubtotal + addonsSum;

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

function renderCampers() {
  if (!passengersList) return;
  passengersList.innerHTML = "";

  for (let i = 1; i <= camperCount; i++) {
    if (i > 1) {
      const divider = document.createElement("div");
      divider.className = "border-t border-dashed border-gray-200 my-3";
      passengersList.appendChild(divider);
    }

    const card = document.createElement("div");
    card.className = "passenger-card space-y-3";
    const isLead = i === 1;
    const slotLabel = isLead 
      ? `Lead Camper (Slot 1, ${selectedPackage.name})` 
      : `Slot ${i}, Additional Guest (+₹2,399)`;

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-full bg-[#f7f3e8] text-[#164e3f] border border-[#164e3f]/20 flex items-center justify-center text-xs font-bold">
            <i data-lucide="user" class="w-4 h-4"></i>
          </div>
          <div>
            <span class="text-sm font-bold text-gray-900">Camper ${i}</span>
            <span class="text-[11px] text-gray-500 block leading-tight">${slotLabel}</span>
          </div>
        </div>
        ${!isLead ? `
          <button type="button" class="remove-camper-btn text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition flex items-center gap-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Remove</span>
          </button>
        ` : '<i data-lucide="chevron-up" class="w-4 h-4 text-gray-500"></i>'}
      </div>

      <div>
        <div class="rounded-xl border border-gray-300 px-3.5 py-2 bg-white focus-within:border-[#164e3f]">
          <input 
            type="text" 
            placeholder="Name *" 
            class="w-full text-sm font-medium text-gray-900 focus:outline-none placeholder-gray-400"
            ${isLead && currentUser ? `value="${currentUser.name}"` : ''}
          >
        </div>
        ${isLead ? '<span class="text-[11px] text-gray-400 font-medium mt-1 block">Enter full name in English</span>' : ''}
      </div>

      <div>
        <div class="rounded-xl border border-gray-300 px-3.5 py-2 bg-white focus-within:border-[#164e3f]">
          <input 
            type="number" 
            placeholder="Age *" 
            class="w-full text-sm font-medium text-gray-900 focus:outline-none placeholder-gray-400"
          >
        </div>
        ${isLead ? '<span class="text-[11px] text-gray-400 font-medium mt-1 block">Please enter valid Age</span>' : ''}
      </div>

      <div>
        <span class="text-xs font-medium text-gray-600 block mb-1">Gender *</span>
        <div class="grid grid-cols-2 gap-3">
          <label class="gender-pill flex items-center justify-between px-4 py-2 border border-gray-300 rounded-full cursor-pointer hover:border-[#164e3f] transition select-none">
            <span class="text-xs font-semibold text-gray-800">Male</span>
            <input type="radio" name="gender-p${i}" value="Male" class="w-4 h-4 text-[#164e3f] accent-[#164e3f]" ${isLead ? 'checked' : ''}>
          </label>
          <label class="gender-pill flex items-center justify-between px-4 py-2 border border-gray-300 rounded-full cursor-pointer hover:border-[#164e3f] transition select-none">
            <span class="text-xs font-semibold text-gray-800">Female</span>
            <input type="radio" name="gender-p${i}" value="Female" class="w-4 h-4 text-[#164e3f] accent-[#164e3f]">
          </label>
        </div>
      </div>
    `;

    if (!isLead) {
      const removeBtn = card.querySelector(".remove-camper-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          window.changePayModalCampers(-1);
        });
      }
    }

    passengersList.appendChild(card);
  }

  updateBookingModalTotal();
}

bookNowBtn.addEventListener("click", () => {
  if (!currentUser.isLoggedIn) {
    pendingAction = "booking";
    openLoginModal();
    showToast("🔒 Please login to complete your booking & receive invoice");
    return;
  }

  renderCampers();

  // Populate Add-ons in booking modal
  modalAddonsContainer.innerHTML = "";
  if (selectedAddons.size > 0) {
    modalAddonsContainer.classList.remove("hidden");
    selectedAddons.forEach((item, id) => {
      const row = document.createElement("div");
      row.className = "flex justify-between items-center text-xs text-gray-700 py-0.5";
      row.innerHTML = `
        <span class="font-bold text-gray-800">+ ${item.name} (${item.qty} × ${formatCurrency(item.unitPrice)})</span>
        <span class="font-extrabold text-[#164e3f]">${formatCurrency(item.qty * item.unitPrice)}</span>
      `;
      modalAddonsContainer.appendChild(row);
    });
  } else {
    modalAddonsContainer.classList.add("hidden");
  }

  updateBookingModalTotal();
  bookingModal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
});

closeModalBtn.addEventListener("click", () => {
  bookingModal.classList.add("hidden");
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
function renderPaymentModalUI() {
  const addonsSum = getAddonsTotalSum();
  const camperSubtotal = camperCount * 2399;
  const grandTotal = camperSubtotal + addonsSum;

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
  if (PACKAGES[camperCount]) {
    selectedPackage = PACKAGES[camperCount];
  } else {
    selectedPackage = {
      persons: camperCount,
      name: `${camperCount} Person Camping Tent`,
      desc: `${camperCount} Person Camping Tent Package`,
      original: camperCount * 3199,
      price: camperCount * 2399
    };
  }

  renderCampers();
  updateBookingModalTotal();
  renderPaymentModalUI();
  if (typeof renderCartDrawerUI === "function") renderCartDrawerUI();
  updatePrice();
  showToast(delta === 1 ? `Added Camper (${camperCount} Persons, ${formatCurrency(camperCount * 2399)})` : `Reduced Campers to ${camperCount}`);
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
function switchPayTab(activeTab, activeView) {
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

      const camperSubtotal = camperCount * 2399;
      const totalAddonsSum = getAddonsTotalSum();
      let addonsNames = [];
      selectedAddons.forEach((item) => {
        addonsNames.push(`${item.name} (${item.qty}×)`);
      });

      const grandTotal = camperSubtotal + totalAddonsSum;

      // Extract User Contact Data
      const randomOrderId = `#GOGO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const leadName = currentUser.isLoggedIn ? currentUser.name : "Vijay Kumar";
      const leadPhone = currentUser.isLoggedIn && currentUser.phone ? currentUser.phone : "9876543210";
      const leadEmail = currentUser.isLoggedIn && currentUser.email ? currentUser.email : "vijay.camper@gmail.com";

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
        successAddonsText.textContent = addonsNames.length > 0 ? addonsNames.join(", ") : "None";
      }
      if (successTotalPaid) successTotalPaid.textContent = formatCurrency(grandTotal);

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
          addons: addonsFormatted,
          camperSubtotal: camperSubtotal,
          addonsSubtotal: totalAddonsSum,
          grandTotal: grandTotal,
          paymentMethod: "Card / ATM",
          status: "Confirmed",
          date: new Date().toISOString().split("T")[0],
          tripDate: (tripDateInput && tripDateInput.value) ? tripDateInput.value : "2026-10-05"
        };

        const existingBookings = JSON.parse(localStorage.getItem("gogo_bookings_db") || "[]");
        existingBookings.unshift(newBookingRecord);
        localStorage.setItem("gogo_bookings_db", JSON.stringify(existingBookings));
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

// Download Pass Button
if (downloadPassBtn) {
  downloadPassBtn.addEventListener("click", () => {
    showToast("⬇ Downloading Campsite Access Pass (PDF)...");
  });
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

function setUserSession(name, phone, email) {
  currentUser.isLoggedIn = true;
  currentUser.name = name ? name.trim() : "Vijay Kumar";
  currentUser.phone = phone ? phone.trim() : "9876543210";
  currentUser.email = email && email.trim() !== "" 
    ? email.trim() 
    : (currentUser.name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com");
  currentUser.initial = getInitial(currentUser.name);

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
          <span class="bg-[#164e3f] text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Active Member</span>
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
        GOGOCamping Member? Click to Login &amp; view saved campers list
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

      setUserSession(name, phone, email);
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
      setUserSession(enteredName, "9876543210");
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
    setUserSession("Vijay Kumar", "9876543210", "vijay.camper@gmail.com");
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

    let addonsText = b.addons && b.addons.length > 0 
      ? b.addons.map(a => `${a.name} (${a.qty}×)`).join(", ") 
      : "No Extra Gear";

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

  const camperSubtotal = camperCount * 2399;

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

  const grandTotal = camperSubtotal + totalAddonsSum;
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
    if (bookingModal) bookingModal.classList.remove("hidden");
    renderCampers();
    showToast("✓ Opening Camper & Guest Details...");
  });
}

// Initialize page state
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  if (qtyDecreaseBtn) qtyDecreaseBtn.disabled = (currentQuantity <= 1);
  selectPackageByPersons(1, false);
  renderCartDrawerUI();
});

if (window.lucide) {
  lucide.createIcons();
}
