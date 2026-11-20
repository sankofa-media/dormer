export type Lang = 'en' | 'ru';
export type Bi = Record<Lang, string>;
export interface Source { id?: string; title: string; url: string }
export interface Block { id: string; fact_ids: string[]; ru: string; en: {text: string; draft: boolean}; sources: Source[] }
export interface Scene { id: string; name: Bi; blocks: Block[] }
export interface Entry { id: string; title: Bi; dek?: Bi; tags: string[]; upcoming?: boolean; tile: {type: 'video'|'empty'|'layers'|'type'|'image'; src?: string; quote?: Bi} }
export interface Project { id: string; title: Bi; dek: Bi; date: string; scenes: Scene[]; runners: {position:number;horse:string;verification:string}[]; runner_sources:Source[]; clippings: (Source & {quote:string;date:string})[]; name_stories: {name:string;id:string;summary:string;sources:Source[]}[] }
export interface Media {src:string; widths:Record<string,string>}
export interface Data { entries:Entry[]; projects:Record<string,Project>; media:Record<string,Media> }
export const text = (b:Block,l:Lang) => l==='ru'?b.ru:b.en.text;
export function validateProject(p:Project):Project {
 if(!/^[a-z0-9-]+$/.test(p.id)||!p.title?.en||!p.title?.ru||!p.scenes?.length)throw Error('Invalid project');
 const ids=new Set<string>();
 for(const s of p.scenes){if(ids.has(s.id)||!s.blocks.length)throw Error('Invalid scene');ids.add(s.id);for(const b of s.blocks){if(!b.ru||!b.en?.text||b.en.draft!==true)throw Error('Missing bilingual block');for(const src of b.sources)if(!/^https?:\/\//.test(src.url)||!src.title)throw Error('Invalid source');}}
 return p;
}
