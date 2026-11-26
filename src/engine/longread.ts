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
