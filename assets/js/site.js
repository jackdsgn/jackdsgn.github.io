/* Jackdsgn · site · comportamento */
const WA_NUM='5534984259509';
const WA_MSG={
  hero:'Oi, Jack! Vi seu portfólio e quero fazer um vídeo. Pode me passar mais detalhes?',
  orcamento:'Oi, Jack! Quero um orçamento de vídeo. Meu projeto é:',
  contato:'Oi, Jack! Tenho uma ideia e quero dar movimento a ela.',
  sobre:'Oi, Jack! Li sobre você e quero conversar sobre um projeto.',
  caso:t=>`Oi, Jack! Vi o case "${t}" no seu portfólio e quero algo parecido para a minha marca.`
};
const wa=msg=>`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
document.querySelectorAll('[data-wa]').forEach(a=>a.href=wa(WA_MSG[a.dataset.wa]));
if('scrollRestoration' in history)history.scrollRestoration='manual';
const M='media/';
/* PROJECTS vem de assets/js/projects.js */
const bySlug=Object.fromEntries(PROJECTS.map(p=>[p.slug,p]));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* faixa de logos: repete o conjunto até cobrir a tela e duplica para o loop sem emenda */
(function(){
  const box=document.getElementById('logoMarquee'),ul=box&&box.querySelector('.logos');
  if(!ul||reduce)return;
  const base=[...ul.children];
  const fill=()=>{
    ul.querySelectorAll('[data-clone]').forEach(n=>n.remove());
    let half=[...base];
    while(half.length<40&&ul.scrollWidth<box.clientWidth*1.1){base.forEach(li=>{const c=li.cloneNode(true);c.dataset.clone='';c.setAttribute('aria-hidden','true');ul.appendChild(c);half.push(c)})}
    half.forEach(li=>{const c=li.cloneNode(true);c.dataset.clone='';c.setAttribute('aria-hidden','true');ul.appendChild(c)});
    ul.style.setProperty('--dur',Math.max(20,ul.scrollWidth/2/40)+'s');
  };
  const imgs=[...ul.querySelectorAll('img')];
  Promise.all(imgs.map(i=>i.complete?0:new Promise(r=>i.onload=i.onerror=r))).then(fill);
  let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(fill,200)});
})();

/* ---- mídia leve: vídeo só toca quando visível ---- */
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting&&!reduce){if(!v.src)v.src=v.dataset.src;v.play().catch(()=>{})}else v.pause()}),{rootMargin:'100px'});
function mediaEl(m){
  if(m.v){const v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.preload='none';v.poster=M+m.v+'.jpg';v.dataset.src=M+m.v+'.mp4';v.setAttribute('aria-hidden','true');vio.observe(v);return v}
  const i=new Image();i.src=M+m.i+'.jpg';i.alt='';i.loading='lazy';i.decoding='async';return i;
}

/* ---- parede do hero ---- */
(function(){
  const all=PROJECTS.flatMap(p=>p.media);
  const wall=document.getElementById('wall');
  const durs=[70,52,84,60,76,58,90,66];
  for(let c=0;c<8;c++){
    const col=document.createElement('div');col.className='col'+(c%2?' down':'');col.style.setProperty('--d',durs[c]+'s');
    const set=[0,1,2,3].map(k=>all[(c*5+k*3)%all.length]);
    [...set,...set].forEach(m=>{const t=document.createElement('div');t.className='tile';t.style.aspectRatio=m.ar;t.appendChild(mediaEl(m));col.appendChild(t)});
    wall.appendChild(col);
  }
})();

/* ---- ambiente de projetos: fileiras em velocidades diferentes ---- */
const ROWS=[
  {h:'s',dir:-1,speed:38,items:[['findata',0],['informei',0],['rubra',0],['saas-together',0],['ideal-cut120',0]]},
  {h:'l',dir:1,speed:26,items:[['fin-jack',0],['blips-vuze',0],['rubra',1],['escola-do-breno',0],['blips-acredita',0],['ideal-flatbed',0],['blips-i1600',0]]},
  {h:'s',dir:-1,speed:46,items:[['ideal-marca',0],['esmi',0],['voce-sabia',0],['esmi',1],['apresentacao-jack',0]]},
];
const rowsEl=document.getElementById('rows');const rowState=[];
ROWS.forEach(r=>{
  const row=document.createElement('div');row.className='row';row.dataset.h=r.h;
  const make=(clone)=>r.items.forEach(([slug,mi])=>{
    const p=bySlug[slug],m=p.media[mi];
    const a=document.createElement('a');a.className='card';a.href='#case-'+slug;a.style.setProperty('--ar',m.ar);
    if(clone){a.tabIndex=-1;a.setAttribute('aria-hidden','true')}else a.setAttribute('aria-label',p.title+', ver case');
    a.appendChild(mediaEl(m));
    a.insertAdjacentHTML('beforeend',`<span class="fmt">${m.fmt}</span><span class="meta"><span><b>${p.title}</b><small>${p.area}</small></span><span class="go">Ver case →</span></span>`);
    row.appendChild(a);
  });
  make(false);make(true);make(true);
  rowsEl.appendChild(row);
  rowState.push({el:row,dir:r.dir,base:r.speed,x:0,v:r.speed});
});
let slow=false;
rowsEl.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')slow=true});
rowsEl.addEventListener('pointerleave',()=>slow=false);
const coarse=matchMedia('(hover:none)').matches;
let last=performance.now(),stageVisible=true;
new IntersectionObserver(([e])=>stageVisible=e.isIntersecting).observe(rowsEl);
function tick(now){
  const dt=Math.min(64,now-last)/1000;last=now;
  if(stageVisible&&!reduce&&!document.getElementById('home').hidden){
    rowState.forEach(s=>{
      const target=s.base*(slow?.18:coarse?.45:1);
      s.v+=(target-s.v)*Math.min(1,dt*4);
      const w=s.el.scrollWidth/3;
      s.x+=s.v*dt*s.dir;
      if(s.x<=-w)s.x+=w; if(s.x>0)s.x-=w;
      s.el.style.transform=`translate3d(${s.x}px,0,0)`;
    });
  }
  requestAnimationFrame(tick);
}
rowState.forEach(s=>{if(s.dir>0)s.x=-s.el.scrollWidth/3});
requestAnimationFrame(tick);

/* ---- serviços: baralho de cartas (ícones do portfólio atual) ---- */
const ICONS={
 motion:'<path data-fill d="M16.5 0H1.5C.67 0 0 .67 0 1.5V12c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5V1.5C18 .67 17.33 0 16.5 0ZM7.5 9.75v-6L12 6.75Z" transform="translate(3 4.5)"/><path data-stroke d="M16.5 0C17.33 0 18 .67 18 1.5V12c0 .83-.67 1.5-1.5 1.5h-15C.67 13.5 0 12.83 0 12V1.5C0 .67.67 0 1.5 0Z" transform="translate(3 4.5)"/><path data-stroke d="M6 0H0" transform="translate(9 21)"/><path data-stroke d="M4.5 3 0 0v6Z" transform="translate(10.5 8.25)"/>',
 ux:'<path data-fill d="M0 9.75V1.5C0 .67.67 0 1.5 0h15c.83 0 1.5.67 1.5 1.5v8.25Z" transform="translate(3 4.5)"/><path data-stroke d="M16.5 0C17.33 0 18 .67 18 1.5V12c0 .83-.67 1.5-1.5 1.5h-15C.67 13.5 0 12.83 0 12V1.5C0 .67.67 0 1.5 0Z" transform="translate(3 4.5)"/><path data-stroke d="M6 0H0" transform="translate(9 21)"/><path data-stroke d="M0 0h18" transform="translate(3 14.25)"/><path data-stroke d="M0 0v3" transform="translate(12 18)"/>',
 art:'<path data-fill d="M10.5 0 9 7.5l6 2.25L4.5 21 6 13.5 0 11.25Z" transform="translate(4.5 1.5)"/><path data-stroke d="M10.5 0 9 7.5l6 2.25L4.5 21 6 13.5 0 11.25Z" transform="translate(4.5 1.5)"/>',
 brand:'<path data-fill d="M5.25 8.25 0 3 2.78.22a.75.75 0 0 1 1.06 0l4.19 4.19a.75.75 0 0 1 0 1.06Z" transform="translate(12.75 3)"/><path data-stroke d="M4.94 17.25H.75A.75.75 0 0 1 0 16.5v-4.19c0-.2.08-.39.22-.53L11.78.22a.75.75 0 0 1 1.06 0l4.19 4.19a.75.75 0 0 1 0 1.06L5.47 17.03a.75.75 0 0 1-.53.22Z" transform="translate(3.75 3)"/><path data-stroke d="m0 0 5.25 5.25" transform="translate(12.75 6)"/><path data-stroke d="M9 0 0 9" transform="translate(6.375 8.625)"/>'
};
const SVC=[['motion','Motion design','Animações 2D e vinhetas que tornam experiências digitais mais dinâmicas, envolventes e memoráveis.'],['ux','UX Motion e microinterações','Interfaces com movimento intencional: transições, feedback visual e microinterações que guiam o usuário.'],['art','Direção de arte','Construção de cenas, storytelling visual e direção criativa por trás de cada animação.'],['brand','Brand motion','Estudo e animação de identidades visuais: marcas ganhando movimento e vida.']];
(function(){
  const deck=document.getElementById('deck'),btn=document.getElementById('deckToggle'),hint=document.getElementById('deckHint');
  deck.innerHTML=SVC.map(([k,t,d],i)=>{const c=i%2?'var(--signal)':'var(--violet-text)';
    return `<article class="scard${i%2?' blue':''}" tabindex="0" aria-label="${t}"><div class="top"><span>Serviço</span><span>0${i+1}</span></div><span class="ico"><svg viewBox="0 0 24 24" fill="${c}" stroke="${c}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k].replace(/data-stroke /g,'data-stroke fill="none" ').replace(/data-fill /g,'data-fill stroke="none" ')}</svg></span><h3>${t}</h3><p>${d}</p></article>`}).join('');
  const cards=[...deck.children];
  let order=[0,1,2,3],open=reduce,closeT;
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
  hint.textContent=finePointer?'Passe o mouse para abrir as cartas. Arraste uma delas para dar uma olhada.':'Toque para abrir. Arraste a carta da frente para ver a próxima.';
  const pos=[];
  function layout(){
    const W=deck.clientWidth,cw=Math.min(260,W-24),ch=Math.round(cw*1.3),g=20;
    deck.style.setProperty('--cw',cw+'px');deck.style.setProperty('--ch',ch+'px');
    let H;
    if(!open){
      H=ch+70;
      order.forEach((ci,depth)=>{pos[ci]={x:(depth-1.5)*-10,y:depth*-9+14,r:[-2,4,-6,7][depth],z:10-depth}});
    }else if(W>=4*cw+3*g){
      H=ch+90;
      cards.forEach((_,i)=>{const o=i-1.5;pos[i]={x:o*(cw+g),y:Math.abs(o)*18-10,r:o*3.2,z:5}});
    }else if(W>=2*cw+g){
      H=2*ch+g+60;
      cards.forEach((_,i)=>{pos[i]={x:((i%2)-.5)*(cw+g),y:(Math.floor(i/2)-.5)*(ch+g),r:i%2?2:-2,z:5}});
    }else{
      H=4*ch+3*16+40;
      cards.forEach((_,i)=>{pos[i]={x:0,y:(i-1.5)*(ch+16),r:i%2?1.5:-1.5,z:5}});
    }
    deck.style.setProperty('--dh',H+'px');
    cards.forEach((c,i)=>{if(c.classList.contains('dragging'))return;const p=pos[i];c.style.zIndex=p.z;c.style.transform=`translate(-50%,-50%) translate(${p.x}px,${p.y}px) rotate(${p.r}deg)`});
    deck.classList.toggle('open',open);btn.textContent=open?'Empilhar as cartas':'Abrir as cartas';btn.setAttribute('aria-expanded',open);
  }
  const setOpen=v=>{open=v;layout()};
  btn.onclick=()=>setOpen(!open);
  if(finePointer){
    deck.addEventListener('pointerenter',()=>{clearTimeout(closeT);setOpen(true)});
    deck.addEventListener('pointerleave',()=>{closeT=setTimeout(()=>{if(!deck.querySelector('.dragging'))setOpen(false)},350)});
  }
  cards.forEach((c,i)=>{
    let sx,sy,dx=0,dy=0,down=false;
    c.addEventListener('pointerdown',e=>{down=true;sx=e.clientX;sy=e.clientY;dx=dy=0;c.setPointerCapture(e.pointerId)});
    c.addEventListener('pointermove',e=>{
      if(!down)return;dx=e.clientX-sx;dy=e.clientY-sy;
      if(Math.hypot(dx,dy)<6&&!c.classList.contains('dragging'))return;
      c.classList.add('dragging');c.style.zIndex=20;
      const p=pos[i];c.style.transform=`translate(-50%,-50%) translate(${p.x+dx}px,${p.y+dy}px) rotate(${p.r+dx*.06}deg) scale(1.04)`;
    });
    const up=()=>{
      if(!down)return;down=false;
      const dragged=c.classList.contains('dragging');c.classList.remove('dragging');
      if(!dragged){ if(!open&&!finePointer)setOpen(true); layout(); return }
      if(!open&&order[0]===i&&Math.hypot(dx,dy)>80){order=[...order.slice(1),i]}
      layout();
    };
    c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  });
  addEventListener('resize',layout);
  layout();
})();

