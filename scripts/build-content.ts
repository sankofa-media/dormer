import {readFile,writeFile,mkdir,rm,rename} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'yaml';
import sharp from 'sharp';
import {validateProject,validateLink,projectAssets,type Entry,type Project,type Media} from '../src/model.ts';
const entries:Entry[]=parse(await readFile('content/projects/index.yaml','utf8')).projects;
const projects:Record<string,Project>={},links:Record<string,Project>={},media:Record<string,Media>={};
const staging='public/.media-build';
await rm(staging,{recursive:true,force:true});await mkdir(staging,{recursive:true});
try {
 for(const e of entries){
  if(e.upcoming)continue;
  if(!/^[a-z0-9-]+$/.test(e.id)||projects[e.id]||links[e.id])throw Error('Invalid or duplicate project index id');
  let p:Project;
  if(e.href){p=validateLink(e,parse(await readFile(`content/projects/${e.id}/tile.yaml`,'utf8')));links[e.id]=p}
  else{p=validateProject(parse(await readFile(`content/projects/${e.id}/project.yaml`,'utf8')));if(p.id!==e.id)throw Error('Project id does not match index');projects[e.id]=p}
  e.tile={type:p.cover.kind};
  for(const file of projectAssets(p)){
   const source=path.resolve('content/projects',e.id,file);const base=`${e.id}/${file.replace(/\.[^.]+$/,'')}`;
   const out=`${staging}/${base}`;await mkdir(path.dirname(out),{recursive:true});
   const meta=await sharp(source).rotate().toBuffer({resolveWithObject:true});
   const width=meta.info.width,height=meta.info.height;
   await sharp(meta.data).webp({quality:85}).toFile(`${out}.webp`);
   const widths:Record<string,string>={};
   for(const w of [480,960,1600]){const actual=Math.min(w,width);if(widths[actual])continue;await sharp(meta.data).resize({width:actual}).webp({quality:82}).toFile(`${out}-w${w}.webp`);widths[actual]=`/media/${base}-w${w}.webp`}
   media[`${e.id}/${file}`]={src:`/media/${base}.webp`,widths,width,height};
  }
 }
 await writeFile(`${staging}/manifest.json`,JSON.stringify(media,null,2));
 await rm('public/media',{recursive:true,force:true});await rename(staging,'public/media');
 await writeFile('src/generated.json',JSON.stringify({entries,projects,links,media}));
 console.log(`Compiled ${Object.keys(projects).length} projects, ${Object.keys(media).length} referenced assets.`);
} finally {await rm(staging,{recursive:true,force:true})}
