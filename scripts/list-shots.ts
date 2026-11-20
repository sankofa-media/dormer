import {readdir,writeFile} from 'node:fs/promises';
const shots=(await readdir('.shots')).filter(f=>f.endsWith('.png')).sort();
await writeFile('.shots/manifest.txt',shots.map(f=>`.shots/${f}`).join('\n')+'\n');
console.log(`${shots.length} screenshots listed in .shots/manifest.txt`);
