// Stops the page behind a popup from scrolling.
// Watches every full-screen overlay (".fixed.inset-0"): while any of them is open the page is locked,
// and it unlocks again when they are all closed. The popup itself can still scroll.
(function () {
  const overlays = Array.from(document.querySelectorAll('.fixed.inset-0'));
  if (!overlays.length) return;

  const html = document.documentElement;
  const body = document.body;

  function isOpen(el) {
    return !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none';
  }

  function update() {
    const locked = overlays.some(isOpen);
    if (locked && html.dataset.scrollLocked !== 'true') {
      // keep the page from jumping sideways when the scrollbar disappears
      const scrollbar = window.innerWidth - html.clientWidth;
      html.dataset.scrollLocked = 'true';
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      if (scrollbar > 0) body.style.paddingRight = scrollbar + 'px';
    } else if (!locked && html.dataset.scrollLocked === 'true') {
      delete html.dataset.scrollLocked;
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.paddingRight = '';
    }
  }

  const observer = new MutationObserver(update);
  overlays.forEach((el) => observer.observe(el, { attributes: true, attributeFilter: ['class', 'style'] }));
  update();
})();
