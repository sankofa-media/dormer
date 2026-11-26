import {readdir,writeFile} from 'node:fs/promises';
const shots=(await readdir('test-results/shots')).filter(f=>f.endsWith('.png')).sort();
await writeFile('test-results/shots/manifest.txt',shots.map(f=>`test-results/shots/${f}`).join('\n')+'\n');
console.log(`${shots.length} screenshots listed in test-results/shots/manifest.txt`);