const LOGOS={adobepremierepro:"M10.15 8.42a2.93 2.93 0 00-1.18-.2 13.9 13.9 0 00-1.09.02v3.36l.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03a1.45 1.45 0 00-.93-1.46zM19.75.3H4.25A4.25 4.25 0 000 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.09 11.65c-.4.56-.96.98-1.61 1.22-.68.25-1.43.34-2.25.34l-.5-.01-.43-.01v3.21a.12.12 0 01-.11.14H5.82c-.08 0-.12-.04-.12-.13V6.42c0-.07.03-.11.1-.11l.56-.01.76-.02.87-.02.91-.01c.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.15.42.23.85.23 1.3 0 .86-.2 1.57-.6 2.13zm6.82-3.15v1.95c0 .08-.05.11-.16.11a4.35 4.35 0 00-1.92.37c-.19.09-.37.21-.51.37v5.1c0 .1-.04.14-.13.14h-1.97a.14.14 0 01-.16-.12v-5.58l-.01-.75-.02-.78c0-.23-.02-.45-.04-.68a.1.1 0 01.07-.11h1.78c.1 0 .18.07.2.16a3.03 3.03 0 01.13.92c.3-.35.67-.64 1.08-.86a3.1 3.1 0 011.52-.39c.07-.01.13.04.14.11v.04z",blender:"M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626",claude:"m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",openai:"M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",adobeaftereffects:"M8.54 10.73c-.1-.31-.19-.61-.29-.92s-.19-.6-.27-.89c-.08-.28-.15-.54-.22-.78h-.02c-.09.43-.2.86-.34 1.29-.15.48-.3.98-.46 1.48-.13.51-.29.98-.44 1.4h2.54c-.06-.21-.14-.46-.23-.72-.09-.27-.18-.56-.27-.86zm8.58-.29c-.55-.03-1.07.26-1.33.76-.12.23-.19.47-.22.72h2.109c.26 0 .45 0 .57-.01.08-.01.16-.03.23-.08v-.1c0-.13-.021-.25-.061-.37-.178-.56-.708-.94-1.298-.92zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.04 16.511h-2.09c-.07.01-.14-.041-.16-.11l-.82-2.4H5.92l-.76 2.36c-.02.09-.1.15-.19.14H3.09c-.11 0-.14-.06-.11-.18L6.2 7.39c.03-.1.06-.19.1-.31.04-.21.06-.43.06-.65-.01-.05.03-.1.08-.11h2.59c.07 0 .12.03.13.08l3.65 10.25c.03.11.001.161-.1.161zm7.851-3.991c-.021.189-.031.33-.041.42-.01.07-.069.13-.14.13-.06 0-.17.01-.33.021-.159.02-.35.029-.579.029-.23 0-.471-.04-.73-.04h-3.17c.039.31.14.62.31.89.181.271.431.48.729.601.4.17.841.26 1.281.25.35-.011.699-.04 1.039-.11.311-.039.61-.119.891-.23.05-.039.08-.02.08.08v1.531c0 .039-.01.08-.021.119-.021.03-.04.051-.069.07-.32.14-.65.24-1 .3-.471.09-.94.13-1.42.12-.761 0-1.4-.12-1.92-.35-.49-.211-.921-.541-1.261-.95-.319-.39-.55-.83-.69-1.31-.14-.471-.209-.961-.209-1.461 0-.539.08-1.07.25-1.59.16-.5.41-.96.75-1.37.33-.4.739-.72 1.209-.95.471-.23 1.03-.31 1.67-.31.531-.01 1.06.09 1.55.31.41.18.77.45 1.05.8.26.34.47.72.601 1.14.129.4.189.81.189 1.22 0 .24-.01.45-.019.64z",adobephotoshop:"M9.85 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01-.2-.01-.34 0-.41.01v3.36c.14.01.27.02.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03.01-.31-.07-.62-.23-.89-.17-.26-.41-.46-.7-.57zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.899c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.391 11.65c-.399.56-.959.98-1.609 1.22-.68.25-1.43.34-2.25.34-.24 0-.4 0-.5-.01s-.24-.01-.43-.01v3.209c.01.07-.04.131-.11.141H5.52c-.08 0-.12-.041-.12-.131V6.42c0-.07.03-.11.1-.11.17 0 .33 0 .56-.01.24-.01.49-.01.76-.02s.56-.01.87-.02c.31-.01.61-.01.91-.01.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.149.42.229.85.229 1.3.001.86-.199 1.57-.6 2.13zm7.091 3.89c-.28.4-.671.709-1.12.891-.49.209-1.09.318-1.811.318-.459 0-.91-.039-1.359-.129-.35-.061-.7-.17-1.02-.32-.07-.039-.121-.109-.111-.189v-1.74c0-.029.011-.07.041-.09.029-.02.06-.01.09.01.39.23.8.391 1.24.49.379.1.779.15 1.18.15.38 0 .65-.051.83-.141.16-.07.27-.24.27-.42 0-.141-.08-.27-.24-.4-.16-.129-.489-.279-.979-.471-.51-.18-.979-.42-1.42-.719-.31-.221-.569-.51-.761-.85-.159-.32-.239-.67-.229-1.021 0-.43.12-.84.341-1.21.25-.4.619-.72 1.049-.92.469-.239 1.059-.349 1.769-.349.41 0 .83.03 1.24.09.3.04.59.12.86.23.039.01.08.05.1.09.01.04.02.08.02.12v1.63c0 .04-.02.08-.05.1-.09.02-.14.02-.18 0-.3-.16-.62-.27-.96-.34-.37-.08-.74-.13-1.12-.13-.2-.01-.41.02-.601.07-.129.03-.24.1-.31.2-.05.08-.08.18-.08.27s.04.18.101.26c.09.11.209.2.34.27.229.12.47.23.709.33.541.18 1.061.43 1.541.73.33.209.6.49.789.83.16.318.24.67.23 1.029.011.471-.129.94-.389 1.331z",adobeillustrator:"M10.53 10.73c-.1-.31-.19-.61-.29-.92-.1-.31-.19-.6-.27-.89-.08-.28-.15-.54-.22-.78h-.02c-.09.43-.2.86-.34 1.29-.15.48-.3.98-.46 1.48-.14.51-.29.98-.44 1.4h2.54c-.06-.211-.14-.46-.23-.721-.09-.269-.18-.559-.27-.859zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zM14.7 16.83h-2.091c-.069.01-.139-.04-.159-.11l-.82-2.38H7.91l-.76 2.35c-.02.09-.1.15-.19.141H5.08c-.11 0-.14-.061-.11-.18L8.19 7.38c.03-.1.06-.21.1-.33.04-.21.06-.43.06-.65-.01-.05.03-.1.08-.11h2.59c.08 0 .12.03.13.08l3.65 10.3c.03.109 0 .16-.1.16zm3.4-.15c0 .11-.039.16-.129.16H16.01c-.1 0-.15-.061-.15-.16v-7.7c0-.1.041-.14.131-.14h1.98c.09 0 .129.05.129.14v7.7zm-.209-9.03c-.231.24-.571.37-.911.35-.33.01-.65-.12-.891-.35-.23-.25-.35-.58-.34-.92-.01-.34.12-.66.359-.89.242-.23.562-.35.892-.35.391 0 .689.12.91.35.22.24.34.56.33.89.01.34-.11.67-.349.92z",adobepremierepro:"M10.15 8.42a2.93 2.93 0 00-1.18-.2 13.9 13.9 0 00-1.09.02v3.36l.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03a1.45 1.45 0 00-.93-1.46zM19.75.3H4.25A4.25 4.25 0 000 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.09 11.65c-.4.56-.96.98-1.61 1.22-.68.25-1.43.34-2.25.34l-.5-.01-.43-.01v3.21a.12.12 0 01-.11.14H5.82c-.08 0-.12-.04-.12-.13V6.42c0-.07.03-.11.1-.11l.56-.01.76-.02.87-.02.91-.01c.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.15.42.23.85.23 1.3 0 .86-.2 1.57-.6 2.13zm6.82-3.15v1.95c0 .08-.05.11-.16.11a4.35 4.35 0 00-1.92.37c-.19.09-.37.21-.51.37v5.1c0 .1-.04.14-.13.14h-1.97a.14.14 0 01-.16-.12v-5.58l-.01-.75-.02-.78c0-.23-.02-.45-.04-.68a.1.1 0 01.07-.11h1.78c.1 0 .18.07.2.16a3.03 3.03 0 01.13.92c.3-.35.67-.64 1.08-.86a3.1 3.1 0 011.52-.39c.07-.01.13.04.14.11v.04z",framer:"M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z",figma:"M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z",blender:"M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626"};

