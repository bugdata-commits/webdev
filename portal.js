(function(){
  const toast=(message)=>{let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}el.textContent=message;window.clearTimeout(el._timer);el._timer=window.setTimeout(()=>el.remove(),4200)};
  const hasSupabase=window.supabase&&window.BUGDATA_SUPABASE_URL&&window.BUGDATA_SUPABASE_PUBLISHABLE_KEY;
  const timedOutRequests=new WeakSet();
  const timeoutFetch=async(input,init={})=>{
    const controller=new AbortController();const parentSignal=init.signal;let timedOut=false;
    const abortFromParent=()=>controller.abort(parentSignal?.reason);
    if(parentSignal?.aborted)abortFromParent();else parentSignal?.addEventListener('abort',abortFromParent,{once:true});
    const timer=window.setTimeout(()=>{timedOut=true;controller.abort()},30000);
    try{return await window.fetch(input,{...init,signal:controller.signal})}
    catch(error){if(timedOut&&error&&(typeof error==='object'||typeof error==='function'))timedOutRequests.add(error);throw error}
    finally{window.clearTimeout(timer);parentSignal?.removeEventListener('abort',abortFromParent)}
  };
  const client=hasSupabase?window.supabase.createClient(window.BUGDATA_SUPABASE_URL,window.BUGDATA_SUPABASE_PUBLISHABLE_KEY,{global:{fetch:timeoutFetch}}):null;
  const setAuthStatus=(message,kind='')=>{const el=document.getElementById('authStatus');if(el){el.textContent=message;el.className='notice '+kind}};
  const authFailureText=(action,error)=>timedOutRequests.has(error)?`${action} timed out. Check your connection before trying again.`:`${action} failed: ${error?.message||'a network error occurred'}. Check your connection and try again.`;
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
    if(authForms[0])authForms[0].addEventListener('submit',async e=>{
      e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type="submit"]');if(button?.disabled)return;
      const email=document.getElementById('signin-email').value.trim(),password=document.getElementById('signin-password').value,originalButtonText=button?.textContent;
      if(button){button.disabled=true;button.textContent='Signing in…'}form.setAttribute('aria-busy','true');setAuthStatus('Signing in…','');
      try{const {error}=await client.auth.signInWithPassword({email,password});if(error){setAuthStatus(error.message,'status priority');return}setAuthStatus(`Signed in as ${email}.`,'');if(userEmail)userEmail.textContent=email;}
      catch(error){setAuthStatus(authFailureText('Sign-in',error),'status priority')}
      finally{form.removeAttribute('aria-busy');if(button){button.disabled=false;button.textContent=originalButtonText}}
    });
    if(authForms[1])authForms[1].addEventListener('submit',async e=>{
      e.preventDefault();
      const form=e.currentTarget,button=form.querySelector('button[type="submit"]');
      if(button?.disabled)return;
      const name=document.getElementById('signup-name').value.trim(),business=document.getElementById('signup-business').value.trim(),email=document.getElementById('signup-email').value.trim(),password=document.getElementById('signup-password').value;
      if(password.length<8){setAuthStatus('Choose a password with at least 8 characters.','status priority');return}
      const originalButtonText=button?.textContent;
      if(button){button.disabled=true;button.textContent='Creating account…'}
      form.setAttribute('aria-busy','true');setAuthStatus('Submitting your signup request…','');
      try{
        const {data,error}=await client.auth.signUp({email,password,options:{data:{full_name:name,business_name:business}}});
        if(error){setAuthStatus(error.message,'status priority');return}
        if(!data?.user){setAuthStatus('Supabase returned no account record, so signup was not confirmed. Please try again or contact support.','status priority');return}
        if(Array.isArray(data.user.identities)&&data.user.identities.length===0){setAuthStatus('This email may already be registered. Try signing in or use Forgot password. If you just submitted a signup, check your inbox for a confirmation message.','status priority');return}
        if(data.session){setAuthStatus('Account created and signed in.','');await syncSession();return}
        setAuthStatus(`Signup request accepted for ${email}. If email confirmation is required, check your inbox and Spam/Junk for a confirmation link.`,'');
      }catch(error){
        if(timedOutRequests.has(error))setAuthStatus('The signup request timed out. It may still have reached Supabase; check your inbox or try signing in before submitting again.','status priority');
        else setAuthStatus(`Signup could not be completed: ${error?.message||'a network error occurred'}. Check your connection and try again.`,'status priority');
      }finally{
        form.removeAttribute('aria-busy');if(button){button.disabled=false;button.textContent=originalButtonText}
      }
    });
    if(authForms[2])authForms[2].addEventListener('submit',async e=>{
      e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type="submit"]');if(button?.disabled)return;
      const email=document.getElementById('reset-email').value.trim(),originalButtonText=button?.textContent;
      if(button){button.disabled=true;button.textContent='Sending…'}form.setAttribute('aria-busy','true');setAuthStatus('Requesting password reset instructions…','');
      try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(error){setAuthStatus(error.message,'status priority');return}setAuthStatus('If an account matches this email, password reset instructions have been requested. Check your inbox and Spam/Junk.','');}
      catch(error){setAuthStatus(authFailureText('Password reset',error),'status priority')}
      finally{form.removeAttribute('aria-busy');if(button){button.disabled=false;button.textContent=originalButtonText}}
    });
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
