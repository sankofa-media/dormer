import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {parse} from 'yaml';
import {checkName,suggest} from '../src/names';
import {scrollToX} from '../src/engine/scroll';
import {validateProject,type Project} from '../src/model';
const project=parse(readFileSync('content/projects/bull-in-the-heather/project.yaml','utf8')) as Project;
describe('name rules',()=>{
 it('counts spaces and punctuation, including the two Bull spellings',()=>{expect(checkName('Bull Inthe Heather')).toMatchObject({length:18,valid:true});expect(checkName('Bull In The Heather')).toMatchObject({length:19,valid:false});expect(checkName('a'.repeat(17)+'!').valid).toBe(true);expect(checkName('a'.repeat(18)+'!').errors).toContain('length')});
 it('counts Unicode characters and normalizes combining marks',()=>{expect(checkName('Лошадь').length).toBe(6);expect(checkName('e\u0301').length).toBe(1)});
 it('rejects blank, protected and declared forbidden categories',()=>{expect(checkName('  ').valid).toBe(false);expect(checkName(' secretariat ').errors).toContain('protected');expect(checkName('New horse',{livingPerson:true,commercial:true,offensive:true}).errors).toEqual(['livingPerson','commercial','offensive'])});
 it('suggests combinations without empty or duplicate results',()=>{expect(suggest('Village Star','Kauto Relka')).toContain('Kauto Star');expect(suggest('','')).toEqual([])});
});
describe('scroll mapping',()=>{
 it('clamps outside race and reaches every furlong',()=>{expect(scrollToX(-200,100,9000,12960)).toBe(0);expect(scrollToX(10000,100,9000,12960)).toBe(12960);for(let i=0;i<=9;i++)expect(scrollToX(100+i*1000,100,9000,12960)).toBeCloseTo(i*1440)});
 it('handles no available distance without NaN',()=>expect(scrollToX(0,0,0,0)).toBe(0));
});
describe('content loader',()=>{
 it('loads bilingual scenes, source links and the provisional field',()=>{expect(validateProject(project)).toBe(project);expect(project.scenes).toHaveLength(16);expect(project.runners).toHaveLength(13);expect(project.scenes.filter(s=>s.id.startsWith('pole-'))).toHaveLength(9);expect(project.scenes.flatMap(s=>s.blocks).every(b=>b.en.draft)).toBe(true)});
 it('rejects duplicate scenes and invalid sources',()=>{const duplicate=structuredClone(project);duplicate.scenes.push(duplicate.scenes[0]);expect(()=>validateProject(duplicate)).toThrow();const bad=structuredClone(project);bad.scenes[1].blocks[0].sources[0].url='javascript:alert(1)';expect(()=>validateProject(bad)).toThrow('Invalid source')});
 it('excludes the flagged sentences without rewriting the remainder',()=>{expect(project.scenes[14].blocks[0].ru).toBe('В апреле 2014 года Булли было двадцать четыре года.');expect(project.scenes[7].blocks[0].ru).not.toContain('впервые снова');expect(project.scenes[6].blocks[0].ru).toMatch(/^В 1994 году/)});
});
