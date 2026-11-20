import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import archive from './server/audited-dataset.json' with {type:'json'};
import { SEED } from './seed.mjs';
import { assertPublicArchive, sanitizeArchive, publicState, PUBLIC_CAPTURED_AT, PUBLIC_ASSESSED_AT } from './public-data.mjs';
import { buildPublic, publicHTML } from './build.mjs';

const parsed=html=>JSON.parse(html.match(/window\.SIGNAL_DESK_SNAPSHOT=(.*?);<\/script>/s)[1]);

test('checked-in public data contains evidence excerpts and no contact inventory',()=>{
  assert.doesNotThrow(()=>assertPublicArchive(archive));
  assert.deepEqual(archive.contacts,[]);
  assert.ok(SEED.every(a=>!a.contacts?.length));
  assert.ok(!/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/i.test(JSON.stringify({archive,SEED})));
  for(const row of archive.signals)for(const source of [row.payload,row.payload.apifyCapture].filter(Boolean)) {
    assert.equal(source.sourceTextKind,'accepted evidence excerpts');
    assert.ok(!Object.hasOwn(source,'analysis'));
    assert.ok(source.sourceText.length<12000);
  }
  assert.ok(archive.runs.every(r=>r.query.startsWith('Discover · ') && r.id.startsWith('public-run-')));
});

test('sanitizer drops private fields and raw bodies without moving another page into same-source evidence',()=>{
  const url='https://example.org/news/cnc';
  const quote='Wir haben unsere neue CNC-Drehmaschine installiert.';
  const input={accounts:[{id:'example.org',name:'Beispielwerk',site:'Berlin, DE',first_seen:'2026-11-09'}],
    signals:[{account_id:'example.org',source_url:url,event_key:'private-event',origin:'Apify discovery',payload:{
      id:url,sourceUrl:url,name:'Beispielwerk',domain:'example.org',title:'Neue CNC-Drehmaschine',quote,date:'2026-11-01',observedAt:'2026-11-09',origin:'Apify discovery',
      facts:[{code:'cnc',quote},{code:'dach',quote:'Berlin, Deutschland',sourceUrl:'https://example.org/imprint'}],
      sourceText:quote+'\nUnrelated confidential page body.\nEmail: private@example.org\nCookie: private-cookie',
      cookies:'private-cookie',credentials:{token:'private-token'},analysis:'private analysis',email:'private@example.org'
    }}],contacts:[{payload:{name:'Alex Beispiel',email:'private@example.org',role:'Production'}}],
    runs:[{id:'provider-run-id',query:'Discover · CNC Maschine',status:'Completed',message:'1 source(s) analyzed.',created:'2026-11-09',finished:'2026-11-09'},
      {id:'hunter-run',query:'Hunter · Beispielwerk',status:'Completed',message:'Alex Beispiel',created:'2026-11-09'}],
    run_pages:[{run_id:'provider-run-id',query:'Discover · CNC Maschine',created:'2026-11-09',search_query:'CNC Maschine',focus:'cnc_addition',
      decisions:[{title:'Neue CNC-Drehmaschine',sourceUrl:url,outcome:'kept',reason:'Operator source.',rawPage:'private body'}],
      provider_stages:[{stage:'Original company pages',status:'SUCCEEDED',urlCount:5,returnedPages:4,missingPages:1,actor:'private-actor',runId:'provider-run-id',authorization:'private-token'}]}]};
  const out=sanitizeArchive(input),serialized=JSON.stringify(out);
  assert.doesNotThrow(()=>assertPublicArchive(out));
  for(const value of ['private@example.org','Alex Beispiel','private-cookie','private-token','Unrelated confidential page body','private-actor','provider-run-id'])assert.ok(!serialized.includes(value),value);
  assert.equal(out.runs.length,1);
  assert.equal(out.signals[0].payload.quote,quote);
  assert.ok(out.signals[0].payload.sourceText.includes(quote));
  assert.ok(!out.signals[0].payload.sourceText.includes('Berlin, Deutschland'));
  assert.equal(out.signals[0].payload.facts.find(f=>f.code==='dach').sourceUrl,'https://example.org/imprint');
  assert.deepEqual(out.run_pages[0].provider_stages,[{stage:'Original company pages',status:'SUCCEEDED',urlCount:5,returnedPages:4,missingPages:1}]);
});

