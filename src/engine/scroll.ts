// Adapted from Sankofa's scene progress and ahead-loading engine (Apache-2.0).
export const clamp = (n:number) => Math.max(0,Math.min(1,n));
export function scrollToX(scroll:number,start:number,length:number,width:number):number {
 return clamp((scroll-start)/Math.max(1,length))*Math.max(0,width);
}
export function load(scene:Element):void {
 for(const img of scene.querySelectorAll<HTMLImageElement>('img[data-src]')){img.src=img.dataset.src!;delete img.dataset.src;}
}
export function ahead(root:Element):()=>void {
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){load(e.target);observer.unobserve(e.target)}},{rootMargin:'120%'});
 root.querySelectorAll('[data-scene]').forEach(el=>observer.observe(el));
 return ()=>observer.disconnect();
}
