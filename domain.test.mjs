import test from 'node:test';
import assert from 'node:assert/strict';
import { SEGMENTS, evaluate } from './domain.mjs';
import { SEED } from './seed.mjs';

const asOf = '2026-11-09';
const accountFor = domain => SEED.find(item => item.domain === domain);
const assess = (account, contact = null) => evaluate(account, contact, asOf);
const points = (result, label) => result.breakdown.find(row => row.label === label).points;
const executiveContact = {name:'Alex Beispiel',role:'Geschäftsführer'};

test('real sources cover the four campaign segments as well as held scopes', () => {
  assert.equal(new Set(SEED.map(item => item.domain)).size, SEED.length);
  assert.ok(SEED.length >= 12);
  assert.equal(SEGMENTS.length, 4);
  const results = SEED.map(item => assess(item));
  assert.deepEqual(new Set(results.map(r => r.segment.id)),
    new Set(['capacity', 'manual', 'hours', 'mixed', 'research', 'covered']));
  for (const r of results) {
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.score, r.breakdown.reduce((n, row) => n + row.points, 0));
    assert.equal(r.buyingSignals.length, 12);
    assert.equal(r.hold, !r.body);
    if (!r.hold) assert.ok(r.body.includes(r.sourceUrl));
  }
});

test('undated operating profiles carry no publication recency points', () => {
  const a = accountFor('milltech.at');
  const r = assess(a);
  assert.equal(r.segment.id, 'hours');
  assert.equal(points(r, 'Strongest buying signal'), 0);
  assert.equal(r.score, 30);
  assert.equal(r.date, null);
  assert.ok(r.body.includes('abgerufen am 2026-11-09'));
});

test('site expansion does not qualify a machine application on its own', () => {
  const r = assess(accountFor('bauer.de'));
  assert.equal(r.segment.id, 'research');
  assert.equal(r.hold, true);
  assert.equal(r.score, 0);
  assert.match(r.holdReason, /machining/);
});

test('installed equipment suppresses the same project across different source pages', () => {
  const a = accountFor('spaleck.de');
  const extra = { ...a, sourceUrl: 'https://www.spaleck.de/zweite-quelle', quote: 'Die Beladung ist bereits automatisiert.',
    facts: [{ code: 'automated', quote: 'Die Beladung ist bereits automatisiert.' }] };
  const r = assess({ ...a, signals: [extra] });
  assert.equal(r.segment.id, 'covered');
  assert.equal(r.score, 0);
  assert.equal(r.subject, '');
});

test('automation at another project or site does not close a separate process', () => {
  const a = accountFor('eggers-cnc.de');
  const r = assess(a);
  assert.equal(r.segment.id, 'manual');
  assert.equal(r.signalResults.length, 2);
  assert.equal(r.signalResults.find(s => s.project === 'Hermle-Fräszentrum').segment, 'covered');
  const newSite = { ...a, site: 'Another site' };
  const coveredSite = { ...a.signals[0], site: a.site, project: a.project };
  assert.equal(assess({ ...newSite, signals: [coveredSite] }).hold, false);
});

test('recent human evidence counts once, duplicate facts never multiply points', () => {
  const a = accountFor('spn-drive.de');
  assert.equal(assess(a).score, assess({ ...a, facts: [...a.facts, ...a.facts] }).score);
  assert.equal(points(assess(a), 'Strongest buying signal'), 23);
});

test('dated stale and future signals are ineligible', () => {
  const a = accountFor('spn-drive.de');
  for (const date of ['2020-01-01', '2027-02-01']) {
    const r = assess({ ...a, date });
    assert.equal(r.score, 0);
    assert.equal(r.hold, true);
  }
  const undated = accountFor('milltech.at');
  assert.equal(evaluate(undated, null, '2028-01-01').hold, true);
});

test('verified company contact can change the greeting and decision question', () => {
  const a = accountFor('lobba.at');
  const named = assess(a, executiveContact);
  assert.ok(named.body.includes('Guten Tag Alex Beispiel,'));
  assert.ok(named.body.includes('genügend Volumen'));
  assert.equal(named.role, 'Geschäftsführer');
  assert.ok(!assess(a).body.includes('Alex Beispiel'));
  assert.equal(assess(a).score, named.score);
});

test('decorating an app account and evaluating again does not manufacture an extra signal', () => {
  const source = accountFor('zt-odenwald.de');
  const container = { name: source.name, domain: source.domain, signals: [source] };
  const first = assess(container);
  const second = assess({ ...container, ...first }, executiveContact);
  assert.equal(second.signalResults.length, 1);
  assert.equal(second.segment.id, 'covered');
  assert.equal(second.score, 0);
  assert.equal(second.body, '');
});

test('generic interest alone cannot stand in for one of twelve defined events', () => {
  const a=accountFor('spn-drive.de');
  const quote='Wir planen die Automatisierung unserer Buchhaltung.';
  const r=assess({...a,quote,facts:a.facts.filter(f=>['dach','cnc'].includes(f.code)),sourceText:quote});
  assert.equal(points(r,'Strongest buying signal'),0);
});

