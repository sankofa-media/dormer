// Link-preview pictures: a 1200x630 shot of each page's own cover, per language.
// Run after `npm run build` with the preview server up: `npm run og`.
// The pictures are committed under public/og/ and picked up by scripts/seo.ts.
import {chromium} from '@playwright/test';
import {readdir,mkdir} from 'node:fs/promises';
const base=process.env.OG_BASE??'http://127.0.0.1:4173';
const ids=(await readdir('content/projects',{withFileTypes:true})).filter(d=>d.isDirectory()).map(d=>d.name);
const pages:{path:string;file:string}[]=[];
for(const lang of ['en','ru']){
 const root=lang==='ru'?'/ru/':'/';
 pages.push({path:root,file:`home-${lang}.jpg`},{path:root+'friends/',file:`friends-${lang}.jpg`});
 for(const id of ids)pages.push({path:`${root}projects/${id}/`,file:`${id}-${lang}.jpg`});
}
await mkdir('public/og',{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1600,height:840},deviceScaleFactor:0.75});
for(const p of pages){
 const res=await page.goto(base+p.path,{waitUntil:'networkidle'});
 if(!res?.ok())continue;
 if(await page.locator('.theme-void').count()){
  // A void page is only a door: its preview is the project's tile from the home page.
  const id=p.path.match(/projects\/([^/]+)/)![1];
  await page.goto(base+p.path.replace(/projects\/.*$/,''),{waitUntil:'networkidle'});
  await page.evaluate(id=>{const t=document.querySelector(`.tile-id-${id}`)!.cloneNode(true) as HTMLElement;document.body.innerHTML='';document.body.append(t);t.setAttribute('style','position:fixed;inset:0;transform:none;width:100vw;height:100vh;margin:0;filter:none');(t.querySelector('.tile-inner') as HTMLElement).style.clipPath='none'},id);
  await page.addStyleTag({content:'body:after{display:none}.tile-id-'+id+' h2{font-size:60px!important;max-width:35%!important}.tile-id-'+id+' p{font-size:20px!important}.tile-foot{display:none!important}'});
  await page.waitForTimeout(800);
  await page.screenshot({path:`public/og/${p.file}`,type:'jpeg',quality:86});
  console.log('og',p.file);continue;
 }
 await page.addStyleTag({content:'header,.skip,.dock,[data-cookie]{display:none!important}*{animation:none!important;transition:none!important}.cover{padding-top:24px!important;margin-top:0!important}'});
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForTimeout(600);
 await page.screenshot({path:`public/og/${p.file}`,type:'jpeg',quality:86});
 console.log('og',p.file);
}
await browser.close();