/* ---- stack: blocos com física (Matter.js carregado só quando a seção aparece) ---- */
const HIGGSFIELD='<svg viewBox="-2 -2 24 24" aria-hidden="true"><path fill="#D1FE17" d="M18.3498 9.83713L18.3339 9.65759C18.1831 7.93447 17.0963 4.69261 14.0816 4.69261C11.8445 4.69261 10.1545 6.97097 8.66311 8.97967C7.47302 10.5883 6.4419 11.9683 5.3073 11.9683C5.00574 11.9357 4.61708 11.7805 4.3792 11.4294C4.16497 11.1108 4.10948 10.7026 4.22046 10.2126C4.39489 9.43684 5.39463 8.7182 6.44963 7.95063C7.02864 7.54238 7.6238 7.10955 8.03634 6.69311C9.22643 5.5091 9.82932 4.65164 9.82932 3.2717C9.82932 1.89176 9.09157 1.20565 8.47276 0.911636C7.23514 0.323844 5.41851 0.666781 4.26026 1.69583C4.08583 1.85922 3.91117 2.01418 3.75243 2.16119C2.58622 3.23097 1.80094 3.95781 0 3.40232V5.63972C2.38791 6.72588 4.39512 4.65164 5.15675 3.69633C5.74372 3.06758 6.36253 2.70006 6.82283 2.70006H6.84671C7.05298 2.70825 7.22741 2.78995 7.35454 2.93696C7.56081 3.18204 7.64018 3.46786 7.60038 3.78622C7.51305 4.45594 6.83875 5.23967 5.60113 6.09713C4.14928 7.10159 1.7218 8.78374 1.53122 10.8987C1.3884 12.4177 2.15003 13.9365 3.34012 14.5243C6.11669 15.8798 7.80665 13.5444 9.5994 11.0783C10.9719 9.1756 12.273 7.37103 14.0818 7.37103C15.7081 7.37103 16.311 8.75916 16.311 9.63301V9.80459L16.1523 9.83713C12.2095 10.5558 10.0595 14.3611 10.0595 16.1167C10.0595 17.8724 11.5034 19.375 13.2804 19.375C15.359 19.375 17.9293 17.5458 18.3419 12.4013L18.3578 12.2136H20V9.83737H18.3498V9.83713ZM16.1998 12.4746C15.8826 15.5531 14.3513 16.9904 13.4232 16.9904C13.0027 16.9904 12.4158 16.631 12.4158 15.9615C12.4158 15.2104 13.5026 12.932 15.946 12.2543L16.2316 12.1808L16.1998 12.4748V12.4746Z"/></svg>';
const MAGNIFIC='<svg viewBox="260 220 560 410" aria-hidden="true"><path fill="#fff" d="M380 235h107l53 130 54-130h106l107 380H673L540 445 407 615H274Z"/></svg>';
const TOOLS=[
 ['Claude · IA','claude','#D97757','#fff'],['Higgsfield · IA','higgsfield','#0A0A0A','#D1FE17'],['Magnific · IA','magnific','#000','#fff'],['ChatGPT · IA','openai','#fff','#000'],
 ['After Effects','adobeaftereffects','#00005B','#9999FF','adobe'],['Premiere Pro','adobepremierepro','#00005B','#9999FF','adobe'],['Photoshop','adobephotoshop','#001E36','#31A8FF','adobe'],['Illustrator','adobeillustrator','#330000','#FF9A00','adobe'],
 ['Blender','blender','#E87D0D','#fff'],['Framer','framer','#0055FF','#fff'],['Figma','figma','#1E1E1E','#fff']];
