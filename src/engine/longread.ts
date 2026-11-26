/** Enhancement only: all text, navigation and video links are server rendered. */
export function motion(calm:()=>boolean){
 const elements=[...document.querySelectorAll<HTMLElement>('[data-depth]')];
 const blooms=[...document.querySelectorAll<HTMLElement>('.bloom')];
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target)}},{threshold:.08});
 for(const el of blooms){if(el.getBoundingClientRect().top>innerHeight&&!calm()){el.classList.add('bloom-ready');observer.observe(el)}}
 let x=0,y=0,frame=0;
 const update=()=>{frame=0;for(const el of elements){if(calm()){el.style.translate='';continue}const rect=el.parentElement!.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)continue;const depth=Number(el.dataset.depth);const clamp=(n:number)=>Math.max(-24,Math.min(24,n));el.style.translate=`${clamp(x*depth*24)}px ${clamp((y+(innerHeight/2-rect.top-rect.height/2)/innerHeight)*depth*24)}px`}};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 addEventListener('pointermove',e=>{x=e.clientX/innerWidth*2-1;y=e.clientY/innerHeight*2-1;schedule()},{passive:true});addEventListener('scroll',schedule,{passive:true});
 return ()=>{if(calm())for(const el of blooms)el.classList.add('revealed');schedule()};
}
interface Player {seekTo(seconds:number,allowSeekAhead:boolean):void;playVideo():void;destroy?():void}
interface YouTube {Player:new (frame:HTMLIFrameElement,options:{events:{onReady:(event:{target:Player})=>void;onError:(event:{data:number})=>void}})=>Player}
declare global {interface Window {YT?:YouTube;onYouTubeIframeAPIReady?:()=>void}}
let api:Promise<YouTube>|undefined;
function youtube():Promise<YouTube>{
 if(window.YT?.Player)return Promise.resolve(window.YT);
 return api??=new Promise((resolve,reject)=>{const previous=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{previous?.();resolve(window.YT!)};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{api=undefined;script.remove();reject(Error('YouTube API unavailable'))};document.head.append(script)});
}
const ru=()=>document.documentElement.lang==='ru';
const watchUrl=(id:string,start:number)=>`https://www.youtube.com/watch?v=${encodeURIComponent(id)}${start?`&t=${start}s`:''}`;
/** Shown when the video owner allows playback on YouTube only (embed errors 2, 5, 100, 101, 150, 152, 153). */
export function blockedCard(id:string,start:number,title:string):HTMLElement{
 const card=document.createElement('div');card.className='video-blocked';
 const t=document.createElement('p');t.className='video-blocked-title';t.textContent=title;
 const note=document.createElement('p');note.className='video-blocked-note';note.textContent=ru()?'Владелец видео разрешает смотреть его только на YouTube.':'The owner allows this video to be watched on YouTube only.';
 const a=document.createElement('a');a.className='video-out';a.href=watchUrl(id,start);a.target='_blank';a.rel='noopener';a.textContent=ru()?'Смотреть на YouTube ↗':'Watch on YouTube ↗';
 card.append(t,note,a);return card;
}
const blockedIds=new Set<string>();
export function videos(){
 const players=new WeakMap<HTMLElement,{player?:Player;start:number;id:string}>();
 const mount=(slot:HTMLElement,id:string,start:number,title:string,link:HTMLAnchorElement,onBlocked:()=>void)=>{
  const state:{player?:Player;start:number;id:string}={start,id};players.set(slot,state);slot.hidden=false;
  if(blockedIds.has(id)){slot.replaceChildren(blockedCard(id,start,title));onBlocked();return}
  const iframe=document.createElement('iframe');iframe.title=title;iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&start=${start}&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
  const fallback=document.createElement('a');fallback.href=link.href;fallback.className='video-fallback';fallback.target='_blank';fallback.rel='noopener';fallback.textContent=ru()?'Открыть на YouTube ↗':'Open on YouTube ↗';
  slot.replaceChildren(iframe,fallback);
  void youtube().then(YT=>{new YT.Player(iframe,{events:{
   onReady:({target})=>{if(players.get(slot)!==state)return;state.player=target;if(state.start)target.seekTo(state.start,true);target.playVideo()},
   onError:({data})=>{if(![2,5,100,101,150,152,153].includes(data))return;blockedIds.add(id);if(players.get(slot)!==state)return;players.delete(slot);slot.replaceChildren(blockedCard(id,state.start,title));onBlocked()}
  }})}).catch(()=>{});
 };
 document.querySelectorAll<HTMLAnchorElement>('[data-video]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const id=link.dataset.video!,start=Number(link.dataset.start??0);
  if(link.dataset.external==='true')return; // already known to be YouTube-only: follow the real link
  event.preventDefault();
  const playlist=link.closest<HTMLElement>('.playlist');
  const structure=link.closest<HTMLElement>('.structure');const slot=(playlist??structure)?.querySelector<HTMLElement>('[data-player]')??link.closest<HTMLElement>('[data-player]')!;
  const title=link.getAttribute('aria-label')??link.textContent?.trim()??'YouTube';
  if(structure){const note=structure.querySelector<HTMLElement>('.structure-note')!;note.hidden=false;note.textContent=link.parentElement!.querySelector('.section-note')!.textContent;structure.querySelectorAll('[data-section]').forEach(a=>a.setAttribute('aria-current',String(a===link)))}
  if(playlist)playlist.querySelectorAll('[data-video]').forEach(a=>{if(a===link)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  const existing=players.get(slot);
  if(existing&&existing.id===id&&existing.player){existing.start=start;existing.player.seekTo(start,true);existing.player.playVideo();return}
  const markExternal=()=>{
   const links=structure?[...structure.querySelectorAll<HTMLAnchorElement>('[data-video]')]:[link];
   for(const a of links){a.dataset.external='true';a.target='_blank';a.rel='noopener';a.href=watchUrl(id,Number(a.dataset.start??0));if(playlist&&!a.querySelector('.ext-mark')){const m=document.createElement('span');m.className='ext-mark';m.textContent=' ↗ YouTube';a.append(m)}}
  };
  mount(slot,id,start,title,link,markExternal);
 }));
}

