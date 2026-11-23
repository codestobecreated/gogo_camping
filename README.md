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

## 🆕 What's new in v2.1.7

- `/rental/` – astro-camping banner fills the empty space under "Explore Outdoor Categories" on desktop (links to the Astro event, auto-matches the right column height)

## 🆕 What's new in v2.1.6

- `/gallery/` – new Gallery page: 29 GOGO photos, category filters and a full-screen viewer; home "See the full gallery" button
- `/blogs/jawadhu-hills.html` and `/blogs/kullar-kugai.html` – single blog pages (home cards and a new "Places worth the drive" section link to them); Jawadhu page features the New Indian Express article
- Navbar on blog pages now has Field notes + Blogs; Gallery links open the new page
- Home: "Upcoming at GOGO" events banner and testimonial arrows removed

## 🆕 What's new in v2.1.5

**Booking (`/rental/`)**
- Booking policy popup before booking (scroll, tick agree, submit) – no refund on cancellation (100% deduction)
- Group-based tier pricing per person (1–25, 26–50, 51–100, 101+) shown + GST; 18% GST added at checkout
- Custom group size typed by the guest (4+ people); add-ons replaced by Veg / Non-Veg food (included)
- Children under 4 free; booking calendar with daily capacity, weekday rule and open / closed days
- Team leader details + Aadhaar / ID (number or upload); team leader camping or not; other campers' name, age, WhatsApp
- Aadhaar upload page for other campers (`/rental/id-upload.html`)
- Payment by UPI QR / UPI app / Card; downloadable PDF ticket with GST and the no-refund note

**New pages**
- `/book/` – choose Regular Camping or Events
- `/events/` – events & activities (booking coming soon)
- `/blogs/` – Field Notes page (from the Figma design) and `/blogs/write.html` for campers' own notes
- `/gopal/` – Calendar Control for the calendar admin (`/rental/cms/calendar.html`)

**CMS**
- Pricing & GST panel, Events manager, Calendar Control, food / kids / ID status on bookings

**Home page**
- Blogs section (Jawadhu Hills, Kullar Kugai), testimonial slider, "Discover astro-camping" opens the Astro event

> Note: there is no backend yet – prices, calendar, events, bookings and uploads are stored in the browser (localStorage).

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
