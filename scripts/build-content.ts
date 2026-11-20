// Adapted from Sankofa's YAML feature compiler and responsive-media pipeline.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'yaml';
import sharp from 'sharp';
import {validateProject,type Entry,type Project,type Media} from '../src/model.ts';
const read=async(p:string)=>parse(await readFile(p,'utf8'));
const entries:Entry[]=(await read('content/projects/index.yaml')).projects;
const projects:Record<string,Project>={};const media:Record<string,Media>={};
for(const e of entries){
 if(e.upcoming)continue;
 projects[e.id]=validateProject(await read(`content/projects/${e.id}/project.yaml`));
 const dirs=[path.resolve(`../${e.id}/art`),path.resolve(`content/projects/${e.id}/art`)];
 for(const dir of dirs){
  const files=await readdir(dir).catch(()=>[]);
  for(const file of files.filter(f=>/\.(png|jpg|jpeg|webp)$/i.test(f))){
   const key=`${e.id}/${file.replace(/\.[^.]+$/,'')}`;
   const out=`public/media/${e.id}`;await mkdir(out,{recursive:true});
   const base=file.replace(/\.[^.]+$/,'');
   await sharp(path.join(dir,file)).webp({quality:85}).toFile(`${out}/${base}.webp`);
   const widths:Record<string,string>={};
   for(const w of [480,960,1600]){await sharp(path.join(dir,file)).resize({width:w,withoutEnlargement:true}).webp({quality:82}).toFile(`${out}/${base}-w${w}.webp`);widths[w]=`/media/${e.id}/${base}-w${w}.webp`;}
   media[key]={src:`/media/${e.id}/${base}.webp`,widths};
  }
 }
}
await mkdir('public/media',{recursive:true});
await writeFile('public/media/manifest.json',JSON.stringify(media,null,2));
await writeFile('src/generated.json',JSON.stringify({entries,projects,media}));
console.log(`Compiled ${Object.keys(projects).length} projects, ${Object.keys(media).length} art assets.`);
