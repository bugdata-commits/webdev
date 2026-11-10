(function(){
  const toast=(message)=>{let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}el.textContent=message;window.clearTimeout(el._timer);el._timer=window.setTimeout(()=>el.remove(),4200)};
  document.querySelectorAll('[data-auth-tabs]').forEach(group=>{
    const buttons=group.querySelectorAll('button[data-panel]');
    const panels=group.parentElement.querySelectorAll('[data-auth-panel]');
    buttons.forEach(button=>button.addEventListener('click',()=>{
      buttons.forEach(item=>item.classList.toggle('active',item===button));
      panels.forEach(panel=>panel.hidden=panel.dataset.authPanel!==button.dataset.panel);
    }));
  });
  document.querySelectorAll('form[data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{
    event.preventDefault();
    const message=form.dataset.demoForm==='ticket'?'Ticket captured in the prototype. Connect the backend to save and route it.':'This account flow is ready for backend authentication and password recovery.';
    toast(message);
  }));
  document.querySelectorAll('[data-filter]').forEach(input=>input.addEventListener('input',()=>{
    const query=input.value.toLowerCase();
    document.querySelectorAll(input.dataset.filter).forEach(row=>row.classList.toggle('hidden',query && !row.textContent.toLowerCase().includes(query)));
  }));
  document.querySelectorAll('[data-demo-action]').forEach(button=>button.addEventListener('click',()=>toast('This admin action is scaffolded and will connect to the database in the backend phase.')));
  const headings=document.querySelectorAll('[data-typing-headline]');
  if(!headings.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  headings.forEach((heading,index)=>{
    const textNodes=[];const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){if(node.nodeValue)textNodes.push({node,chars:Array.from(node.nodeValue)})}
    const fullText=textNodes.map(item=>item.chars.join('')).join('');if(!fullText)return;
    heading.setAttribute('aria-label',fullText);textNodes.forEach(item=>item.node.nodeValue='');heading.classList.add('typing-active');
    let started=false;const start=()=>{if(started)return;started=true;let visible=0;const total=fullText.length;const reveal=()=>{visible+=1;let remaining=visible;textNodes.forEach(item=>{const count=Math.min(remaining,item.chars.length);item.node.nodeValue=item.chars.slice(0,count).join('');remaining-=count});if(visible<total)window.setTimeout(reveal,Math.max(22,Math.min(42,1200/total)));else{textNodes.forEach(item=>item.node.nodeValue=item.chars.join(''));heading.classList.remove('typing-active');heading.classList.add('typing-complete')}};window.setTimeout(reveal,index*120+240)};
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){start();observer.disconnect()}},{threshold:.2});observer.observe(heading)}else start();
  });
})();
