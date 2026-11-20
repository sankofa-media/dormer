// A deliberately small seed, not a substitute for the registry's full review.
export const protectedNames = ['Ferdinand','Secretariat','Frankel','Seabiscuit','Northern Dancer'];
export const protectedSource='https://www.ifhaonline.org/resources/NP_2024.pdf';
export interface Declarations { livingPerson:boolean; commercial:boolean; offensive:boolean }
export function checkName(name:string, declarations:Declarations={livingPerson:false,commercial:false,offensive:false}) {
 const length=Array.from(name.normalize('NFC')).length;
 const errors:string[]=[];
 if(!name.trim())errors.push('empty');
 if(length>18)errors.push('length');
 if(protectedNames.some(n=>n.toLocaleLowerCase()===name.trim().normalize('NFC').toLocaleLowerCase()))errors.push('protected');
 for(const [key,value] of Object.entries(declarations))if(value)errors.push(key);
 return {length,errors,valid:errors.length===0};
}
export function suggest(sire:string,dam:string):string[]{
 const a=sire.trim().split(/\s+/),b=dam.trim().split(/\s+/);
 return [...new Set([`${a[0]||''} ${b.at(-1)||''}`,`${b[0]||''} ${a.at(-1)||''}`,`${sire.slice(0,7)}${dam.slice(-7)}`])].filter(n=>n.trim());
}