test('another company domain cannot substantiate the scored operating signal', () => {
  const a = accountFor('spn-drive.de');
  const r = assess({ ...a, sourceUrl: 'https://other.example/story' });
  assert.equal(r.hold, true);
  assert.equal(points(r, 'Machining fit'), 0);
});

test('series evidence asks about the loading method and does not assert manual work', () => {
  const a = accountFor('lobba.at');
  const r = assess({ ...a, facts: a.facts.filter(f => f.code !== 'high_mix') });
  assert.equal(r.segment.id, 'manual');
  assert.match(r.pain, /loading method.*unknown/i);
  assert.match(r.body, /Wie werden die Werkstücke/);
  assert.equal(points(r, 'Strongest buying signal'), 0);
  assert.doesNotMatch(r.body, /manuell|per Hand|zu viel Zeit|viel Zeit bindet/);
});

test('job duties and shift requirements stay visible as context without purchase points', () => {
  for(const a of [accountFor('alutronic.de'),accountFor('sbot.co.at')]) {
    const r=assess(a);
    assert.equal(points(r,'Strongest buying signal'),0);
    assert.equal(r.score,30);
    assert.ok(r.buyingSignals.every(row=>row.status==='unknown'));
  }
});

test('undated expansion, undated unseen profiles and invalid publication dates cannot trigger', () => {
  const a = accountFor('spn-drive.de');
  const undated = assess({ ...a, date: null });
  assert.equal(points(undated, 'Strongest buying signal'), 0);
  assert.equal(undated.hold, true);
  assert.equal(assess({ ...a, date: '2026-02-30' }).hold, true);
  assert.equal(assess({ ...a, date: '2026' }).hold, true);
  const evergreen = accountFor('milltech.at');
  assert.equal(assess({ ...evergreen, observedAt: null }).hold, true);
  assert.equal(assess({ ...evergreen, observedAt: '2027-04-01' }).hold, true);
});

test('publication age includes day 365; day 366 becomes historical', () => {
  const a=accountFor('spn-drive.de');
  for(const [days,status] of [[365,'confirmed'],[366,'historical']]) {
    const date=new Date(Date.parse(asOf)-days*86400000).toISOString().slice(0,10);
    const row=assess({...a,date}).buyingSignals.find(x=>x.id==='cnc_addition');
    assert.equal(row.status,status);
  }
});

test('a future observation cannot retroactively close a documented project', () => {
  const a = accountFor('spn-drive.de');
  const extra = {
    ...a, sourceUrl: 'https://www.spn-drive.de/machine-update', date: null,
    observedAt: '2026-12-01', quote: 'Unsere Anlage wird automatisch beladen.',
    facts: [{ code: 'automated', quote: 'Unsere Anlage wird automatisch beladen.' }]
  };
  assert.equal(assess({ ...a, signals: [extra] }).segment.id, 'capacity');
});

test('hiring staff for a night shift is distinct from a declared unattended production objective', () => {
  const a=accountFor('milltech.at');
  const r=assess(a);
  assert.equal(r.buyingSignals.find(row=>row.id==='unattended_goal').status,'unknown');
  assert.equal(r.segment.id,'hours');
});

test('past manual handling and planned expansion are not current operating signals', () => {
  const a = accountFor('spn-drive.de');
  const facts = a.facts.filter(f => ['cnc', 'dach'].includes(f.code));
  facts.push({ code: 'manual_loading', quote: 'Früher haben wir Werkstücke von Hand eingelegt.' },
    { code: 'new_capacity', quote: 'Eine weitere CNC-Maschine ist geplant.' });
  const r = assess({ ...a, quote:'Eine weitere CNC-Maschine ist geplant.', facts });
  assert.equal(r.hold, true);
  assert.equal(points(r, 'Strongest buying signal'), 0);
});

test('production and purchasing receive distinct questions, unrelated roles get a referral question', () => {
  const a = accountFor('kochmaschinenbau.de');
  const production = assess(a, {name:'Alex Beispiel',role:'Geschäftsführung, Produktionsleitung'});
  const purchasing = assess(a, {name:'Sam Beispiel',role:'Geschäftsführung, Einkauf'});
  assert.match(production.body, /Wie werden die Werkstücke/);
  assert.match(purchasing.body, /Beschaffung/);
  assert.match(purchasing.recipientBasis, /authority unconfirmed/);
  assert.match(assess(a, { name: 'Test Person', role: 'Personalwesen' }).body, /An wen in der Fertigung/);
  assert.match(assess(a, { name: 'Info', type: 'generic' }).body, /^Guten Tag,/);
});

test('manually held accounts have no campaign priority or draft', () => {
  const a = accountFor('kochmaschinenbau.de');
  const r = assess({ ...a, review: 'Hold' }, executiveContact);
  assert.equal(r.hold, true);
  assert.equal(r.score, 0);
  assert.equal(r.body, '');
  assert.equal(r.subject, '');
  assert.match(r.holdReason, /reviewer/);
});

