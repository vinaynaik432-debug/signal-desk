import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot } from './snapshot.mjs';
import { publicFiles } from './assets.mjs';

const assets = publicFiles();
const sourceUrl = 'https://example.org/clamping';
const originalQuote = 'Wir prüfen die Beladung der neuen Maschine.';
const recipient = 'Alex Beispiel';

function localizedState(language) {
  const de = language === 'de';
  const label = de ? 'Neue CNC-Maschine oder Zelle' : 'New CNC machine or cell';
  const subject = de ? 'Ihre neue Maschine' : 'Your new machine';
  const publicSource = { sourceUrl, title:'Neue CNC-Maschine', quote:originalQuote, sourceText:'private original body' };
  const evidence = { quote:originalQuote, sourceUrl, origin:'Apify discovery', method:'source rule', status:'unknown', inScoredScope:false };
  return {
    asOf:'2026-11-09', signalCatalog:[{id:'cnc_addition', label, weight:23}], segments:[],
    accounts:[{id:'example.org',name:'Example',signals:[publicSource],contacts:[{name:recipient,role:'Werkleitung',email:'private@example.org'}],
      sourceUrl,buyingSignals:[{id:'cnc_addition',label,status:'unknown',weight:23,points:0,evidence:[evidence]}],
      subject,body:subject,draftByContact:{[recipient]:{subject,body:subject + ' · ' + recipient}}}],
    runs:[{query:'CNC Recherche',searchQuery:'site:example.org Werkzeugmaschine',focus:'cnc_addition',decisions:[
      {sourceUrl,signalIds:[],reason:de ? 'Datum ungeklärt.' : 'Date unverified.'},
      {sourceUrl,reason:de ? 'Früherer Lauf.' : 'Earlier run.'}]}]
  };
}

function readSnapshot(html) {
  const match = html.match(/window\.SIGNAL_DESK_SNAPSHOT=(.*?);<\/script>/s);
  assert.ok(match);
  return JSON.parse(match[1]);
}

test('the standalone file embeds its fonts and licenses without external brand assets',()=>{
  const html=snapshot(localizedState('en'),assets,localizedState('de'));
  for(const file of Object.values(assets).filter(asset=>asset.base64)){
    assert.ok(html.includes('data:'+file.type+';base64,'+file.content));
  }
  assert.ok(!html.includes('./brand/'));
  assert.match(html,/SIL OPEN FONT LICENSE/i);
});

test('public mode omits named contacts, recipient drafts and Hunter activity in both languages',()=>{
  const en=localizedState('en'),de=localizedState('de');
  for(const state of [en,de])state.runs.push({query:'Hunter · Example',decisions:[]});
  const html=snapshot(en,assets,de,'en',{publicDemo:true,capturedAt:'2026-11-09',assessedAt:'2026-11-20'});
  const data=readSnapshot(html);
  assert.equal(data.publicDemo,true);assert.equal(data.capturedAt,'2026-11-09');assert.equal(data.assessedAt,'2026-11-20');
  assert.ok(!html.includes(recipient));assert.ok(!html.includes('private@example.org'));
  for(const state of Object.values(data.locales)) {
    assert.deepEqual(state.accounts[0].contacts,[]);
    assert.deepEqual(state.accounts[0].draftByContact,{});
    assert.ok(!state.runs.some(run=>run.query.includes('Hunter')));
  }
});

test('export preserves real stage counters while omitting actor identifiers and arbitrary payloads',()=>{
  const state=localizedState('en');
  state.runs[0].stages=[{stage:'German web search',status:'SUCCEEDED',organicResults:20,originalUrlsSelected:12,actor:'private-actor',runId:'private-run',cookies:'private-cookie'}];
  const data=readSnapshot(snapshot(state,assets));
  assert.deepEqual(data.locales.en.runs[0].stages,[{stage:'German web search',status:'SUCCEEDED',organicResults:20,originalUrlsSelected:12}]);
});

test('offline export carries both locales, original quotes and per-capture status without private records', () => {
  const en = localizedState('en');
  const de = localizedState('de');
  const html = snapshot(en,assets,de,'de');
  const data = readSnapshot(html);
  assert.equal(data.initialLang,'de');
  assert.ok(!html.includes('private@example.org') && !html.includes('private original body'));
  for (const [lang,state] of Object.entries(data.locales)) {
    const a=state.accounts[0];
    assert.equal(a.buyingSignals[0].label,lang==='de' ? 'Neue CNC-Maschine oder Zelle' : 'New CNC machine or cell');
    assert.equal(a.signals[0].quote,originalQuote);
    assert.deepEqual(a.buyingSignals[0].evidence[0],en.accounts[0].buyingSignals[0].evidence[0]);
    assert.equal(a.draftByContact[recipient].body,(lang==='de' ? 'Ihre neue Maschine' : 'Your new machine')+' · '+recipient);
    assert.deepEqual(state.runs[0].decisions[0].signalIds,[]);
    assert.ok(!Object.hasOwn(state.runs[0].decisions[1],'signalIds'));
    assert.equal(state.runs[0].searchQuery,'site:example.org Werkzeugmaschine');
  }
});

test('manual hold clears every exported language and named draft even if input still has old copy', () => {
  const en=localizedState('en'), de=localizedState('de');
  en.accounts[0].review=de.accounts[0].review='Hold';
  const data=readSnapshot(snapshot(en,assets,de));
  for(const state of Object.values(data.locales)) {
    assert.equal(state.accounts[0].body,'');
    assert.deepEqual(state.accounts[0].draftByContact[recipient],{subject:'',body:''});
  }
});

test('export keeps run-time account novelty and research triggers separate from buying signal points', () => {
  const en=localizedState('en'),de=localizedState('de');
  for (const [lang,state] of [['en',en],['de',de]]) {
    const label=lang==='en' ? 'Manual CNC loading' : 'Manuelle CNC-Beladung';
    const trigger={id:'manual_cnc_duties',label,description:label};
    state.researchTriggerCatalog=[trigger];
    state.accounts[0].researchTriggers=[{...trigger,evidence:[{quote:originalQuote,sourceUrl,status:'observed',rawPage:'private page cache'}]}];
    Object.assign(state.runs[0].decisions[0],{accountState:'new',researchTriggerIds:[trigger.id],signalIds:[]});
  }
  const html=snapshot(en,assets,de);
  assert.ok(!html.includes('private page cache'));
  const data=readSnapshot(html);
  for(const state of Object.values(data.locales)) {
    const decision=state.runs[0].decisions[0];
    assert.equal(decision.accountState,'new');
    assert.deepEqual(decision.signalIds,[]);
    assert.deepEqual(decision.researchTriggerIds,['manual_cnc_duties']);
    assert.equal(state.accounts[0].buyingSignals[0].points,0);
    assert.equal(state.accounts[0].researchTriggers[0].evidence[0].quote,originalQuote);
    assert.ok(!Object.hasOwn(state.runs[0].decisions[1],'accountState'));
    assert.ok(!Object.hasOwn(state.runs[0].decisions[1],'researchTriggerIds'));
  }
});
