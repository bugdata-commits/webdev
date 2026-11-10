(function () {
  const hasSupabase = window.supabase && window.BUGDATA_SUPABASE_URL && window.BUGDATA_SUPABASE_PUBLISHABLE_KEY;
  const client = hasSupabase ? window.supabase.createClient(window.BUGDATA_SUPABASE_URL, window.BUGDATA_SUPABASE_PUBLISHABLE_KEY) : null;
  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>\'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const statusClass = (value) => ['resolved', 'closed', 'paid', 'approved', 'published'].includes(String(value).toLowerCase()) ? 'closed' : ['urgent', 'failed', 'cancelled'].includes(String(value).toLowerCase()) ? 'priority' : 'waiting';
  const setStatus = (message, kind = '') => { const element = $('#dashboardStatus'); if (element) { element.textContent = message; element.className = `notice ${kind}`; } };
  const setAuthStatus = (message, kind = '') => { const element = $('#adminAuthStatus'); if (element) { element.textContent = message; element.className = `notice ${kind}`; } };
  const tableStates = {};
  const charts = {};
  let dashboardData = {};

  const tableConfig = {
    tickets: { rowsId: 'ticketRows', infoId: 'ticketsPageInfo', columns: 7, defaultSort: 'updated_at' },
    clients: { rowsId: 'clientRows', infoId: 'clientsPageInfo', columns: 5, defaultSort: 'created_at' },
    courses: { rowsId: 'courseRows', infoId: 'coursesPageInfo', columns: 5, defaultSort: 'created_at' },
    affiliates: { rowsId: 'affiliateRows', infoId: 'affiliatesPageInfo', columns: 5, defaultSort: 'created_at' },
    payments: { rowsId: 'paymentRows', infoId: 'paymentsPageInfo', columns: 6, defaultSort: 'created_at' }
  };

  function showDashboard(signedIn) {
    $('#adminAuth').hidden = signedIn;
    $('#adminDashboard').hidden = !signedIn;
    const state = $('#adminState');
    if (state) { state.textContent = signedIn ? 'Admin connected' : 'Sign in required'; state.className = `status ${signedIn ? 'open' : 'priority'}`; }
  }

  function valueForSort(row, key) {
    const value = row[key];
    if (value === null || value === undefined) return '';
    if (['created_at', 'updated_at'].includes(key)) return new Date(value).getTime() || 0;
    if (key === 'amount' || key === 'commission_rate') return Number(value) || 0;
    return String(value).toLowerCase();
  }

  function searchable(row, table) {
    const input = $(`[data-table-search="${table}"]`);
    if (!input || !input.value.trim()) return true;
    const query = input.value.trim().toLowerCase();
    return Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query));
  }

  function renderEmpty(config, message = 'No records found.') {
    const element = $(`#${config.rowsId}`);
    if (element) element.innerHTML = `<tr><td colspan="${config.columns}" class="muted">${escapeHtml(message)}</td></tr>`;
    const info = $(`#${config.infoId}`);
    if (info) info.textContent = '0 records';
  }

  function rowHtml(table, row) {
    if (table === 'tickets') {
      const profile = dashboardData.profileMap.get(row.client_id);
      return `<tr data-ticket-row><td class="ticket-id">BUG-${String(row.ticket_number).padStart(5, '0')}</td><td>${escapeHtml(profile?.business_name || profile?.full_name || 'Unknown client')}</td><td>${escapeHtml(row.subject)}</td><td><select data-ticket-priority class="table-select"><option value="normal" ${row.priority === 'normal' ? 'selected' : ''}>Normal</option><option value="high" ${row.priority === 'high' ? 'selected' : ''}>High</option><option value="urgent" ${row.priority === 'urgent' ? 'selected' : ''}>Urgent</option></select></td><td><select data-ticket-status class="table-select"><option value="open" ${row.status === 'open' ? 'selected' : ''}>Open</option><option value="in_progress" ${row.status === 'in_progress' ? 'selected' : ''}>In progress</option><option value="awaiting_client" ${row.status === 'awaiting_client' ? 'selected' : ''}>Awaiting client</option><option value="resolved" ${row.status === 'resolved' ? 'selected' : ''}>Resolved</option><option value="closed" ${row.status === 'closed' ? 'selected' : ''}>Closed</option></select></td><td>${formatDate(row.updated_at || row.created_at)}</td><td><button class="button ghost small" data-action="save-ticket" data-id="${row.id}" type="button">Save</button></td></tr>`;
    }
    if (table === 'clients') {
      return `<tr><td>${escapeHtml(row.full_name || 'Unnamed client')}</td><td>${escapeHtml(row.business_name || '—')}</td><td><select data-client-role class="table-select"><option value="client" ${row.role === 'client' ? 'selected' : ''}>Client</option><option value="affiliate" ${row.role === 'affiliate' ? 'selected' : ''}>Affiliate</option><option value="admin" ${row.role === 'admin' ? 'selected' : ''}>Admin</option></select></td><td>${formatDate(row.created_at)}</td><td><button class="button ghost small" data-action="save-client" data-id="${row.id}" type="button">Save role</button></td></tr>`;
    }
    if (table === 'courses') {
      const count = dashboardData.enrollmentCounts[row.id] || 0;
      return `<tr><td>${escapeHtml(row.title || row.slug)}</td><td><span class="status ${row.published ? 'closed' : 'waiting'}">${row.published ? 'Published' : 'Draft'}</span></td><td>${count}</td><td>${formatDate(row.created_at)}</td><td><button class="button ghost small" data-action="toggle-course" data-id="${row.id}" data-published="${row.published}" type="button">${row.published ? 'Unpublish' : 'Publish'}</button></td></tr>`;
    }
    if (table === 'affiliates') {
      return `<tr><td class="ticket-id">${escapeHtml(row.referral_code)}</td><td>${escapeHtml(row.commission_rate)}%</td><td><span class="status ${row.approved ? 'closed' : 'waiting'}">${row.approved ? 'Approved' : 'Pending'}</span></td><td>${formatDate(row.created_at)}</td><td><button class="button ghost small" data-action="toggle-affiliate" data-id="${row.id}" data-approved="${row.approved}" type="button">${row.approved ? 'Revoke' : 'Approve'}</button></td></tr>`;
    }
    if (table === 'payments') {
      const order = dashboardData.orderMap.get(row.order_id);
      return `<tr><td class="ticket-id">${escapeHtml(row.provider_reference || row.id.slice(0, 8))}</td><td>${escapeHtml(order?.description || row.order_id || '—')}</td><td>${escapeHtml(row.amount)} ${escapeHtml(row.currency)}</td><td><select data-payment-status class="table-select"><option value="created" ${row.status === 'created' ? 'selected' : ''}>Created</option><option value="awaiting" ${row.status === 'awaiting' ? 'selected' : ''}>Awaiting</option><option value="paid" ${row.status === 'paid' ? 'selected' : ''}>Paid</option><option value="failed" ${row.status === 'failed' ? 'selected' : ''}>Failed</option><option value="cancelled" ${row.status === 'cancelled' ? 'selected' : ''}>Cancelled</option><option value="refunded" ${row.status === 'refunded' ? 'selected' : ''}>Refunded</option></select></td><td>${formatDate(row.created_at)}</td><td><button class="button ghost small" data-action="save-payment" data-id="${row.id}" type="button">Save</button></td></tr>`;
    }
    return '';
  }

  function getFilteredSortedRows(table) {
    const state = tableStates[table];
    if (!state) return [];
    const filtered = state.rows.filter((row) => searchable(row, table));
    const sortKey = state.sortKey || tableConfig[table].defaultSort;
    filtered.sort((a, b) => {
      const av = valueForSort(a, sortKey); const bv = valueForSort(b, sortKey);
      if (av === bv) return 0;
      const result = av > bv ? 1 : -1;
      return state.direction === 'asc' ? result : -result;
    });
    return filtered;
  }

  function renderTable(table) {
    const config = tableConfig[table];
    const state = tableStates[table];
    if (!config || !state) return;
    const filtered = getFilteredSortedRows(table);
    const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * state.pageSize;
    const pageRows = filtered.slice(start, start + state.pageSize);
    const element = $(`#${config.rowsId}`);
    if (element) element.innerHTML = pageRows.length ? pageRows.map((row) => rowHtml(table, row)).join('') : `<tr><td colspan="${config.columns}" class="muted">No matching records.</td></tr>`;
    const info = $(`#${config.infoId}`);
    if (info) info.textContent = `${filtered.length ? start + 1 : 0}–${Math.min(start + state.pageSize, filtered.length)} of ${filtered.length}`;
    document.querySelector(`[data-page-prev="${table}"]`)?.toggleAttribute('disabled', state.page <= 1);
    document.querySelector(`[data-page-next="${table}"]`)?.toggleAttribute('disabled', state.page >= pages);
  }

  const exportTitles = { tickets: 'Support tickets', clients: 'Client records', courses: 'Courses', affiliates: 'Affiliate approvals', payments: 'Payment records' };
  function exportRows(table) {
    const rows = getFilteredSortedRows(table);
    const mapped = rows.map((row) => {
      if (table === 'tickets') { const profile = dashboardData.profileMap.get(row.client_id); return [
        `BUG-${String(row.ticket_number).padStart(5, '0')}`, profile?.business_name || profile?.full_name || 'Unknown client', row.subject, row.priority, row.status.replaceAll('_', ' '), formatDate(row.updated_at || row.created_at)
      ]; }
      if (table === 'clients') return [row.full_name || 'Unnamed client', row.business_name || '', row.role, formatDate(row.created_at)];
      if (table === 'courses') return [row.title || row.slug, row.published ? 'Published' : 'Draft', dashboardData.enrollmentCounts[row.id] || 0, formatDate(row.created_at)];
      if (table === 'affiliates') return [row.referral_code, `${row.commission_rate}%`, row.approved ? 'Approved' : 'Pending', formatDate(row.created_at)];
      const order = dashboardData.orderMap.get(row.order_id);
      return [row.provider_reference || row.id.slice(0, 8), order?.description || row.order_id || '', `${row.amount} ${row.currency}`, row.status, formatDate(row.created_at)];
    });
    const headers = {
      tickets: ['Ticket', 'Client', 'Subject', 'Priority', 'Status', 'Updated'],
      clients: ['Name', 'Company', 'Role', 'Joined'],
      courses: ['Course', 'Status', 'Enrolled', 'Created'],
      affiliates: ['Referral code', 'Commission', 'Approval', 'Joined'],
      payments: ['Reference', 'Order', 'Amount', 'Status', 'Created']
    }[table];
    return { title: exportTitles[table], headers, rows: mapped };
  }

  function safeFilename(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function csvCell(value) { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  function exportCsv(table) {
    const report = exportRows(table);
    if (!report) return;
    const generated = new Date().toLocaleString();
    const csv = [['Report', report.title], ['Generated', generated], [], report.headers, ...report.rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    downloadBlob(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }), `${safeFilename(report.title)}-${new Date().toISOString().slice(0, 10)}.csv`);
    setStatus(`Exported ${report.rows.length} ${report.title.toLowerCase()} to CSV.`);
  }

  function exportPdf(table) {
    const report = exportRows(table);
    const pdf = window.jspdf;
    if (!report || !pdf?.jsPDF) { setStatus('PDF export library is unavailable. Please refresh and try again.', 'status priority'); return; }
    const doc = new pdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const generated = new Date().toLocaleString();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text(`Bugdata — ${report.title}`, 40, 42);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90); doc.text(`Generated ${generated} · ${report.rows.length} records · Filters and sorting applied from dashboard`, 40, 59);
    doc.setTextColor(0);
    if (typeof doc.autoTable !== 'function') { setStatus('PDF table plugin is unavailable. Please refresh and try again.', 'status priority'); return; }
    doc.autoTable({ head: [report.headers], body: report.rows, startY: 78, theme: 'grid', styles: { font: 'helvetica', fontSize: 8, cellPadding: 5 }, headStyles: { fillColor: [16, 42, 47], textColor: [255, 255, 255] }, alternateRowStyles: { fillColor: [241, 248, 246] }, margin: { left: 40, right: 40 } });
    doc.save(`${safeFilename(report.title)}-${new Date().toISOString().slice(0, 10)}.pdf`);
    setStatus(`Exported ${report.rows.length} ${report.title.toLowerCase()} to PDF.`);
  }

  function setupTables(data) {
    Object.entries(tableConfig).forEach(([table, config]) => {
      tableStates[table] = { rows: data[table], page: 1, pageSize: 10, sortKey: config.defaultSort, direction: 'desc' };
      renderTable(table);
    });
  }

  function drawChart(name, elementId, config) {
    if (!window.Chart) return;
    if (charts[name]) charts[name].destroy();
    const canvas = document.getElementById(elementId);
    if (canvas) charts[name] = new Chart(canvas, config);
  }

  function drawAnalytics(data) {
    const ticketStatuses = ['open', 'in_progress', 'awaiting_client', 'resolved', 'closed'];
    const ticketCounts = ticketStatuses.map((status) => data.tickets.filter((ticket) => ticket.status === status).length);
    drawChart('tickets', 'ticketChart', { type: 'doughnut', data: { labels: ticketStatuses.map((s) => s.replaceAll('_', ' ')), datasets: [{ data: ticketCounts, backgroundColor: ['#61e3cf', '#b18ad0', '#f4d06f', '#87e0bc', '#718a88'] }] }, options: { responsive: true, plugins: { legend: { labels: { color: '#d3e3df' } } } } });
    const courseLabels = data.courses.map((course) => course.title || course.slug);
    drawChart('enrollments', 'enrollmentChart', { type: 'bar', data: { labels: courseLabels, datasets: [{ label: 'Enrollments', data: data.courses.map((course) => dashboardData.enrollmentCounts[course.id] || 0), backgroundColor: '#61e3cf' }] }, options: { responsive: true, scales: { x: { ticks: { color: '#b1c8c4' } }, y: { beginAtZero: true, ticks: { color: '#b1c8c4', precision: 0 } } }, plugins: { legend: { display: false } } } });
    const paidByMonth = {};
    data.payments.filter((payment) => payment.status === 'paid').forEach((payment) => { const key = String(payment.created_at || '').slice(0, 7) || 'Unknown'; paidByMonth[key] = (paidByMonth[key] || 0) + Number(payment.amount || 0); });
    const months = Object.keys(paidByMonth).sort();
    drawChart('revenue', 'revenueChart', { type: 'line', data: { labels: months.length ? months : ['No paid data'], datasets: [{ label: 'Revenue', data: months.length ? months.map((month) => paidByMonth[month]) : [0], borderColor: '#b18ad0', backgroundColor: 'rgba(177,138,208,.2)', fill: true, tension: .3 }] }, options: { responsive: true, scales: { x: { ticks: { color: '#b1c8c4' } }, y: { beginAtZero: true, ticks: { color: '#b1c8c4' } } }, plugins: { legend: { labels: { color: '#d3e3df' } } } } });
  }

  async function saveRecord(table, id, changes, label) {
    const { error } = await client.from(table).update(changes).eq('id', id);
    if (error) { setStatus(`Could not update ${label}: ${error.message}`, 'status priority'); return; }
    setStatus(`${label} updated successfully.`);
    await loadDashboard();
  }

  async function loadDashboard() {
    if (!client) { showDashboard(false); setAuthStatus('Supabase configuration is missing.', 'status priority'); return; }
    setStatus('Loading live data…');
    const { data: { user } } = await client.auth.getUser();
    if (!user) { showDashboard(false); return; }
    const identity = await client.from('profiles').select('role').eq('id', user.id).single();
    if (identity.error || identity.data?.role !== 'admin') { showDashboard(false); setAuthStatus('This account is not an administrator.', 'status priority'); await client.auth.signOut(); return; }
    const [profiles, tickets, courses, affiliates, payments, orders, enrollments] = await Promise.all([
      client.from('profiles').select('id,full_name,business_name,role,created_at').order('created_at', { ascending: false }).limit(1000),
      client.from('support_tickets').select('id,ticket_number,client_id,subject,priority,status,updated_at,created_at').order('updated_at', { ascending: false }).limit(1000),
      client.from('courses').select('id,title,slug,published,created_at').order('created_at', { ascending: false }).limit(1000),
      client.from('affiliates').select('id,referral_code,commission_rate,approved,created_at').order('created_at', { ascending: false }).limit(1000),
      client.from('payments').select('id,order_id,provider_reference,status,amount,currency,created_at').order('created_at', { ascending: false }).limit(1000),
      client.from('orders').select('id,description,client_id,amount,currency,status,created_at').order('created_at', { ascending: false }).limit(1000),
      client.from('course_enrollments').select('course_id').limit(5000)
    ]);
    const result = { profiles, tickets, courses, affiliates, payments, orders, enrollments };
    const failed = Object.entries(result).find(([, response]) => response.error);
    if (failed) { console.error(failed[1].error); setStatus(`Could not load ${failed[0]}. Check administrator policies.`, 'status priority'); return; }
    const data = Object.fromEntries(Object.entries(result).map(([key, response]) => [key, response.data || []]));
    const profileMap = new Map(data.profiles.map((profile) => [profile.id, profile]));
    const orderMap = new Map(data.orders.map((order) => [order.id, order]));
    const enrollmentCounts = data.enrollments.reduce((counts, enrollment) => { counts[enrollment.course_id] = (counts[enrollment.course_id] || 0) + 1; return counts; }, {});
    dashboardData = { ...data, profileMap, orderMap, enrollmentCounts };
    $('#clientCount').textContent = data.profiles.filter((profile) => profile.role === 'client').length;
    $('#ticketCount').textContent = data.tickets.filter((ticket) => ['open', 'in_progress', 'awaiting_client'].includes(ticket.status)).length;
    $('#paymentCount').textContent = data.payments.filter((payment) => ['created', 'awaiting'].includes(payment.status)).length;
    $('#lastUpdated').textContent = `Updated ${new Date().toLocaleString()}`;
    setupTables(data);
    drawAnalytics(data);
    setStatus(`Loaded ${data.profiles.length} users, ${data.tickets.length} tickets and ${data.payments.length} payment records.`);
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
    setAuthStatus('Signed in. Checking administrator access…');
    await syncSession();
  });
  $('#refreshDashboard')?.addEventListener('click', loadDashboard);
  $('#signOut')?.addEventListener('click', async () => { await client.auth.signOut(); showDashboard(false); setAuthStatus('You have been signed out.'); });
  client.auth.onAuthStateChange((_event, session) => { if (!session) showDashboard(false); });

  document.addEventListener('input', (event) => { const table = event.target.dataset.tableSearch; if (table && tableStates[table]) { tableStates[table].page = 1; renderTable(table); } });
  document.addEventListener('change', (event) => {
    const sortTable = event.target.dataset.tableSort;
    const pageTable = event.target.dataset.pageSize;
    if (sortTable && tableStates[sortTable]) { tableStates[sortTable].sortKey = event.target.value; tableStates[sortTable].page = 1; renderTable(sortTable); }
    if (pageTable && tableStates[pageTable]) { tableStates[pageTable].pageSize = Number(event.target.value); tableStates[pageTable].page = 1; renderTable(pageTable); }
  });
  document.addEventListener('click', async (event) => {
    const csvButton = event.target.closest('[data-export-csv]');
    const pdfButton = event.target.closest('[data-export-pdf]');
    if (csvButton) { exportCsv(csvButton.dataset.exportCsv); return; }
    if (pdfButton) { exportPdf(pdfButton.dataset.exportPdf); return; }
    const prev = event.target.closest('[data-page-prev]');
    const next = event.target.closest('[data-page-next]');
    if (prev || next) { const table = (prev || next).dataset.pagePrev || (prev || next).dataset.pageNext; if (tableStates[table]) { tableStates[table].page += next ? 1 : -1; renderTable(table); } return; }
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === 'save-ticket') { const row = button.closest('tr'); await saveRecord('support_tickets', id, { status: row.querySelector('[data-ticket-status]').value, priority: row.querySelector('[data-ticket-priority]').value }, 'Ticket'); }
    if (button.dataset.action === 'save-client') { const row = button.closest('tr'); await saveRecord('profiles', id, { role: row.querySelector('[data-client-role]').value }, 'User role'); }
    if (button.dataset.action === 'toggle-course') await saveRecord('courses', id, { published: button.dataset.published !== 'true' }, 'Course publication');
    if (button.dataset.action === 'toggle-affiliate') await saveRecord('affiliates', id, { approved: button.dataset.approved !== 'true' }, 'Affiliate approval');
    if (button.dataset.action === 'save-payment') { const row = button.closest('tr'); await saveRecord('payments', id, { status: row.querySelector('[data-payment-status]').value }, 'Payment status'); }
  });
  syncSession();
})();