/** One fixed player at the bottom of the screen for song cards and playlists. */
export function dock(){
 const links=[...document.querySelectorAll<HTMLAnchorElement>('a[data-dock]')];
 if(!links.length)return;
 let bar:HTMLElement|undefined,player:Player&{pauseVideo?():void;getPlayerState?():number}|undefined,queue:HTMLAnchorElement[]=[],index=0,paused=false;
 const T=(ruText:string,en:string)=>ru()?ruText:en;
 const build=()=>{
  bar=document.createElement('section');bar.className='dock';bar.setAttribute('aria-label',T('Плеер','Player'));
  bar.innerHTML=`<div class="dock-screen"><div class="dock-frame"></div></div><div class="dock-info"><strong class="dock-title"></strong><span class="dock-meta"></span></div><div class="dock-controls"><button type="button" class="dock-prev" aria-label="${T('Предыдущая','Previous')}">⏮</button><button type="button" class="dock-toggle" aria-label="${T('Пауза','Pause')}">⏸</button><button type="button" class="dock-next" aria-label="${T('Следующая','Next')}">⏭</button><a class="dock-out" target="_blank" rel="noopener" aria-label="${T('Открыть на YouTube','Open on YouTube')}">↗</a><button type="button" class="dock-close" aria-label="${T('Закрыть плеер','Close player')}">✕</button></div>`;
  document.body.append(bar);document.body.classList.add('has-dock');
  bar.querySelector('.dock-prev')!.addEventListener('click',()=>go(index-1));
  bar.querySelector('.dock-next')!.addEventListener('click',()=>go(index+1));
  bar.querySelector('.dock-toggle')!.addEventListener('click',()=>{if(!player)return;if(paused){player.playVideo();}else{player.pauseVideo?.()}});
  bar.querySelector('.dock-close')!.addEventListener('click',close);
 };
 const close=()=>{player?.destroy?.();player=undefined;bar?.remove();bar=undefined;document.body.classList.remove('has-dock');mark()};
 const mark=()=>{for(const a of links){const on=!!bar&&queue[index]===a;a.toggleAttribute('aria-current',on);a.closest('.song,li')?.classList.toggle('is-playing',on);const label=a.querySelector('.song-play-label');if(label)label.textContent=on?T('играет','playing'):T('слушать','listen')}};
 const setPaused=(p:boolean)=>{paused=p;const b=bar?.querySelector<HTMLButtonElement>('.dock-toggle');if(b){b.textContent=p?'▶':'⏸';b.setAttribute('aria-label',p?T('Играть','Play'):T('Пауза','Pause'))}};
 const go=(i:number)=>{if(!queue.length)return;index=(i+queue.length)%queue.length;load()};
 const load=()=>{
  if(!bar)build();
  const a=queue[index],id=a.dataset.dock!;
  bar!.querySelector('.dock-title')!.textContent=a.dataset.title??'';
  bar!.querySelector('.dock-meta')!.textContent=[a.dataset.artist,a.dataset.year].filter(Boolean).join(' · ');
  bar!.querySelector<HTMLAnchorElement>('.dock-out')!.href=watchUrl(id,0);
  bar!.classList.remove('dock-blocked');mark();setPaused(false);
  player?.destroy?.();player=undefined;
  const frame=document.createElement('div');frame.className='dock-frame';bar!.querySelector('.dock-screen')!.replaceChildren(frame);
  void youtube().then(YT=>{const P=YT.Player as unknown as new (el:HTMLElement,o:object)=>Player;
   const current=a;
   player=new P(frame,{host:'https://www.youtube-nocookie.com',videoId:id,width:'100%',height:'100%',playerVars:{autoplay:1,playsinline:1,rel:0,origin:location.origin},events:{
    onReady:({target}:{target:Player})=>{if(queue[index]!==current)return;target.playVideo()},
    onStateChange:({data}:{data:number})=>{if(data===1)setPaused(false);if(data===2)setPaused(true);if(data===0)go(index+1)},
    onError:({data}:{data:number})=>{if(queue[index]!==current||![2,5,100,101,150,152,153].includes(data))return;bar!.classList.add('dock-blocked');bar!.querySelector('.dock-meta')!.textContent=T('Эту запись можно послушать только на YouTube ↗','This recording plays on YouTube only ↗');setTimeout(()=>{if(queue[index]===current)go(index+1)},4000)}
   }}) as typeof player}).catch(()=>{location.href=watchUrl(id,0)});
 };
 for(const a of links)a.addEventListener('click',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();
  const scope=a.closest('.playlist');queue=links.filter(x=>scope?scope.contains(x):!x.closest('.playlist'));
  const i=queue.indexOf(a);
  if(bar&&i===index&&queue[index]===a&&player){if(paused)player.playVideo();else player.pauseVideo?.();return}
  index=i;load();
 });
}