const SKILLS=[['Motion 2D','hot'],['Animação de UI',''],['Direção de arte',''],['Vinhetas',''],['Storyboard',''],['Sound design','cool'],['Brand motion',''],['IA generativa','hot'],['Edição de vídeo',''],['Microinterações','']];
(function(){
  const pit=document.getElementById('pit');
  const chips=[];
  for(let copy=0;copy<2;copy++){
  TOOLS.forEach(([name,slug,bg,fg,kind])=>{
    const el=document.createElement('div');el.className='chip tool'+(kind?' adobe':'');el.setAttribute('role','img');el.setAttribute('aria-label',name);
    if(kind){el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="18" fill="${fg}"/><path fill="${bg}" d="${LOGOS[slug]}"/></svg>`;el.style.background='transparent'}
    else{el.style.background=bg;el.innerHTML=slug==='magnific'?MAGNIFIC:slug==='higgsfield'?HIGGSFIELD:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${fg}" d="${LOGOS[slug]}"/></svg>`}
    if(bg==='#000'||bg==='#1E1E1E'||bg==='#0A0A0A')el.style.boxShadow='inset 0 0 0 1px rgba(245,243,255,.18)';
    el.insertAdjacentHTML('beforeend',`<span class="tip">${name}</span>`);
    chips.push({el,kind:'tool'});
  });
  SKILLS.forEach(([t,c])=>{const el=document.createElement('div');el.className='chip skill '+c;el.textContent=t;chips.push({el,kind:'skill'})});
  if(copy)chips.slice(chips.length/2).forEach(c=>c.el.setAttribute('aria-hidden','true'));
  }
  // ordem embaralhada para a queda
  chips.sort(()=>Math.random()-.5).forEach(c=>pit.appendChild(c.el));
  if(reduce)return;

  let started=false,running=false;
  new IntersectionObserver(([e])=>{running=e.isIntersecting;if(e.isIntersecting&&!started){started=true;load()}},{threshold:.25}).observe(pit);
  function load(){
    if(window.Matter)return start();
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';s.onload=start;document.head.appendChild(s);
  }
  function start(){
    const {Engine,Bodies,Body,Composite,Constraint,Query}=Matter;
    const engine=Engine.create();engine.gravity.y=1.1;
    const world=engine.world;
    let W=pit.clientWidth,H=pit.clientHeight,walls=[];
    function buildWalls(){
      Composite.remove(world,walls);
      const t=200;
      walls=[Bodies.rectangle(W/2,H+t/2,W*3,t,{isStatic:true}),Bodies.rectangle(-t/2,H/2-400,t,H*3,{isStatic:true}),Bodies.rectangle(W+t/2,H/2-400,t,H*3,{isStatic:true}),Bodies.rectangle(W/2,-900-t/2,W*3,t,{isStatic:true})];
      Composite.add(world,walls);
    }
    buildWalls();
    // mede os chips antes de virar absoluto
    chips.forEach(c=>{c.w=c.el.offsetWidth;c.h=c.el.offsetHeight});
    pit.classList.add('live');
    chips.forEach((c,i)=>{
      const r=c.kind==='tool'?c.w*.22:c.h/2;
      c.body=Bodies.rectangle(40+Math.random()*(W-80),-80-i*70,c.w,c.h,{chamfer:{radius:r},restitution:.35,friction:.4,frictionAir:.012,density:c.kind==='tool'?.0025:.0018,angle:(Math.random()-.5)*.8});
      c.body.plugin={chip:c};c.cool=0;
      c.el.style.transform=`translate(-200px,-200px)`;
    });
    chips.forEach((c,i)=>setTimeout(()=>{Body.setPosition(c.body,{x:c.w/2+8+Math.random()*Math.max(1,W-c.w-16),y:-c.h-20-Math.random()*60});Composite.add(world,c.body)},i*55));
    const bodies=()=>chips.map(c=>c.body);

    // arrastar e arremessar
    let drag=null;
    const local=e=>{const r=pit.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
    chips.forEach(c=>{
      c.el.addEventListener('pointerdown',e=>{
        e.preventDefault();c.el.setPointerCapture(e.pointerId);const p=local(e);
        drag=Constraint.create({pointA:p,bodyB:c.body,pointB:{x:p.x-c.body.position.x,y:p.y-c.body.position.y},stiffness:.2,damping:.08,length:0});
        Composite.add(world,drag);
      });
      c.el.addEventListener('pointermove',e=>{if(drag&&drag.bodyB===c.body)drag.pointA=local(e)});
      const end=()=>{if(drag&&drag.bodyB===c.body){Composite.remove(world,drag);drag=null}};
      c.el.addEventListener('pointerup',end);c.el.addEventListener('pointercancel',end);
    });
    // passar o mouse: os blocos pulam
    let last={x:0,y:0,t:0};
    pit.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse'||drag)return;
      const p=local(e),now=performance.now(),dt=Math.max(16,now-last.t),vx=(p.x-last.x)/dt,vy=(p.y-last.y)/dt;last={...p,t:now};
      chips.forEach(c=>{
        const b=c.body,dx=b.position.x-p.x,dy=b.position.y-p.y,d=Math.hypot(dx,dy);
        if(d<Math.max(c.w,c.h)*.75&&now>c.cool){
          c.cool=now+350;
          Body.setVelocity(b,{x:b.velocity.x+vx*6+(dx/d||0)*2,y:-7-Math.random()*5});
          Body.setAngularVelocity(b,(Math.random()-.5)*.25);
        }
      });
    });
    // toque rápido num bloco também faz pular
    pit.addEventListener('click',e=>{const p=local(e);Query.point(bodies(),p).forEach(b=>{Body.setVelocity(b,{x:(Math.random()-.5)*6,y:-12});Body.setAngularVelocity(b,(Math.random()-.5)*.3)})});

    addEventListener('resize',()=>{W=pit.clientWidth;H=pit.clientHeight;buildWalls();chips.forEach(c=>{if(c.body.position.x>W-20)Body.setPosition(c.body,{x:W-60,y:c.body.position.y})})});

    let prev=performance.now(),acc=0;const step=1000/60;
    (function frame(now){
      acc+=Math.min(100,now-prev);prev=now;
      if(running){while(acc>=step){Engine.update(engine,step);acc-=step}}else acc=0;
      chips.forEach(c=>{const b=c.body;c.el.style.transform=`translate(${b.position.x-c.w/2}px,${b.position.y-c.h/2}px) rotate(${b.angle}rad)`});
      requestAnimationFrame(frame);
    })(prev);
  }
})();


