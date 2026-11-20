import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import archive from './server/audited-dataset.json' with {type:'json'};
import { publicFiles } from './assets.mjs';
import { snapshot } from './snapshot.mjs';
import { assertPublicArchive, publicState, PUBLIC_CAPTURED_AT, PUBLIC_ASSESSED_AT } from './public-data.mjs';

export function publicHTML() {
  assertPublicArchive(archive);
  const html=snapshot(publicState(archive,'en'),publicFiles(),publicState(archive,'de'),'en',{
    publicDemo:true,capturedAt:PUBLIC_CAPTURED_AT,assessedAt:PUBLIC_ASSESSED_AT
  });
  // Every runtime asset is embedded. External source links are navigation only.
  const policy="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
  return html.replace('<head>','<head>\n  <meta http-equiv="Content-Security-Policy" content="'+policy+'">\n  <meta name="referrer" content="no-referrer">');
}

export async function buildPublic(directory=new URL('./dist/',import.meta.url)) {
  const html=publicHTML();
  // A former Worker must never survive a switch to the static publication.
  await rm(directory,{recursive:true,force:true});
  await mkdir(directory,{recursive:true});
  const output=directory instanceof URL?new URL('index.html',directory):resolve(directory,'index.html');
  await writeFile(output,html);
  return output;
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  await buildPublic();
  console.log('Built the public static demo from reviewed evidence. No live services or database are included.');
}
