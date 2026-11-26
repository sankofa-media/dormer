export type Lang = 'en' | 'ru';
export type Bi = {ru:string; en:string | {text:string; draft?:boolean}};
export type Copy = string | Bi;
export interface Source {title:string; url:string}
export type Size = 'bleed'|'wide'|'column'|'left'|'right';
export interface Art {type:'art'; src:string; alt:Bi; caption?:Bi; size?:Size; layers?:{src:string;depth:number}[]}
export interface Photo {type:'photo'; src:string; alt:Bi; caption:Bi; credit:Copy; source_url:string; size?:Size; treatment?:'print'|'plain'|'halftone'|'cutout'}
export interface Collage {type:'collage'; background:string | Art | Photo; pieces:{src:string;x:number;y:number;w:number;rotate:number;z:number;depth:number}[]; balloons:{who:string;lang:string;text:Copy;x:number;y:number;tail:'left'|'right'|'down'}[]}
export type Block = Art | Photo | Collage
 | {type:'text';text:Bi;sources?:Source[]}
 | {type:'gallery';items:(Art|Photo)[];layout:'strip'|'grid'|'scatter'}
 | {type:'clipping';masthead:Copy;date:string;headline:Copy;deck:Copy;body:Copy;cite:{publication:string;date:string;page:string;url:string};style:'broadsheet'|'tabloid'|'magazine'|'french-daily';paper?:string}
 | {type:'video';id:string;title:Bi;poster?:string;start?:number;caption:Bi;credit:Copy}
 | {type:'song';title:string;artist?:string;year:string;credits:Bi;label?:string;text:Bi;video_id?:string;video_note?:Bi;sleeve?:string;sources?:Source[]}
 | {type:'playlist';title:Bi;artist?:string;items:{title:string;artist?:string;year:string;video_id:string;note?:Bi}[]}
 | {type:'structure';video_id:string;sections:{label:Bi;start:number;end:number;note:Bi}[]}
 | {type:'quote';text:Bi;attribution:Copy;source:Source}
 | {type:'timeline';items:{date:string;text:Bi}[]}
 | {type:'poster';lines:{text:Copy;size:'xl'|'l'|'m'|'s';font:'display'|'grotesk'|'script';color:string}[];paper:string;photo?:Photo}
 | {type:'aside';title?:Bi;text:Bi;sources?:Source[]}
 | {type:'tour';src:string;alt:Bi;credit:Copy;source_url:string;stops:{x:number;y:number;w:number;h:number;title:Bi;text:Bi}[]}
 | {type:'ladder';title:Bi;left:Bi;right:Bi;items:{step:number;anchor:string;name:string;brand:string;year:string;image?:string;popsa:number;zhest:number;teaser:Bi}[]}
 | {type:'scorecard';popsa:number;zhest:number;facts:{label:Bi;value:Bi}[]}
 | {type:'scentmap';title:Bi;lede:Bi;x:Bi;y:Bi;families:{id:string;label:Bi;color:string}[];items:{id:string;name:string;brand:string;year:string;family:string;step:number;anchor?:string;image?:string;popsa:number;zhest:number;px:number;py:number;flip?:boolean;who?:Bi;notes:Bi;text:Bi;teaser:Bi;invented?:boolean}[]};
