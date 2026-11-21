// Adapted from Sankofa's YAML feature compiler and responsive-media pipeline.
import {readFile,writeFile,mkdir,readdir,statfs,stat} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'yaml';
import sharp from 'sharp';
import {validateProject,type Entry,type Project,type Media} from '../src/model.ts';
const disk=await statfs('.');
if(disk.bavail*disk.bsize<3*1024**3)throw Error('Stopped: less than 3 GiB of disk space is free.');
const read=async(p:string)=>parse(await readFile(p,'utf8'));
const entries:Entry[]=(await read('content/projects/index.yaml')).projects;
const projects:Record<string,Project>={};const media:Record<string,Media>={};
for(const e of entries){
 if(e.upcoming)continue;
 projects[e.id]=validateProject(await read(`content/projects/${e.id}/project.yaml`));
 const facts=JSON.parse(await readFile(`content/projects/${e.id}/fact-sources.json`,'utf8'));
 for(const scene of projects[e.id].scenes)for(const block of scene.blocks){
  const expected=[...new Map(block.fact_ids.flatMap(id=>{if(!facts[id])throw Error(`Unknown fact: ${id}`);return facts[id]}).map((s:any)=>[s.url,s])).values()];
  if(JSON.stringify(expected)!==JSON.stringify(block.sources))throw Error(`Stale block sources: ${block.id}`);
 }
 const dir=path.resolve(`content/projects/${e.id}/art`);
 {
  const manifest=await readFile(path.join(dir,'manifest.json'),'utf8').then(JSON.parse).catch(()=>null);
  const files:string[]=manifest?manifest.files.map((f:{file:string;technical_pass:boolean})=>{if(!f.technical_pass)throw Error(`Art failed checks: ${f.file}`);return f.file}):await readdir(dir).catch(()=>[]);
  if(manifest)for(let horse=1;horse<=5;horse++)for(const [gait,count] of [['gallop',10],['walk',8]] as const){
   for(let frame=1;frame<=count;frame++)if(!['png','webp'].some(ext=>files.includes(`horse-${horse}-${gait}-${frame}.${ext}`)))throw Error(`Missing horse ${horse} ${gait} frame ${frame}`);
  }
  for(const file of files.filter(f=>/\.(png|jpg|jpeg|webp)$/i.test(f))){
   const key=`${e.id}/${file.replace(/\.[^.]+$/,'')}`;
   const out=`public/media/${e.id}`;await mkdir(out,{recursive:true});
   const base=file.replace(/\.[^.]+$/,'');
   const source=path.join(dir,file);const modified=(await stat(source)).mtimeMs;
   const fresh=async(file:string)=>(await stat(file).catch(()=>({mtimeMs:0}))).mtimeMs>=modified;
   if(!await fresh(`${out}/${base}.webp`))await sharp(source).webp({quality:85}).toFile(`${out}/${base}.webp`);
   const widths:Record<string,string>={};
   for(const w of [480,960,1600]){if(!await fresh(`${out}/${base}-w${w}.webp`))await sharp(source).resize({width:w,withoutEnlargement:true}).webp({quality:82}).toFile(`${out}/${base}-w${w}.webp`);widths[w]=`/media/${e.id}/${base}-w${w}.webp`;}
   media[key]={src:`/media/${e.id}/${base}.webp`,widths};
  }
 }
}
await mkdir('public/media',{recursive:true});
await writeFile('public/media/manifest.json',JSON.stringify(media,null,2));
await writeFile('src/generated.json',JSON.stringify({entries,projects,media}));
console.log(`Compiled ${Object.keys(projects).length} projects, ${Object.keys(media).length} art assets.`);
