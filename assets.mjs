import { readFileSync } from 'node:fs';

export function publicFiles() {
  const files = {
    'index.html': 'text/html; charset=utf-8',
    'app.js': 'text/javascript; charset=utf-8',
    'style.css': 'text/css; charset=utf-8',
    'brand/dm-sans-latin-wght-normal.woff2': 'font/woff2',
    'brand/ibm-plex-mono-latin-400-normal.woff2': 'font/woff2',
    'brand/DM-Sans-LICENSE.txt': 'text/plain; charset=utf-8',
    'brand/IBM-Plex-Mono-LICENSE.txt': 'text/plain; charset=utf-8'
  };
  return Object.fromEntries(Object.entries(files).map(([path,type]) => {
    const base64 = !type.startsWith('text/');
    const content = readFileSync(new URL('./public/' + path,import.meta.url),base64 ? 'base64' : 'utf8');
    return ['/' + path,{type,content,base64}];
  }));
}
