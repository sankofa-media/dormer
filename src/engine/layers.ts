// Adapted from Sankofa layered(): opaque plate first, whole figures above it.
import type {Data,Media} from '../model.ts';
function image(asset:Media,layer=false):HTMLImageElement{
 const img=document.createElement('img');img.className='scene-art'+(layer?' scene-layer':'');img.alt='';img.decoding='async';
 img.dataset.src=asset.widths[innerWidth<650?'960':'1600'];return img;
}
export function mountArt(data:Data,id:string):void{
 const media=data.media;const prefix=id+'/';
 function group(scene:string,target:Element,immediate=false){
  const keys=Object.keys(media).filter(k=>k.startsWith(prefix+scene+'-')&&!k.endsWith('-full')&&!/gallop-/.test(k)).sort((a,b)=>Number(b.endsWith('-plate'))-Number(a.endsWith('-plate')));
  if(!keys.length)return false;
  const art=document.createElement('div');art.className='art-stack';art.setAttribute('aria-hidden','true');
  for(const key of keys){const img=image(media[key],!key.endsWith('-plate'));if(immediate){img.src=img.dataset.src!;delete img.dataset.src;}art.append(img)}target.prepend(art);return true;
 }
 const track=media[prefix+'track-plate'];
 if(track)for(const target of document.querySelectorAll('.race-backdrop,.tile-landscape')){const img=image(track);img.src=img.dataset.src!;delete img.dataset.src;target.prepend(img);}
 const cover=document.querySelector('.cover-landscape');
 if(cover){const found=group('start',cover,true);if(found)cover.classList.add('has-art');}
 for(const section of document.querySelectorAll<HTMLElement>('.after-scene')){
  const scene=section.dataset.scene!;const alias=({father:'stall','old-friends':'paddock',april:'paddock'} as Record<string,string>)[scene]??scene;
  const target=section.querySelector('.after-art')!;
  // The closing paddock is empty apart from the reader's own horse.
  if(scene==='paddock'||scene==='april'||scene==='father'){
   const plate=media[prefix+alias+'-plate'];if(plate){target.prepend(image(plate));target.classList.add('has-art')}
  }else if(group(alias,target))target.classList.add('has-art');
 }
 document.querySelectorAll('.figure-placeholder').forEach((target,i)=>{if(group(`clip-${i+1}`,target))target.classList.add('has-art')});
 for(let n=1;n<=9;n++){const pole=document.querySelector(`#pole-${n} .pole`);const asset=media[prefix+`track-pole-${n}`];if(pole&&asset){const img=image(asset,true);pole.append(img)}}
}
export function spriteFrames(data:Data,id:string):Map<number,string[]>{
 const frames=new Map<number,string[]>();
 for(let n=0;n<13;n++){
  const keys=Object.keys(data.media).filter(k=>new RegExp(`^${id}/horse-${n+1}-gallop-\\d+$`).test(k)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  if(keys.length)frames.set(n,keys.map(k=>data.media[k].widths['480']));
 }
 return frames;
}
