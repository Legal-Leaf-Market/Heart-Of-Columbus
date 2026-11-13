/* No dependencies, no tracking, no external requests. */
(() => {
  'use strict';
  const body=document.body, hero=document.querySelector('.hero');
  if(!hero || body.classList.contains('tj-upgrade')) return;
  body.classList.add('tj-upgrade');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let preference=false;
  try { preference=localStorage.getItem('tj-effects-paused')==='true'; } catch {}
  const svg=(id)=>`<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;
  const skip=document.createElement('a');skip.className='tj-skip';skip.href='#top';skip.textContent='Skip to content';body.prepend(skip);
  const copy=hero.querySelector('.wrap > div');
  const neon=document.createElement('div');neon.className='tj-neon';neon.setAttribute('aria-hidden','true');
  neon.innerHTML='<strong>ChopShop</strong><span>17TH STREET · COLUMBUS</span>';copy?.append(neon);
  const rule=document.createElement('div');rule.className='tj-razor-rule';rule.setAttribute('aria-hidden','true');rule.innerHTML=svg('i-razor');
  document.querySelector('#story h2')?.after(rule);
  const pole=document.createElement('span');pole.className='tj-pole';pole.setAttribute('aria-hidden','true');hero.querySelector('.art')?.append(pole);
  const fall=document.createElement('div');fall.className='tj-fall';fall.setAttribute('aria-hidden','true');
  const ids=['i-scissors','i-comb','i-razor','i-spark'];
  for(let i=0;i<12;i++) {
    const p=document.createElement('span');p.className='tj-fall-piece';p.innerHTML=svg(ids[i%4]);
    p.style.cssText=`--x:${(i*37+9)%98}%;--size:${22+i%4*8}px;--duration:${19+i%5*4}s;--delay:${-i*3.2}s;--drift:${i%2?55:-45}px;--spin:${i%2?110:-90}deg;--fall:${Math.max(hero.offsetHeight+180,1100)}px`;
    fall.append(p);
  }
  hero.prepend(fall);
  const controls=document.createElement('div');controls.className='tj-motion-controls';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='tj-motion-toggle';
  const note=document.createElement('small');note.textContent='Neon · falling graphics · motion';controls.append(toggle,note);copy?.append(controls);
  function update() {
    const paused=preference||reduced.matches;body.classList.toggle('tj-paused',paused);
    toggle.textContent=paused?'Turn effects on':'Pause effects';
    toggle.disabled=reduced.matches;note.textContent=reduced.matches?'Reduced motion enabled on your device':'Neon · falling graphics · motion';
  }
  toggle.addEventListener('click',()=>{preference=!preference;try{localStorage.setItem('tj-effects-paused',String(preference));}catch{}update();});
  reduced.addEventListener('change',update);update();
  const visibility=()=>body.classList.toggle('tj-hidden',document.hidden);document.addEventListener('visibilitychange',visibility);visibility();
  if('IntersectionObserver' in window) {
    const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('tj-offscreen',!e.isIntersecting)),{rootMargin:'80px'});
    [hero,...document.querySelectorAll('.stripe,.book-band')].forEach(e=>io.observe(e));
  }
  const nav=document.querySelector('nav.links'),header=document.querySelector('header.top .wrap');
  if(nav&&header) {
    nav.id=nav.id||'tj-section-navigation';const menu=document.createElement('button');menu.type='button';menu.className='tj-mobile-toggle';menu.textContent='Menu';menu.setAttribute('aria-controls',nav.id);menu.setAttribute('aria-expanded','false');header.insertBefore(menu,nav);
    const close=()=>{nav.classList.remove('tj-nav-open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu';};
    menu.addEventListener('click',()=>{const open=nav.classList.toggle('tj-nav-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu';});
    nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
    header.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('tj-nav-open')){close();menu.focus();}});
    window.matchMedia('(min-width:821px)').addEventListener('change',close);
  }
  // Keep particle fall distance correct when the hero stacks or font metrics change.
  if('ResizeObserver' in window) new ResizeObserver(()=>fall.querySelectorAll('.tj-fall-piece').forEach(p=>p.style.setProperty('--fall',`${hero.offsetHeight+180}px`))).observe(hero);
})();
