// Adapted from Sankofa scripts/seo: prerender, alternates, JSON-LD, discovery files.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
import {homePage,projectPage,esc,url,home} from '../src/render.ts';
import {type Data,type Lang,text} from '../src/model.ts';
const data:Data=JSON.parse(await readFile('src/generated.json','utf8'));
const template=await readFile('dist/index.html','utf8');
const site=(process.env.SITE_URL??'https://dormer.workshop.aenix.io').replace(/\/$/,'');
if(!/^https?:\/\//.test(site))throw Error('SITE_URL must be an absolute HTTP(S) URL');
const json=(v:unknown)=>JSON.stringify(v).replace(/</g,'\\u003c');
const pages:{path:string;lang:Lang;title:string;description:string;alternate:string;body:string;id?:string}[]=[];
for(const lang of ['en','ru'] as Lang[]){
 pages.push({path:home(lang),lang,title:'Dormer',description:lang==='ru'?'Большие истории о музыке, живописи, театре, запахах — обо всём, что нам интересно.':'Independent multimedia stories about music and art.',alternate:home(lang==='ru'?'en':'ru'),body:homePage(data,lang)});
 for(const p of Object.values(data.projects))pages.push({path:url(p.id,lang),lang,title:p.title[lang],description:p.dek[lang],alternate:url(p.id,lang==='ru'?'en':'ru'),body:projectPage(data,p,lang),id:p.id});
}
await mkdir('dist/media',{recursive:true});
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#bec6ac"/><path d="M0 450 Q350 300 1200 420V630H0" fill="#879477"/><path d="M0 500H1200" stroke="#eee7d3" stroke-width="12"/><text x="70" y="90" font-family="Georgia" font-size="38" fill="#29392d">Dormer ↗</text><text x="70" y="280" font-family="Georgia" font-size="110" fill="#29392d">Bull in the Heather</text><text x="75" y="365" font-family="monospace" font-size="25" fill="#29392d">SONIC YOUTH / FLORIDA DERBY / 1993</text></svg>`)).png().toFile('dist/media/og.png');
for(const p of pages){
 const canonical=site+p.path;const image=site+'/media/og.png';const project=p.id?data.projects[p.id]:undefined;
 const schema={'@context':'https://schema.org','@type':p.id?'Article':'CollectionPage',headline:p.title,name:p.title,description:p.description,inLanguage:p.lang,url:canonical,image,...(project?{datePublished:project.date+'T00:00:00Z',dateModified:project.date+'T00:00:00Z',author:{'@type':'Organization',name:'Dormer'},publisher:{'@type':'Organization',name:'Dormer'},articleBody:project.scenes.flatMap(s=>s.blocks.map(b=>text(b,p.lang))).join('\n\n')}: {})};
 const en=p.lang==='en'?p.path:p.alternate,ru=p.lang==='ru'?p.path:p.alternate;
 const head=`<title>${esc(p.title)}${p.id?' — Dormer':''}</title><meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${esc(canonical)}"><link rel="alternate" hreflang="en" href="${site+en}"><link rel="alternate" hreflang="ru" href="${site+ru}"><link rel="alternate" hreflang="x-default" href="${site+en}"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:site_name" content="Dormer"><meta property="og:type" content="${p.id?'article':'website'}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:locale" content="${p.lang==='en'?'en_US':'ru_RU'}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Bull in the Heather — Dormer"><meta name="twitter:card" content="summary_large_image"><link rel="alternate" type="application/atom+xml" href="${home(p.lang)}projects.atom"><script type="application/ld+json">${json(schema)}</script>`;
 const html=template.replace('<html lang="en">',`<html lang="${p.lang}">`).replace('<!-- seo --><title>Dormer</title>',head).replace('<!-- app -->',()=>p.body);
 await mkdir('dist'+p.path,{recursive:true});await writeFile('dist'+p.path+'index.html',html);
}
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pages.map(p=>`<url><loc>${esc(site+p.path)}</loc><xhtml:link rel="alternate" hreflang="${p.lang==='en'?'ru':'en'}" href="${esc(site+p.alternate)}"/></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
await writeFile('dist/llms.txt',`# Dormer\n\n> Independent bilingual multimedia special projects.\n\nEnglish translations are drafts. Artwork may be placeholder. Sources are linked beside each block.\n\n${pages.map(p=>`- [${p.title} (${p.lang})](${site+p.path}): ${p.description}`).join('\n')}\n\n- [Full text](${site}/llms-full.txt)\n- [Atom](${site}/projects.atom)\n`);
for(const lang of ['en','ru'] as Lang[]){
 const projects=Object.values(data.projects);
 await writeFile(`dist${home(lang)}llms-full.txt`,projects.map(p=>`# ${p.title[lang]}\n\n${p.scenes.map(s=>`## ${s.name[lang]}\n\n${s.blocks.map(b=>text(b,lang)+'\n\n'+b.sources.map(s=>`[${s.title}](${s.url})`).join('; ')).join('\n\n')}`).join('\n\n')}`).join('\n\n'));
 const self=site+home(lang)+'projects.atom';
 await writeFile(`dist${home(lang)}projects.atom`,`<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}"><id>${self}</id><title>Dormer</title><link href="${self}" rel="self"/><updated>2026-11-20T00:00:00Z</updated><author><name>Dormer</name></author>${projects.map(p=>`<entry><id>${site+url(p.id,lang)}</id><title>${esc(p.title[lang])}</title><link href="${site+url(p.id,lang)}"/><updated>${p.date}T00:00:00Z</updated><summary>${esc(p.dek[lang])}</summary></entry>`).join('')}</feed>`);
}
console.log(`Prerendered ${pages.length} pages; canonical origin: ${site}`);
