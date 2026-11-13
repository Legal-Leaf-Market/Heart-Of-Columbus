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
  // Falling shop tools, drawn in the brand colours. Three depth layers: far
  // pieces are small, soft and slow; near ones are big, crisp and quicker.
  // Each piece falls (outer span) while it sways and tumbles (inner span).
  const ART={
    razor:'<g transform="rotate(-18 32 32)"><path d="M36 30 58 22q4-1 3 3l-3 5q-8 3-20 4z" fill="url(#tjg-steel)" stroke="#6d6a66" stroke-width=".7"/><path d="M40 31 57 25" stroke="#fff" stroke-opacity=".7" stroke-width="1"/><path d="M6 36q2-6 10-6h22q4 1 4 5t-4 5H16q-8 0-10-4z" fill="url(#tjg-ox)"/><circle cx="12" cy="35" r="1.7" fill="#d9b48a"/><circle cx="37" cy="35" r="1.7" fill="#d9b48a"/></g>',
    shears:'<path d="M31 36 38 3l4 2-7 32z" fill="url(#tjg-steel)" stroke="#6d6a66" stroke-width=".6"/><path d="M33 36 26 3l-4 2 7 32z" fill="url(#tjg-steel)" stroke="#6d6a66" stroke-width=".6"/><path d="M26 45 32 36 38 45" fill="none" stroke="#831d2c" stroke-width="4" stroke-linecap="round"/><circle cx="22" cy="51" r="7" fill="none" stroke="#831d2c" stroke-width="4"/><circle cx="42" cy="51" r="7" fill="none" stroke="#831d2c" stroke-width="4"/><circle cx="32" cy="35" r="2.6" fill="#d9b48a"/>',
    comb:'<rect x="6" y="20" width="52" height="11" rx="3" style="fill:var(--tj-ink)"/><path d="M9 30v14M13 30v10M17 30v14M21 30v10M25 30v14M29 30v10M33 30v14M37 30v10M41 30v14M45 30v10M49 30v14M53 30v10" style="stroke:var(--tj-ink)" stroke-width="2.4" stroke-linecap="round"/><path d="M10 23h44" stroke="#bc9471" stroke-width="1.2"/>',
    clippers:'<rect x="16" y="6" width="32" height="10" rx="2" fill="url(#tjg-steel)" stroke="#6d6a66" stroke-width=".6"/><path d="M19 6V3M23 6V3M27 6V3M31 6V3M35 6V3M39 6V3M43 6V3" stroke="#8a8782" stroke-width="1.6"/><rect x="18" y="14" width="28" height="45" rx="12" style="fill:var(--tj-ink)"/><rect x="18" y="33" width="28" height="5" fill="url(#tjg-brass)"/><circle cx="32" cy="47" r="3.2" fill="#831d2c"/><path d="M23 19v12" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>',
    brush:'<path d="M20 31q-4-17 12-25 16 8 12 25z" fill="#efe3cf" stroke="#cdbb9f" stroke-width="1"/><path d="M26 30q-1-12 6-20" stroke="#cdbb9f" stroke-width="1" fill="none"/><rect x="20" y="30" width="24" height="7" rx="1.5" fill="url(#tjg-brass)"/><path d="M23 37h18l-2 21q-7 4-14 0z" fill="url(#tjg-ox)"/>',
    pole:'<rect x="24" y="12" width="16" height="40" rx="3" fill="url(#tjp-pole)" style="stroke:var(--tj-ink)" stroke-width="1.5"/><rect x="21" y="6" width="22" height="7" rx="3" fill="url(#tjg-brass)"/><rect x="21" y="51" width="22" height="7" rx="3" fill="url(#tjg-brass)"/><circle cx="32" cy="5" r="3" fill="url(#tjg-brass)"/><path d="M28 15v34" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>',
    clip:'<g fill="none" style="stroke:var(--tj-ink)" stroke-width="2.2" stroke-linecap="round"><path d="M8 40q9-15 21-10t25-12"/><path d="M14 50q10-8 18-4t20-6" stroke-opacity=".8"/><path d="M20 26q6-8 14-6" stroke-opacity=".6"/></g>',
    spark:'<path d="M32 5 38 26l21 6-21 6-6 21-6-21-21-6 21-6z" fill="url(#tjg-brass)"/>'
  };
  const defs=document.createElementNS('http://www.w3.org/2000/svg','svg');defs.setAttribute('width','0');defs.setAttribute('height','0');defs.setAttribute('aria-hidden','true');defs.style.position='absolute';
  defs.innerHTML='<defs><linearGradient id="tjg-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f2ee"/><stop offset=".45" stop-color="#b9b6b0"/><stop offset=".55" stop-color="#e6e3de"/><stop offset="1" stop-color="#8d8a85"/></linearGradient><linearGradient id="tjg-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d3a8"/><stop offset=".5" stop-color="#bc9471"/><stop offset="1" stop-color="#8a6544"/></linearGradient><linearGradient id="tjg-ox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8323f"/><stop offset="1" stop-color="#5e1420"/></linearGradient><pattern id="tjp-pole" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="12" height="12" fill="#f4ebdd"/><rect width="4.5" height="12" fill="#831d2c"/><rect x="7" width="2.2" height="12" fill="#211f1c"/></pattern></defs>';
  body.prepend(defs);
  const art=(k)=>`<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${ART[k]}</svg>`;
  let seed=7;const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
  const pick=()=>{const r=rnd();return r<.28?'clip':r<.4?'spark':['razor','shears','comb','clippers','brush','pole'][Math.floor(rnd()*6)];};
  const LAYERS=[{share:.4,size:[24,34],o:.32,dur:[22,28],blur:.6,x:[2,98]},{share:.35,size:[38,52],o:.55,dur:[15,20],blur:0,x:[2,98]},{share:.25,size:[58,84],o:.78,dur:[10,13],blur:0,x:[54,98]}];
  const fall=document.createElement('div');fall.className='tj-fall';fall.setAttribute('aria-hidden','true');
  const count=window.innerWidth<600?14:30;
  const fallDist=()=>Math.max(hero.offsetHeight+180,900);
  for(let i=0;i<count;i++) {
    const u=i/count,L=u<LAYERS[0].share?LAYERS[0]:u<LAYERS[0].share+LAYERS[1].share?LAYERS[1]:LAYERS[2];
    const span=(a,b)=>a+rnd()*(b-a),dur=span(...L.dur);
    const p=document.createElement('span');p.className='tj-fall-piece';
    p.innerHTML=`<span class="tj-fall-sway">${art(pick())}</span>`;
    p.style.cssText=`--x:${span(...(window.innerWidth<600?[2,96]:L.x)).toFixed(1)}%;--size:${Math.round(span(...L.size))}px;--o:${L.o};--blur:${L.blur}px;--duration:${dur.toFixed(1)}s;--delay:${(-rnd()*dur).toFixed(1)}s;--drift:${Math.round(span(-70,70))}px;--fall:${fallDist()}px;--r0:${Math.round(span(-40,40))}deg;--r1:${Math.round(span(-40,40))}deg;--tumble:${Math.round(span(40,160))}deg;--sway:${span(2.4,4.8).toFixed(1)}s`;
    fall.append(p);
  }
  hero.prepend(fall);
  // With the soundtrack on, strong kicks snip a burst of clippings and sparks.
  let lastBurst=0;
  document.addEventListener('tj-beat',()=>{
    const now=performance.now();
    if(now-lastBurst<450||body.classList.contains('tj-paused')||reduced.matches||fall.querySelectorAll('.tj-burst').length>24) return;
    lastBurst=now;
    const x=10+rnd()*80,y=12+rnd()*55;
    for(let j=0;j<5;j++) {
      const b=document.createElement('span');b.className='tj-burst';
      const a=rnd()*Math.PI*2,d=40+rnd()*70;
      b.innerHTML=art(j%3?'clip':'spark');
      b.style.cssText=`left:${x}%;top:${y}%;--bx:${Math.round(Math.cos(a)*d)}px;--by:${Math.round(Math.sin(a)*d+30)}px;--bs:${Math.round(16+rnd()*16)}px;--br:${Math.round(rnd()*360)}deg`;
      b.addEventListener('animationend',()=>b.remove());fall.append(b);
    }
  });
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
