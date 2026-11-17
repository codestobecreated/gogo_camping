# GOGOCamping - Product Booking Page

An interactive camping equipment & tent booking webpage created for **GOGOCamping** with modern responsive UI, live dynamic pricing, 25% OFF discount tiers, and camper registration flow.

## 🚀 Features

- **GOGOCamping Brand Header**: Styled matching GOGOCamping's identity (Navy accent `#27384a`, warm cream background `#f7f3e8`, forest pine green `#164e3f`).
- **Interactive Gallery & Video**:
  - High-res product showcase gallery with 5 thumbnail switchers.
  - Embedded YouTube setup guide video (`ETORWgahumI`).
- **1, 2, 3 & 4 Person Package Selection**:
  - 1 Person (Solo): ₹1,799 (25% OFF)
  - 2 Person (Duo): ₹2,999 (25% OFF)
  - 3 Person (Trio): ₹3,899 (25% OFF)
  - 4 Person (Family/Group): ₹4,799 (25% OFF)
- **Add-on Accessories**:
  - Foldable Camping Chair (+₹299)
  - Thermal Sleeping Bag (+₹449)
  - LED Camping Lantern (+₹199)
  - Heavy Duty Rope & Carabiners (+₹149)
- **Camper Login System**:
  - Mobile OTP Login (+91 phone authentication simulation).
  - Google Sign-In integration.
  - Active Camper profile badge.
- **Booking & Camper Details Modal**:
  - Contact details (Email, Phone, WhatsApp updates toggle).
  - Dynamic camper passenger slots with Name, Age, and Gender selector.
  - Live itemized pricing and checkout confirmation.

## 🛠️ Built With

- **HTML5**
- **Tailwind CSS**
- **Vanilla JavaScript**
- **Lucide Icons**

## 💻 Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/codestobecreated/gogo_camping.git
   ```
2. Navigate into the folder and open `index.html` in your browser, or start a local server:
   ```bash
   python -m http.server 8080
   ```
3. Visit `http://localhost:8080` in your web browser.

## 📁 Site Structure (v2.0.0)

- `index.html` – GOGO Camping Jawadhu Hills home page (sticky navbar; "Reserve Your Camp" opens the tent booking page)
- `assests/` – home page images
- `rental/` – tent booking page (`index.html`, `app.js`, `styles.css`, product images)
  - Click the main photo to open a full-screen photo popup
  - Package (Solo / Couple / Trio / Group) is chosen only on this page; the booking popup and cart follow it
  - The GOGOCamping logo returns to the home page
- `rental/cms/` – CMS admin dashboard

## 🆕 What's new in v2.1.0

- **Home page redesign** from the Figma "GOGO Redesign" file, using its original photos (`assests/figma/`); navbar unchanged
  - Full-screen hero, frosted-glass "What happens when you GOGO?" card, torn-paper edges, photo collage, testimonials
  - Booking bar: "Check availability" opens the tent booking page (`rental/`)
- **Popups** on every page stop the page behind from scrolling (`scroll-lock.js`)
- **CMS admin** (`rental/cms/`)
  - Gear stock: set the stock for each add-on; shows In use / Available and In stock, Low stock, Out of stock (`rental/inventory.js`). The booking page blocks sold-out gear
  - Booking status is a dropdown (Confirmed / Completed / Cancelled)
  - Offline booking supports Custom / Group packages (5+ campers)
  - Add-on and booking insight panels under the charts
  - "Logged-in Members" lists accounts that logged in but have not booked yet