export type Cover = (Omit<Art,'type'> & {kind:'art'}) | (Omit<Collage,'type'> & {kind:'collage'});
export interface Chapter {id:string;name:Bi;kicker?:Bi;heat?:number;blocks:Block[]}
export interface Project {id:string;layout:'longread';theme:'watercolor'|'yeye';title:Bi;dek:Bi;date:string;cover:Cover;paper?:string;chapters:Chapter[]}
export interface Entry {id:string;title:Bi;dek?:Bi;tags:string[];upcoming?:boolean;tile:{type:'art'|'collage'|'empty'|'type'|'image'|'video';src?:string;quote?:Bi}}
export interface Media {src:string;widths:Record<string,string>;width:number;height:number}
export interface Data {entries:Entry[];projects:Record<string,Project>;media:Record<string,Media>}
export const local=(v:Copy,l:Lang):string=>typeof v==='string'?v:typeof v[l]==='string'?v[l] as string:(v[l] as {text:string}).text;
export const text=(b:Block,l:Lang):string=>'text' in b?local(b.text,l):b.type==='clipping'?local(b.body,l):'';
const fail=(message:string):never=>{throw Error(message)};
const str=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const bi=(v:any)=>{if(!v||!str(v.ru)||!(str(v.en)||str(v.en?.text)))fail('Missing bilingual string')};
const copy=(v:any)=>{if(!str(v))bi(v)};
export const http=(v:unknown):boolean=>{try {return typeof v==='string'&&['http:','https:'].includes(new URL(v).protocol)}catch{return false}};
const source=(s:any)=>{if(!s||!str(s.title)||!http(s.url))fail('Invalid source: title and http(s) URL required')};
export function assetPath(src:string,folder='art'):string {
 if(!str(src)||src.includes('..')||src.includes('\\')||src.startsWith('/')||! /\.(png|jpe?g|webp|avif)$/i.test(src))fail('Invalid asset path');
 const result=/^(art|photos)\//.test(src)?src:`${folder}/${src}`;
 if(!/^(art|photos)\/[\w./ -]+$/i.test(result))fail('Invalid asset path');
 return result;
}
const asset=(v:any,folder='art')=>{assetPath(v,folder)};
const list=(v:any)=>{if(!Array.isArray(v)||!v.length)fail('Expected nonempty list')};
const choice=(v:any,values:string[])=>{if(!values.includes(v))fail(`Invalid value: ${v}`)};
const finite=(...values:any[])=>{if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)))fail('Expected finite number')};
const video=(v:any)=>{if(typeof v!=='string'||!/^[\w-]{11}$/.test(v))fail('Invalid YouTube id')};
const color=(v:any)=>{if(!str(v)||! /^(#[\da-f]{3,8}|[a-z]+)$/i.test(v))fail('Invalid color')};
export function validateBlock(b:any):asserts b is Block {
 if(!b||typeof b!=='object')fail('Invalid block');
 if(b.size!==undefined)choice(b.size,['bleed','wide','column','left','right']);
 if(b.sources!==undefined){if(!Array.isArray(b.sources))fail('Invalid sources');b.sources.forEach(source)}
 switch(b.type){
 case 'text':case 'aside':bi(b.text);if(b.title)bi(b.title);break;
 case 'art':case 'photo':
  asset(b.src,b.type==='photo'?'photos':'art');bi(b.alt);if(b.caption)bi(b.caption);
  if(b.type==='photo'){copy(b.credit);if(!http(b.source_url))fail('Photo source_url required');bi(b.caption);if(b.treatment)choice(b.treatment,['print','plain','halftone','cutout'])}
  if(b.layers){if(!Array.isArray(b.layers))fail('Invalid layers');for(const layer of b.layers){asset(layer.src);finite(layer.depth)}}break;
 case 'gallery':choice(b.layout,['strip','grid','scatter']);list(b.items);for(const i of b.items){choice(i.type,['art','photo']);validateBlock(i)}break;
 case 'clipping':for(const k of ['masthead','headline','deck','body'])copy(b[k]);for(const k of ['publication','date','page'])if(!str(b.cite?.[k]))fail('Invalid clipping citation');if(!http(b.cite?.url)||!str(b.date))fail('Invalid clipping citation');choice(b.style,['broadsheet','tabloid','magazine','french-daily']);if(b.paper)asset(b.paper);break;
 case 'video':video(b.id);bi(b.title);if(b.poster!==undefined)asset(b.poster);bi(b.caption);copy(b.credit);if(b.start!==undefined){finite(b.start);if(b.start<0)fail('Invalid video start')}break;
 case 'song':
  if(!str(b.title)||!str(b.year))fail('Song title and year required');bi(b.credits);bi(b.text);
  if(b.label!==undefined&&!str(b.label))fail('Invalid song label');
  if(b.video_id!==undefined)video(b.video_id);if(b.video_note!==undefined)bi(b.video_note);if(b.sleeve!==undefined)asset(b.sleeve);break;
 case 'playlist':bi(b.title);list(b.items);for(const item of b.items){if(!str(item?.title)||!str(item?.year))fail('Track title and year required');video(item.video_id);if(item.note!==undefined)bi(item.note)}break;
 case 'structure':video(b.video_id);list(b.sections);let end=0;for(const s of b.sections){bi(s.label);bi(s.note);finite(s.start,s.end);if(s.start<end||s.end<=s.start)fail('Invalid section times');end=s.end}break;
 case 'quote':bi(b.text);copy(b.attribution);source(b.source);break;
 case 'timeline':list(b.items);for(const i of b.items){if(!str(i.date))fail('Missing date');bi(i.text)}break;
 case 'poster':color(b.paper);list(b.lines);for(const line of b.lines){copy(line.text);choice(line.size,['xl','l','m','s']);choice(line.font,['display','grotesk','script']);color(line.color)}if(b.photo){choice(b.photo.type,['photo']);validateBlock(b.photo)}break;
 case 'collage':if(typeof b.background==='string')asset(b.background);else {choice(b.background?.type,['art','photo']);validateBlock(b.background)}
  if(!Array.isArray(b.pieces)||!Array.isArray(b.balloons))fail('Invalid collage');
  for(const p of b.pieces){asset(p.src);finite(p.x,p.y,p.w,p.rotate,p.z,p.depth);if(p.x<0||p.x>100||p.y<0||p.y>100||p.w<=0||p.w>100)fail('Invalid collage coordinates')}
  for(const balloon of b.balloons){copy(balloon.text);if(!str(balloon.who)||! /^[a-z]{2,3}(-[A-Za-z]+)?$/.test(balloon.lang))fail('Invalid balloon');finite(balloon.x,balloon.y);if(balloon.x<0||balloon.x>100||balloon.y<0||balloon.y>100)fail('Invalid balloon coordinates');choice(balloon.tail,['left','right','down'])}break;
 case 'tour':asset(b.src,'photos');bi(b.alt);copy(b.credit);if(!http(b.source_url))fail('Tour source_url required');list(b.stops);for(const st of b.stops){finite(st.x,st.y,st.w,st.h);if(st.x<0||st.y<0||st.w<=0||st.h<=0||st.x+st.w>100.01||st.y+st.h>100.01)fail('Invalid tour stop');bi(st.title);bi(st.text)}break;
 case 'scentmap':bi(b.title);bi(b.lede);bi(b.x);bi(b.y);list(b.families);list(b.items);{const fam=new Set(b.families.map((f:{id:string;label:Bi;color:string})=>{if(!/^[a-z0-9-]+$/.test(f.id)||!/^#[0-9a-f]{6}$/i.test(f.color))fail('Invalid scentmap family');bi(f.label);return f.id}));const ids=new Set<string>();for(const it of b.items){finite(it.step,it.popsa,it.zhest,it.px,it.py);if(!/^[a-z0-9-]+$/.test(it.id)||ids.has(it.id)||!str(it.name)||!str(it.brand)||!fam.has(it.family)||(it.anchor&&!/^[a-z0-9-]+$/.test(it.anchor)))fail(`Invalid scentmap item ${it.id}`);ids.add(it.id);if(it.image)asset(it.image,'photos');if(it.who)bi(it.who);bi(it.notes);bi(it.text);bi(it.teaser)}}break;
 case 'ladder':bi(b.title);bi(b.left);bi(b.right);list(b.items);for(const it of b.items){finite(it.step,it.popsa,it.zhest);if(!str(it.name)||!str(it.brand)||!str(it.year)||!/^[a-z0-9-]+$/.test(it.anchor))fail('Invalid ladder item');if(it.image)asset(it.image,'photos');bi(it.teaser)}break;
 case 'scorecard':finite(b.popsa,b.zhest);list(b.facts);for(const f of b.facts){bi(f.label);bi(f.value)}break;
 default:fail(`Unknown block type: ${b.type}`);
 }
}
export function validateProject(p:any):Project {
 if(!p||! /^[a-z0-9-]+$/.test(p.id)||p.layout!=='longread')fail('Invalid project');
 choice(p.theme,['watercolor','yeye','rose','scent']);bi(p.title);bi(p.dek);if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date))fail('Invalid date');
 choice(p.cover?.kind,['art','collage']);validateBlock({...p.cover,type:p.cover.kind});if(p.paper)asset(p.paper);
 list(p.chapters);const ids=new Set<string>();for(const c of p.chapters){if(!/^[a-z0-9-]+$/.test(c.id)||ids.has(c.id))fail('Invalid chapter id');ids.add(c.id);bi(c.name);if(c.kicker)bi(c.kicker);list(c.blocks);c.blocks.forEach(validateBlock)}return p;
}
/** The only assets the compiler may emit. Nested galleries/collages are included. */
export function projectAssets(p:Project):string[] {
 const files=new Set<string>();const add=(src:string,folder='art')=>files.add(assetPath(src,folder));
 const visit=(b:Block)=>{switch(b.type){
 case 'art':case 'photo':add(b.src,b.type==='photo'?'photos':'art');if(b.type==='art')b.layers?.forEach(l=>add(l.src));break;
 case 'gallery':b.items.forEach(visit);break;
 case 'clipping':if(b.paper)add(b.paper);break;
 case 'video':if(b.poster)add(b.poster);break;
 case 'song':if(b.sleeve)add(b.sleeve);break;
 case 'poster':if(b.photo)visit(b.photo);break;
 case 'tour':add(b.src,'photos');break;
 case 'ladder':case 'scentmap':for(const it of b.items)if(it.image)add(it.image,'photos');break;
 case 'collage':typeof b.background==='string'?add(b.background):visit(b.background);b.pieces.forEach(p=>add(p.src));break;
 }};
 visit({...p.cover,type:p.cover.kind} as Block);if(p.paper)add(p.paper);p.chapters.forEach(c=>c.blocks.forEach(visit));return [...files];
}
