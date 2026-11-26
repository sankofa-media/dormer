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
 it('collects only referenced assets, including nested photos',()=>{const p=structuredClone(project);p.chapters[0].blocks.push({type:'gallery',layout:'grid',items:[photo]});const assets=projectAssets(p);expect(assets).toContain('photos/photo.jpg');expect(assets).toContain('art/cover-full.webp');expect(assets.some(s=>/walk|gallop/.test(s))).toBe(false)});
});
