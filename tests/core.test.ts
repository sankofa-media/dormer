import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {parse} from 'yaml';
import {validateProject,validateBlock,projectAssets} from '../src/model';
const bi={ru:'Текст',en:'Text'};
const photo={type:'photo',src:'photo.jpg',alt:bi,caption:bi,credit:'Photo: Author',source_url:'https://example.com/photo'};
const project=parse(readFileSync('content/projects/bull-in-the-heather/project.yaml','utf8'));
describe('longread validation',()=>{
 it('accepts the supplied bilingual project',()=>expect(validateProject(project)).toBe(project));
 it('requires photo credit and a source URL including in galleries',()=>{for(const key of ['credit','source_url']){const bad={...photo,[key]:undefined};expect(()=>validateBlock(bad)).toThrow();expect(()=>validateBlock({type:'gallery',layout:'grid',items:[bad]})).toThrow()}});
 it('rejects unknown block types',()=>expect(()=>validateBlock({type:'race'})).toThrow('Unknown block type'));
 it('rejects unsafe URLs, duplicate chapters and missing translations',()=>{
 expect(()=>validateBlock({...photo,source_url:'javascript:alert(1)'})).toThrow();
 expect(()=>validateBlock({type:'text',text:bi,sources:[{title:'',url:'https://example.com'}]})).toThrow('Invalid source');
 expect(()=>validateProject({...project,chapters:[project.chapters[0],project.chapters[0]]})).toThrow('chapter');
 expect(()=>validateBlock({type:'text',text:{ru:'Есть'}})).toThrow('bilingual');
 });
 it('rejects traversal and invalid section times',()=>{expect(()=>validateBlock({...photo,src:'../secret.jpg'})).toThrow('asset');expect(()=>validateBlock({type:'structure',video_id:'8JGBNkLM9_8',sections:[{label:bi,note:bi,start:5,end:2}]})).toThrow('times')});
 it('collects only referenced assets, including nested photos',()=>{const p=structuredClone(project);p.chapters[0].blocks.push({type:'gallery',layout:'grid',items:[photo]});const assets=projectAssets(p);expect(assets).toContain('photos/photo.jpg');expect(assets).toContain('art/cover.webp');expect(assets.some(s=>/walk|gallop/.test(s))).toBe(false)});
});

import {fixture,fixtureData} from './fixtures';
import {projectPage,markdown} from '../src/render';
for(const theme of ['watercolor','yeye'] as const)it(`validates and renders every ${theme} block in both languages`,()=>{
 const p=fixture(theme);expect(validateProject(p)).toBe(p);
 for(const lang of ['ru','en'] as const){const html=projectPage(fixtureData(p),p,lang);expect(html).toContain('class="structure"');expect(html).toContain('class="clipping');expect(html).toContain('data-video=');expect(html).not.toContain('<iframe');expect(html).toContain('width="960" height="640"');expect(html).toContain(lang==='ru'?'Вторая часть':'Second section')}
});
it('escapes HTML and rejects executable Markdown links',()=>{expect(markdown('<script>alert(1)</script> [bad](javascript:alert) **bold** *soft*')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt; bad <strong>bold</strong> <em>soft</em></p>')});

it('preserves time gaps in proportional structure strips',()=>{const p=fixture('yeye');p.chapters[0].blocks=[{type:'structure',video_id:'8JGBNkLM9_8',sections:[{label:bi,note:bi,start:10,end:20},{label:bi,note:bi,start:30,end:40}]}];const html=projectPage(fixtureData(p),p,'en');expect(html).toContain('--gap:25%;--length:25%')});

const song={type:'song',title:'Tous les garçons et les filles',year:'1962',credits:bi,text:bi};
const track={title:'Le temps',year:'1963',video_id:'m94_C8Z7wLk'};
describe('songs and playlists',()=>{
 it('accepts minimal and complete song cards and playlists',()=>{
  expect(()=>validateBlock(song)).not.toThrow();
  expect(()=>validateBlock({...song,label:'Vogue EPL 7967',video_id:track.video_id,video_note:bi,sleeve:'obj-45.png',sources:[{title:'Archive',url:'https://example.com'}]})).not.toThrow();
  expect(()=>validateBlock({type:'playlist',title:bi,items:[track,{...track,note:bi}]})).not.toThrow();
 });
 it('requires original titles, string years and bilingual copy',()=>{
  for(const patch of [{title:bi},{title:''},{year:1962},{year:''},{credits:undefined},{credits:{ru:'Есть'}},{text:undefined},{text:{en:'Only English'}}])expect(()=>validateBlock({...song,...patch})).toThrow();
  for(const patch of [{title:'Not bilingual'},{items:[]},{items:[null]},{items:[{...track,title:bi}]},{items:[{...track,year:1963}]},{items:[{...track,note:{ru:'Есть'}}]}])expect(()=>validateBlock({type:'playlist',title:bi,items:[track],...patch})).toThrow();
 });
 it('validates optional fields, video IDs, sources and asset paths',()=>{
  for(const patch of [{label:''},{video_id:''},{video_id:'bad/id'},{video_note:{ru:'Есть'}},{sleeve:'../secret.png'},{sleeve:''},{sources:[{title:'Bad',url:'javascript:alert(1)'}]}])expect(()=>validateBlock({...song,...patch})).toThrow();
  for(const video_id of ['',undefined,'bad/id',12345678901])expect(()=>validateBlock({type:'playlist',title:bi,items:[{...track,video_id}]})).toThrow();
 });
 it('collects sleeves and PNG collage assets in the project art folder',()=>{
  const p=fixture('yeye');const assets=projectAssets(p);expect(assets).toContain('art/obj-45.png');expect(assets).toContain('art/cutout.png');expect(assets).toContain('art/test.webp');
 });
 it('renders stable sleeve colors, translated copy, sources and plain video links without embeds',()=>{
  const p=fixture('yeye'),data=fixtureData(p);
  const ru=projectPage(data,p,'ru'),en=projectPage(data,p,'en');
  expect(ru.match(/--sleeve-color:#[a-f0-9]+/g)).toEqual(en.match(/--sleeve-color:#[a-f0-9]+/g));
  expect(ru).toContain('▶ смотреть');expect(en).toContain('▶ watch');expect(en).toContain('Song archive');expect(en).toContain('Vogue EPL 7967');
  expect(en).toContain('class="playlist-tracks"');expect(en).toContain('https://www.youtube.com/watch?v=m94_C8Z7wLk');expect(en).not.toContain('<iframe');expect(en).not.toContain('youtube-nocookie');
 });
});