/* ---- reveal no scroll (só o que começa abaixo da dobra) ---- */
function arm(root){
  if(reduce)return;
  const els=root.querySelectorAll('.stage-head,.sec-head,.blk,.pilar,.gallery figure,.cta h2,.funil li');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');e.target.classList.remove('pre');io.unobserve(e.target)}}),{threshold:.15});
  els.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pre');io.observe(el)}});
}

/* ---- olhinhos seguindo o mouse ---- */
(function(){
  const eyes=[...document.querySelectorAll('.eye')];
  let tx=0,ty=0;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{passive:true});
  function loop(){
    eyes.forEach(eye=>{
      const r=eye.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      const a=Math.atan2(ty-cy,tx-cx),d=Math.min(1,Math.hypot(tx-cx,ty-cy)/(r.width*10));
      if(!r.width)return;eye.firstChild.style.transform=`translate(${Math.cos(a)*r.width*.22*d}px,${Math.sin(a)*r.height*.29*d}px)`;
    });
    requestAnimationFrame(loop);
  }
  if(!reduce){loop();
    const box={classList:{add:()=>document.querySelectorAll('.eyes').forEach(e=>e.classList.add('blink')),remove:()=>document.querySelectorAll('.eyes').forEach(e=>e.classList.remove('blink'))}};
    (function blink(){setTimeout(()=>{box.classList.add('blink');setTimeout(()=>{box.classList.remove('blink');blink()},140)},2800+Math.random()*3500)})();
  }
})();

