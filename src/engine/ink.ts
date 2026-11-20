// Pointer depth follows Sankofa's LivingInk model; transforms stay decorative.
export function ink(root:HTMLElement, calm:()=>boolean):void {
 root.addEventListener('pointermove',e=>{
  if(calm())return;const r=root.getBoundingClientRect();
  root.style.setProperty('--px',String((e.clientX-r.left)/r.width-.5));
  root.style.setProperty('--py',String((e.clientY-r.top)/r.height-.5));
 });
 root.addEventListener('pointerleave',()=>{root.style.setProperty('--px','0');root.style.setProperty('--py','0')});
}
