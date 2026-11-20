import './style.css';
import raw from './generated.json';
import {type Data,type Lang} from './model';
import {homePage,projectPage,pick,esc,sources} from './render';
import {isCalm,onCalm} from './engine/calm';
import {scrollToX,clamp,ahead,load} from './engine/scroll';
import {ink} from './engine/ink';
import {mountArt,spriteFrames} from './engine/layers';
import {checkName,suggest,type Declarations} from './names';
import {Ambience} from './engine/sound';
const data=raw as Data;
const lang:Lang=location.pathname.startsWith('/ru/')?'ru':'en';
const t=(ru:string,en:string)=>pick(lang,ru,en);
const id=location.pathname.match(/\/projects\/([^/]+)/)?.[1];
const p=id?data.projects[id]:undefined;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=p?projectPage(data,p,lang):homePage(data,lang);
document.documentElement.lang=lang;document.body.classList.add('enhanced');
const q=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
let calm=isCalm()||read('dormer.calm')==='true';
function read(k:string){try{return localStorage.getItem(k)}catch{return null}}
function write(k:string,v:string){try{localStorage.setItem(k,v);return true}catch{return false}}
function applyCalm(){document.body.classList.toggle('calm',calm);q('#calm')?.setAttribute('aria-pressed',String(calm));document.querySelectorAll('video').forEach(v=>{if(calm)v.pause();else void v.play().catch(()=>{})})}
applyCalm();onCalm(on=>{calm=on||read('dormer.calm')==='true';applyCalm();updateRace?.()});
for(const d of document.querySelectorAll<HTMLDialogElement>('dialog')){d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{if(d.id==='song-dialog')d.querySelector('iframe')?.remove()})}
for(const b of document.querySelectorAll('[data-search-open]'))b.addEventListener('click',()=>{q<HTMLDialogElement>('#search-dialog').showModal();q<HTMLInputElement>('#search-input').focus()});
interface SearchHit{url:string;meta:{title:string};excerpt:string}
interface Pagefind{options(o:{mergeIndex:{bundlePath:string}[]}):Promise<void>;search(s:string):Promise<{results:{data():Promise<SearchHit>}[]}>}
let index:Promise<Pagefind>|undefined;
let searchVersion=0;
async function search(){const value=q<HTMLInputElement>('#search-input').value.trim();const version=++searchVersion;const out=q('#search-results');if(!value){out.textContent='';return;}out.textContent=t('Поиск…','Searching…');try{
 const bundle='/pagefind/pagefind.js'; index??=import(/* @vite-ignore */ bundle);
 const found=await(await index).search(value);const hits=await Promise.all(found.results.slice(0,12).map(r=>r.data()));if(version!==searchVersion)return;
 const unique=[...new Map(hits.map(h=>[h.url,h])).values()];
 out.replaceChildren();for(const hit of unique){const a=document.createElement('a');a.className='search-result';a.href=hit.url;const h=document.createElement('h3');h.textContent=hit.meta.title;const snippet=document.createElement('p');
 // Pagefind supplies escaped HTML with mark tags only; strip everything else.
 const doc=new DOMParser().parseFromString(hit.excerpt,'text/html');for(const el of doc.body.querySelectorAll('*'))if(el.tagName!=='MARK')el.replaceWith(document.createTextNode(el.textContent??''));snippet.append(...doc.body.childNodes);a.append(h,snippet);out.append(a)}
 if(!unique.length)out.textContent=t('Ничего не найдено.','No stories found.');
 }catch{if(version===searchVersion)out.textContent=t('Поиск временно недоступен. Попробуйте позже.','Search is temporarily unavailable. Please try again later.')}}