test('public build fails closed if contact data or credential fields return to the archive',()=>{
  assert.throws(()=>assertPublicArchive({...archive,contacts:[{name:'Alex Beispiel'}]}),/contact-free/);
  assert.throws(()=>assertPublicArchive({...archive,extra:{authorization:'private-value'}}),/Private fields/);
  assert.throws(()=>assertPublicArchive({...archive,extra:'private@example.org'}),/Private data/);
});

test('real evidence keeps reviewed and discovered origin, negative scope and source-locality uncertainty',()=>{
  const state=publicState(archive);
  const koch=state.accounts.find(a=>a.id==='kochmaschinenbau.de');
  const added=koch.buyingSignals.find(r=>r.id==='cnc_addition');
  assert.equal(koch.score,53);assert.equal(added.points,23);
  assert.ok(added.evidence.some(e=>e.origin==='Curated research'));
  assert.ok(added.evidence.some(e=>e.origin==='Apify discovery' && e.quote.includes('Hermle C250')));
  const installed=state.accounts.find(a=>a.id==='zt-odenwald.de');
  assert.equal(installed.hold,true);assert.equal(installed.score,0);
  const sacs=state.accounts.find(a=>a.id==='sacs.aero');
  assert.equal(sacs.site,'Empfingen');
  assert.equal(sacs.hold,true);assert.equal(sacs.score,0);
  assert.ok(sacs.signals.some(s=>s.sourceText.includes('für den Standort in Empfingen')));
  assert.ok(sacs.researchTriggers.some(r=>r.id==='cnc_shift_pattern'));
  assert.ok(sacs.signals.every(s=>!s.facts.some(f=>f.code==='dach')));
  assert.equal(state.asOf,PUBLIC_ASSESSED_AT);assert.equal(state.capturedAt,PUBLIC_CAPTURED_AT);
});

test('actual broad discovery searches retain their original search and retrieval counters',()=>{
  const state=publicState(archive);
  for(const [focus,organic,selected,returned,missing] of [
    ['cnc_shift_pattern',20,12,11,1],['quantified_batch_size',20,12,12,0],['automation_interface',11,6,6,0]
  ]) {
    const run=state.runs.find(r=>r.focus===focus && r.stages.length);
    assert.ok(run?.searchQuery);
    assert.equal(run.stages[0].organicResults,organic);
    assert.equal(run.stages[0].originalUrlsSelected,selected);
    assert.equal(run.stages[1].returnedPages,returned);
    assert.equal(run.stages[1].missingPages,missing);
    assert.ok(run.decisions.length);
  }
});

test('deterministic static build removes former Worker output and performs no network requests',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'signal-desk-public-'));
  const previousFetch=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error('A static build must never request a provider.');};
  try {
    await mkdir(join(directory,'server'));
    await writeFile(join(directory,'server','index.js'),'old private worker');
    await buildPublic(directory);
    assert.deepEqual(await readdir(directory),['index.html']);
    const html=await readFile(join(directory,'index.html'),'utf8');
    assert.equal(html,publicHTML());
    const data=parsed(html);
    assert.equal(data.publicDemo,true);
    assert.equal(data.capturedAt,PUBLIC_CAPTURED_AT);assert.equal(data.assessedAt,PUBLIC_ASSESSED_AT);
    assert.match(html,/connect-src 'none'/);
    assert.ok(!/api\.apify\.com|api\.featherless\.ai|api\.hunter\.io|private worker/.test(html));
    assert.ok(!Object.hasOwn(data,'model'));
    for(const state of Object.values(data.locales)) {
      assert.equal(state.writable,false);
      assert.ok(Object.values(state.providers).every(v=>v===false));
      assert.ok(state.accounts.every(a=>a.contacts.length===0 && Object.keys(a.draftByContact).length===0));
      assert.ok(state.accounts.every(a=>a.signals.every(s=>!Object.hasOwn(s,'sourceText') && !Object.hasOwn(s,'apifyCapture'))));
      assert.ok(!JSON.stringify(state).includes('@'));
      assert.ok(state.runs.some(r=>r.stages.length===2));
      const sacs=state.accounts.find(a=>a.id==='sacs.aero');
      assert.equal(sacs.site,'Empfingen');
      assert.ok(sacs.signals.some(s=>s.facts.some(f=>f.quote.includes('für den Standort in Empfingen'))));
    }
  } finally {globalThis.fetch=previousFetch;await rm(directory,{recursive:true,force:true});}
});
