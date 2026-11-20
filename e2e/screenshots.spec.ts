import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
test('capture wall and every scene',async({page},info)=>{
 test.setTimeout(120000);
 await mkdir('.shots',{recursive:true});const paths:string[]=[];
 const shot=async(name:string,fullPage=false)=>{const path=`.shots/${info.project.name}-${name}.png`;await page.locator('img:not([data-src])').evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode().catch(()=>{}))));await page.waitForTimeout(350);await page.screenshot({path,fullPage,animations:'disabled',scale:'css'});paths.push(path)};
 await page.goto('/ru/');await page.evaluate(()=>document.fonts.ready);await shot('home');await shot('home-wall',true);await page.goto('/ru/projects/bull-in-the-heather/');await page.evaluate(()=>document.fonts.ready);await shot('cover');await page.locator('#start-race').click();await page.waitForTimeout(650);await shot('start');
 for(let i=1;i<=9;i++){await page.locator('#programme').click();await page.locator(`[data-go="${i}"]`).click();await expect(page.locator('.race-stage')).toHaveAttribute('data-pole',String(i));await shot(`pole-${i}`);
 const paper=page.locator(`#pole-${i} .chapter-paper`);const overflow=await paper.evaluate(el=>el.scrollHeight-el.clientHeight);
 for(let d=Math.min(overflow,250);d>0;d=Math.min(overflow,d+250)){
 await page.evaluate(({i,d})=>{const r=document.querySelector<HTMLElement>('#race')!;scrollTo(0,r.offsetTop-document.querySelector<HTMLElement>('.race-tools')!.offsetHeight+Number(document.querySelector<HTMLElement>(`#pole-${i}`)!.dataset.scrollStart)+d)}, {i,d});
 await shot(`pole-${i}-read-${d}`);if(d===overflow)break;
 }
if(i===9)await shot('finish');if(i===3){await page.locator('#horse-name').scrollIntoViewIfNeeded();await shot('constructor')}}
 for(const id of ['kentucky','father','old-friends','april','paddock']){await page.locator('#'+id).evaluate(el=>el.scrollIntoView({block:'start'}));await shot(id);const path=`.shots/${info.project.name}-${id}-full.png`;await page.locator('#'+id).screenshot({path,animations:'disabled',scale:'css'});paths.push(path)}
 await page.locator('#calm').click();await page.locator('#pole-3').scrollIntoViewIfNeeded();await shot('calm');await writeFile(`.shots/${info.project.name}-manifest.txt`,paths.join('\n')+'\n');
});
