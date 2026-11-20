import test from 'node:test';
import assert from 'node:assert/strict';
import { openDB } from './local-db.mjs';
import { initialize, saveCandidates, saveContactList, readAccounts, canonicalURL } from './repository.mjs';
import { publicFiles } from './assets.mjs';
import { routes } from './api.mjs';
import kochHistory from './example-run.json' with {type:'json'};
import marketHistory from './example-market-run.json' with {type:'json'};
import signalCheckHistory from './example-signal-checks.json' with {type:'json'};
const assets=publicFiles();
const candidate={name:'Testwerk',domain:'www.testwerk.de',site:'Berlin, DE',sourceUrl:'https://www.testwerk.de/news/anlage?utm_source=mail',title:'New CNC cell',date:'2026-11-01',quote:'Neue CNC-Zelle in Berlin.',facts:[{code:'cnc',quote:'Neue CNC-Zelle in Berlin.'}],sourceText:'private model input never exported'};
const req=(path,body,extra={})=>new Request('http://localhost'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json',...extra},body:JSON.stringify(body)});

test('bundled fonts are served as original bytes',async()=>{
  for(const [path,asset] of Object.entries(assets).filter(([,file])=>file.base64)){
    const response=await routes(req(path),{},assets);
    assert.equal(response.status,200);
    assert.equal(response.headers.get('Content-Type'),asset.type);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),Buffer.from(asset.content,'base64'));
  }
});

