import test from 'node:test';
import assert from 'node:assert/strict';
import {BUYING_SIGNALS, assessBuyingSignals, matchBuyingSignal, trustedSignalSource} from './buying-signals.mjs';
import {evaluate} from './domain.mjs';
import {SEED} from './seed.mjs';

const AS_OF='2026-11-09';
const url='https://example.de/fertigung/linie-a';
const base={name:'Example GmbH',domain:'example.de',site:'Werk Nord, DE',project:'CNC-Linie Alpha',sourceUrl:url,
  observedAt:AS_OF,date:'2026-10-01',origin:'Apify discovery',facts:[
    {code:'cnc',quote:'Unsere Fertigung arbeitet mit CNC-Drehmaschinen.'},{code:'dach',quote:'Werk Nord in Deutschland'}]};
const examples={
  loading_rfq:'Wir bitten um Angebote für die automatische Beladung unserer CNC-Drehmaschinen.',
  feasibility_pilot:'Wir suchen externe Pilotpartner für eine Machbarkeitsstudie zur Beladung unserer CNC-Drehmaschine.',
  loader_retrofit:'Wir planen den Ersatz unseres vorhandenen Ladesystems zur Beladung der CNC-Drehmaschine.',
  unattended_goal:'Wir wollen nachts mit unseren CNC-Drehmaschinen mannlos produzieren.',
  loading_bottleneck:'Die manuelle Beladung unserer CNC-Drehmaschine ist der Engpass in der Produktion.',
  budget_approved:'Wir haben das Budget für die automatische Beladung der CNC-Linie Alpha freigegeben.',
  pilot_rollout:'Nach erfolgreichem Pilotprojekt rollen wir die automatische Beladung auf eine weitere CNC-Drehmaschine aus.',
  series_contract:'Wir haben einen neuen Serienauftrag über 18000 CNC-Drehteile pro Jahr erhalten.',
  insourcing:'Wir holen die bisher extern vergebene CNC-Bearbeitung zurück in unsere eigene Fertigung.',
  cnc_addition:'Wir haben unseren Maschinenpark um eine neue CNC-Drehmaschine erweitert.',
  ergonomics_project:'Wir starten ein Ergonomieprojekt zur Entlastung beim manuellen Beladen unserer CNC-Drehmaschinen.',
  automation_owner_job:'Sie übernehmen die Projektleitung für die Automatisierung der Maschinenbeladung unserer CNC-Drehmaschine.'
};
const signal=(quote,extra={})=>({...base,quote,sourceText:quote,title:'Betriebsmitteilung',...extra});
const find=(s,id,date=AS_OF)=>assessBuyingSignals(base,s,date).find(r=>r.id===id);

test('a denied machine investment is not evidence of a purchase',()=>{
  for (const q of ['We have not purchased a new CNC machining center.',
    'We have never purchased a new CNC machine.', 'We haven’t ordered a new CNC lathe.',
    'Wir haben keine neue CNC-Drehmaschine bestellt.', 'Wir haben die neue CNC-Drehmaschine nicht gekauft.']) {
    assert.equal(find(signal(q),'cnc_addition').status,'unknown',q);
  }
  assert.equal(find(signal('We have purchased a new CNC machining center.'),'cnc_addition').status,'confirmed');
});

