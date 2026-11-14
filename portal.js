(function(){
  const toast=(message)=>{let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}el.textContent=message;window.clearTimeout(el._timer);el._timer=window.setTimeout(()=>el.remove(),4200)};
  const hasSupabase=window.supabase&&window.BUGDATA_SUPABASE_URL&&window.BUGDATA_SUPABASE_PUBLISHABLE_KEY;
  const client=hasSupabase?window.supabase.createClient(window.BUGDATA_SUPABASE_URL,window.BUGDATA_SUPABASE_PUBLISHABLE_KEY):null;
  const setAuthStatus=(message,kind='')=>{const el=document.getElementById('authStatus');if(el){el.textContent=message;el.className='notice '+kind}};
  const authForms=[...document.querySelectorAll('form[data-demo-form="auth"]')];
  const ticketForm=document.querySelector('form[data-demo-form="ticket"]');
  const userEmail=document.getElementById('signedInEmail');
  async function loadTickets(user){
    const list=document.getElementById('ticketList');
    if(!client||!list||!user)return;
    const {data,error}=await client.from('support_tickets').select('ticket_number,subject,status,priority,created_at').eq('client_id',user.id).order('created_at',{ascending:false}).limit(20);
    if(error){console.warn(error);return}
    if(!data.length){list.innerHTML='<li><div><strong>No tickets yet</strong><small>Submit a ticket and it will appear here.</small></div></li>';return}
    list.innerHTML=data.map(t=>`<li><div><strong>${escapeHtml(t.subject)}</strong><small class="ticket-id">BUG-${String(t.ticket_number).padStart(5,'0')} · ${new Date(t.created_at).toLocaleDateString()}</small></div><span class="status ${t.status==='resolved'||t.status==='closed'?'closed':t.status==='awaiting_client'?'waiting':'open'}">${escapeHtml(t.status.replace('_',' '))}</span></li>`).join('');
  }
  const escapeHtml=(value)=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function syncSession(){
    if(!client)return;
    const {data:{session}}=await client.auth.getSession();
    if(session){setAuthStatus(`Signed in as ${session.user.email}`,'');if(userEmail)userEmail.textContent=session.user.email;await loadTickets(session.user)}
    else setAuthStatus('Sign in to submit tickets and view your ticket history.','');
  }
  document.querySelectorAll('[data-auth-tabs]').forEach(group=>{
    const buttons=group.querySelectorAll('button[data-panel]');const panels=group.parentElement.querySelectorAll('[data-auth-panel]');
    buttons.forEach(button=>button.addEventListener('click',()=>{buttons.forEach(item=>item.classList.toggle('active',item===button));panels.forEach(panel=>panel.hidden=panel.dataset.authPanel!==button.dataset.panel)}));
  });
  if(client){
    syncSession();
    client.auth.onAuthStateChange((_event,session)=>{if(session)loadTickets(session.user);syncSession()});
    if(authForms[0])authForms[0].addEventListener('submit',async e=>{e.preventDefault();const email=document.getElementById('signin-email').value.trim(),password=document.getElementById('signin-password').value;const {error}=await client.auth.signInWithPassword({email,password});if(error)setAuthStatus(error.message,'status priority');else toast('Signed in successfully.')});
    if(authForms[1])authForms[1].addEventListener('submit',async e=>{e.preventDefault();const name=document.getElementById('signup-name').value.trim(),business=document.getElementById('signup-business').value.trim(),email=document.getElementById('signup-email').value.trim(),password=document.getElementById('signup-password').value;if(password.length<8){setAuthStatus('Choose a password with at least 8 characters.','status priority');return}const {error}=await client.auth.signUp({email,password,options:{data:{full_name:name,business_name:business}}});if(error)setAuthStatus(error.message,'status priority');else setAuthStatus('Account created. Check your email if confirmation is enabled.','')});
    if(authForms[2])authForms[2].addEventListener('submit',async e=>{e.preventDefault();const email=document.getElementById('reset-email').value.trim();const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(error)setAuthStatus(error.message,'status priority');else toast('Password reset instructions requested.')});
    if(ticketForm)ticketForm.addEventListener('submit',async e=>{e.preventDefault();const {data:{user}}=await client.auth.getUser();if(!user){setAuthStatus('Please sign in before submitting a ticket.','status priority');return}const payload={client_id:user.id,subject:document.getElementById('ticket-subject').value.trim(),category:document.getElementById('ticket-category').value,priority:document.getElementById('ticket-priority').value.toLowerCase().split(' ')[0]};const details=document.getElementById('ticket-details').value.trim();const {data:ticket,error}=await client.from('support_tickets').insert(payload).select('id').single();if(error){setAuthStatus(error.message,'status priority');return}const message=await client.from('ticket_messages').insert({ticket_id:ticket.id,author_id:user.id,body:details});if(message.error){setAuthStatus(message.error.message,'status priority');return}toast('Support ticket submitted.');ticketForm.reset();await loadTickets(user)});
  }else{
    document.querySelectorAll('form[data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();toast(form.dataset.demoForm==='ticket'?'Ticket saved. Sign in to view its status.':'Supabase account access is unavailable right now. Please try again shortly.')}));
  }
  document.querySelectorAll('[data-filter]').forEach(input=>input.addEventListener('input',()=>{const query=input.value.toLowerCase();document.querySelectorAll(input.dataset.filter).forEach(row=>row.classList.toggle('hidden',query&&!row.textContent.toLowerCase().includes(query)))}));
  document.querySelectorAll('[data-demo-action]').forEach(button=>button.addEventListener('click',()=>toast('This action is unavailable for the current account.')));
  const headings=document.querySelectorAll('[data-typing-headline]');
  if(!headings.length||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  headings.forEach((heading,index)=>{const textNodes=[];const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.nodeValue)textNodes.push({node,chars:Array.from(node.nodeValue)})}const fullText=textNodes.map(item=>item.chars.join('')).join('');if(!fullText)return;heading.setAttribute('aria-label',fullText);textNodes.forEach(item=>item.node.nodeValue='');heading.classList.add('typing-active');let started=false;const start=()=>{if(started)return;started=true;let visible=0;const total=fullText.length;const reveal=()=>{visible+=1;let remaining=visible;textNodes.forEach(item=>{const count=Math.min(remaining,item.chars.length);item.node.nodeValue=item.chars.slice(0,count).join('');remaining-=count});if(visible<total)window.setTimeout(reveal,Math.max(22,Math.min(42,1200/total)));else{textNodes.forEach(item=>item.node.nodeValue=item.chars.join(''));heading.classList.remove('typing-active');heading.classList.add('typing-complete')}};window.setTimeout(reveal,index*120+240)};if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){start();observer.disconnect()}},{threshold:.2});observer.observe(heading)}else start()});
})();
