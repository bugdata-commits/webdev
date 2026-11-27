(() => {
  const menu = document.getElementById('bdMenu');
  const nav = document.getElementById('bdLinks');
  const closeMenu = () => {
    if (!menu || !nav) return;
    nav.classList.remove('bd-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('bd-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  const size = document.getElementById('signageSize');
  const quantity = document.getElementById('signageQuantity');
  const subtotal = document.getElementById('signageSubtotal');
  const orderLink = document.getElementById('signageWhatsApp');
  const year = document.getElementById('shopYear');
  if (year) year.textContent = new Date().getFullYear();
  if (!size || !quantity || !subtotal || !orderLink) return;

  const buildOrder = () => {
    const option = size.selectedOptions[0];
    const unitPrice = Number(option.dataset.price);
    const unitCount = Math.max(1, Math.min(100, Number.parseInt(quantity.value, 10) || 1));
    quantity.value = String(unitCount);
    const total = unitPrice * unitCount;
    subtotal.textContent = `$${total.toFixed(2)} USD`;
    const message = `Hello Bugdata, I would like to ask about vinyl signage: ${size.value} (${option.dataset.dimensions}), quantity ${unitCount}, listed print subtotal $${total.toFixed(2)} USD. Please confirm artwork, finish and any delivery or installation costs before payment.`;
    orderLink.href = `https://wa.me/263717051860?text=${encodeURIComponent(message)}`;
    document.querySelectorAll('[data-size]').forEach((button) => {
      const selected = button.dataset.size === size.value;
      button.setAttribute('aria-pressed', String(selected));
      if (selected) button.textContent = `Selected · ${size.value}`;
      else button.textContent = `Choose ${button.dataset.size}`;
    });
  };
  size.addEventListener('change', buildOrder);
  quantity.addEventListener('input', buildOrder);
  document.querySelectorAll('[data-size]').forEach((button) => button.addEventListener('click', () => {
    size.value = button.dataset.size;
    buildOrder();
    document.getElementById('order-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    size.focus({ preventScroll: true });
  }));
  buildOrder();
})();
