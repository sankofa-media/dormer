import {test,expect} from '@playwright/test';
test('wall, filters, URL history and bilingual search',async({page})=>{
 await page.goto('/');await expect(page.locator('.tile')).toHaveCount(4);await expect(page.locator('.upcoming a')).toHaveCount(0);
 await expect(page.locator('h1')).toHaveText('Dormer');await page.locator('[data-tag=horses]').click();await expect(page.locator('.tile:visible')).toHaveCount(1);await expect(page).toHaveURL(/tag=horses/);
 await page.reload();await expect(page.locator('.tile:visible')).toHaveCount(1);await page.locator('[data-tag=art]').click();await expect(page.locator('.tile:visible')).toContainText('Girl on a Ball');await page.goBack();await expect(page.locator('.tile:visible')).toContainText('Bull in the Heather');
 await page.locator('header [data-search-open]').click();for(const term of ['Ferdinand','Фердинанд']){await page.locator('#search-input').fill(term);await expect(page.locator('.search-result').first()).toBeVisible();await expect(page.locator('#search-results')).toContainText('Bull');await expect(page.locator('.search-result p').first()).not.toBeEmpty()}
 await page.keyboard.press('Escape');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/ru/');await page.locator('header [data-search-open]').click();await page.locator('#search-input').fill('Ferdinand');await expect(page.locator('.search-result').first()).toBeVisible();
});
test('start, every pole, constructor, programme and final paddock',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/ru/projects/bull-in-the-heather/');await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');await page.locator('#start-race').click();await expect(page.locator('body')).toHaveClass(/fired/);await expect(page.locator('.race-stage')).toHaveAttribute('data-pole','0');
 for(let i=1;i<=9;i++){await page.locator('#programme').click();await page.locator(`[data-go="${i}"]`).click();await expect(page.locator('.race-stage')).toHaveAttribute('data-pole',String(i));await expect(page.locator(`#pole-${i} .chapter-paper`)).toBeInViewport();}
 await page.locator('#programme').click();await expect(page.locator('.runners li')).toHaveCount(13);await page.locator('[data-story="bull"]').click();await expect(page.locator('#name-story')).toContainText('восемнадцать');await page.locator('[data-go="3"]').click();
 const input=page.locator('#horse-name');await input.fill('Bull In The Heather');await expect(page.locator('#name-feedback')).toContainText('19 / 18');await page.locator('#name-form button[type=submit]').click();await expect(page.locator('#saved')).toBeEmpty();await input.fill('Secretariat');await expect(page.locator('#name-feedback')).toContainText('защищено');await input.fill('Bull Inthe Heather');await expect(page.locator('#name-feedback')).toContainText('18 / 18');await page.locator('#name-form button[type=submit]').click();await expect(page.locator('#saved')).toContainText('Сохранено');
 await page.locator('#paddock').scrollIntoViewIfNeeded();await expect(page.locator('#reader-horse')).toBeVisible();await expect(page.locator('#reader-horse span')).toHaveText('Bull Inthe Heather');await page.reload();await expect(page.locator('#reader-horse span')).toHaveText('Bull Inthe Heather');expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('wheel progress and reduced motion fallback',async({page})=>{
 await page.goto('/projects/bull-in-the-heather/');await page.locator('#start-race').click();await expect(page.locator('body')).toHaveClass(/fired/);await page.waitForTimeout(550);await page.mouse.move(10,400);await page.mouse.wheel(0,1200);await expect(page.locator('.race-stage')).toHaveAttribute('data-pole','1');
 await page.evaluate(()=>{const r=document.querySelector<HTMLElement>('#race')!,s=document.querySelector<HTMLElement>('.race-stage')!,bar=document.querySelector<HTMLElement>('.race-tools')!;scrollTo(0,r.offsetTop-bar.offsetHeight+(r.offsetHeight-s.offsetHeight)*5/9)});await expect(page.locator('.race-stage')).toHaveAttribute('data-pole','5');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('body')).toHaveClass(/calm/);await expect(page.locator('#pole-2')).not.toHaveAttribute('aria-hidden','true');await expect(page.locator('#pole-3 .chapter-paper')).toHaveCSS('max-height','none');await page.locator('#pole-3').scrollIntoViewIfNeeded();await expect(page.locator('#horse-name')).toBeVisible();expect(await page.locator('.track').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
});
test('no JavaScript retains article and SEO',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(baseURL+'/ru/projects/bull-in-the-heather/');await expect(page.locator('h1')).toContainText('Heather');await expect(page.locator('#father')).toContainText('Фердинанда');await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',/\/ru\/projects\/bull-in-the-heather\/$/);expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain('Article');await context.close();
});
test('YouTube consent, keyboard and horizontal touch',async({page})=>{
 await page.goto('/projects/bull-in-the-heather/');await expect(page.locator('iframe')).toHaveCount(0);await page.locator('#start-race').click();await page.waitForTimeout(550);await page.keyboard.press('ArrowRight');await expect(page.locator('.race-stage')).toHaveAttribute('data-pole','1');
 await page.locator('.race-stage').evaluate(el=>{const start=new Touch({identifier:1,target:el,clientX:330,clientY:400});el.dispatchEvent(new TouchEvent('touchstart',{touches:[start],bubbles:true}));const end=new Touch({identifier:1,target:el,clientX:30,clientY:400});el.dispatchEvent(new TouchEvent('touchmove',{touches:[end],bubbles:true,cancelable:true}))});
 expect(await page.locator('.track').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
 await page.locator('#programme').click();await page.locator('[data-go="6"]').click();await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({body:'<html><body>Offline embed fixture</body></html>',contentType:'text/html'}));await page.locator('[data-video="8JGBNkLM9_8"]').click();await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie.com\/embed\/8JGBNkLM9_8/);
});
test('review: real runners, single sky panel and per-block sources',async({page})=>{
 await page.goto('/ru/projects/bull-in-the-heather/#pole-2');
 await expect(page.locator('.race-stage')).toHaveAttribute('data-pole','2');
 await expect(page.locator('.herd .horse')).toHaveCount(13);
 await expect(page.locator('.herd [data-horse="1"]')).toHaveCount(1);
 await expect(page.locator('.horse i')).toHaveCount(0);
 for(const img of await page.locator('.herd img').all())await expect(img).toHaveJSProperty('naturalWidth',480);
 const panel=page.locator('#pole-2 .chapter-paper'),stage=await page.locator('.race-stage').boundingBox(),box=await panel.boundingBox();
 expect(box!.x).toBeGreaterThanOrEqual(15.5);expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width-15.5);
 expect(box!.width).toBeLessThanOrEqual(520);expect(box!.y+box!.height).toBeLessThan(stage!.y+stage!.height*.55);
 await expect(page.locator('.chapter-paper:visible')).toHaveCount(1);
 const source=page.locator('[data-block="pole-2-1"] details');await expect(source).not.toHaveAttribute('open');await source.locator('summary').click();
 const links=await source.locator('a').allTextContents();expect(links.join(' ')).not.toContain('Ferdinand');
 // Halfway between poles still shows one stationary, fully contained paper.
 await page.evaluate(()=>scrollBy(0,450));await expect(page.locator('.chapter-paper:visible')).toHaveCount(1);
 const active=await page.locator('.chapter-paper:visible').boundingBox();expect(active!.x).toBeGreaterThanOrEqual(15.5);expect(active!.x+active!.width).toBeLessThanOrEqual(page.viewportSize()!.width-15.5);
});
test('review: approved home copy and layered cover respond to pointer',async({page})=>{
 await page.goto('/ru/');await expect(page.locator('.mast h1')).toHaveText('Dormer');
 await expect(page.locator('.home-dek')).toHaveText('Большие истории о музыке, живописи, театре, запахах — обо всём, что нам интересно.');
 await expect(page.locator('.header-note')).toHaveCount(0);await expect(page.locator('.tile-figure')).toHaveAttribute('src',/cover-grey/);
 const tile=page.locator('.tile-0');await tile.dispatchEvent('pointermove',{clientX:200,clientY:500});
 expect(await tile.evaluate(el=>el.style.getPropertyValue('--px'))).not.toBe('');
 await expect(page.locator('.tile-1 .tile-meta')).not.toBeVisible();
});