document.querySelectorAll<HTMLFormElement>('[data-inline-search]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();q<HTMLDialogElement>('#search-dialog').showModal();q<HTMLInputElement>('#search-input').value=form.querySelector('input')!.value;q<HTMLInputElement>('#search-input').focus();void search()}));
q('#search-form').addEventListener('submit',e=>{e.preventDefault();void search()});let debounce:number;q('#search-input').addEventListener('input',()=>{clearTimeout(debounce);debounce=window.setTimeout(()=>void search(),180)});
let updateRace:(()=>void)|undefined;
if(!p){
 const filter=(tag:string)=>{const tiles=[...document.querySelectorAll<HTMLElement>('.tile')];const before=new Map(tiles.map(el=>[el,el.getBoundingClientRect()]));q('.wall').classList.toggle('filtered',tag!=='all');for(const el of tiles)el.hidden=tag!=='all'&&!el.dataset.tags!.split(' ').includes(tag);
 for(const b of document.querySelectorAll<HTMLElement>('[data-tag]'))b.setAttribute('aria-pressed',String(b.dataset.tag===tag));
 if(!calm)for(const el of tiles.filter(e=>!e.hidden)){const prev=before.get(el)!,next=el.getBoundingClientRect();el.animate([{translate:`${prev.left-next.left}px ${prev.top-next.top}px`,opacity:.3},{translate:'0 0',opacity:1}],{duration:450,easing:'ease-out'})}
 };
 const initial=new URLSearchParams(location.search).get('tag')??'all';filter(['music','horses','art','perfume'].includes(initial)?initial:'all');
 for(const b of document.querySelectorAll<HTMLElement>('[data-tag]'))b.addEventListener('click',()=>{const tag=b.dataset.tag!;const u=new URL(location.href);if(tag==='all')u.searchParams.delete('tag');else u.searchParams.set('tag',tag);history.pushState({},'',u);filter(tag)});
 addEventListener('popstate',()=>filter(new URLSearchParams(location.search).get('tag')??'all'));
 document.querySelectorAll<HTMLElement>('.tile').forEach(el=>ink(el,()=>calm));mountArt(data,'bull-in-the-heather');
}else{
 mountArt(data,p.id);ahead(app);
 const race=q('#race'),track=q('.track'),stage=q('.race-stage');const chapters=[...document.querySelectorAll<HTMLElement>('.chapter')];const ambience=new Ambience();let current=0,lastY=scrollY,lastTime=performance.now(),velocity=0,raf=0;
 const top=()=>race.getBoundingClientRect().top+scrollY- q('.race-tools').clientHeight;
 const length=()=>Math.max(1,race.offsetHeight-stage.offsetHeight);
 const go=(i:number,focus=false)=>{if(calm)chapters[i].scrollIntoView({behavior:'auto',block:'start'});else window.scrollTo({top:top()+length()*i/9,behavior:'instant'});history.replaceState({},'',`#${chapters[i].id}`);if(focus)chapters[i].querySelector<HTMLElement>('.chapter-paper')!.focus({preventScroll:true});updateRace?.()};
 const ticker=[t('13 лошадей · 9 фурлонгов · мокрая дорожка','13 runners · 9 furlongs · sloppy track'),t('Bull Inthe Heather держится примерно восьмым','Bull Inthe Heather sits around eighth'),t('Серый жеребец · отец — Фердинанд','Grey colt · sire: Ferdinand'),t('Кличка: не больше 18 знаков','A name: no more than 18 characters'),t('Sear Sound, Нью-Йорк · осень 1993','Sear Sound, New York · autumn 1993'),t('Ким Гордон · Кэтлин Ханна','Kim Gordon · Kathleen Hanna'),t('Клип сняла Тамра Дэвис','Video directed by Tamra Davis'),t('UK № 24 · US Alternative № 13','UK no. 24 · US Alternative no. 13'),t('Great Navigator выдохся; Bull проходит между лошадьми','Great Navigator fades; Bull moves between horses'),t('Bull Inthe Heather — первый! Два корпуса · 1:51⅕ · $60.80','Bull Inthe Heather wins! Two lengths · 1:51⅕ · $60.80')];
 updateRace=()=>{
  if(calm){chapters.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');load(s)});track.style.transform='';return;}
  const x=scrollToX(scrollY,top(),length(),innerWidth*9);track.style.transform=`translateX(${-x}px)`;const n=Math.round(x/innerWidth);current=n;
  for(let i=0;i<chapters.length;i++){chapters[i].inert=i!==n;chapters[i].setAttribute('aria-hidden',String(i!==n));if(Math.abs(i-n)<=1)load(chapters[i]);}
  q('#progress').textContent=`${n} / 9`;q('#ticker-fact').textContent=ticker[n];document.body.classList.toggle('photo-freeze',n===6);stage.style.setProperty('--race-p',String(x/(innerWidth*9)));stage.dataset.pole=String(n);
 };
 const frames=spriteFrames(data,p.id);const frameEls=new Map<number,HTMLImageElement>();for(const [n,urls]of frames){const el=q(`.herd .horse-${n}`);el.classList.add('has-frames');const img=document.createElement('img');img.alt='';img.src=urls[0];el.append(img);frameEls.set(n,img);urls.forEach(src=>{const i=new Image();i.src=src})}
 let phase=0,previous=performance.now();
 function animate(now:number){const dt=Math.min(100,now-previous);previous=now;velocity*=Math.exp(-dt/220);const speed=calm?0:Math.min(3,velocity);stage.style.setProperty('--gallop',`${1.8-speed*.48}s`);stage.style.setProperty('--blur',`${Math.min(3,speed)}px`);ambience.speed=speed;
 if(!calm&&current!==6&&!document.hidden){phase+=dt/1000*(2+speed*5);for(const [n,img]of frameEls){const urls=frames.get(n)!;const src=urls[Math.floor(phase)%urls.length];if(!img.src.endsWith(src))img.src=src}}
 raf=requestAnimationFrame(animate)}raf=requestAnimationFrame(animate);
 addEventListener('pagehide',()=>cancelAnimationFrame(raf));
 addEventListener('scroll',()=>{const now=performance.now();velocity=Math.min(4,Math.abs(scrollY-lastY)/Math.max(16,now-lastTime));lastY=scrollY;lastTime=now;updateRace?.()},{passive:true});addEventListener('resize',()=>updateRace?.());updateRace();
 q('#start-race').addEventListener('click',()=>{document.body.classList.add('fired');q('#start-race').textContent=t('Поехали!','They’re off!');ambience.fire();setTimeout(()=>go(0,true),calm?0:450)});
 q('#calm').addEventListener('click',()=>{const n=current;calm=!calm||isCalm();write('dormer.calm',String(calm));applyCalm();updateRace?.();go(n)});
 q('#sound').addEventListener('click',async()=>{const on=await ambience.toggle();q('#sound').setAttribute('aria-pressed',String(on));q('#sound').textContent=on?t('Звук: вкл.','Sound: on'):t('Звук: выкл.','Sound: off')});
 q('#programme').addEventListener('click',()=>q<HTMLDialogElement>('#programme-dialog').showModal());
 for(const b of document.querySelectorAll<HTMLElement>('[data-go]'))b.addEventListener('click',e=>{e.preventDefault();q<HTMLDialogElement>('#programme-dialog').close();go(Number(b.dataset.go),true)});
 q('[data-song]').addEventListener('click',()=>q<HTMLDialogElement>('#song-dialog').showModal());
 for(const b of document.querySelectorAll<HTMLElement>('[data-video]'))b.addEventListener('click',()=>{const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1`;iframe.title=t('Официальная запись Sonic Youth','Official Sonic Youth recording');iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';b.parentElement!.querySelector('iframe')?.remove();b.parentElement!.append(iframe);b.hidden=true});
 q<HTMLDialogElement>('#song-dialog').addEventListener('close',()=>{q<HTMLButtonElement>('#song-dialog [data-video]').hidden=false});
 const storiesRu=['Seabiscuit и Hard Tack, кличка его отца, означают «морской сухарь».','Отца Kauto Star звали Village Star, мать — Kauto Relka.','По преданию, которое пересказывает музей NSLM, Potoooooooo — это «Pot» и восемь букв «o».','По сообщению Racing Post, в ЮАР коня President Trump переименовали в Fake News по требованию властей.','В сентябре 2026 года Жокей-клуб потребовал переименовать Austrian Painter в Merrylegs после жалобы на оскорбительную кличку. Это не устанавливает намерений владельца.','По примечаниям Smithsonian Folkways, песня Stewball происходит от баллады о скаковом коне Skew Ball.'];
 for(const b of document.querySelectorAll<HTMLElement>('[data-story]'))b.addEventListener('click',()=>{const n=b.dataset.story;const box=q('#name-story');if(n==='bull'){box.innerHTML=`<h3>Bull Inthe Heather</h3><p>${esc(t('Inthe — слитно: кличка занимает ровно восемнадцать знаков. Как выбирали имя, не установлено.','Inthe is one word: the name has exactly eighteen characters. How the name was chosen is not established.'))}</p>${sources(p.scenes[3].blocks[1].sources)}`;}else{const s=p.name_stories[Number(n)];box.innerHTML=`<h3>${esc(s.name)}</h3><p>${esc(lang==='ru'?storiesRu[Number(n)]:s.summary)}</p>${sources(s.sources)}`}box.scrollIntoView({block:'nearest'})});
 const form=q<HTMLFormElement>('#name-form'),name=q<HTMLInputElement>('#horse-name');
 const messages:Record<string,string>={empty:t('Введите кличку.','Enter a name.'),length:t('Не больше 18 знаков, включая пробелы и пунктуацию.','No more than 18 characters, including spaces and punctuation.'),protected:t('Это имя защищено IFHA. Выберите другое.','This name is protected by the IFHA. Choose another.'),livingPerson:t('Нужно письменное согласие живого человека.','Written permission from the living person is required.'),commercial:t('Коммерческие названия и реклама не допускаются.','Commercial names and advertising are not permitted.'),offensive:t('Непристойные и оскорбительные имена не допускаются.','Obscene and offensive names are not permitted.')};
 const validate=()=>{const declarations=Object.fromEntries(['livingPerson','commercial','offensive'].map(k=>[k,form.querySelector<HTMLInputElement>(`[name=${k}]`)!.checked])) as unknown as Declarations;const result=checkName(name.value,declarations);q('#name-feedback').textContent=`${result.length} / 18 · ${result.valid?t('Пройдено по доступным проверкам.','Passes the available checks.'):result.errors.map(e=>messages[e]).join(' ')}`;name.setAttribute('aria-invalid',String(!result.valid));return result.valid};
 const updateSuggestions=()=>{const s=suggest(q<HTMLInputElement>('#sire').value,q<HTMLInputElement>('#dam').value);const box=q('#suggestions');box.replaceChildren();s.forEach(v=>{const b=document.createElement('button');b.type='button';b.textContent=v;b.addEventListener('click',()=>{name.value=v;validate()});box.append(b)})};for(const input of form.querySelectorAll('input'))input.addEventListener('input',()=>{validate();updateSuggestions()});updateSuggestions();validate();
 const showHorse=(value:string|null)=>{if(!value)return;const h=q('#reader-horse');h.hidden=false;h.querySelector('span')!.textContent=value};showHorse(read('dormer.horse'));
 form.addEventListener('submit',e=>{e.preventDefault();if(!validate())return;const saved=write('dormer.horse',name.value);showHorse(name.value);q('#saved').textContent=saved?t('Сохранено. Ваш конь ждёт в последнем паддоке.','Saved. Your horse is waiting in the last paddock.'):t('Ваш конь здесь до закрытия страницы; хранилище недоступно.','Your horse is here until the page closes; storage is unavailable.')});
 let touchX=0,touchY=0,originY=0;stage.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;originY=scrollY},{passive:true});stage.addEventListener('touchmove',e=>{if(calm)return;const dx=touchX-e.touches[0].clientX,dy=touchY-e.touches[0].clientY;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>12){e.preventDefault();scrollTo({top:originY+dx*length()/(innerWidth*9),behavior:'instant'})}},{passive:false});
 addEventListener('keydown',e=>{if(calm||document.querySelector('dialog[open]')||(e.target as Element)?.closest('input,textarea,select'))return;if(race.getBoundingClientRect().top>100||race.getBoundingClientRect().bottom<innerHeight)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(Math.max(0,Math.min(9,current+(e.key==='ArrowRight'?1:-1))),true)}});
 const hashIndex=chapters.findIndex(s=>s.id===location.hash.slice(1));if(hashIndex>=0)requestAnimationFrame(()=>go(hashIndex));
}
