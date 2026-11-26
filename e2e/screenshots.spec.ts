import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {type Data} from '../src/model';
import {projectPage} from '../src/render';
import {fixture,fixtureData} from '../tests/fixtures';
const data:Data=JSON.parse(readFileSync('src/generated.json','utf8'));
test('screenshots: supplied projects and theme fixtures',async({page},info)=>{
 test.setTimeout(120000);await mkdir('test-results/shots',{recursive:true});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/ru/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/shots/home-ru-${info.project.name}.png`,fullPage:true,animations:'disabled'});
 for(const p of Object.values(data.projects))for(const lang of ['ru','en'] as const){await page.goto(`${lang==='ru'?'/ru':''}/projects/${p.id}/`);await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{const image=i as HTMLImageElement;image.loading='eager';return image.decode()})));await expect(page.locator('h1')).toBeVisible();await page.screenshot({path:`test-results/shots/${p.id}-${lang}-${info.project.name}.png`,fullPage:true,animations:'disabled'})}
 for(const theme of ['watercolor','yeye'] as const){const p=fixture(theme);await page.goto('/');await page.locator('#app').evaluate((el,html)=>{el.innerHTML=html},projectPage(fixtureData(p),p,'ru'));await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{const image=i as HTMLImageElement;image.loading='eager';return image.decode()})));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/shots/fixture-${theme}-${info.project.name}.png`,fullPage:true,animations:'disabled'})}
});
