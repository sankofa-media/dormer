import {type Project,type Data,type Art,type Photo,projectAssets} from '../src/model';
export const bi={ru:'История музыки',en:'A music story'};
const art:Art={type:'art',src:'art/test.webp',alt:bi,layers:[{src:'art/cutout.webp',depth:2}],size:'wide'};
const photo:Photo={type:'photo',src:'photos/test.jpg',alt:bi,caption:bi,credit:'Photo: Test archive',source_url:'https://example.com/photo',treatment:'halftone'};
export function fixture(theme:'watercolor'|'yeye'):Project {return {id:`test-${theme}`,layout:'longread',theme,title:bi,dek:bi,date:'2026-11-26',cover:theme==='watercolor'?{kind:'art',src:'art/test.webp',alt:bi}:{kind:'collage',background:'art/test.webp',pieces:[{src:'art/cutout.webp',x:25,y:10,w:50,rotate:-4,z:1,depth:2}],balloons:[{who:'Françoise',lang:'fr',text:'Bonjour, la musique !',x:60,y:20,tail:'left'}]},chapters:[{id:'all-blocks',name:bi,kicker:bi,blocks:[
 {type:'text',text:{ru:'**Музыка** и *время*. [Источник](https://example.com).',en:'**Music** and *time*. [Source](https://example.com).'},sources:[{title:'Archive',url:'https://example.com'}]},art,photo,
 {type:'gallery',layout:'scatter',items:[{...photo,treatment:'print'}, {...art,size:'column'}]},
 {type:'clipping',masthead:'LE JOURNAL',date:'1963',headline:bi,deck:bi,body:bi,cite:{publication:'Test',date:'1963',page:'1',url:'https://example.com'},style:'french-daily'},
 {type:'video',id:'8JGBNkLM9_8',title:bi,poster:'art/test.webp',caption:bi,credit:'Test'},
 {type:'structure',video_id:'8JGBNkLM9_8',sections:[{label:bi,start:0,end:10,note:bi},{label:bi,start:10,end:40,note:{ru:'Вторая часть',en:'Second section'}}]},
 {type:'quote',text:bi,attribution:'Test author',source:{title:'Test source',url:'https://example.com'}},
 {type:'timeline',items:[{date:'1963',text:bi}]},
 {type:'poster',paper:'#e8b53a',lines:[{text:'OLYMPIA',size:'xl',font:'grotesk',color:'#d7262e'},{text:bi,size:'l',font:'display',color:'#1d2a5b'},{text:'Paris · 1963',size:'m',font:'script',color:'#171c28'}],photo},
 {type:'collage',background:'art/test.webp',pieces:[{src:'art/cutout.webp',x:20,y:10,w:50,rotate:5,z:2,depth:5}],balloons:[{who:'Françoise',lang:'fr',text:'Les garçons et les filles',x:65,y:50,tail:'down'},{who:'Музыка',lang:'ru',text:'Большая история о музыке',x:5,y:10,tail:'right'}]},
 {type:'aside',title:bi,text:bi}
 ]}]}}
export function fixtureData(p:Project):Data {
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#e7dfd0"/><circle cx="480" cy="300" r="180" fill="#b79b92"/><path d="M0 580 Q400 200 960 450V640H0" fill="#65796c"/></svg>`;
 const src=`data:image/svg+xml,${encodeURIComponent(svg)}`;
 return {entries:[],projects:{[p.id]:p},media:Object.fromEntries(projectAssets(p).map(path=>[`${p.id}/${path}`,{src,widths:{960:src},width:960,height:640}]))};
}
