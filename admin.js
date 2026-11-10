(function () {
  const hasSupabase = window.supabase && window.BUGDATA_SUPABASE_URL && window.BUGDATA_SUPABASE_PUBLISHABLE_KEY;
  const client = hasSupabase ? window.supabase.createClient(window.BUGDATA_SUPABASE_URL, window.BUGDATA_SUPABASE_PUBLISHABLE_KEY) : null;
  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const statusClass = (value) => ['resolved', 'closed', 'paid', 'approved', 'published'].includes(String(value).toLowerCase()) ? 'closed' : ['urgent', 'failed', 'cancelled'].includes(String(value).toLowerCase()) ? 'priority' : 'waiting';
  const setStatus = (message, kind = '') => { const element = $('#dashboardStatus'); if (element) { element.textContent = message; element.className = `notice ${kind}`; } };
  const setAuthStatus = (message, kind = '') => { const element = $('#adminAuthStatus'); if (element) { element.textContent = message; element.className = `notice ${kind}`; } };
  const renderEmpty = (id, columns, message) => { const element = $(`#${id}`); if (element) element.innerHTML = `<tr><td colspan="${columns}" class="muted">${escapeHtml(message)}</td></tr>`; };
  const renderRows = (id, rows, columns, html) => { const element = $(`#${id}`); if (element) element.innerHTML = rows.length ? rows.map(html).join('') : `<tr><td colspan="${columns}" class="muted">No records found.</td></tr>`; };

  function showDashboard(signedIn) {
    $('#adminAuth').hidden = signedIn;
    $('#adminDashboard').hidden = !signedIn;
    const state = $('#adminState');
    if (state) { state.textContent = signedIn ? 'Admin connected' : 'Sign in required'; state.className = `status ${signedIn ? 'open' : 'priority'}`; }
  }

  async function loadDashboard() {
    if (!client) { showDashboard(false); setAuthStatus('Supabase configuration is missing.', 'status priority'); return; }
    setStatus('Loading live data…');
    const [profiles, tickets, courses, affiliates, payments, orders, enrollments] = await Promise.all([
      client.from('profiles').select('id,full_name,business_name,role,created_at').eq('role', 'client').order('created_at', { ascending: false }).limit(100),
      client.from('support_tickets').select('id,ticket_number,client_id,subject,priority,status,updated_at,created_at').in('status', ['open', 'in_progress', 'awaiting_client']).order('updated_at', { ascending: false }).limit(100),
      client.from('courses').select('id,title,slug,published,created_at').order('created_at', { ascending: false }).limit(100),
      client.from('affiliates').select('id,referral_code,commission_rate,approved,created_at').order('created_at', { ascending: false }).limit(100),
      client.from('payments').select('id,order_id,provider_reference,status,amount,currency,created_at').order('created_at', { ascending: false }).limit(100),
      client.from('orders').select('id,description,client_id,amount,currency,status,created_at').order('created_at', { ascending: false }).limit(100),
      client.from('course_enrollments').select('course_id').limit(1000)
    ]);
    const result = { profiles, tickets, courses, affiliates, payments, orders, enrollments };
    const failed = Object.entries(result).find(([, response]) => response.error);
    if (failed) {
      console.error(failed[1].error);
      setStatus(`Could not load ${failed[0]}. Your account may not have administrator access.`, 'status priority');
      return;
    }
    const data = Object.fromEntries(Object.entries(result).map(([key, response]) => [key, response.data || []]));
    const profileMap = new Map(data.profiles.map((profile) => [profile.id, profile]));
    const orderMap = new Map(data.orders.map((order) => [order.id, order]));
    const enrollmentCounts = data.enrollments.reduce((counts, enrollment) => { counts[enrollment.course_id] = (counts[enrollment.course_id] || 0) + 1; return counts; }, {});
    $('#clientCount').textContent = data.profiles.length;
    $('#ticketCount').textContent = data.tickets.length;
    $('#paymentCount').textContent = data.payments.filter((payment) => ['created', 'awaiting'].includes(payment.status)).length;
    $('#lastUpdated').textContent = `Updated ${new Date().toLocaleString()}`;
    renderRows('ticketRows', data.tickets, 6, (ticket) => { const profile = profileMap.get(ticket.client_id); return `<tr data-ticket-row><td class="ticket-id">BUG-${String(ticket.ticket_number).padStart(5, '0')}</td><td>${escapeHtml(profile?.business_name || profile?.full_name || 'Unknown client')}</td><td>${escapeHtml(ticket.subject)}</td><td><span class="status ${statusClass(ticket.priority)}">${escapeHtml(ticket.priority)}</span></td><td><span class="status ${statusClass(ticket.status)}">${escapeHtml(ticket.status.replaceAll('_', ' '))}</span></td><td>${formatDate(ticket.updated_at || ticket.created_at)}</td></tr>`; });
    renderRows('clientRows', data.profiles, 4, (profile) => `<tr><td>${escapeHtml(profile.full_name || 'Unnamed client')}</td><td>${escapeHtml(profile.business_name || '—')}</td><td><span class="status open">${escapeHtml(profile.role)}</span></td><td>${formatDate(profile.created_at)}</td></tr>`);
    renderRows('courseRows', data.courses, 4, (course) => `<tr><td>${escapeHtml(course.title || course.slug)}</td><td><span class="status ${course.published ? 'closed' : 'waiting'}">${course.published ? 'Published' : 'Draft'}</span></td><td>${enrollmentCounts[course.id] || 0}</td><td>${formatDate(course.created_at)}</td></tr>`);
    renderRows('affiliateRows', data.affiliates, 4, (affiliate) => `<tr><td class="ticket-id">${escapeHtml(affiliate.referral_code)}</td><td>${escapeHtml(affiliate.commission_rate)}%</td><td><span class="status ${affiliate.approved ? 'closed' : 'waiting'}">${affiliate.approved ? 'Approved' : 'Pending'}</span></td><td>${formatDate(affiliate.created_at)}</td></tr>`);
    renderRows('paymentRows', data.payments, 5, (payment) => { const order = orderMap.get(payment.order_id); return `<tr><td class="ticket-id">${escapeHtml(payment.provider_reference || payment.id.slice(0, 8))}</td><td>${escapeHtml(order?.description || payment.order_id || '—')}</td><td>${escapeHtml(payment.amount)} ${escapeHtml(payment.currency)}</td><td><span class="status ${statusClass(payment.status)}">${escapeHtml(payment.status)}</span></td><td>${formatDate(payment.created_at)}</td></tr>`; });
    setStatus(`Loaded ${data.profiles.length} clients, ${data.tickets.length} open tickets and ${data.payments.length} payment records.`);
  }

  async function syncSession() {
    if (!client) return;
    const { data: { session } } = await client.auth.getSession();
    showDashboard(Boolean(session));
    if (session) await loadDashboard();
  }

  if (!client) { showDashboard(false); setAuthStatus('Supabase configuration is missing.', 'status priority'); return; }
  $('#adminAuthForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAuthStatus('Signing in…');
    const { error } = await client.auth.signInWithPassword({ email: $('#adminEmail').value.trim(), password: $('#adminPassword').value });
    if (error) { setAuthStatus(error.message, 'status priority'); return; }
    setAuthStatus('Signed in. Loading the dashboard…');
    await syncSession();
  });
  $('#refreshDashboard')?.addEventListener('click', loadDashboard);
  $('#signOut')?.addEventListener('click', async () => { await client.auth.signOut(); showDashboard(false); setAuthStatus('You have been signed out.'); });
  client.auth.onAuthStateChange((_event, session) => { if (!session) showDashboard(false); });
  syncSession();
})();
