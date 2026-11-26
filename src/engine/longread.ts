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
interface Player {seekTo(seconds:number,allowSeekAhead:boolean):void;playVideo():void}
interface YouTube {Player:new (frame:HTMLIFrameElement,options:{events:{onReady:(event:{target:Player})=>void;onError:()=>void}})=>Player}
declare global {interface Window {YT?:YouTube;onYouTubeIframeAPIReady?:()=>void}}
let api:Promise<YouTube>|undefined;
function youtube():Promise<YouTube>{
 if(window.YT?.Player)return Promise.resolve(window.YT);
 return api??=new Promise((resolve,reject)=>{const previous=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{previous?.();resolve(window.YT!)};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{api=undefined;script.remove();reject(Error('YouTube API unavailable'))};document.head.append(script)});
}
export function videos(){
 const players=new WeakMap<HTMLElement,{player?:Player;start:number}>();
 document.querySelectorAll<HTMLAnchorElement>('[data-video]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();
  const structure=link.closest<HTMLElement>('.structure');const slot=structure?.querySelector<HTMLElement>('[data-player]')??link.closest<HTMLElement>('[data-player]')!;
  const start=Number(link.dataset.start??0),id=link.dataset.video!;
  if(structure){const note=structure.querySelector<HTMLElement>('.structure-note')!;note.hidden=false;note.textContent=link.parentElement!.querySelector('.section-note')!.textContent;structure.querySelectorAll('[data-section]').forEach(a=>a.setAttribute('aria-current',String(a===link)))}
  const existing=players.get(slot);if(existing){existing.start=start;existing.player?.seekTo(start,true);existing.player?.playVideo();return}
  const state:{player?:Player;start:number}={start};players.set(slot,state);slot.hidden=false;
  const iframe=document.createElement('iframe');iframe.title=link.getAttribute('aria-label')??link.textContent?.trim()??'YouTube';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&start=${start}&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
  slot.replaceChildren(iframe);
  const fallback=document.createElement('a');fallback.href=link.href;fallback.className='video-fallback';fallback.textContent=document.documentElement.lang==='ru'?'Открыть на YouTube ↗':'Open on YouTube ↗';slot.append(fallback);
  if(structure)void youtube().then(YT=>{new YT.Player(iframe,{events:{onReady:({target})=>{state.player=target;target.seekTo(state.start,true);target.playVideo()},onError:()=>{players.delete(slot)}}})}).catch(()=>{players.delete(slot)});
 }));
}
