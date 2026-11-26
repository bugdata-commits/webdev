(function () {
  const KEY = 'bugdata-cart-v1';
  function refreshCartBadges() {
    let quantity = 0;
    try {
      const items = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(items)) {
        quantity = items.reduce((sum, item) => {
          const validProduct = item && ['website-design-zw', 'website-design-com'].includes(item.id);
          const validQuantity = Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20;
          return sum + (validProduct && validQuantity ? item.quantity : 0);
        }, 0);
      }
    } catch (_) { quantity = 0; }
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = String(quantity);
      badge.hidden = quantity === 0;
      const link = badge.closest('a');
      if (link) link.setAttribute('aria-label', `View cart, ${quantity} ${quantity === 1 ? 'item' : 'items'}`);
    });
  }
  refreshCartBadges();
  window.addEventListener('storage', refreshCartBadges);
  window.addEventListener('pageshow', refreshCartBadges);
})();