test('retired vacancies cannot drive the current score or draft in either language',()=>{
  for(const domain of ['alutronic.de','fietz.com']){
    const company=accountFor(domain);
    const retired=company.signals.find(s=>s.sourceAvailability==='unavailable');
    assert.ok(retired);
    const r=assess(company);
    assert.notEqual(r.sourceUrl,retired.sourceUrl);
    const old=r.signalResults.find(s=>s.sourceUrl===retired.sourceUrl);
    assert.equal(old.score,0);assert.equal(old.hold,true);
    assert.doesNotMatch(r.bodyEn, /inserting, clamping|loading and unloading aluminium parts/i);
  }
});

test('included automation closes the same scope across sources and an explicit retrofit reopens it',()=>{
  const source=accountFor('zt-odenwald.de');
  const quote='Wir haben ein neues CNC-Drehzentrum von MAZAK angeschafft.';
  const announcement={...source,sourceUrl:'https://www.zt-odenwald.de/maschinen-update',quote,sourceText:quote,
    facts:source.facts.filter(f=>f.code!=='automation_included')};
  const company={name:source.name,domain:source.domain,signals:[announcement,source]};
  const held=assess(company);
  assert.equal(held.score,0);
  assert.equal(held.segment.id,'covered');
  const adjustment=held.breakdown.find(r=>r.label==='Eligibility adjustment');
  assert.equal(adjustment.quote,source.facts.find(f=>f.code==='automation_included').quote);
  assert.equal(adjustment.sourceUrl,source.sourceUrl);
  assert.match(held.holdReason,/includes robotic automation/);
  assert.doesNotMatch(held.holdReason,/installation in progress/);
  const retrofit='Wir planen den Ersatz des bestehenden Beladeroboters an unserem CNC-Drehzentrum.';
  const reopened=assess({...company,signals:[source,{...announcement,quote:retrofit,sourceText:retrofit}]});
  assert.equal(reopened.hold,false);
  assert.equal(reopened.buyingSignals.find(r=>r.id==='loader_retrofit').points,52);
  assert.equal(assess({...company,signals:[announcement,{...source,project:'Andere Maschine'}]}).score,53);
  assert.equal(assess({...company,signals:[announcement,{...source,observedAt:'2027-01-01'}]}).score,53);
});

test('recently observed capability pages retain fit while dated buying events expire',()=>{
  const quote='Wir fertigen CNC-Drehteile in Kleinserien.';
  const profile={name:'Beispiel GmbH',domain:'example.de',sourceUrl:'https://example.de/maschinenpark',
    title:'Unser Maschinenpark',quote,sourceText:quote,date:'2022-01-01',observedAt:asOf,origin:'Apify discovery',
    facts:[{code:'dach',quote:'Unser Standort liegt in Deutschland.'},{code:'cnc',quote},
      {code:'repeat_production',quote}]};
  const current=assess(profile);
  assert.equal(current.score,30);
  assert.equal(current.date,'2022-01-01');
  assert.ok(current.buyingSignals.every(row=>row.points===0));
  assert.equal(assess({...profile,observedAt:'2022-01-01'}).hold,true);
  assert.equal(assess({...profile,sourceAvailability:'unavailable'}).hold,true);
  assert.equal(assess({...profile,date:'2027-01-01'}).hold,true);
  const event='Wir haben eine neue CNC-Fräsmaschine für unsere Kleinserien angeschafft.';
  for(const sourceUrl of ['https://example.de/news/2022/purchase',profile.sourceUrl]) {
    const old=assess({...profile,sourceUrl,quote:event,sourceText:event});
    assert.equal(old.score,0);
    assert.equal(old.buyingSignals.find(row=>row.id==='cnc_addition').status,'historical');
  }
});

test('saved locality evidence remains visible without inferring a DACH country',()=>{
  const quote='Zur Erweiterung unseres Teams suchen wir für den Standort in Empfingen einen CNC-Fräser (m/w/d) für die Dauernachtschicht.';
  const source={name:'SACS Aerospace',domain:'sacs.aero',site:'',sourceUrl:'https://www.sacs.aero/portfolio-items/cnc-fraeser',
    title:'CNC-Fräser (m/w/d) für die Dauernachtschicht',quote,sourceText:quote,observedAt:asOf,origin:'Apify discovery',
    facts:[{code:'cnc',quote},{code:'extended_hours',quote}]};
  const result=assess(source);
  assert.equal(result.site,'Empfingen');
  assert.equal(source.site,'');
  assert.equal(result.hold,true);
  assert.equal(result.score,0);
  assert.equal(points(result,'DACH site'),0);
  assert.match(result.holdReason,/Empfingen.*country still needs verification/);
  assert.match(result.pain,/CNC shift staffing/);
  assert.equal(result.breakdown.find(r=>r.label==='Eligibility adjustment').quote,quote);
  assert.equal(assess({...source,sourceUrl:'https://unrelated.example/job'}).site,'');
});
