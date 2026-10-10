import {cp,mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs',{recursive:true});
await cp('dist/client','docs',{recursive:true});
await writeFile('docs/.nojekyll','');
console.log('GitHub Pages files prepared in docs/');