/* ---- case ---- */
const todo=(q)=>`<div class="todo"><b>A preencher</b>${q}</div>`;
function renderCase(p){
  const i=PROJECTS.indexOf(p),nx=PROJECTS[(i+1)%PROJECTS.length];
  const m0=p.media[0],[aw,ah]=m0.ar.split('/').map(Number),tall=aw/ah<1;
  const hero=m0.v?`<video id="caseVideo" src="${M+(m0.full||m0.v)}.mp4" poster="${M+m0.v}.jpg" muted loop playsinline autoplay preload="metadata"></video>${m0.full&&!m0.mute?'<button type="button" class="sound" id="soundBtn" aria-pressed="false">Ativar som</button>':''}`:`<img src="${M+m0.i}.jpg" alt="${p.title}">`;
  const ads=p.ads?`<div class="adsbox"><span class="yn ${p.ads.yes?'yes':'no'}">${p.ads.yes?'Sim, peça de anúncio':'Não é anúncio'}</span></div><p>${p.ads.text}</p>`:todo('Foi um anúncio? Em qual plataforma e formato rodou (Meta, YouTube, outdoor, TV)? Teve verba de mídia?');
  const como=p.como?`<p>${p.como.intro}</p><div class="pilares">${p.como.pilares.map(([n,d],k)=>`<div class="pilar"><em>Pilar ${k+1}</em><b>${n}</b><p>${d}</p></div>`).join('')}</div>`:todo('Quais foram as 3 decisões criativas que guiaram a peça? Ex.: hierarquia da mensagem, paleta, ritmo dos slides.');
  const isAd=p.ads&&p.ads.yes;
  const imp=p.impacto?`<p>${p.impacto.text}</p>${p.impacto.metrics?'':todo('Tem algum número? Ex.: adesões ao débito automático, alcance, CTR, redução de atendimentos presenciais.')}`:todo(isAd?'Quais números a campanha teve? CTR, CPM, custo por lead ou por venda, ROAS, retenção do vídeo (3s e ThruPlay). Se rodou em teste A/B, qual versão venceu e por quanto?':'Teve impacto mensurável? Views, alcance, aprovação do cliente, prêmio, uso em sala de aula. Se foi estudo, qual aprendizado ficou?');
  const causa=p.causa?`<p>${p.causa}</p>`:todo(isAd?'Qual elemento puxou o resultado: o gancho, a oferta, o formato ou o CTA? Ligue uma etapa do roteiro a um número de "Impacto".':'Qual decisão você acredita que gerou esse resultado? Ligue um pilar de "Como foi pensado" a um número de "Impacto".');
  const funil=p.funil?`<p>Como o anúncio distribui a atenção em ${m0.full?'cada segundo':'cada etapa'}:</p><ol class="funil">${p.funil.map(([t,e,d])=>`<li><span class="t">${t}</span><b>${e}</b><p>${d}</p></li>`).join('')}</ol>`:'';
  const blocks=[['Descrição','O que é',`<p>${p.oque}</p>`],['Contexto','Por que foi criado',`<p>${p.porque}</p>`],['Processo','Como foi pensado',como]];
  if(funil)blocks.push(['Roteiro','Estrutura do anúncio',funil]);
  blocks.push(['Veiculação','Foi um anúncio?',ads]);
  if(p.impacto)blocks.push(['Resultado','Impacto',`<p>${p.impacto.text}</p>`]);
  if(p.causa)blocks.push(['Causa','O que gerou o impacto',causa]);
  const gal=p.media.slice(1).map(m=>`<figure>${m.v?`<video src="${M+m.v}.mp4" poster="${M+m.v}.jpg" muted loop playsinline autoplay aria-hidden="true"></video>`:`<img src="${M+m.i}.jpg" alt="" loading="lazy">`}</figure>`).join('');
  const nxImg=nx.media[0].v?nx.media[0].v:nx.media[0].i;
  document.getElementById('case').innerHTML=`
  <div class="wrap">
    <div class="case-hero">
      <a class="back" href="#projetos">← Todos os projetos</a>
      <div class="tags"><span class="tag">${p.area}</span>${p.ads&&p.ads.yes?'<span class="tag brand">Ads</span>':''}${p.ai?'<span class="tag">IA generativa</span>':''}</div>
      <h1>${p.title}</h1>
      <p class="intro">${p.oque}</p>
    </div>
    <div class="hero-media ${tall?'tall':''}">${hero}</div>
    <dl class="ficha">
      <div><dt class="label">Cliente</dt><dd>${p.client}</dd></div>
      <div><dt class="label">Ano</dt><dd>${p.year}</dd></div>
      <div><dt class="label">Serviço</dt><dd>${p.service}</dd></div>
      <div><dt class="label">Categoria</dt><dd>${p.category}</dd></div>
    </dl>
    <div class="brief">
      ${blocks.map(([k,t,b],n)=>`<section class="blk"><h2><small>${String(n+1).padStart(2,'0')} · ${k}</small>${t}</h2><div class="body">${b}</div></section>`).join('')}
    </div>
    ${gal?`<div class="gallery">${gal}</div>`:''}
    <div class="case-cta"><div><h2>Gostou deste projeto? <span>Vamos criar um assim para a sua marca.</span></h2></div><a class="glow signal" href="${wa(WA_MSG.caso(p.title))}" target="_blank" rel="noopener"><span><svg class="wa-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>Quero um vídeo assim</span></a></div>
    <div class="next"><a href="#case-${nx.slug}"><span class="label">Próximo case</span><h3>${nx.title}</h3></a><a href="#case-${nx.slug}" tabindex="-1" aria-hidden="true"><figure><img src="${M+nxImg}.jpg" alt="" loading="lazy"></figure></a></div>
  </div>`;
  arm(document.getElementById('case'));
  const sb=document.getElementById('soundBtn'),cv=document.getElementById('caseVideo');
  if(sb)sb.onclick=()=>{cv.muted=!cv.muted;if(!cv.muted){cv.currentTime=0;cv.play().catch(()=>{})}sb.textContent=cv.muted?'Ativar som':'Desativar som';sb.setAttribute('aria-pressed',!cv.muted)};
}