test('all 12 precisely defined signals have positive examples in the original German',()=>{
  assert.equal(new Set(BUYING_SIGNALS.map(d=>d.id)).size,12);
  for (const def of BUYING_SIGNALS){
    const extra=def.id==='loading_rfq'?{deadline:'2026-11-23',deadlineQuote:'Angebotsfrist: 2026-11-23'}:{};
    if(def.id==='automation_owner_job') extra.title='Stellenausschreibung Projektleitung';
    const source=signal(examples[def.id],extra);
    assert.equal(matchBuyingSignal(def.id,source.quote),true,def.id);
    const result=find(source,def.id);
    assert.equal(result.status,'confirmed',def.id);
    assert.ok(def.labelDe && def.descriptionDe);
  }
});
test('all 12 support English descriptions of corresponding manufacturing events',()=>{
  const english=[
    'We invite bids through this RFQ for machine loading of our CNC lathes.',
    'We are seeking pilot partners for a feasibility trial of machine tending.',
    'We will replace the worn out loader of our CNC lathe.',
    'We plan unattended production on our new CNC milling machine.',
    'Manual loading of our CNC lathes is a bottleneck limiting our throughput.',
    'We have approved funding for robotic loading of our CNC line 3.',
    'After a successful pilot we will expand machine tending to a second plant and another machine.',
    'We won a new production contract for 1500 precision parts per month.',
    'We are bringing previously outsourced milling back into our own plant for in-house machining.',
    'We have ordered a new CNC milling machine for our shop.',
    'Our safety project addresses repetitive lifting of workpieces during CNC loading.',
    'You will lead the implementation of robotic machine loading for our CNC lathes.'
  ];
  for(const [i,def] of BUYING_SIGNALS.entries()) assert.ok(matchBuyingSignal(def.id,english[i]),def.id);
});
test('generic capabilities, vacancies, buyer denials, supplier marketing and adjacent examples earn no signals',()=>{
  const rejected=[
    ['series_contract','Wir produzieren Drehteile in Kleinserien und großen Losgrößen.'],
    ['automation_owner_job','Wir suchen Produktionshelfer für das Einlegen von Teilen in unsere CNC-Maschinen.'],
    ['unattended_goal','Wir produzieren im Dreischichtbetrieb und suchen eine Nachtschichtbesetzung.'],
    ['ergonomics_project','Wir bieten allen Mitarbeitenden ergonomische Arbeitsplatzgestaltung.'],
    ['loading_bottleneck','Unsere Mitarbeiter legen die Teile von Hand in die CNC-Maschine ein.'],
    ['budget_approved','Wir haben Geld für die Automatisierung der Buchhaltung freigegeben.'],
    ['insourcing','Wir bieten in-house machining und CNC-Fräsen an.'],
    ['cnc_addition','Unser Kunde hat seinen Maschinenpark um eine neue CNC-Drehmaschine erweitert.'],
    ['pilot_rollout','Wir wollen einen erfolgreichen Softwarepilot in der Buchhaltung auf einen zweiten Standort übertragen.'],
    ['feasibility_pilot','Wir suchen nicht nach Pilotpartnern für die Maschinenbeladung.']
  ];
  for(const [id,q] of rejected)assert.equal(find(signal(q),id).status,'unknown',q);
});
test('verified deadline, time zone, expiry and document type control RFQ priority',()=>{
  const q=examples.loading_rfq;
  assert.equal(find(signal(q),'loading_rfq').status,'unknown');
  const rfq=signal(q,{deadline:'2026-11-09T11:00:00+01:00',deadlineQuote:'Angebotsfrist: 09.11.2026, 11:00 CET'});
  assert.equal(find(rfq,'loading_rfq','2026-11-09T09:59:00Z').status,'confirmed');
  assert.equal(find(rfq,'loading_rfq','2026-11-09T10:00:00Z').status,'historical');
  assert.equal(find({...rfq,procurementStatus:'awarded'},'loading_rfq','2026-11-08').status,'unknown'); // first observed on 9 November
});
test('one strongest signal and only separate corroborating quotes count for a named scope',()=>{
  const q=examples.loader_retrofit;
  const source=signal(q,{sourceText:[q,examples.loading_bottleneck,examples.unattended_goal,examples.cnc_addition].join('\n')});
  const r=evaluate(source,null,AS_OF);
  assert.equal(r.score,92); // Fit 30 + 52 strongest + 4 + 4 + 2.
  assert.equal(r.buyingSignals.reduce((sum,row)=>sum+row.points,0),62);
  assert.equal(r.buyingSignals.find(row=>row.id==='loader_retrofit').points,52);
  const single=examples.loader_retrofit+' Die manuelle Beladung unserer CNC-Drehmaschine ist der Engpass.';
  const one=signal(single.replace('. Die',' und die'));
  assert.equal(evaluate(one,null,AS_OF).score,82);
  assert.equal(evaluate({...source,project:''},null,AS_OF).score,82);
});
test('matrix includes other sites and respects a replacement scope for existing equipment',()=>{
  const one=signal(examples.cnc_addition);
  const two=signal(examples.loader_retrofit,{site:'Werk Süd, DE',project:'Drehmaschine Süd',sourceUrl:'https://example.de/sued/retrofit',
    facts:[...base.facts,{code:'automated',quote:'Die Maschine wird automatisch beladen.'}]});
  const r=evaluate({...base,sourceUrl:undefined,signals:[one,two]},null,AS_OF);
  assert.equal(r.score,82);
  const off=r.buyingSignals.find(row=>row.id==='cnc_addition');
  assert.equal(off.status,'confirmed');assert.equal(off.points,0);assert.equal(off.evidence[0].inScoredScope,false);
  assert.equal(r.buyingSignals.find(row=>row.id==='loader_retrofit').evidence[0].inScoredScope,true);
});
test('source provenance is independent: a curated page also retrieved by Apify needs its own evidence',()=>{
  const koch=SEED.find(a=>a.domain==='kochmaschinenbau.de');
  const withFlag=evaluate({...koch,alsoDiscovered:'Apify'},null,AS_OF);
  assert.deepEqual(new Set(withFlag.buyingSignals.find(r=>r.id==='cnc_addition').evidence.map(e=>e.origin)),new Set(['Curated research']));
  const capture={...koch,date:'',quote:koch.quote,sourceText:koch.quote,facts:[]};
  const r=evaluate({...koch,apifyCapture:capture},null,AS_OF);
  const evidence=r.buyingSignals.find(row=>row.id==='cnc_addition').evidence;
  assert.ok(evidence.some(e=>e.origin==='Curated research' && e.status==='confirmed'));
  assert.ok(evidence.some(e=>e.origin==='Apify discovery' && e.status==='unknown'));
  assert.equal(r.score,53);
});
test('invented or external model quotations cannot be added to the original evidence',()=>{
  const s=signal('Wir fertigen CNC-Teile in Deutschland.',{analysis:'Featherless',facts:[...base.facts,
    {code:'loading_bottleneck',quote:examples.loading_bottleneck,method:'Featherless'},
    {code:'series_contract',quote:examples.series_contract,sourceUrl:'https://other.de/news',method:'Featherless'}]});
  assert.ok(assessBuyingSignals(base,s,AS_OF).every(r=>r.status==='unknown'));
});
test('historical news aggregation does not turn archived CNC purchases into new signals',()=>{
  const q='Wir haben unseren Maschinenpark im Jahr 2018 um eine neue CNC-Drehmaschine erweitert.';
  assert.equal(find(signal(q),'cnc_addition').status,'historical');
  assert.equal(find(signal(q,{sourceUrl:'https://example.de/aktuelles/'}),'cnc_addition').status,'unknown');
});
test('TED competition is tied to verified buyer and single selected loading lot',()=>{
  const quote='Description: Automated machine loading of our CNC lathes.';
  const o={buyerName:base.name,buyerDomain:base.domain,quote:'Official name: Example GmbH',websiteQuote:'Internet address: https://example.de',
    roleQuote:'Roles of this organisation: Buyer',sourceUrl:'https://ted.europa.eu/en/notice/-/detail/12345-2026'};
  const fields={...base,sourceUrl:o.sourceUrl,sourceClass:'official_procurement',noticeType:'competition',noticeTypeQuote:'Contract notice – competition',
    procurementStatus:'open',deadline:'2026-11-20',deadlineQuote:'Deadline for receipt of tenders: 20/11/2026',ownership:o};
  const source=signal(quote,{...fields,sourceText:[quote,o.quote,o.websiteQuote,o.roleQuote,fields.noticeTypeQuote,fields.deadlineQuote].join('\n')});
  assert.ok(trustedSignalSource(base,source));
  assert.equal(find(source,'loading_rfq').status,'confirmed');
  assert.equal(evaluate(source,null,AS_OF).score,90);
  assert.equal(find({...source,ownership:{...o,buyerDomain:'other.de'}},'loading_rfq').status,'unknown');
});