test('repeat research, tracking parameters, and reprints keep one account and one scored event',async()=>{
  const db=openDB(':memory:');
  try{
    assert.deepEqual(await saveCandidates(db,[candidate]),{accounts:1,signals:1});
    assert.deepEqual(await saveCandidates(db,[{...candidate,domain:'testwerk.de',sourceUrl:'https://testwerk.de/news/anlage#top'}]),{accounts:0,signals:0});
    await saveCandidates(db,[{...candidate,sourceUrl:'https://testwerk.de/presse/anlage'}]);
    await saveCandidates(db,[{...candidate,site:'Bremen, DE',sourceUrl:'https://testwerk.de/bremen/anlage'}]);
    const [a]=await readAccounts(db);
    assert.equal(a.signals.length,2);
    assert.equal(a.signals.find(s=>s.site==='Berlin, DE').citations.length,2);
    assert.ok(!JSON.stringify(a).includes('private model input'));
  } finally{db.close();}
});
test('export, review, operator status and safe write boundaries work from the public API',async()=>{
  const db=openDB(':memory:');const env={DB:db,APIFY_API_TOKEN:'test-secret'};
  try{
    await initialize(db);
    await saveContactList(db,'kochmaschinenbau.de',[{name:'Alex Beispiel',role:'Produktionsleitung',sourceUrl:'https://example.org/team',email:'alex@example.org',provider:'Company source'}]);
    const state=await (await routes(req('/api/state'),env,assets)).json();
    assert.ok(state.accounts.length>=10);assert.equal(state.segments.length,4);
    assert.ok(!JSON.stringify(state).includes('test-secret'));
    const a=state.accounts.find(a=>!a.hold && a.contacts.length);
    const dto={id:a.id,status:'Prioritize'};
    assert.equal((await routes(req('/api/review',dto,{'Origin':'https://foreign.example'}),env,assets)).status,403);
    assert.equal((await routes(req('/api/review',dto),{...env,READ_ONLY:'1'},assets)).status,403);
    assert.equal((await routes(req('/api/review',dto),env,assets)).status,200);
    assert.equal((await readAccounts(db)).find(x=>x.id===a.id).review,'Prioritize');
    const d=await (await routes(req('/api/draft?id='+a.id+'&contact='+encodeURIComponent(a.contacts[0].name)),env,assets)).json();
    assert.ok(d.body.includes(a.contacts[0].name));
    const html=await (await routes(req('/api/export'),env,assets)).text();
    assert.ok(html.includes('window.SIGNAL_DESK_SNAPSHOT='));
    assert.ok(!/<script[^>]+src=|<link[^>]+href=["'][.][/]/i.test(html));
    assert.ok(!html.includes('test-secret'));assert.ok(!html.includes('private model input'));
    for (const person of state.accounts.flatMap(a=>a.contacts)) if(person.email) assert.ok(!html.includes(person.email));
  }finally{db.close();}
});
test('canonicalization preserves meaningful queries and removes trackers',()=>{assert.equal(canonicalURL('https://www.testwerk.de/m?id=24&utm_medium=a#fragment'),'https://testwerk.de/m?id=24');});

test('refresh uses current evidence, preserves reviews, and rejects an older in-flight model result',async()=>{
  const {getSource,saveAnalysis}=await import('./repository.mjs');
  const db=openDB(':memory:');
  try{
    await saveCandidates(db,[candidate]);
    await db.prepare("UPDATE accounts SET review='Prioritize' WHERE id='testwerk.de'").run();
    const v1=await getSource(db,'testwerk.de',candidate.sourceUrl);
    assert.ok(await saveAnalysis(db,'testwerk.de',v1,{...v1,model:'model-v1'}));
    const revised={...candidate,sourceText:'We have since installed robot loading.',quote:'Wir haben die automatische Beladung in Betrieb genommen.',facts:[]};
    assert.equal((await saveCandidates(db,[revised])).updated,1);
    assert.equal(await saveAnalysis(db,'testwerk.de',v1,{...v1,model:'old-model'}),false);
    const [out]=await readAccounts(db);
    assert.equal(out.review,'Prioritize');assert.equal(out.signals[0].quote,revised.quote);assert.equal(out.signals[0].analysis,'');
    await saveCandidates(db,[{...candidate,domain:'news.testwerk.de',sourceUrl:'https://news.testwerk.de/another',quote:'Another plant, different installation',project:'second plant'}]);
    assert.equal((await readAccounts(db)).length,1);assert.equal((await readAccounts(db))[0].signals.length,2);
  }finally{db.close();}
});
test('company role citations survive Hunter enrichment and repeated seed import',async()=>{
  const {saveContactList}=await import('./repository.mjs'); const db=openDB(':memory:');
  try{
    await saveCandidates(db,[candidate]);const pub={name:'Ida Beispiel',role:'Leitung Zerspanung',sourceUrl:'https://testwerk.de/team',provider:'company website'};
    const hunter={name:pub.name,role:'Manager',provider:'Hunter',email:'ida@testwerk.de',sourceUrl:'https://testwerk.de/kontakt',confidence:91,verification:'valid'};
    await saveContactList(db,'testwerk.de',[pub,hunter,pub]);
    const [a]=await readAccounts(db);assert.equal(a.contacts.length,1);const [c]=a.contacts;
    assert.equal(c.role,pub.role);assert.equal(c.sourceUrl,pub.sourceUrl);assert.equal(c.email,hunter.email);assert.equal(c.emailProvider,'Hunter');assert.equal(c.verification,'valid');
  }finally{db.close();}
});
test('stored demo history shows its two source pages and one account on a fresh and reopened database',async()=>{
 const {listRuns}=await import('./repository.mjs');const db=openDB(':memory:');
 try{
  await initialize(db);await initialize(db);const runs=await listRuns(db);
  const run=runs.find(r=>r.created===kochHistory.run.created && r.query===kochHistory.run.query);assert.equal(run.decisions.length,2);
  const broad=runs.find(r=>r.created===marketHistory.created && r.query===marketHistory.query);assert.equal(broad.status,'Partial');assert.equal(broad.decisions.length,11);assert.equal(broad.decisions.filter(d=>d.outcome==='kept').length,4);
  assert.deepEqual([...new Set(run.decisions.map(d=>d.accountId))],['kochmaschinenbau.de']);
  assert.equal((await routes(req('/api/discover',{query:'CNC Deutschland',pageLimit:500}),{DB:db,APIFY_API_TOKEN:'fixture',FEATHERLESS_API_KEY:'fixture'},assets)).status,400);
 }finally{db.close();}
});

test('the live proof archive distinguishes a verified CNC acquisition from a zero-result RFQ in both languages and in export',async()=>{
  const db=openDB(':memory:');
  try{
    await initialize(db);
    await saveContactList(db,'kochmaschinenbau.de',[{name:'Alex Beispiel',role:'Produktionsleitung',sourceUrl:'https://example.org/team',provider:'Company source'}]);
    const states={};
    for(const lang of ['en','de']){
      const state=await (await routes(req('/api/state?lang='+lang),{DB:db},assets)).json();
      states[lang]=state;
      assert.equal(state.signalCatalog.length,12);
      for(const a of state.accounts) {
        assert.equal(a.buyingSignals.length,12);
        assert.equal(a.breakdown.reduce((s,r)=>s+r.points,0),a.score);
        assert.ok(a.buyingSignals.every(row=>row.points===0 || row.evidence.some(e=>e.status==='confirmed' && e.inScoredScope!==false && e.sourceUrl && e.quote)));
      }
      const k=state.accounts.find(a=>a.id==='kochmaschinenbau.de');
      const purchase=k.buyingSignals.find(b=>b.id==='cnc_addition');
      assert.equal(purchase.points,23);assert.equal(k.score,53);
      assert.ok(purchase.evidence.some(e=>e.origin==='Apify discovery'&&e.status==='confirmed'&&e.quote.includes('Hermle C250')));
      const openTender=k.buyingSignals.find(b=>b.id==='loading_rfq');assert.equal(openTender.points,0);assert.equal(openTender.status,'unknown');
      const tenderCheck=signalCheckHistory.find(r=>r.focus==='loading_rfq');
      const procurement=state.runs.find(r=>r.created===tenderCheck.created && r.focus===tenderCheck.focus);assert.equal(procurement.decisions.length,5);assert.ok(procurement.decisions.every(d=>d.outcome==='skipped'));
      const d=await (await routes(req('/api/draft?id=kochmaschinenbau.de&contact=Alex%20Beispiel&lang='+lang),{DB:db},assets)).json();
      assert.ok(d.body.includes('Alex Beispiel'));assert.match(d.body,lang==='de'?/Guten Tag/:/Hello|Dear/);
      const invalid=await routes(req('/api/discover?lang='+lang,{query:'xy'}),{DB:db},assets);assert.equal(invalid.status,400);
      assert.match((await invalid.json()).error,lang==='de'?/Suchtext/:/search/);
    }
    assert.notEqual(states.en.signalCatalog[0].label,states.de.signalCatalog[0].label);
    const html=await (await routes(req('/api/export?lang=de'),{DB:db},assets)).text();
    const data=JSON.parse(html.match(/window\.SIGNAL_DESK_SNAPSHOT=(.*?)<\/script>/s)[1].replace(/;$/,''));
    assert.equal(data.initialLang,'de');
    for(const lang of ['en','de']){
      const koch=data.locales[lang].accounts.find(a=>a.id==='kochmaschinenbau.de');assert.equal(koch.buyingSignals.length,12);
      assert.ok(koch.draftByContact['Alex Beispiel'].body.includes('Alex Beispiel'));
      assert.equal(data.locales[lang].writable,false);
    }
  } finally{db.close();}
});

test('new-account status is derived from the insertion, including multiple pages for one new company',async()=>{
  const db=openDB(':memory:');
  try{
    const first=new Set();
    const secondSource={...candidate,sourceUrl:'https://testwerk.de/zweite-maschine',title:'Second machine'};
    const r=await saveCandidates(db,[candidate,secondSource],first);
    assert.equal(r.accounts,1);assert.deepEqual([...first],['testwerk.de']);
    const later=new Set();
    const replay=await saveCandidates(db,[secondSource],later);
    assert.equal(replay.accounts,0);assert.equal(later.size,0);
  } finally{db.close();}
});
