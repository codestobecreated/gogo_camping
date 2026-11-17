// Gear stock shared by the CMS (admin sets the stock) and the rental page (customers add gear to bookings).
// Stock is saved in localStorage ("gogo_inventory_stock"); bookings come from "gogo_bookings_db".
window.GogoInventory = (function () {
  const STOCK_KEY = "gogo_inventory_stock";
  const LOW_STOCK = 3;

  const ITEMS = [
    { id: "chair", name: "Camping Chair", price: 1200, image: "chair.jpg", defaultStock: 45 },
    { id: "sleeping_bag", name: "Sleeping Bag", price: 1500, image: "sleeping_bag.jpg", defaultStock: 30 },
    { id: "lantern", name: "LED Lantern", price: 800, image: "lantern.jpg", defaultStock: 60 },
    { id: "rope", name: "Rope Set", price: 600, image: "rope.jpg", defaultStock: 80 }
  ];

  function getStock() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STOCK_KEY) || "{}");
    } catch (e) {}
    const stock = {};
    ITEMS.forEach((item) => {
      stock[item.id] = Number.isFinite(saved[item.id]) ? saved[item.id] : item.defaultStock;
    });
    return stock;
  }

  function setStock(id, qty) {
    const stock = getStock();
    stock[id] = Math.max(0, Math.floor(Number(qty)) || 0);
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  }

  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem("gogo_bookings_db") || "[]");
    } catch (e) {
      return [];
    }
  }

  // Gear is out with upcoming (confirmed) bookings; completed trips have returned it and cancelled ones never took it
  function inUse(id, bookings) {
    const item = ITEMS.find((i) => i.id === id);
    return (bookings || getBookings())
      .filter((b) => b.status !== "Completed" && b.status !== "Cancelled")
      .reduce((sum, b) => sum + (b.addons || [])
        .filter((a) => a.name === item.name)
        .reduce((n, a) => n + (a.qty || 1), 0), 0);
  }

  function available(id, bookings) {
    return Math.max(0, getStock()[id] - inUse(id, bookings));
  }

  return { ITEMS, LOW_STOCK, getStock, setStock, inUse, available };
})();
