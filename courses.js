(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const catalog = {
    agentic: {
      title: 'Digital Marketing in the Agentic Era',
      modules: [
        { title: '01 · The digital growth map', intro: 'Turn a business goal into a clear audience, offer, message and next step.', steps: ['Describe one specific customer and the job they need done.', 'Write a one-sentence offer that names the value and the audience.', 'Map one path from discovery to enquiry, purchase and follow-up.'], questions: [
          { q: 'What should a useful marketing plan begin with?', a: ['A platform trend', 'A defined audience and business objective', 'The most expensive advert'], correct: 1 },
          { q: 'A call to action should primarily…', a: ['Tell someone the next useful step', 'List every service', 'Replace the offer'], correct: 0 },
          { q: 'Why map a customer journey?', a: ['To add more steps', 'To spot how people move from discovery to action', 'To avoid measuring outcomes'], correct: 1 }
        ]},
        { title: '02 · Content, channels & measurement', intro: 'Create a practical content rhythm and measure signals that help you improve.', steps: ['Choose one priority channel based on where your audience spends attention.', 'Plan a week of useful posts around one clear campaign objective.', 'Track reach, qualified enquiries and conversion—not vanity numbers alone.'], questions: [
          { q: 'Which is the strongest starting metric for a lead campaign?', a: ['Qualified enquiries', 'Number of colours in the design', 'Posting frequency alone'], correct: 0 },
          { q: 'A good content calendar is…', a: ['A repeatable plan linked to audience needs and goals', 'A guarantee that every post goes viral', 'Only a list of holidays'], correct: 0 },
          { q: 'When a post performs poorly, first…', a: ['Review the audience, message and evidence', 'Delete all future content', 'Assume the platform is broken'], correct: 0 }
        ]},
        { title: '03 · Agentic workflows with human oversight', intro: 'Design safe, useful AI workflows that assist people and escalate important decisions.', steps: ['Pick a bounded task with a clear input and desired output.', 'Define sources, permissions, review points and a human escalation path.', 'Test edge cases and keep a record of quality, safety and time saved.'], questions: [
          { q: 'What makes an AI workflow safer?', a: ['Unlimited access to all business data', 'Clear scope, permission limits and human review for consequential actions', 'No monitoring'], correct: 1 },
          { q: 'An agent should escalate when…', a: ['A request is ambiguous or outside its approved scope', 'It finishes a routine task', 'A result is easy to verify'], correct: 0 },
          { q: 'How should a new workflow be launched?', a: ['Test with realistic cases, monitor results and improve', 'Give it full autonomy immediately', 'Skip documentation'], correct: 0 }
        ]}
      ]
    },
    dreamer: {
      title: 'The Motivated Dreamer',
      modules: [
        { title: '01 · Choose a service people value', intro: 'Turn your interest and available device into one focused, sellable digital service.', steps: ['List skills, interests and tools you already have access to.', 'Ask three potential customers what takes time or causes frustration.', 'Choose one small service with a clear result and a realistic first customer.'], questions: [
          { q: 'A practical first service should…', a: ['Solve a clear problem for a specific person', 'Promise instant wealth', 'Require tools you do not have'], correct: 0 },
          { q: 'Why talk to potential customers before building?', a: ['To validate a real need and learn their language', 'To avoid choosing a service', 'To copy private information'], correct: 0 },
          { q: 'A good first offer is usually…', a: ['Specific and easy to understand', 'A list of every possible skill', 'Impossible to measure'], correct: 0 }
        ]},
        { title: '02 · Make a simple portfolio & offer', intro: 'Build a small proof-of-skill sample and describe what a customer receives.', steps: ['Create one original sample that demonstrates your chosen service.', 'Write the deliverable, timeline, revision boundary and price assumption.', 'Ask for feedback and improve clarity before sharing the offer.'], questions: [
          { q: 'A portfolio sample should…', a: ['Show your own work and the result you can deliver', 'Claim another person’s work', 'Hide what the service includes'], correct: 0 },
          { q: 'Why define revisions and deliverables?', a: ['To set fair expectations for both sides', 'To prevent feedback', 'To guarantee unlimited work'], correct: 0 },
          { q: 'A clear offer tells a buyer…', a: ['What they get and what happens next', 'Only your job title', 'That results are guaranteed'], correct: 0 }
        ]},
        { title: '03 · Find a first client responsibly', intro: 'Practise outreach, delivery and learning without spam or unrealistic promises.', steps: ['Identify a small list of relevant people or businesses.', 'Send a brief, personal message focused on a useful observation.', 'Deliver what was agreed, request feedback and document the next improvement.'], questions: [
          { q: 'Good outreach is…', a: ['Relevant, respectful and specific', 'A mass message sent repeatedly', 'A guarantee of income'], correct: 0 },
          { q: 'After delivering a project, ask for…', a: ['Honest feedback and permission before sharing work publicly', 'Account passwords', 'A guaranteed referral'], correct: 0 },
          { q: 'What is a responsible income claim?', a: ['Results depend on skill, demand and effort; no earnings are guaranteed', 'Everyone earns instantly', 'A phone automatically creates a business'], correct: 0 }
        ]}
      ]
    }
  };
  const authStatus = $('#courseStatus');
  const setStatus = (message, kind = '') => { if (authStatus) { authStatus.textContent = message; authStatus.dataset.kind = kind; } };
  const show = (el, value) => { if (el) el.hidden = !value; };
  let client = null;
  let user = null;
  try {
    if (window.supabase && window.BUGDATA_SUPABASE_URL && window.BUGDATA_SUPABASE_PUBLISHABLE_KEY) client = window.supabase.createClient(window.BUGDATA_SUPABASE_URL, window.BUGDATA_SUPABASE_PUBLISHABLE_KEY);
  } catch (error) { console.error('Could not initialize student account service.', error); }
  const pendingKey = 'bugdata-course-pending-v1';
  const keyFor = (kind) => `bugdata-course-${kind}-v1:${user?.id || 'visitor'}`;
  const readList = (key) => { try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const writeList = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const enrolled = () => readList(keyFor('enrollments'));
  const scores = () => { try { return JSON.parse(localStorage.getItem(keyFor('scores')) || '{}'); } catch { return {}; } };
  const percentFor = (id) => { const course = catalog[id], score = scores()[id] || {}; if (!course) return 0; return Math.round(course.modules.filter((_, i) => score[i] >= 70).length / course.modules.length * 100); };
  function renderEnrollment() {
    document.querySelectorAll('[data-enrol-course]').forEach((button) => {
      const id = button.dataset.enrolCourse, active = enrolled().includes(id);
      button.textContent = active ? 'Open learning area ↓' : 'Register interest ↗';
      button.dataset.active = String(active);
    });
  }
  function quizHtml(courseId, module, index) {
    const saved = scores()[courseId]?.[index];
    return `<form class="bd-quiz" data-quiz data-course="${courseId}" data-module="${index}"><h4>Quick progress check${saved !== undefined ? ` · best score ${saved}%` : ''}</h4>${module.questions.map((item, qIndex) => `<fieldset class="bd-question"><legend>${qIndex + 1}. ${esc(item.q)}</legend>${item.a.map((answer, aIndex) => `<label class="bd-answer"><input required type="radio" name="q${index}-${qIndex}" value="${aIndex}"><span>${esc(answer)}</span></label>`).join('')}</fieldset>`).join('')}<button class="bd-btn bd-btn-primary" type="submit">Check my answers</button><p class="bd-module-result" aria-live="polite">${saved !== undefined ? (saved >= 70 ? 'Module passed. Your best score is kept; you can retry any time.' : 'Try again to raise your best score to 70% or above.') : 'Pass with 70% or higher to mark this module complete.'}</p></form>`;
  }
  function renderLearning() {
    const area = $('#learningArea'); if (!area) return;
    if (!user) { area.innerHTML = '<div class="bd-card"><span class="bd-eyebrow">Student learning area</span><h2>Sign in to open your course.</h2><p>Choose a course above, then sign in or create a student account to continue.</p><a class="bd-btn bd-btn-primary" href="#student-account">Go to student sign in ↓</a></div>'; return; }
    const ids = enrolled();
    if (!ids.length) { area.innerHTML = `<div class="bd-card"><span class="bd-eyebrow">Your learning dashboard</span><h2>Choose your first course.</h2><p>Hi ${esc(user.user_metadata?.full_name || user.email || 'learner')}. Request a place from the course cards above to open its starter lessons and progress checks.</p><a class="bd-btn bd-btn-outline" href="#course-catalog">Browse courses ↑</a></div>`; return; }
    area.innerHTML = ids.map((id) => {
      const course = catalog[id]; if (!course) return '';
      const progress = percentFor(id), courseScores = scores()[id] || {};
      return `<article class="bd-card" id="learning-${id}"><span class="bd-eyebrow">Your course workspace</span><div class="bd-login-row"><div><h2>${esc(course.title)}</h2><p>Starter modules and short checks for your learning journey.</p></div><a class="bd-pill" href="assets/resources/${id}-learning-guide.pdf" download>Download PDF guide ↧</a></div><div class="bd-login-row" style="margin:18px 0 8px"><strong>Progress · ${progress}%</strong><span class="bd-note">${course.modules.filter((_,i)=>courseScores[i]>=70).length} of ${course.modules.length} checks passed</span></div><div class="bd-progress" role="progressbar" aria-label="${esc(course.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>${course.modules.map((module, index) => `<section class="bd-module"><h3>${esc(module.title)}</h3><p>${esc(module.intro)}</p><div class="bd-lesson-steps">${module.steps.map((step, n) => `<div class="bd-lesson"><strong>Step ${n + 1}</strong><br>${esc(step)}</div>`).join('')}</div>${quizHtml(id,module,index)}</section>`).join('')}</article>`;
    }).join('');
  }
  function renderAuth() {
    if (user) {
      const stored = enrolled();
      const synced = Array.isArray(user.user_metadata?.course_requests) ? user.user_metadata.course_requests.filter((id) => catalog[id]) : [];
      writeList(keyFor('enrollments'), [...new Set([...stored, ...synced])]);
    }
    show($('#signedInPanel'), Boolean(user)); show($('#authForms'), !user); show($('#signoutButton'), Boolean(user));
    const who = $('#studentIdentity'); if (who) who.textContent = user ? `Signed in as ${user.email}` : 'Not signed in';
    renderEnrollment(); renderLearning();
  }
  async function persistCourseRequest(id) {
    if (!catalog[id] || !user) return;
    const list = enrolled(); if (!list.includes(id)) list.push(id); writeList(keyFor('enrollments'), list);
    // Keep a request marker on the authenticated account; access is still a preview, not payment confirmation.
    const existing = Array.isArray(user.user_metadata?.course_requests) ? user.user_metadata.course_requests : [];
    let accountSynced = true;
    if (client && !existing.includes(id)) {
      const { data, error } = await client.auth.updateUser({ data: { course_requests: [...existing, id] } });
      if (error) { console.warn('Course request metadata did not sync.', error); accountSynced = false; }
      else if (data?.user) user = data.user;
    }
    setStatus(accountSynced
      ? 'Your course interest is saved to your student account. The lessons below are starter previews; the team will confirm your training place and payment separately.'
      : 'Your course request is saved on this device, but account sync failed. Please contact Bugdata to confirm your request. The lessons below are starter previews.', accountSynced ? 'success' : 'error');
    renderAuth();
    document.querySelector(`#learning-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-enrol-course]').forEach((button) => button.addEventListener('click', async () => {
    const id = button.dataset.enrolCourse;
    if (!client) { setStatus('Student sign-up is currently unavailable because account access is not configured. Contact Bugdata to register.', 'error'); return; }
    if (!user) { localStorage.setItem(pendingKey, id); setStatus(`Create a student account or sign in to request ${catalog[id].title}.`, ''); $('#student-account')?.scrollIntoView({ behavior: 'smooth' }); $('#signup-name')?.focus(); return; }
    await persistCourseRequest(id);
  }));
  $('#signinForm')?.addEventListener('submit', async (event) => {
    event.preventDefault(); if (!client) { setStatus('Account access is not configured in this browser.', 'error'); return; }
    setStatus('Signing in…'); const email = $('#signin-email').value.trim(), password = $('#signin-password').value;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) { setStatus(error.message, 'error'); return; }
    user = data.user; setStatus('Signed in. Your starter courses are ready.', 'success'); renderAuth();
    const pending = localStorage.getItem(pendingKey); if (pending && catalog[pending]) { localStorage.removeItem(pendingKey); await persistCourseRequest(pending); }
  });
  $('#signupForm')?.addEventListener('submit', async (event) => {
    event.preventDefault(); if (!client) { setStatus('Account access is not configured in this browser. Contact Bugdata to register.', 'error'); return; }
    const name = $('#signup-name').value.trim(), email = $('#signup-email').value.trim(), password = $('#signup-password').value;
    if (password.length < 8) { setStatus('Choose a password with at least 8 characters.', 'error'); return; }
    const pending = localStorage.getItem(pendingKey);
    setStatus('Creating your student account…');
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { full_name: name, account_type: 'student', ...(pending ? { course_interest: pending } : {}) } } });
    if (error) { setStatus(error.message, 'error'); return; }
    if (data.session && data.user) { user = data.user; renderAuth(); if (pending && catalog[pending]) { localStorage.removeItem(pendingKey); await persistCourseRequest(pending); } else setStatus('Student account created. Choose a course to request a place.', 'success'); }
    else setStatus('Account created. Check your email for the confirmation link, then return here to sign in. Your selected course will remain on this device.', 'success');
  });
  $('#signoutButton')?.addEventListener('click', async () => { if (client) await client.auth.signOut(); user = null; renderAuth(); setStatus('You are signed out. Your progress remains stored on this device for this account.', ''); });
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-quiz]'); if (!form) return;
    event.preventDefault(); if (!user) { setStatus('Sign in to save your progress.', 'error'); return; }
    const id = form.dataset.course, index = Number(form.dataset.module), module = catalog[id]?.modules[index]; if (!module) return;
    let correct = 0; module.questions.forEach((question, q) => { if (Number(new FormData(form).get(`q${index}-${q}`)) === question.correct) correct++; });
    const score = Math.round(correct / module.questions.length * 100), all = scores(); all[id] = all[id] || {}; all[id][index] = Math.max(score, Number(all[id][index]) || 0); localStorage.setItem(keyFor('scores'), JSON.stringify(all));
    const message = form.querySelector('.bd-module-result'); if (message) message.textContent = `${correct} of ${module.questions.length} correct · ${score}%. ${score >= 70 ? 'Module passed—nice work.' : 'Review the steps and try again; 70% is the pass mark.'}`;
    renderLearning();
  });
  document.querySelectorAll('[data-auth-switch]').forEach((button) => button.addEventListener('click', () => {
    const signup = button.dataset.authSwitch === 'signup'; show($('#signinForm'), !signup); show($('#signupForm'), signup);
    document.querySelectorAll('[data-auth-switch]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  }));
  const menu = $('#bdMenu'), nav = $('#bdLinks');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('bd-open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { nav.classList.remove('bd-open'); menu?.setAttribute('aria-expanded', 'false'); if (menu) menu.setAttribute('aria-label', 'Open navigation'); }));
  const year = $('#bdYear'); if (year) year.textContent = new Date().getFullYear();
  if (client) {
    client.auth.getSession().then(async ({ data }) => { user = data.session?.user || null; renderAuth(); setStatus(user ? 'Signed in. Request a course from the catalog to add its starter lessons.' : 'Sign in or create a student account to get started.', user ? 'success' : ''); const pending = localStorage.getItem(pendingKey); if (user && pending && catalog[pending]) { localStorage.removeItem(pendingKey); await persistCourseRequest(pending); } }).catch((error) => { console.error(error); setStatus('Could not reach the account service. Please retry when connected.', 'error'); });
    client.auth.onAuthStateChange((_event, session) => { user = session?.user || null; renderAuth(); });
  } else { setStatus('Student account service is unavailable. You can still review the course previews; registration needs the site account service.', 'error'); renderAuth(); }
})();
