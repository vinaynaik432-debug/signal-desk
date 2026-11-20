import test from 'node:test';
import assert from 'node:assert/strict';
import {RESEARCH_TRIGGERS,matchResearchTrigger,researchTriggersFor} from './research-triggers.mjs';
const now='2026-11-09';
const firm={name:'Test Manufacturing',domain:'example.de'};
function page(text,extra={}) {
  return {domain:firm.domain,site:'Berlin, DE',sourceUrl:'https://example.de/fertigung',title:'CNC-Fertigung',
    quote:text.split('\n')[0],sourceText:text,observedAt:now,date:null,origin:'Apify discovery',...extra};
}
const hits=(p,asOf=now)=>researchTriggersFor(firm,p,asOf);
const load='manual_cnc_duties',hours='cnc_shift_pattern',lot='quantified_batch_size',iface='automation_interface';
test('four bilingual profiles carry no buying points and quote original operator evidence',()=>{
  assert.equal(RESEARCH_TRIGGERS.length,4);
  assert.ok(RESEARCH_TRIGGERS.every(d=>d.labelDe && d.descriptionDe));
  const r=hits(page('CNC-Maschinen be- und entladen',{sourceUrl:'https://example.de/karriere/stellenangebote.html',title:'Stellenangebote'}));
  assert.deepEqual(r.map(x=>x.id),[load]);
  assert.equal(r[0].quote,'CNC-Maschinen be- und entladen');assert.equal(r[0].status,'observed');
  assert.equal(r[0].origin,'Apify discovery');assert.equal(r[0].points,0);assert.equal(r[0].date,null);
});
test('dedicated CNC jobs and same-job headings substantiate manual work, without implying a bottleneck',()=>{
  const q='Beladen und Entladen der Maschinen';
  const s=page(q,{title:'Maschinenbediener/-in CNC',sourceUrl:'https://example.de/karriere/operator',date:'2026-10-03'});
  assert.ok(matchResearchTrigger(load,q));assert.equal(hits(s)[0].status,'dated');
  assert.equal(hits(s)[0].contextQuote,s.title);
  const index=page('Maschinenbediener/-in CNC\nIhre Aufgaben\n'+q,{title:'Stellenangebote',sourceUrl:'https://example.de/karriere'});
  assert.equal(hits(index)[0].contextQuote,'Maschinenbediener/-in CNC');
  const plastics=page('Einlegen und Abnehmen von Kunststoffteilen in die Maschine',{title:'CNC-Maschinenbediener (m/w/d)',sourceUrl:s.sourceUrl});
  assert.equal(hits(plastics)[0].id,load);
});
test('dedicated night shift is retained but shift language in another role does not carry over',()=>{
  const r=hits(page('CNC-Fräser (m/w/d) - Dauernachtschicht',{sourceUrl:'https://example.de/karriere',title:'Unsere offenen Stellen'}));
  assert.equal(r[0].id,hours);
  const general=page('CNC-Dreher (m/w/d)\nKüchenhilfe (m/w/d)\nBereitschaft zur Dauernachtschicht',{title:'Karriere',sourceUrl:'https://example.de/jobs'});
  assert.deepEqual(hits(general),[]);
  assert.deepEqual(hits(page('Wir wollen unsere CNC-Drehmaschine in der Nachtschicht künftig mannlos betreiben.')),[]);
  const neg=page('Wir arbeiten an CNC-Maschinen ohne Nachtschicht.');
  assert.deepEqual(hits(neg),[]);
});
test('distinguishes a reported manufacturing range from offered batch sizes',()=>{
  const q='In Losgrößen von 20 bis 5.000 Stück fertigen wir wiederholgenau.';
  const positive=hits(page(q));assert.equal(positive[0].id,lot);
  assert.equal(positive[0].basis,'reported production range');
  const typical=hits(page('Der typische Kleinserienbereich liegt bei 5 bis 50 Stück, kleine Serienlose bis etwa 200 Stück wickeln wir ebenfalls ab.'));
  assert.equal(typical[0].id,lot);assert.equal(typical[0].basis,'offered or typical range');
  for(const t of ['Die CNC-Maschine hat 120 Werkzeugplätze.', 'Wir bieten Losgrößen bis 200 mm an.',
    'Unsere Magazinplätze haben eine Kapazität von 200 Stück.', 'Die Steuerung erlaubt Losgrössen mit 20 Stück pro Stunde.']) {
    assert.deepEqual(hits(page(t)),[],t);
  }
});
test('robot-ready interface accepts the operator’s own order, not installed robots or supplier options',()=>{
  const q='Vorausschauend haben wir gleich eine Schnittstelle zu einem Roboter dazu bestellt.';
  const s=page('Unser neues CNC Bearbeitungszentrum zur Schrankbearbeitung.\n'+q+'\nSo kann die Maschine in Zukunft autonom arbeiten.',{title:'Über uns'});
  const r=hits(s);assert.equal(r[0].id,iface);assert.ok(r[0].contextQuote.includes('CNC'));
  const done=page(s.sourceText+'\nDie Roboterzelle ist bereits installiert.',{title:'Über uns'});
  assert.deepEqual(hits(done),[]);
  assert.deepEqual(hits(page('Die Roboterschnittstelle kann optional bestellt werden.')),[]);
  assert.deepEqual(hits(page('Our CNC lathe comes equipped with a robot interface for your machine tool.')),[]);
});
test('unavailable old roles remain historical; unsupported model proposals, recruitment agencies and other domains are rejected',()=>{
  const q='CNC lathes: loading and unloading workpieces manually.';
  const p=page(q,{date:'2022-01-01',sourceUrl:'https://example.de/jobs/cnc-operator'});assert.equal(hits(p)[0].status,'historical');
  assert.equal(hits({...p,date:null,sourceAvailability:'unavailable'})[0].status,'historical');
  assert.deepEqual(hits({...p,sourceUrl:'https://external.example/jobs/123'}),[]);
  assert.deepEqual(hits({...p,observedAt:'2027-01-02'}),[]);
  assert.deepEqual(hits(page('Für ein Kundenunternehmen suchen wir für die CNC-Maschinenbedienung: manuelles Einlegen und Entnehmen von Teilen.')),[]);
  const unrelated=page('Unser Werk bearbeitet CNC-Teile.',{facts:[{code:load,quote:q,method:'Featherless'}]});
  assert.deepEqual(hits(unrelated),[]);
  assert.equal(hits(page(q,{facts:[{code:load,quote:q,method:'Featherless'}]}))[0].method,'Featherless');
});