/* ---- sobre: fluxo de IA, manifesto e linha do processo ---- */
(function(){
  const chip=(slug)=>{if(slug==='formats')return `<span class="fmt-ico" title="Formatos 9:16, 4:5 e 16:9"><svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="9" height="16" rx="1.5"/><rect x="13" y="6" width="8" height="10" rx="1.5"/><rect x="23" y="8" width="8" height="5" rx="1"/><path d="M2 22h29" stroke-linecap="round" opacity=".5"/></svg></span>`;const t=TOOLS.find(x=>x[1]===slug);const [name,,bg,fg,kind]=t;
    const inner=slug==='magnific'?MAGNIFIC:slug==='higgsfield'?HIGGSFIELD:kind?`<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" fill="${fg}"/><path fill="${bg}" d="${LOGOS[slug]}"/></svg>`:`<svg viewBox="0 0 24 24"><path fill="${fg}" d="${LOGOS[slug]}"/></svg>`;
    return `<span class="${kind?'adobe':''}" style="background:${kind?'transparent':bg}" title="${name.replace(' · IA','')}">${inner}</span>`};
  const FLOW=[
    [['claude','openai'],'Roteiro e ideias','A IA ajuda a explorar ganchos, versões de texto e estrutura de cenas.','Eu decido o que fica.'],
    [['higgsfield','magnific'],'Assets e referências','Gero bases de imagem e vídeo, texturas e variações em minutos.','Eu escolho e ajusto cada asset.'],
    [['adobeaftereffects','adobepremierepro'],'Animação e acabamento','Timing, transições, tipografia e som são feitos à mão.','100% direção humana.'],
    [['formats'],'Entrega','Versões para cada formato e canal, prontas para postar.','Revisado frame a frame.']];
  document.getElementById('aiFlow').innerHTML=FLOW.map(([tools,t,d,h])=>`<li><div class="tools">${tools.map(chip).join('')}</div><b>${t}</b><p>${d}</p><span class="human">${h}</span></li>`).join('');
  const man=document.getElementById('manifesto');
  man.innerHTML=man.textContent.split(' ').map(w=>`<span class="w">${w}</span>`).join(' ');
  const words=[...man.querySelectorAll('.w')],steps=document.getElementById('steps'),lis=[...steps.children];
  function onScroll(){
    if(document.getElementById('sobre').hidden||reduce)return;
    const vh=innerHeight,r=man.getBoundingClientRect();
    const p=Math.min(1,Math.max(0,(vh*.85-r.top)/(r.height+vh*.35)));
    const n=Math.round(p*words.length);words.forEach((w,i)=>w.classList.toggle('on',i<n));
    const s=steps.getBoundingClientRect();
    const q=Math.min(1,Math.max(0,(vh*.6-s.top)/s.height));steps.style.setProperty('--prog',q.toFixed(3));
    lis.forEach(li=>li.classList.toggle('done',li.getBoundingClientRect().top<vh*.6));
  }
  addEventListener('scroll',onScroll,{passive:true});addEventListener('hashchange',()=>setTimeout(onScroll,50));onScroll();
  if(reduce)lis.forEach(li=>li.classList.add('done'));
  // retrato inclina levemente com o mouse
  const por=document.getElementById('portrait'),pin=por.querySelector('.portrait-in');
  if(!reduce&&matchMedia('(hover:hover)').matches){
    por.addEventListener('pointermove',e=>{const r=por.getBoundingClientRect();pin.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');pin.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*10+'deg')});
    por.addEventListener('pointerleave',()=>{pin.style.setProperty('--ry','0deg');pin.style.setProperty('--rx','0deg')});
  }
})();

/* ---- rotas por hash (#home, #sobre, #case-slug) ---- */
let lastHomeAnchor=null;
function route(){
  const h=location.hash.slice(1)||'home';
  const views={home:document.getElementById('home'),case:document.getElementById('case'),sobre:document.getElementById('sobre')};
  let show='home';
  if(h.startsWith('case-')&&bySlug[h.slice(5)]){show='case';renderCase(bySlug[h.slice(5)])}
  else if(h==='sobre')show='sobre';
  Object.entries(views).forEach(([k,el])=>el.hidden=k!==show);
  const cur=show==='sobre'?'sobre':'home';
  document.querySelectorAll('[data-nav]').forEach(a=>a.dataset.nav===cur?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  const t=show==='home'&&h!=='home'&&document.getElementById(h);
  if(t)requestAnimationFrame(()=>t.scrollIntoView());else scrollTo(0,0);
}
addEventListener('hashchange',route);route();

addEventListener('scroll',()=>{document.getElementById('top').classList.toggle('scrolled',scrollY>40);document.body.classList.toggle('past-hero',scrollY>innerHeight*.25)},{passive:true});
const ICON_COPY=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M15 9V5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15H9"/></svg>`,ICON_OK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.copy,label=b.getAttribute('aria-label'),done=()=>{b.innerHTML=ICON_OK;b.classList.add('ok');b.setAttribute('aria-label','Copiado');setTimeout(()=>{b.innerHTML=ICON_COPY;b.classList.remove('ok');b.setAttribute('aria-label',label)},1600)};navigator.clipboard.writeText(t).then(done).catch(()=>{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);getSelection().removeAllRanges();getSelection().addRange(r)})}));
arm(document.getElementById('home'));

/* ---- lettering JACK: mesma coreografia da referência, com o SVG da marca ---- */
const JACK_PATHS={j:"M8.27043 40.2349C6.5521 40.2349 4.97654 39.8779 3.53355 39.1691C2.09055 38.4552 0.912705 37.4506 0 36.1553L4.51763 31.4434C4.99183 32.0655 5.50173 32.5398 6.05241 32.8662C6.60309 33.1925 7.18436 33.3608 7.80643 33.3608C8.71914 33.3608 9.42279 33.1211 9.91738 32.6367C10.412 32.1522 10.6567 31.4383 10.6567 30.4847V0H17.4485V31.3057C17.4485 34.1359 16.6429 36.3338 15.0367 37.8942C13.4305 39.4547 11.1768 40.2349 8.27043 40.2349Z",a:"M31.7152 0H26.9478L17.4485 39.8219H24.1842L25.1733 34.7989L26.8152 26.4918L29.3341 13.7176L31.8529 26.4918L33.505 34.8805L34.484 39.8219H41.2196L31.7152 0Z",c:"M38.9097 20.3926C38.9097 7.41443 48.7812 0.00488281 60.4883 0.00488281C66.7803 0.00488281 71.3948 2.55462 74.5817 5.66021L71.3184 9.88258C68.1315 7.17475 64.7918 5.50212 60.7279 5.50212C51.8099 5.50212 45.681 11.4736 45.681 20.3926C45.681 29.3116 51.7334 35.125 60.5699 35.125C65.3475 35.125 69.3298 32.973 72.5115 30.2652L75.4587 34.5641C71.1603 38.3887 65.8268 40.6172 60.0906 40.6172C47.9857 40.6172 38.9097 33.2127 38.9097 20.3926Z",k:"M77.7532 40.026V0.204102H84.5449V40.0311H77.7532V40.026ZM83.1478 33.7026V21.6219L90.8982 0.204102H98.5669L83.1478 33.7026ZM92.3769 40.026L87.4921 24.2584L85.6412 18.2767L90.2965 14.1971L99.8264 40.026H92.3769Z M87.4922 24.2632L84.5451 40.0257L83.1479 28.6691L87.4922 24.2632Z"};
let logoN=0;
function jackSVG(){
  const id='jk'+(logoN++);
  return `<svg class="jack" viewBox="-2 -4 104 49" fill="currentColor" aria-hidden="true"><defs><clipPath id="${id}"><rect x="-60" y="-1" width="220" height="42.5"/></clipPath></defs><g class="all"><g clip-path="url(#${id})"><path class="j" d="${JACK_PATHS.j}"/><path class="a" d="${JACK_PATHS.a}"/><path class="c" d="${JACK_PATHS.c}"/></g><path class="k" d="${JACK_PATHS.k}"/></g></svg>`;
}
// fases: K surge girando no centro → desliza para o lugar → J, A, C sobem pela máscara → segura →
// A e C descem, o par JK se junta → segura → sai e recomeça
function jackTimeline(svg,{loop=true,align='left',onFull}={}){
  const q=s=>svg.querySelector(s),J=q('.j'),A=q('.a'),C=q('.c'),K=q('.k'),ALL=q('.all');
  const tl=gsap.timeline({repeat:loop?-1:0});
  tl.set([J,A,C],{y:46,x:0}).set(ALL,{x:0}).set(K,{x:-38.8,scale:0,rotation:-180,transformOrigin:'50% 50%'})
    .to(K,{scale:1,rotation:0,duration:.6,ease:'back.out(1.7)'})
    .to(K,{x:0,duration:.8,ease:'expo.inOut'},'+=.05')
    .to([J,A,C],{y:0,duration:.7,ease:'expo.out',stagger:.13},'-=.45')
    .addLabel('full');
  if(onFull)tl.call(onFull,null,'full+=.6');
  if(!loop)return tl;
  tl.to({},{duration:2.4})
    .to([C,A],{y:46,duration:.5,ease:'expo.in',stagger:.08});
  if(align==='center')tl.to(J,{x:57.3,duration:.8,ease:'expo.inOut'},'-=.15').to(ALL,{x:-28.6,duration:.8,ease:'expo.inOut'},'<');
  else tl.to(K,{x:-57.3,duration:.8,ease:'expo.inOut'},'-=.15');
  tl.to({},{duration:2})
    .to(J,{y:46,duration:.45,ease:'expo.in'})
    .to(K,{scale:0,rotation:180,duration:.5,ease:'back.in(1.7)'},'<.05')
    .to({},{duration:.35});
  return tl;
}
const intro=document.getElementById('intro');
function endIntro(){intro.classList.add('done')}
document.getElementById('skip').onclick=endIntro;intro.onclick=endIntro;
document.getElementById('brandLogo').innerHTML=jackSVG();
document.getElementById('introLogo').innerHTML=jackSVG();
// quem chega por anúncio (utm, gclid, fbclid) entra direto, sem o intro
const fromAd=/[?&](utm_[a-z]+|gclid|fbclid)=/i.test(location.search);
if(window.gsap&&!reduce){
  if(fromAd)endIntro();
  else{jackTimeline(document.querySelector('#introLogo svg'),{loop:false,onFull:endIntro});setTimeout(endIntro,4000)}
  // o header começa depois do intro
  const head=jackTimeline(document.querySelector('#brandLogo svg'),{loop:true,align:'left'});head.pause(0);
  setTimeout(()=>head.play(0),fromAd?300:1900);
}else endIntro();