test('different named line, site, or unrelated loading application is not combined with the selected project',()=>{
  const primary=examples.unattended_goal;
  for(const distractor of [
    'Wir haben das Budget für die automatische Beladung der CNC-Linie Beta freigegeben.',
    'Wir planen den Ersatz unseres Ladesystems am Standort Berlin.',
    'Wir suchen Pilotpartner für einen Pilotversuch zur Lkw-Beladung an der Verladerampe.'
  ]){
    const s=signal(primary,{sourceText:[primary,distractor].join('\n')});
    const r=evaluate(s,null,AS_OF);
    assert.equal(r.score,73,distractor);
    assert.equal(pointsCredited(r),43);
  }
});
function pointsCredited(result) {return result.buyingSignals.reduce((n,row)=>n+row.points,0);}


test('outside machining converted to own manufacture is a historical insourcing event when the original announcement is old',()=>{
  const quote='Dreh- und Frästeile für unsere Fördertechnik, die bisher extern bezogen wurden, können wir so zu einem Großteil selbst herstellen.';
  assert.equal(matchBuyingSignal('insourcing',quote),true);
  assert.equal(find(signal(quote,{date:'2024-12-02'}),'insourcing').status,'historical');
  assert.equal(find(signal('Wir könnten bisher extern bezogene Drehteile auch selbst herstellen.'),'insourcing').status,'unknown');
  assert.equal(find(signal('Drehteile können wir für unsere Fördertechnik selbst herstellen.'),'insourcing').status,'unknown');
});
