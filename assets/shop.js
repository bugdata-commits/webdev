(() => {
  'use strict';

  const SHOP_KEY = 'bugdata-shop-cart-v1';
  const MAX_QUANTITY = 100;
  const products = {
    'vinyl-a4': { name: 'Vinyl sign · A4', price: 4, unit: 'per sign' },
    'vinyl-a3': { name: 'Vinyl sign · A3', price: 6, unit: 'per sign' },
    'vinyl-a2': { name: 'Vinyl sign · A2', price: 10, unit: 'per sign' },
    'vinyl-a1': { name: 'Vinyl sign · A1', price: 18, unit: 'per sign' },
    'vinyl-a0': { name: 'Vinyl sign · A0', price: 34, unit: 'per sign' },
    'card-design': { name: 'Business card design', price: 1, unit: 'per design' },
    'cards-photo-50': { name: 'Business card printing · photo paper (50 cards)', price: 10, unit: 'per pack of 50' },
    'cards-pvc-15': { name: 'Business card printing · PVC (15 cards)', price: 10, unit: 'per pack of 15' },
    'business-id': { name: 'Business ID card · design and printing', price: 2, unit: 'per card' },
    'card-holder': { name: 'Business card holder', price: 2, unit: 'each' },
    'content-piece': { name: 'Content creation · one piece (up to four revisions)', price: 4.5, unit: 'per piece' },
    'business-flyer': { name: 'Business flyer · up to four revisions', price: 4.5, unit: 'per flyer' },
    'video-20': { name: 'Video design · 20 seconds', price: 10, unit: 'per video' },
    'video-60': { name: 'Video design · one minute', price: 20, unit: 'per video' }
  };

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
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('bd-open')) {
        closeMenu();
        menu.focus();
      }
    });
  }

  const year = document.getElementById('shopYear');
  if (year) year.textContent = String(new Date().getFullYear());
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartContents = document.getElementById('cartContents');
  const totalOutput = document.getElementById('shopTotal');
  const inquiryLink = document.getElementById('shopInquiry');
  const status = document.getElementById('cartStatus');
  if (!cartItems || !cartEmpty || !cartContents || !totalOutput || !inquiryLink) return;

  const money = (value) => `$${value.toFixed(2)} USD`;
  const cleanQuantity = (value) => Math.max(1, Math.min(MAX_QUANTITY, Number.parseInt(value, 10) || 1));
  const readCart = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(SHOP_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((line) => line && Object.prototype.hasOwnProperty.call(products, line.id))
        .map((line) => ({ id: line.id, quantity: cleanQuantity(line.quantity) }))
        .filter((line, index, lines) => lines.findIndex((candidate) => candidate.id === line.id) === index);
    } catch (_) { return []; }
  };
  let cart = readCart();

  const saveCart = () => {
    try { window.localStorage.setItem(SHOP_KEY, JSON.stringify(cart)); }
    catch (_) { /* The current page remains usable if browser storage is unavailable. */ }
  };
  const say = (message) => { if (status) status.textContent = message; };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const updateBadges = () => {
    const count = cart.reduce((sum, line) => sum + line.quantity, 0);
    document.querySelectorAll('[data-shop-count]').forEach((node) => { node.textContent = String(count); });
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count === 0;
      const link = badge.closest('a');
      if (link) link.setAttribute('aria-label', `View Shop basket, ${count} ${count === 1 ? 'item' : 'items'}`);
    });
  };

  const createLine = (line) => {
    const product = products[line.id];
    const row = element('article', 'cart-line');
    row.dataset.line = line.id;
    const description = element('div', 'cart-line-description');
    description.append(element('p', 'cart-line-title', product.name));
    description.append(element('span', 'cart-line-unit', `${money(product.price)} ${product.unit}`));
    row.append(description);
    row.append(element('strong', 'cart-line-total', money(product.price * line.quantity)));

    const controls = element('div', 'quantity-control');
    controls.setAttribute('aria-label', `Quantity for ${product.name}`);
    const quantityGroup = element('div');
    const minus = element('button', '', '−');
    minus.type = 'button';
    minus.dataset.action = 'decrease';
    minus.setAttribute('aria-label', `Decrease ${product.name} quantity`);
    const input = element('input');
    input.type = 'number';
    input.min = '1';
    input.max = String(MAX_QUANTITY);
    input.step = '1';
    input.inputMode = 'numeric';
    input.value = String(line.quantity);
    input.setAttribute('aria-label', `Quantity of ${product.name}`);
    input.dataset.action = 'quantity';
    const plus = element('button', '', '+');
    plus.type = 'button';
    plus.dataset.action = 'increase';
    plus.setAttribute('aria-label', `Increase ${product.name} quantity`);
    quantityGroup.append(minus, input, plus);
    const remove = element('button', 'remove-item', 'Remove');
    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `Remove ${product.name} from basket`);
    controls.append(quantityGroup, remove);
    row.append(controls);
    return row;
  };

  const updateInquiryLink = () => {
    if (!cart.length) {
      inquiryLink.href = 'https://wa.me/263717051860';
      return;
    }
    const lines = cart.map((line) => {
      const product = products[line.id];
      return `${line.quantity} × ${product.name} (${money(product.price)} ${product.unit}; line ${money(product.price * line.quantity)})`;
    });
    const subtotal = cart.reduce((sum, line) => sum + products[line.id].price * line.quantity, 0);
    const message = `Hello Bugdata, I would like to inquire about these Shop items:\n${lines.join('\n')}\nListed subtotal: ${money(subtotal)}. Please confirm specifications, availability and any delivery or other charges before payment. I understand this message is an inquiry, not a completed order or payment.`;
    inquiryLink.href = `https://wa.me/263717051860?text=${encodeURIComponent(message)}`;
  };

  const render = () => {
    cartItems.replaceChildren(...cart.map(createLine));
    const empty = cart.length === 0;
    cartEmpty.hidden = !empty;
    cartContents.hidden = empty;
    const subtotal = cart.reduce((sum, line) => sum + products[line.id].price * line.quantity, 0);
    totalOutput.textContent = money(subtotal);
    updateInquiryLink();
    updateBadges();
    saveCart();
  };

  document.querySelectorAll('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.product;
      if (!Object.prototype.hasOwnProperty.call(products, id)) return;
      const line = cart.find((item) => item.id === id);
      if (line) line.quantity = Math.min(MAX_QUANTITY, line.quantity + 1);
      else cart.push({ id, quantity: 1 });
      render();
      say(`${products[id].name} added to your basket.`);
      button.textContent = 'Added to basket';
      window.setTimeout(() => { button.textContent = 'Add to basket'; }, 1100);
    });
  });

  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row = button.closest('[data-line]');
    const line = cart.find((item) => item.id === row?.dataset.line);
    if (!line) return;
    if (button.dataset.action === 'increase') line.quantity = Math.min(MAX_QUANTITY, line.quantity + 1);
    if (button.dataset.action === 'decrease') line.quantity = Math.max(1, line.quantity - 1);
    if (button.dataset.action === 'remove') {
      cart = cart.filter((item) => item.id !== line.id);
      say(`${products[line.id].name} removed from your basket.`);
    }
    render();
  });

  cartItems.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-action="quantity"]');
    if (!input) return;
    const line = cart.find((item) => item.id === input.closest('[data-line]')?.dataset.line);
    if (!line) return;
    line.quantity = cleanQuantity(input.value);
    render();
  });

  const clearButton = document.getElementById('clearCart');
  if (clearButton) clearButton.addEventListener('click', () => {
    cart = [];
    render();
    say('Your basket is empty.');
  });

  window.addEventListener('storage', (event) => {
    if (event.key === SHOP_KEY) {
      cart = readCart();
      render();
    }
  });
  window.addEventListener('pageshow', () => { cart = readCart(); render(); });
  render();
})();
