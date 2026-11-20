// Adapted from Sankofa layered(): opaque plate first, whole figures above it.
import type {Data,Media} from '../model.ts';
function image(asset:Media,layer=false):HTMLImageElement{
 const img=document.createElement('img');img.className='scene-art'+(layer?' scene-layer':'');img.alt='';img.decoding='async';
 img.dataset.src=asset.widths[innerWidth<650?'960':'1600'];return img;
}
export function mountArt(data:Data,id:string):void{
 const media=data.media;const prefix=id+'/';
 const track=media[prefix+'track-plate'];
 if(track)for(const target of document.querySelectorAll('.race-backdrop,.cover-landscape,.tile-landscape')){const img=image(track);img.src=img.dataset.src!;delete img.dataset.src;target.prepend(img);}
 for(const section of document.querySelectorAll<HTMLElement>('[data-scene]')){
  const scene=section.dataset.scene!;const target=section.querySelector('.after-art,.cover-landscape')??section;
  const names=Object.keys(media).filter(k=>k.startsWith(prefix+scene+'-')&&!/gallop-/.test(k)).sort((a,b)=>Number(b.endsWith('-plate'))-Number(a.endsWith('-plate')));
  for(const key of names)target.prepend(image(media[key],!key.endsWith('-plate')));
 }
}
export function spriteFrames(data:Data,id:string):Map<number,string[]>{
 const frames=new Map<number,string[]>();
 for(let n=0;n<13;n++){
  const keys=Object.keys(data.media).filter(k=>new RegExp(`^${id}/horse-${n+1}-gallop-\\d+$`).test(k)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  if(keys.length)frames.set(n,keys.map(k=>data.media[k].widths['480']));
 }
 return frames;
}
