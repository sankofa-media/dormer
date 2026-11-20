import {clamp} from './scroll';
// Each pole owns its reading distance, followed by travel to the next pole.
export function raceTimeline(overflows:number[],travel=850){
 let end=0;
 const stops=overflows.map((overflow,i)=>{const start=end;const hold=Math.max(0,overflow)+250;end+=hold+(i<overflows.length-1?travel:0);return {start,hold,overflow}});
 return {stops,length:end,at(distance:number){
  const d=Math.max(0,distance);
  for(let i=0;i<stops.length;i++){const s=stops[i];if(d<=s.start+s.hold||i===stops.length-1)return {position:i,pole:i,read:Math.min(s.overflow,Math.max(0,d-s.start))};
   if(d<stops[i+1].start){const fraction=(d-s.start-s.hold)/travel;return {position:i+fraction,pole:Math.round(i+fraction),read:fraction<.5?s.overflow:0}};
  }
  return {position:0,pole:0,read:0};
 }};
}
// Illustrative field spacing; only Bull's late advance is historically asserted.
export function runnerPosition(index:number,progress:number){
 const early=[.43,.86,.76,.65,.59,.53,.48,.37,.30,.22,.94,.12,.04];
 const finish=[.96,.78,.72,.66,.60,.54,.48,.41,.34,.27,.20,.12,.03];
 const advance=clamp((progress-.68)/.32);const eased=advance*advance*(3-2*advance);
 return early[index]+(finish[index]-early[index])*eased+Math.sin(progress*19+index*1.7)*.012*Math.sin(Math.PI*progress);
}
