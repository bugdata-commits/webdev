(function () {
  const STORAGE_KEY = 'bugdata-cart-v1';
  const PRODUCTS = {
    'website-design-zw': { id: 'website-design-zw', title: 'Website design + eligible Zimbabwean domain', price: 24.99, currency: 'USD' },
    'website-design-com': { id: 'website-design-com', title: 'Website design + .com domain', price: 50, currency: 'USD' }
  };
  const hasSupabase = window.supabase && window.BUGDATA_SUPABASE_URL && window.BUGDATA_SUPABASE_PUBLISHABLE_KEY;
  const client = hasSupabase ? window.supabase.createClient(window.BUGDATA_SUPABASE_URL, window.BUGDATA_SUPABASE_PUBLISHABLE_KEY) : null;
  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const money = (value, currency = 'USD') => `${currency} ${Number(value).toFixed(2)}`;
  const toast = (message) => {
    let element = document.querySelector('.toast');
    if (!element) { element = document.createElement('div'); element.className = 'toast'; document.body.appendChild(element); }
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(element._timer);
    element._timer = setTimeout(() => element.classList.remove('show'), 4200);
  };
  const setCheckoutStatus = (message, kind = '') => {
    const element = $('#checkoutStatus');
    if (element) { element.textContent = message; element.className = `notice ${kind}`; }
  };
  const readCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter((item) => PRODUCTS[item.id] && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20) : [];
    } catch { return []; }
  };
  const writeCart = (cart) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); render(); };
  const total = (cart) => cart.reduce((sum, item) => sum + PRODUCTS[item.id].price * item.quantity, 0);
  const count = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);
  const productRows = (cart) => cart.map((item) => ({ ...item, product: PRODUCTS[item.id], lineTotal: PRODUCTS[item.id].price * item.quantity }));

  function renderBadge(cart) {
    document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = count(cart); element.hidden = count(cart) === 0; });
  }

  function render() {
    const cart = readCart();
    renderBadge(cart);
    const list = $('#cartList');
    if (!list) return;
    if (!cart.length) {
      list.innerHTML = '<li><div><strong>Your cart is empty</strong><small>Add a package from the website offers to begin checkout.</small></div></li>';
    } else {
      list.innerHTML = productRows(cart).map(({ id, quantity, product, lineTotal }) => `<li class="cart-row"><div><strong>${escapeHtml(product.title)}</strong><small>${money(product.price, product.currency)} each</small></div><div class="cart-controls"><button class="button ghost small" type="button" data-cart-change="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span aria-label="Quantity">${quantity}</span><button class="button ghost small" type="button" data-cart-change="${id}" data-delta="1" aria-label="Increase quantity">+</button><strong>${money(lineTotal, product.currency)}</strong><button class="button ghost small" type="button" data-cart-remove="${id}">Remove</button></div></li>`).join('');
    }
    const subtotal = $('#cartSubtotal');
    if (subtotal) subtotal.textContent = money(total(cart), cart[0] ? PRODUCTS[cart[0].id].currency : 'USD');
    const button = $('#checkoutButton');
    if (button) button.disabled = !cart.length;
  }

  function addToCart(id) {
    if (!PRODUCTS[id]) return;
    const cart = readCart();
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity = Math.min(existing.quantity + 1, 20);
    else cart.push({ id, quantity: 1 });
    writeCart(cart);
    toast(`${PRODUCTS[id].title} added to cart.`);
  }

  async function loadOrderHistory(user) {
    const list = $('#orderHistory');
    if (!list || !client || !user) return;
    const [ordersResponse, paymentsResponse] = await Promise.all([
      client.from('orders').select('id,description,amount,currency,status,paynow_reference,created_at').eq('client_id', user.id).order('created_at', { ascending: false }).limit(50),
      client.from('payments').select('order_id,status,provider_reference,created_at').order('created_at', { ascending: false }).limit(100)
    ]);
    if (ordersResponse.error) { list.innerHTML = '<li><div><strong>Order history unavailable</strong><small>Sign in again and retry.</small></div></li>'; return; }
    const paymentMap = new Map((paymentsResponse.data || []).map((payment) => [payment.order_id, payment]));
    if (!ordersResponse.data.length) { list.innerHTML = '<li><div><strong>No orders yet</strong><small>Your completed checkout orders will appear here.</small></div></li>'; return; }
    list.innerHTML = ordersResponse.data.map((order) => { const payment = paymentMap.get(order.id); const status = payment?.status || order.status; return `<li><div><strong>${escapeHtml(order.description)}</strong><small class="ticket-id">${escapeHtml(order.paynow_reference || order.id.slice(0, 8))} · ${new Date(order.created_at).toLocaleDateString()}</small></div><div class="order-meta"><strong>${money(order.amount, order.currency)}</strong><span class="status ${['paid', 'approved'].includes(status) ? 'closed' : ['failed', 'cancelled'].includes(status) ? 'priority' : 'waiting'}">${escapeHtml(status)}</span></div></li>`; }).join('');
  }

  async function checkout(event) {
    event.preventDefault();
    const cart = readCart();
    if (!cart.length) { setCheckoutStatus('Your cart is empty.', 'status priority'); return; }
    if (!client) { setCheckoutStatus('Secure checkout is unavailable until Supabase is configured.', 'status priority'); return; }
    const { data: { user } } = await client.auth.getUser();
    if (!user) { setCheckoutStatus('Sign in before checkout so the order is securely linked to your account.', 'status priority'); $('#account')?.scrollIntoView({ behavior: 'smooth' }); return; }
    const button = $('#checkoutButton');
    if (button) { button.disabled = true; button.textContent = 'Creating secure order…'; }
    setCheckoutStatus('Validating your cart and creating a secure order…');
    const response = await client.functions.invoke('create-order', { body: { items: cart.map(({ id, quantity }) => ({ id, quantity })) } });
    if (response.error || response.data?.error) {
      setCheckoutStatus(response.data?.error || response.error?.message || 'Checkout could not be started. Please try again.', 'status priority');
      render();
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    render();
    const reference = response.data.reference;
    setCheckoutStatus(`Order ${reference} created. Complete payment through Paynow using this reference.`, '');
    await loadOrderHistory(user);
    if (response.data.paynow_url) window.open(response.data.paynow_url, '_blank', 'noopener,noreferrer');
    toast(`Secure order ${reference} created.`);
    if (button) button.textContent = 'Create secure order';
  }

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-cart]');
    const changeButton = event.target.closest('[data-cart-change]');
    const removeButton = event.target.closest('[data-cart-remove]');
    if (addButton) { addToCart(addButton.dataset.addCart); return; }
    if (changeButton) {
      const cart = readCart(); const item = cart.find((entry) => entry.id === changeButton.dataset.cartChange);
      if (item) { item.quantity = Math.max(0, Math.min(20, item.quantity + Number(changeButton.dataset.delta))); writeCart(cart.filter((entry) => entry.quantity > 0)); }
      return;
    }
    if (removeButton) { writeCart(readCart().filter((item) => item.id !== removeButton.dataset.cartRemove)); }
  });
  window.addEventListener('storage', render);
  $('#checkoutForm')?.addEventListener('submit', checkout);
  render();
  if (client) {
    client.auth.getUser().then(({ data: { user } }) => { if (user) loadOrderHistory(user); });
    client.auth.onAuthStateChange((_event, session) => { if (session?.user) loadOrderHistory(session.user); else if ($('#orderHistory')) $('#orderHistory').innerHTML = '<li><div><strong>Sign in to view order history</strong><small>Your orders are private to your account.</small></div></li>'; });
  }
})();
