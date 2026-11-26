import './style.css';
import raw from './generated.json';
import {type Data,type Lang} from './model';
import {homePage,projectPage,pick} from './render';
import {isCalm,onCalm} from './engine/calm';
const data=raw as Data;
const lang:Lang=location.pathname.startsWith('/ru/')?'ru':'en';
const t=(ru:string,en:string)=>pick(lang,ru,en);
const id=location.pathname.match(/\/projects\/([^/]+)/)?.[1];
const p=id?data.projects[id]:undefined;
const app=document.querySelector<HTMLDivElement>('#app')!;
if(!app.querySelector('main'))app.innerHTML=p?projectPage(data,p,lang):homePage(data,lang);
document.documentElement.lang=lang;document.body.classList.add('enhanced');
const q=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
let calm=isCalm()||read('dormer.calm')==='true';
function read(k:string){try{return localStorage.getItem(k)}catch{return null}}
function write(k:string,v:string){try{localStorage.setItem(k,v);return true}catch{return false}}
function applyCalm(){document.body.classList.toggle('calm',calm);q('#calm')?.setAttribute('aria-pressed',String(calm));document.querySelectorAll('video').forEach(v=>{if(calm)v.pause();else void v.play().catch(()=>{})})}
applyCalm();onCalm(on=>{calm=on||read('dormer.calm')==='true';applyCalm()});
for(const d of document.querySelectorAll<HTMLDialogElement>('dialog')){d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})}
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
import {motion,videos,dock,tours,heat} from './engine/longread';
const refreshMotion=motion(()=>calm);
q('#calm')?.addEventListener('click',()=>{const requested=read('dormer.calm')!=='true';write('dormer.calm',String(requested));calm=isCalm()||requested;applyCalm();refreshMotion()});
onCalm(()=>refreshMotion());
videos();dock();tours(()=>calm);heat();
if(!p){
 const filter=(tag:string)=>{q('.wall').classList.toggle('filtered',tag!=='all');document.querySelectorAll<HTMLElement>('.tile').forEach(el=>el.hidden=tag!=='all'&&!el.dataset.tags!.split(' ').includes(tag));document.querySelectorAll<HTMLElement>('[data-tag]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tag===tag)))};
 filter(new URLSearchParams(location.search).get('tag')??'all');
 document.querySelectorAll<HTMLElement>('[data-tag]').forEach(b=>b.addEventListener('click',()=>{const tag=b.dataset.tag!;const u=new URL(location.href);if(tag==='all')u.searchParams.delete('tag');else u.searchParams.set('tag',tag);history.pushState({},'',u);filter(tag)}));
 addEventListener('popstate',()=>filter(new URLSearchParams(location.search).get('tag')??'all'));
}
