import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {type Data} from '../src/model';
import {projectPage} from '../src/render';
import {fixture,fixtureData} from '../tests/fixtures';
const data:Data=JSON.parse(readFileSync('src/generated.json','utf8'));
for(const project of Object.values(data.projects))for(const lang of ['ru','en'] as const){
 test(`${project.id} ${lang}: all chapters, click-only video and mobile width`,async({page})=>{
  const requests:string[]=[];page.on('request',r=>{if(/youtube|ytimg/.test(r.url()))requests.push(r.url())});
  await page.goto(`${lang==='ru'?'/ru':''}/projects/${project.id}/`);
  await expect(page.locator('[data-chapter]')).toHaveCount(project.chapters.length);
  for(const chapter of project.chapters)await expect(page.locator(`#${chapter.id} h2`)).toHaveText(typeof chapter.name[lang]==='string'?chapter.name[lang] as string:(chapter.name[lang] as {text:string}).text);
  expect(requests).toEqual([]);await expect(page.locator('iframe')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const video=page.locator('.video [data-video]').first();if(await video.count()){await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({body:'<html></html>',contentType:'text/html'}));await video.click();await expect(page.locator('iframe')).toHaveAttribute('src',/^https:\/\/www.youtube-nocookie.com\/embed\//)}
 });
 test(`${project.id} ${lang}: readable without JavaScript`,async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(`${baseURL}${lang==='ru'?'/ru':''}/projects/${project.id}/`);await expect(page.locator('[data-chapter]')).toHaveCount(project.chapters.length);await expect(page.locator('.text-block').first()).toBeVisible();await expect(page.locator('iframe')).toHaveCount(0);await context.close();
 });
}
for(const theme of ['watercolor','yeye'] as const)test(`${theme}: structure API seeks, motion and layout`,async({page})=>{
 const p=fixture(theme);let apiRequests=0;
 await page.route('**/projects/test-*/',async route=>{const response=await route.fetch();const html=await response.text();await route.fulfill({response,body:html.replace(/<div id="app">[\s\S]*?<\/div>\s*<\/body>/,`<div id="app">${projectPage(fixtureData(p),p,'ru')}</div></body>`)})});
 await page.route('https://www.youtube.com/iframe_api',route=>{apiRequests++;return route.fulfill({contentType:'application/javascript',body:`window.seeks=[];window.YT={Player:class{constructor(frame,options){setTimeout(()=>options.events.onReady({target:this}),0)}seekTo(s){window.seeks.push(s)}playVideo(){}}};window.onYouTubeIframeAPIReady();`})});
 await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({body:'<html></html>',contentType:'text/html'}));
 await page.goto(`/projects/${p.id}/`);await expect(page.locator('.structure')).toHaveCount(1);
 expect(apiRequests).toBe(0);await expect(page.locator('iframe')).toHaveCount(0);
 await page.locator('[data-section="1"]').click();await expect.poll(()=>page.evaluate(()=>(window as any).seeks)).toEqual([10]);
 await page.locator('[data-section="0"]').click();await expect.poll(()=>page.evaluate(()=>(window as any).seeks)).toEqual([10,0]);expect(apiRequests).toBe(1);
 await expect(page.locator('.structure iframe')).toHaveAttribute('src',/start=10/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(100,100);await expect(page.locator('[data-depth]').first()).toHaveCSS('translate','none');await expect(page.locator('.bloom').first()).toHaveCSS('mask-image','none');
});
test('home wall, language switch and Pagefind',async({page})=>{
 await page.goto('/ru/');await page.locator('.home-search input').fill('Фердинанд');await page.locator('.home-search').press('Enter');await expect(page.locator('.search-result').first()).toBeVisible();await page.locator('#search-dialog [data-close]').click();await page.locator('header a[lang=en]').click();await expect(page.locator('html')).toHaveAttribute('lang','en');
});

for(const theme of ['watercolor','yeye'] as const)test(`${theme}: songs, shared playlist player and transparent cutouts`,async({page})=>{
 const p=fixture(theme);const requests:string[]=[];
 page.on('request',r=>{if(/youtube|ytimg/.test(r.url()))requests.push(r.url())});
 await page.route('**/projects/test-*/',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<div id="app">[\s\S]*?<\/div>\s*<\/body>/,`<div id="app">${projectPage(fixtureData(p),p,'ru')}</div></body>`)})});
 await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({body:'<html></html>',contentType:'text/html'}));
 await page.goto(`/projects/${p.id}/`);
 expect(requests).toEqual([]);await expect(page.locator('iframe')).toHaveCount(0);
 const tracks=page.locator('.playlist [data-video]');
 await tracks.first().focus();await page.keyboard.press('Enter');
 await expect(page.locator('iframe')).toHaveCount(1);await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie.com\/embed\/m94_C8Z7wLk\?autoplay=1/);
 await page.locator('iframe').evaluate(el=>el.setAttribute('data-original','true'));
 await tracks.nth(1).click();await expect(page.locator('iframe')).toHaveCount(1);await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie.com\/embed\/8JGBNkLM9_8\?autoplay=1/);await expect(page.locator('iframe')).toHaveAttribute('data-original','true');
 await expect(tracks.nth(1)).toHaveAttribute('aria-current','true');await expect(tracks.first()).not.toHaveAttribute('aria-current','true');
 await tracks.first().click();await expect(page.locator('iframe')).toHaveCount(1);await expect(page.locator('iframe')).toHaveAttribute('src',/embed\/m94_C8Z7wLk/);
 await page.locator('.song-watch').click();await expect(page.locator('.song iframe')).toHaveCount(1);await expect(page.locator('.song iframe')).toHaveAttribute('src',/youtube-nocookie.com\/embed\/m94_C8Z7wLk/);await expect(page.locator('.playlist iframe')).toHaveCount(1);
 const cutout=page.locator('.collage-piece img').first();await expect(cutout).toHaveAttribute('src',/^data:image\/png/);await expect(cutout).toHaveCSS('filter',/drop-shadow\(rgb\(255, 255, 255\)/);
 expect(await cutout.evaluate(async el=>{const img=el as HTMLImageElement;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d')!;ctx.drawImage(img,0,0);return ctx.getImageData(0,0,1,1).data[3]})).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('song and playlist links remain usable without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 const p=fixture('yeye');
 await page.route('**/projects/test-*/',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<div id="app">[\s\S]*?<\/div>\s*<\/body>/,`<div id="app">${projectPage(fixtureData(p),p,'en')}</div></body>`)})});
 await page.goto(`${baseURL}/projects/${p.id}/`);
 await expect(page.locator('.song-watch')).toBeVisible();await expect(page.locator('.song-watch')).toHaveAttribute('href',/watch\?v=m94_C8Z7wLk/);
 const tracks=page.locator('.playlist-tracks a');await expect(tracks).toHaveCount(2);await expect(tracks.first()).toBeVisible();await expect(page.locator('.track-note')).toBeVisible();await expect(page.locator('iframe')).toHaveCount(0);
 await page.route('https://www.youtube.com/watch**',route=>route.fulfill({body:'YouTube link destination'}));
 await tracks.nth(1).click();await expect(page).toHaveURL(/youtube.com\/watch\?v=8JGBNkLM9_8/);
 await context.close();
});