test('capability observations use their retrieval date while news and jobs keep their dated history',()=>{
  const q='In Losgrößen von 20 bis 5.000 Stück fertigen wir CNC-Drehteile.';
  const profile=page(q,{date:'2022-01-01',sourceUrl:'https://example.de/leistungen/cnc-drehen'});
  const observation=hits(profile)[0];
  assert.equal(observation.status,'observed');
  assert.equal(observation.date,'2022-01-01');
  assert.equal(observation.observedAt,now);
  assert.equal(observation.points,0);
  assert.equal(hits({...profile,sourceUrl:'https://example.de/news/2022/expansion'})[0].status,'historical');
  assert.equal(hits({...profile,title:'Investition in eine neue Fräsmaschine'})[0].status,'historical');
  assert.equal(hits({...profile,observedAt:'2022-02-01'})[0].status,'historical');
  assert.equal(hits({...profile,sourceAvailability:'unavailable'})[0].status,'historical');
  const jobPage=page('CNC-Fräser (m/w/d) für die Dauernachtschicht',{
    title:'CNC-Fräser (m/w/d)',date:'2022-01-01',sourceUrl:'https://example.de/portfolio-items/cnc-fraeser'});
  assert.equal(hits(jobPage)[0].status,'historical');
});

test('saved shift observations retain a cited locality without changing buying points',()=>{
  const quote='Für unseren Standort in Empfingen suchen wir CNC-Fräser (m/w/d) für die Dauernachtschicht.';
  const source=page(quote,{site:'',title:'CNC-Fräser (m/w/d)',sourceUrl:'https://example.de/jobs/cnc-fraeser'});
  const record=hits(source)[0];
  assert.equal(record.site,'Empfingen');
  assert.equal(record.points,0);
  assert.equal(record.quote,quote);
});
