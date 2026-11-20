// Synthesised ambience: no recording is loaded or played without consent.
export class Ambience {
 private ctx?:AudioContext;private rain?:AudioBufferSourceNode;private timer?:number;
 enabled=false;speed=0;
 async toggle():Promise<boolean>{
  this.enabled=!this.enabled;
  if(!this.enabled){this.rain?.stop();clearInterval(this.timer);await this.ctx?.suspend();return false;}
  this.ctx??=new AudioContext();await this.ctx.resume();
  const c=this.ctx,buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const a=buffer.getChannelData(0);
  for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*.11;
  const source=c.createBufferSource();source.buffer=buffer;source.loop=true;
  const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1200;
  const gain=c.createGain();gain.gain.value=.18;source.connect(filter).connect(gain).connect(c.destination);source.start();this.rain=source;
  let beat=0;this.timer=window.setInterval(()=>{if(document.hidden)return;if(beat++%(this.speed>1?1:3)===0)this.knock(100,.045,.07)},160);return true;
 }
 private knock(freq:number,duration:number,volume:number){if(!this.enabled||!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(40,c.currentTime+duration);g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration);}
 fire(){this.knock(500,.15,.2)}
}