/** Sticky painting that zooms to each detail as its card scrolls through the middle of the screen. */
export function tours(calm:()=>boolean){
 for(const tour of document.querySelectorAll<HTMLElement>('[data-tour]')){
  tour.classList.add('tour-live');
  const img=tour.querySelector<HTMLImageElement>('.tour-frame img')!;
  const stops=[...tour.querySelectorAll<HTMLElement>('.tour-stop')];
  const show=(st?:HTMLElement)=>{
   stops.forEach(x=>x.classList.toggle('is-active',x===st));
   if(!st||calm()){img.style.transform='';return}
   const [x,y,w,h]=['x','y','w','h'].map(k=>Number(st.dataset[k]));
   const s=Math.min(4,Math.max(1,Math.min(100/w,100/h)*0.92));
   const cx=x+w/2,cy=y+h/2;
   const tx=Math.min(0,Math.max(100-100*s,50-cx*s)),ty=Math.min(0,Math.max(100-100*s,50-cy*s));
   img.style.transform=`translate(${tx}%,${ty}%) scale(${s})`;
  };
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)show(e.target as HTMLElement)},{rootMargin:'-45% 0px -45% 0px'});
  stops.forEach(st=>io.observe(st));
  new IntersectionObserver(([e])=>{if(!e.isIntersecting)show(undefined)}).observe(tour);
 }
}

/** Page colour follows the chapter's heat: from sweet pink to the colour of something you should not smell. */
export function heat(){
 const chapters=[...document.querySelectorAll<HTMLElement>('[data-heat]')];
 const page=document.querySelector<HTMLElement>('.theme-scent');
 if(!chapters.length||!page)return;
 const stops:[number,number[]][]=[[0,[255,228,238]],[.35,[236,226,200]],[.6,[196,201,150]],[.8,[110,98,64]],[1,[28,20,16]]];
 const color=(t:number)=>{for(let i=1;i<stops.length;i++){const [a,ca]=stops[i-1],[b,cb]=stops[i];if(t<=b){const k=(t-a)/(b-a);return ca.map((v,j)=>Math.round(v+(cb[j]-v)*k))}}return stops.at(-1)![1]};
 let frame=0;
 const update=()=>{frame=0;const mid=innerHeight/2;let t=0;for(const ch of chapters){const r=ch.getBoundingClientRect();if(r.top<mid)t=Number(ch.dataset.heat)}
  const [r,g,b]=color(Math.max(0,Math.min(1,t)));page.style.setProperty('--bg',`rgb(${r},${g},${b})`);page.style.setProperty('--fg',t>.7?'#efe6d6':'#2a1f1a');page.dataset.dark=String(t>.7)};
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});update();
}
