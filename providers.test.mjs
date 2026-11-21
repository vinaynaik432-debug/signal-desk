import test from 'node:test'
import assert from 'node:assert/strict'
import {discover, analyze, contacts, inspectDiscoveryResults} from './providers.mjs'

const source = 'https://www.beispielwerk.de/maschinenpark'
const text = [
  'Wir fertigen CNC-Drehteile und Frästeile für den Maschinenbau.',
  'Unser Standort liegt in Bayern.',
  'Wir haben eine neue Fräsmaschine in Betrieb genommen.',
  'Wir planen keine Nachtschicht.',
  'Unsere Rechnungskontrolle ist automatisiert.',
  'Unsere CNC-Maschinen werden automatisch beladen.'
].join('\n')
const row = {
  metadata:{url:source, title:'Maschinenpark | Beispielwerk GmbH'},
  searchResult:{url:source}, crawl:{httpStatusCode:200,loadedAt:'2026-11-09'}, text
}

function respond(t, result) {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const endpoint = new URL(url)
    calls.push({url:endpoint, options})
    if (Array.isArray(result) && options.method==='POST' && endpoint.pathname.endsWith('/runs')) {
      return Response.json({data:{id:'t3stRun',defaultDatasetId:'t3stData',status:'SUCCEEDED'}})
    }
    return Response.json(result)
  })
  return calls
}

test('discovery requires operator evidence, ignores press, redirects and duplicate domains, and caps costs', async t => {
  const press = 'https://www.herstellerzeitung.de/berichte/beispielwerk'
  const calls = respond(t, [
    row, row,
    {metadata:{title:'Produktionsausbau | Herstellerzeitung', url:press}, searchResult:{url:press},
      text:'Die Beispielwerk GmbH stellt CNC-Drehteile her. „Wir fertigen CNC-Drehteile für den Maschinenbau“, sagte eine Sprecherin.'},
    {...row,searchResult:{url:'https://www.andere-quelle.de/bericht'}},
    {...row,metadata:{...row.metadata,url:'http://127.0.0.1/maschinenpark'}}
  ])
  const result = await discover({APIFY_TOKEN:'unit-test'}, 'CNC Fertigung')
  assert.equal(result.candidates.length, 1)
  assert.equal(result.candidates[0].name, 'Beispielwerk GmbH')
  assert.equal(result.candidates[0].site, 'Bayern')
  assert.equal(result.candidates[0].date, '') // A crawl date is not a publication date.
  assert.deepEqual(result.candidates[0].facts.map(f => f.code), ['cnc','dach','cnc_addition'])
  assert.match(result.warnings[0], /4 result/)
  assert.equal(calls.length, 2)
  assert.equal(calls[0].url.searchParams.get('maxTotalChargeUsd'), '0.05')
  assert.equal(calls[0].url.origin, 'https://api.apify.com')
  assert.equal(calls[0].options.redirect, 'error')
})

test('model enrichment preserves negation and refuses unrelated labels or manufactured quotations', async t => {
  const calls = respond(t, {choices:[{message:{content:JSON.stringify({facts:[
    {code:'new_capacity',quote:'eine neue Fräsmaschine'}, {code:'extended_hours',quote:'Nachtschicht'},
    {code:'automated',quote:'Rechnungskontrolle ist automatisiert.'},
    {code:'manual_loading',quote:'Wir beladen die Maschine von Hand.'}, {code:'explicit_interest',quote:'Wir fertigen CNC-Drehteile'}
  ]})}}]})
  const candidate = {domain:'beispielwerk.de',sourceUrl:source,sourceText:text,facts:[{code:'cnc',quote:text.split('\n')[0]}]}
  const output = await analyze({FEATHERLESS_API_KEY:'unit-test'}, candidate)
  assert.deepEqual(output.facts, [candidate.facts[0], {code:'new_capacity',quote:text.split('\n')[2]}, {code:'cnc_addition',quote:text.split('\n')[2],method:'source rule',sourceUrl:source}])
  assert.equal(calls[0].url.origin, 'https://api.featherless.ai')
})

test('domain lookup shows the provider-reported verification, and accepts only domain-matched addresses and public source links', async t => {
  const calls = respond(t, {data:{domain:'beispielwerk.de',emails:[
    {value:'anna@beispielwerk.de',first_name:'Anna',last_name:'Muster',type:'personal',position:'Produktionsleiterin',confidence:88,verification:{status:'accept_all'},provenance:'found',
      sources:[{uri:'javascript:alert(1)'},{uri:source,still_on_page:true}]},
    {value:'team@another-company.de'},
    {value:'team@beispielwerk.de',type:'generic'},
    {value:'info@beispielwerk.de',first_name:'Info',last_name:'Kontakt',type:'personal',position:'Vertriebsleiter'},
    {value:'bad@beispielwerk.de',verification:{status:'invalid'}}
  ]}})
  const rows = await contacts({HUNTER_API_KEY:'unit-test'}, 'beispielwerk.de')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].verification, 'accept_all')
  assert.equal(rows[0].sourceUrl, source)
  assert.equal(rows[0].name, 'Anna Muster')
  assert.equal(calls[0].url.searchParams.get('required_field'), 'full_name,position')
  assert.equal(rows[0].sources.length, 1)
  assert.equal(calls[0].url.origin, 'https://api.hunter.io')
  assert.equal(calls[0].url.search.includes('api_key'),false)
})

test('invalid destinations and credentials fail before dispatch, vendor failures redact bodies and tokens', async t => {
  let count = 0
  t.mock.method(globalThis, 'fetch', async () => {
    count++
    return new Response('sensitive echo from provider', {status:429})
  })
  await assert.rejects(discover({APIFY_TOKEN:'unit-test'}, 'https://127.0.0.1'), /search phrase/)
  await assert.rejects(contacts({HUNTER_API_KEY:'unit-test'}, '127.0.0.1'), /public company domain/)
  await assert.rejects(analyze({FEATHERLESS_API_KEY:'unit-test'}, {domain:'abc.de',sourceUrl:'https://def.de'}), /matching/)
  await assert.rejects(discover({}, 'CNC'), /not configured/)
  assert.equal(count,0)
  await assert.rejects(discover({APIFY_TOKEN:'unit-test'}, 'CNC'), {message:'Apify returned HTTP 429.'})
  assert.equal(count,1)
})

test('retains different first-party pages from the same account and removes replays', async t => {
  const second = new URL('/leistungen', source).href
  respond(t, [row, {...row,metadata:{...row.metadata,url:second},searchResult:{url:second}},
    {...row,metadata:{...row.metadata,url:source+'?utm_source=tradefair'},searchResult:{url:source}}])
  const result = await discover({APIFY_TOKEN:'unit-test'}, 'CNC')
  assert.deepEqual(result.candidates.map(c=>c.sourceUrl), [source,second])
})

test('automated means already deployed machine loading at this process', async t => {
  const negative = 'Unsere Rechnungskontrolle ist automatisiert.'
  const unimplemented = 'Wir planen eine automatisierte Beladung der CNC-Fräsmaschine.'
  const actual = 'Unsere CNC-Maschinen werden automatisch beladen.'
  respond(t, {choices:[{message:{content:JSON.stringify({facts:[actual,negative,unimplemented].map(quote=>({code:'automated',quote}))})}}]})
  const result = await analyze({FEATHERLESS_API_KEY:'unit-test'}, {domain:'beispielwerk.de',sourceUrl:source,sourceText:[negative,unimplemented,actual].join('\n')})
  assert.deepEqual(result.facts, [{code:'automated',quote:actual}])
})

test('machine retailer pages do not become CNC operator prospects; headings yield to specific first-party statements', async t => {
  const retailerUrl = 'https://www.bespoke-machines.de/cnc-maschinen'
  const line = 'Unser Maschinenpark umfasst 16 moderne CNC-Maschinen und drei Drehmaschinen.'
  respond(t, [
    {metadata:{title:'CNC Maschinen preiswert beim deutschen Hersteller kaufen',url:retailerUrl},
      searchResult:{url:retailerUrl}, text:'Unser Bestseller: Mit den CNC Maschinen treffen Sie immer eine gute Entscheidung.'},
    {...row, metadata:{...row.metadata,url:source+'?srsltid=random'}, text:['CNC-Drehmaschine','Unser CNC Maschinenpark',line,'Bruchweg 4','32369 Rahden','Deutschland'].join('\n')}
  ])
  const result = await discover({APIFY_TOKEN:'unit-test'}, 'CNC Maschinenpark')
  assert.equal(result.candidates.length, 1)
  assert.equal(result.candidates[0].quote, line)
  assert.equal(result.candidates[0].sourceUrl, source)
  assert.equal(result.candidates[0].site, 'Deutschland')
  assert.equal(result.candidates[0].facts[0].quote, line)
  assert.ok(result.candidates[0].facts.some(f => f.code === 'dach' && f.quote === 'Bruchweg 4 32369 Rahden Deutschland'))
})

test('excludes KUNZMANN configurable machine marketing even when the builder also mentions its own production', async t => {
  const sourceUrl = 'https://www.kunzmann-fraesmaschinen.de/'
  const title = 'Made in Germany seit 1907. Manuelle, hybride & CNC-Lösungen für Ausbildung & Industrie. Jetzt Beratung anfragen!'
  const offer = 'Bei vielen unserer CNC-Fräsmaschinen können Sie zwischen verschiedenen Steuerungen wählen.'
  const builder = {metadata:{title,url:sourceUrl},searchResult:{url:sourceUrl},
    text:'Wir fertigen Bauteile in unserem eigenen Werk. ' + offer}
  respond(t,[builder, {...builder,metadata:{url:sourceUrl,title:'Fräsmaschinen von KUNZMANN'}},
    {...builder,metadata:{url:sourceUrl,title:'Unternehmen'},text:offer.repeat(2)}, row])
  const output = await discover({APIFY_TOKEN:'unit-test'}, 'CNC Fräsen')
  assert.deepEqual(output.candidates.map(c=>c.domain), ['beispielwerk.de'])
})

test('5 or 12 page depth preserves the cost ceiling and emits one safe, attributable decision per reviewed result', async t => {
  const rows = [row, row, {metadata:{title:'<em>unsafe</em>',url:'https://a.de/?token=test-only'}},
    {...row,metadata:{title:'Media',url:'https://linkedin.com/example'}},
    {...row,crawl:{httpStatusCode:404}},
    ...Array.from({length:9},(_,i)=>({...row,metadata:{...row.metadata,url:source+'/'+i},searchResult:{url:source+'/'+i}}))]
  const calls = respond(t,rows)
  for (const n of [0, 6, '12', null]) await assert.rejects(discover({APIFY_TOKEN:'unit-test'},'CNC',n),/5 or 12/)
  assert.equal(calls.length,0)
  const result=await discover({APIFY_TOKEN:'unit-test'},'CNC',12)
  assert.equal(JSON.parse(calls[0].options.body).maxResults,12)
  assert.equal(calls[1].url.searchParams.get('limit'),'12')
  assert.equal(calls[0].url.searchParams.get('maxTotalChargeUsd'),'0.05')
  assert.equal(result.pagesReviewed,12)
  assert.equal(result.uniqueCompanies,1)
  assert.deepEqual(result.decisions.slice(0,5).map(d=>d.outcome),['kept','duplicate','skipped','skipped','skipped'])
  assert.equal(result.decisions[2].sourceUrl,'')
  assert.equal(result.decisions[2].title,'unsafe')
  for (const d of result.decisions) assert.deepEqual(Object.keys(d).sort(),['domain','outcome','reason','sourceUrl','title'])
})

test('a short headline or a planned purchase cannot displace an explicit investment in the source', async t => {
  const purchase='Wir haben unseren Maschinenpark um eine neue CNC-Drehmaschine erweitert.'
  const proposal='Neue CNC-Drehmaschine'
  const planned='Wir planen eine neue CNC-Drehmaschine, die nächstes Jahr installiert wird.'
  respond(t,{choices:[{message:{content:JSON.stringify({facts:[{code:'new_capacity',quote:purchase},{code:'new_capacity',quote:proposal},{code:'new_capacity',quote:planned}]})}}]})
  const result=await analyze({FEATHERLESS_API_KEY:'unit-test'}, {domain:'beispielwerk.de',sourceUrl:source,sourceText:[purchase,proposal,planned].join('\n')})
  assert.equal(result.facts.find(f=>f.code==='new_capacity')?.quote,purchase)
})

test('empty model response preserves explicitly evidenced operating facts and identifies rule provenance', async t => {
  // Same sentence structure as the previously missed Koch investment, using test wording.
  const line='Um unseren Kunden mehr Flexibilität zu bieten, haben wir unseren Maschinenpark um eine neue 5-Achs-CNC-Fräsmaschine erweitert.'
  respond(t,{choices:[{message:{content:'{"facts":[]}'}}]})
  const output=await analyze({FEATHERLESS_API_KEY:'unit-test'}, {domain:'beispielwerk.de',sourceUrl:source,quote:line})
  assert.deepEqual(output.facts.map(f=>[f.code,f.method]),[['cnc','source rule'],['new_capacity','source rule'],['cnc_addition','source rule']])
})

test('ignores job interest and foreign geography even if a model claims positive intent or DACH', async t => {
  const vacancy='Wir suchen Ingenieure für die Automatisierung unserer Maschinen.'
  const foreign='Unsere Fertigung liegt in Tschechien und beliefert Kunden in Deutschland.'
  respond(t,{choices:[{message:{content:JSON.stringify({facts:[{code:'dach',quote:foreign},{code:'explicit_interest',quote:vacancy}]})}}]})
  const result=await analyze({FEATHERLESS_API_KEY:'unit-test'}, {domain:'beispielwerk.de',sourceUrl:source,sourceText:[foreign,vacancy].join('\n')})
  assert.deepEqual(result.facts,[])
})

test('supports editorial subdomains while keeping evidence from another URL out of the prompt and result', async t => {
  const other='CH-8001 Zürich'
  const q='Wir fertigen CNC-Drehteile.'
  const calls=respond(t,{choices:[{message:{content:JSON.stringify({facts:[{code:'dach',quote:other}]})}}]})
  const input={domain:'beispielwerk.de',sourceUrl:'https://news.beispielwerk.de/investition',quote:q,sourceText:[q,other].join('\n'),facts:[{code:'dach',quote:other,sourceUrl:'https://beispielwerk.de/impressum'}]}
  const result=await analyze({FEATHERLESS_API_KEY:'unit-test'},input)
  assert.ok(!JSON.parse(calls[0].options.body).messages[1].content.includes(other))
  assert.ok(!result.facts.some(f=>f.code==='dach'))
  await assert.rejects(analyze({FEATHERLESS_API_KEY:'unit-test'}, {...input,sourceUrl:'https://fakebeispielwerk.de/investition'}),/matching/)
})

test('self-issued company announcements support third-person subjects and verify calendar dates',async t=>{
  const announcement='Beispielwerk hat in ein neues Dreh-Fräszentrum investiert und damit die vorhandenen Fertigungskapazitäten erweitert.'
  const other='Fremdwerk hat in ein neues Dreh-Fräszentrum investiert und damit die vorhandenen Fertigungskapazitäten erweitert.'
  const make=(line,path,date)=>({metadata:{title:'Neue Kapazität | Beispielwerk',url:'https://beispielwerk.de/'+path,datePublished:date},text:line})
  respond(t,[make(announcement,'aktuell/anlage','2026-02-30'),make(announcement,'aktuelles/','2026-10-09'),make(other,'presse/fremdwerk','2026-10-09')])
  const result=await discover({APIFY_TOKEN:'unit-test'},'CNC')
  assert.deepEqual(result.candidates.map(x=>x.date),['',''])
  assert.equal(result.decisions[2].outcome,'skipped')
  assert.match(result.decisions[1].reason,/index/)
})

test('accepts concrete first-party loading duties and rejects staffing-agency pages describing a client',async t=>{
  const duty='Werkstücke nach Vorgabe einlegen, spannen und entnehmen.'
  const sourceUrl='https://beispielwerk.de/karriere/stellenangebot-cnc'
  const job={metadata:{url:sourceUrl,title:'CNC Maschinenbediener (m/w/d) | Beispielwerk'},text:'CNC-Drehmaschinen bedienen und überwachen. '+duty+' Wir arbeiten im Dreischichtbetrieb.'}
  const agency={...job,metadata:{...job.metadata,url:sourceUrl+'-extern'},text:'Im Auftrag unseres Kunden suchen wir erfahrene Mitarbeiter. '+job.text}
  respond(t,[job,agency])
  const result=await discover({APIFY_TOKEN:'unit-test'},'CNC Maschinenbediener')
  assert.deepEqual(result.decisions.map(x=>x.outcome),['kept','skipped'])
  assert.equal(result.candidates[0].quote,duty)
})

test('malformed provider output leaves the input evidence intact and redacts error payloads',async t=>{
  const c={domain:'beispielwerk.de',sourceUrl:source,quote:text.split('\n')[0],facts:[{code:'cnc',quote:text.split('\n')[0]}]}
  const before=structuredClone(c)
  respond(t,{choices:[{message:{content:'Provider text with untrusted details'}}]})
  await assert.rejects(analyze({FEATHERLESS_API_KEY:'unit-test'},c),{message:'Featherless returned an unreadable analysis. The original evidence is available.'})
  assert.deepEqual(c,before)
})

test('reads the same timed-out Apify run and preserves its partial dataset without starting it again',async t=>{
  const calls=[]
  const run={id:'a123Run',defaultDatasetId:'b123Dataset',status:'RUNNING'}
  let polls=0
  t.mock.method(globalThis,'fetch',async (url,options)=>{
    const endpoint=new URL(url)
    calls.push([options.method,endpoint.pathname])
    if(options.method==='POST') {
      assert.equal(endpoint.pathname,'/v2/actors/apify~rag-web-browser/runs')
      assert.equal(endpoint.searchParams.get('timeout'),'100')
      assert.equal(endpoint.searchParams.get('maxTotalChargeUsd'),'0.05')
      return Response.json({data:run})
    }
    if(endpoint.pathname==='/v2/actor-runs/a123Run') {
      assert.ok(Number(endpoint.searchParams.get('waitForFinish'))<=60)
      return Response.json({data:{...run,status:++polls===1?'RUNNING':'TIMED-OUT'}})
    }
    assert.equal(endpoint.pathname,'/v2/datasets/b123Dataset/items')
    return Response.json([row])
  })
  const result=await discover({APIFY_TOKEN:'unit-test'},'Maschinenpark',12)
  assert.equal(calls.filter(c=>c[0]==='POST').length,1)
  assert.equal(result.providerStatus,'TIMED-OUT')
  assert.equal(result.partial,true)
  assert.equal(result.pagesReviewed,1)
  assert.equal(result.candidates.length,1)
  assert.match(result.warnings[0],/TIMED-OUT.*Recovered 1 available page/)
})

test('when status reads fail, fetches the original dataset; an empty failed run gives an actionable error',async t=>{
  const run={id:'c123Run',defaultDatasetId:'d123Dataset',status:'RUNNING'}
  let dataset=[row]
  let failed=false
  let starts=0
  t.mock.method(globalThis,'fetch',async (url,options)=>{
    if(options.method==='POST') { starts++;return Response.json({data:{...run,status:failed?'FAILED':'RUNNING'}}) }
    if(new URL(url).pathname.includes('/actor-runs/')) return new Response('sensitive provider error',{status:503})
    return Response.json(dataset)
  })
  const partial=await discover({APIFY_TOKEN:'unit-test'},'CNC')
  assert.equal(partial.partial,true)
  assert.equal(partial.providerStatus,'UNKNOWN')
  assert.equal(partial.pagesReviewed,1)
  assert.equal(starts,1)
  dataset=[];failed=true
  await assert.rejects(discover({APIFY_TOKEN:'unit-test'},'CNC'),/Apify reported FAILED and its dataset had no pages/)
  assert.equal(starts,2)
})

test('offline inspection never calls a provider and cannot accept unsafe run IDs from a start response',async t=>{
  const calls=respond(t,{data:{id:'../../other',defaultDatasetId:'t3stData',status:'SUCCEEDED'}})
  assert.equal(inspectDiscoveryResults([row],12).pagesReviewed,1)
  assert.equal(calls.length,0)
  await assert.rejects(discover({APIFY_TOKEN:'unit-test'},'CNC'),/incomplete run identifiers/)
  assert.equal(calls.length,1)
})

test('transient read errors retry the existing run and its dataset without another paid start',async t=>{
  const run={id:'e123Run',defaultDatasetId:'f123Dataset',status:'RUNNING'}
  const count={start:0,status:0,dataset:0}
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(options.method==='POST'){count.start++;return Response.json({data:run})}
    if(new URL(url).pathname.includes('/actor-runs/')){
      if(++count.status===1)return new Response(null,{status:502})
      return Response.json({data:{...run,status:'SUCCEEDED'}})
    }
    if(++count.dataset===1)return new Response(null,{status:503})
    return Response.json([row])
  })
  const result=await discover({APIFY_TOKEN:'unit-test'},'CNC')
  assert.deepEqual(count,{start:1,status:2,dataset:2})
  assert.equal(result.partial,false)
  assert.equal(result.pagesReviewed,1)
})

const buyerStatements = {
  loading_rfq:'Wir bitten um Angebote für die automatische Beladung und Entladung unserer CNC-Drehmaschine.',
  feasibility_pilot:'Wir suchen Pilotpartner für eine Machbarkeitsstudie zur automatischen Beladung unserer CNC-Drehmaschine.',
  loader_retrofit:'Wir planen den Ersatz unseres vorhandenen Ladesystems zur Beladung der CNC-Drehmaschine.',
  unattended_goal:'Wir wollen unsere CNC-Drehmaschine in der Nachtschicht künftig mannlos betreiben.',
  loading_bottleneck:'Die manuelle Beladung unserer CNC-Drehmaschine ist der Engpass in der Produktion.',
  budget_approved:'Das Budget für die automatische Beladung der CNC-Linie Alpha wurde freigegeben.',
  pilot_rollout:'Nach erfolgreichem Pilotprojekt rollen wir die automatische Beladung auf eine weitere CNC-Drehmaschine aus.',
  series_contract:'Wir haben einen neuen Serienauftrag über 18.000 CNC-Drehteile pro Jahr erhalten.',
  insourcing:'Wir holen die bisher extern vergebene CNC-Bearbeitung zurück in unsere eigene Fertigung.',
  cnc_addition:'Wir haben unseren Maschinenpark um eine neue CNC-Drehmaschine erweitert.',
  ergonomics_project:'Wir starten ein Ergonomieprojekt zur Entlastung unserer Mitarbeitenden bei der manuellen Beladung der CNC-Drehmaschine.',
  automation_owner_job:'Sie übernehmen die Projektleitung für die Automatisierung der Maschinenbeladung unserer CNC-Drehmaschine.'
}
const officialSite='https://www.beispielwerk.de/unternehmen/news/produktion'
function buyerPage(body,options={}) {
  return {metadata:{url:officialSite,title:'Fertigung | Beispielwerk GmbH',datePublished:'2026-10-02',...options},
    text:'Unser Maschinenpark umfasst mehrere CNC-Drehmaschinen.\n'+body}
}

test('all 12 buyer signals travel from original page text through discovery and audited model extraction',async t=>{
  const calls=respond(t,{choices:[{message:{content:JSON.stringify({facts:Object.entries(buyerStatements).map(([code,quote])=>({code,quote}))})}}]})
  const page=buyerPage(Object.values(buyerStatements).join('\n'))
  const result=inspectDiscoveryResults([page],5)
  assert.equal(result.candidates.length,1)
  const c=result.candidates[0]
  assert.deepEqual(c.facts.filter(f=>Object.hasOwn(buyerStatements,f.code) && f.method==='source rule').map(f=>f.code).sort(),Object.keys(buyerStatements).sort())
  const analysis=await analyze({FEATHERLESS_API_KEY:'unit-test'},c)
  const enriched=analysis.facts.filter(f=>Object.hasOwn(buyerStatements,f.code))
  assert.equal(enriched.length,12)
  for (const f of enriched) {
    assert.equal(f.quote,buyerStatements[f.code])
    assert.equal(f.sourceUrl,officialSite)
    assert.equal(f.method,'Featherless')
  }
  const instruction=JSON.parse(calls[0].options.body).messages[0].content
  for(const id of Object.keys(buyerStatements))assert.ok(instruction.includes(id))
})

test('focus changes the actual single Apify search while preserving the cap and independently extracted facts',async t=>{
  const calls=respond(t,[buyerPage([buyerStatements.cnc_addition,buyerStatements.loading_bottleneck].join('\n'))])
  const result=await discover({APIFY_TOKEN:'unit-test'},'Deutschland',5,'loading_bottleneck')
  assert.equal(result.focus,'loading_bottleneck')
  assert.match(result.searchQuery,/Engpass/)
  assert.equal(JSON.parse(calls[0].options.body).query,result.searchQuery)
  assert.deepEqual(result.providerUsage,{ceilingUsd:0.05,reportedUsd:null,provider:'Apify',starts:1,requestedPages:5})
  assert.ok(result.candidates[0].facts.some(f=>f.code==='cnc_addition'))
  assert.equal(calls.filter(c=>c.options.method==='POST').length,1)
})

const tedUrl='https://ted.europa.eu/en/notice/-/detail/12345-2026'
function tedPage(change='') {
  const notice=[
    'Contract notice – competition','1. Buyer','1.1. Buyer','Official name: Beispielwerk GmbH','2. Procedure',
    'Title: Request for quotations for automated machine loading of our CNC lathes.',
    'Description: We are requesting quotations for a robotic machine loading system for our CNC lathes.',
    '5.1. Lot LOT-0001','Place of performance: Berlin, Germany','Deadline for receipt of tenders: 14/04/2099 12:00:00 (UTC+2)',
    '8. Organisations','8.1. ORG-0001','Official name: Beispielwerk GmbH','Internet address: https://beispielwerk.de','Roles of this organisation: Buyer',
    '8.1. ORG-0002','Official name: Separate Vendor','Internet address: https://other-work.de','Roles of this organisation: Review organisation',
    'Publication date: 10/10/2026'
  ].join('\n')
  const text=change ? change(notice):notice
  return {metadata:{url:tedUrl,title:'Competition – CNC machine loading'}, text}
}

test('TED single-lot procurement identifies the contracting buyer from one authority block and requires an open deadline',()=>{
  const rows=[tedPage(),tedPage(t=>t.replace('2099','2021')),tedPage(t=>t.replace('https://beispielwerk.de','https://portal.evergabe.de')),
    tedPage(t=>t.replace('5.1. Lot LOT-0001','5.1. Lot LOT-0001\n5.1. Lot LOT-0002')),tedPage(t=>t.replace('Contract notice – competition','Contract award notice'))]
  const r=inspectDiscoveryResults(rows,5,'loading_rfq')
  assert.equal(r.candidates.length,1)
  const c=r.candidates[0]
  assert.equal(c.domain,'beispielwerk.de')
  assert.equal(c.sourceClass,'official_procurement')
  assert.equal(c.date,'2026-10-10')
  assert.equal(c.deadline,'2099-04-14T12:00:00+02:00')
  assert.equal(c.procurementStatus,'open')
  assert.equal(c.ownership.buyerName,'Beispielwerk GmbH')
  assert.ok(c.sourceText.includes(c.ownership.websiteQuote))
  assert.ok(c.facts.find(f=>f.code==='loading_rfq'))
  assert.equal(r.decisions.filter(d=>d.outcome==='skipped').length,4)
})

test('dates require publisher metadata, an explicit article header, or a visible date corroborated by the URL month',()=>{
  const title='Mehr Kapazität in unserer Fräserei'
  const make=(path,header,tail='')=>({metadata:{url:'https://beispielwerk.de/'+path,title:title+' | Beispielwerk GmbH'},
    text:[title,header,...text.split('\n'),'Footer','Verwandte Artikel',tail].join('\n')})
  const rows=[make('unternehmen/presse/meldung','Veröffentlicht am 8. Oktober 2026'),make('2026/07/fraeserei','2. Juli 2026'),
    make('2026/07/andere','July 2, 2025'),make('news/','Published on 7 July 2026'),make('aktuelles/meldung','', 'Veröffentlicht am 09.11.2026')]
  const result=inspectDiscoveryResults(rows)
  assert.deepEqual(result.candidates.map(c=>c.date),['2026-10-08','2026-07-02','','',''])
  assert.match(result.candidates[0].dateQuote,/8\. Oktober/)
})

test('explicit source and quoted searches retain the exact user query with a focus',async t=>{
  const calls=respond(t,[row])
  const query='site:kochmaschinenbau.de "Hermle C250"'
  const result=await discover({APIFY_TOKEN:'unit-test'},query,5,'cnc_addition')
  assert.equal(result.searchQuery,query)
  assert.equal(JSON.parse(calls[0].options.body).query,query)
  assert.ok(result.candidates[0].facts.some(f=>f.code==='cnc_addition'))
})

test('dedicated press detail dates must immediately follow the exact article heading',()=>{
  const heading='Neue CNC-Maschine für unsere Produktion'
  const make=(path,lines)=>({metadata:{title:heading+' | Beispielwerk',url:'https://beispielwerk.de/'+path},text:[heading,...lines,text].join('\n')})
  const r=inspectDiscoveryResults([make('news/detailseite/unsere-produktion',['08.10.2026']),
    make('news/detailseite/andere',['Verwandte Artikel','08.10.2026'])])
  assert.deepEqual(r.candidates.map(c=>c.date),['2026-10-08',''])
})

test('captured page text wins over an invented summary or supplied claim, even if echoed by the model',async t=>{
  const fake=buyerStatements.budget_approved
  const literal='Unser Maschinenpark umfasst mehrere CNC-Drehmaschinen.'
  respond(t,{choices:[{message:{content:JSON.stringify({facts:[{code:'budget_approved',quote:fake}]})}}]})
  const r=await analyze({FEATHERLESS_API_KEY:'unit-test'},{domain:'beispielwerk.de',sourceUrl:source,quote:fake,sourceText:literal,
    facts:[{code:'budget_approved',quote:fake}]})
  assert.ok(!r.facts.some(f=>f.code==='budget_approved'))
})

test('research search focuses produce separate source-backed operating evidence and reject unlinked ATS listings',async t=>{
  const jobUrl='https://beispielwerk.de/karriere/cnc-maschinenbediener'
  const heading='CNC-Maschinenbediener (m/w/d) | Beispielwerk'
  const job=buyerPage('Unser Standort liegt in Bayern.\nBeladen und Entladen der Maschinen\nDauernachtschicht', {title:heading,url:jobUrl})
  const platform=buyerPage(job.text,{title:heading,url:'https://beispielwerk.jobs.personio.de/job/12345'})
  const calls=[]
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    const endpoint=new URL(url)
    calls.push({url:endpoint,options})
    if(options.method==='POST'){
      const google=endpoint.pathname.includes('google-search-scraper')
      return Response.json({data:{id:google?'searchRun':'crawlRun',defaultDatasetId:google?'searchData':'crawlData',status:'SUCCEEDED'}})
    }
    if(endpoint.pathname.includes('searchData'))return Response.json([{url:'https://apify.com/pricing?fpr=ig',title:'Upgrade'},{url:jobUrl,title:heading,position:1},{url:platform.metadata.url,title:heading,position:2}])
    return Response.json([{...job,url:jobUrl,crawl:{loadedUrl:jobUrl}}])
  })
  const r=await discover({APIFY_TOKEN:'unit-test'},'Bayern',5,'manual_cnc_duties')
  assert.equal(calls.filter(c=>c.options.method==='POST').length,2)
  assert.equal(r.stages[0].excludedDuringSelection,1)
  assert.equal(r.stages[0].organicResults,2)
  assert.equal(r.stages[0].rawResultRows,3)
  assert.equal(inspectDiscoveryResults([platform]).decisions[0].outcome,'skipped')
  assert.equal(calls[0].url.searchParams.get('maxTotalChargeUsd'),'0.01')
  assert.equal(calls[2].url.searchParams.get('maxTotalChargeUsd'),'0.04')
  const lookup=JSON.parse(calls[0].options.body)
  const crawl=JSON.parse(calls[2].options.body)
  assert.equal(lookup.country,'de')
  assert.equal(lookup.language,'de')
  assert.equal(lookup.query,'Bayern')
  assert.equal(lookup.maxItems,10)
  assert.deepEqual(crawl.proxyConfiguration,{useApifyProxy:true})
  assert.equal(crawl.maxCrawlDepth,0)
  assert.deepEqual(crawl.startUrls,[{url:jobUrl}])
  assert.equal(r.stages[1].returnedPages,1)
  assert.equal(r.candidates.length,1)
  for(const id of ['manual_cnc_duties','cnc_shift_pattern']){
    const f=r.candidates[0].facts.find(x=>x.code===id)
    assert.ok(f)
    assert.equal(f.sourceUrl,jobUrl)
    assert.ok(r.candidates[0].sourceText.includes(f.quote))
  }
  assert.ok(!r.candidates[0].facts.some(f=>['loading_bottleneck','automation_owner_job','explicit_interest'].includes(f.code)))
})

test('natural research evidence on an empty-focus run includes a numeric operating range and an owned robot interface',()=>{
  const page=buyerPage('In unserer CNC-Fertigung bearbeiten wir typische Losgrößen von 5 bis 200 Stück.\nFür unsere CNC-Drehmaschine haben wir eine Roboterschnittstelle für die spätere Beladung bestellt.')
  const r=inspectDiscoveryResults([page],5,'','2026-11-09')
  const ids=r.candidates[0].facts.map(f=>f.code)
  assert.ok(ids.includes('quantified_batch_size'))
  assert.ok(ids.includes('automation_interface'))
  assert.ok(!ids.includes('series_contract') && !ids.includes('loading_rfq'))
})

test('German index snippets never establish facts when the original page is missing or redirects to another domain',async t=>{
  const hits=[{url:source,snippet:text},{url:'https://maschinenbetrieb.de/jobs/cnc',snippet:text}]
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    const endpoint=new URL(url)
    if(options.method==='POST') {
      const localized=endpoint.pathname.includes('igolaizola~google-search-scraper-ppe')
      return Response.json({data:{id:localized?'googleRun':'sourceRun',defaultDatasetId:localized?'googleData':'sourceData',status:'SUCCEEDED'}})
    }
    if(endpoint.pathname.includes('googleData'))return Response.json(hits)
    return Response.json([{url:source,crawl:{loadedUrl:'https://anderen-betrieb.de/unsere-projekte'},
      metadata:{title:row.metadata.title},text}])
  })
  const output=await discover({APIFY_TOKEN:'unit-test'},'manuelle CNC Beladung',5,'manual_cnc_duties')
  assert.equal(output.candidates.length,0)
  assert.equal(output.stages[1].missingPages,1)
  assert.equal(output.partial,true)
  assert.match(output.decisions[0].reason,/different domains/)
})

test('if a scoped crawler rejects a request, the successful search and unknown spend remain explicit',async t=>{
  let count=0
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    const endpoint=new URL(url)
    if(options.method==='POST'){
      count++
      if(count===2) return new Response('private error payload',{status:400})
      return Response.json({data:{id:'searchRun',defaultDatasetId:'searchData',status:'SUCCEEDED',usageTotalUsd:0.004}})
    }
    return Response.json([{url:source,title:'Example',snippet:text}])
  })
  const output=await discover({APIFY_TOKEN:'unit-test'},'Losgrößen CNC Werkzeuge',5,'quantified_batch_size')
  assert.deepEqual(output.stages.map(s=>s.status),['SUCCEEDED','FAILED'])
  assert.equal(output.stages[0].reportedUsd,0.004)
  assert.equal(output.providerUsage.reportedUsd,null)
  assert.equal(output.pagesReviewed,0)
  assert.equal(output.candidates.length,0)
  assert.match(output.warnings[0],/HTTP 400/)
  assert.doesNotMatch(output.warnings[0],/private error/)
})

test('job board, agency, and unknown publisher mirroring an identified employer cannot become an operator account',()=>{
  const template='JOB AG Personal GmbH in Würzburg sucht ab sofort eine/n CNC-Maschinenbediener.\nBe- und Entladen von Fertigungsmaschinen.\nWir arbeiten im 3-Schichtbetrieb.'
  const make=(domain,title,body)=>({metadata:{url:'https://'+domain+'/jobs/cnc-maschinenbediener',title},text:body})
  const rows=[
    make('jobleads.com','CNC-Maschinenbediener (m/w/d) | Bayern | JobLeads.com',template),
    make('talent.com','CNC-Maschinenbediener (m/w/d) | Talent',template),
    make('de.bebee.com','CNC-Maschinenbediener (m/w/d) | beBee',template),
    make('foranda.de','CNC-Maschinenbediener (m/w/d) | Foranda',template),
    make('jobs.unbekannt.de','CNC-Maschinenbediener (m/w/d) | Unbekannt','Arbeitgeber: Fremdwerk GmbH\nWir fertigen CNC-Drehteile in unserer Produktion.\nBeladen und Entladen der Maschinen.'),
    make('beispielwerk.de','CNC-Maschinenbediener (m/w/d) | Beispielwerk','Die Beispielwerk GmbH sucht zur Verstärkung einen CNC-Maschinenbediener.\nUnser Betrieb fertigt CNC-Drehteile.\nBeladen und Entladen der Maschinen.'),
    make('staffing-center.de','CNC-Maschinenbediener (m/w/d) | Staffing Center',template)]
  const r=inspectDiscoveryResults(rows,12,'manual_cnc_duties','2026-11-09')
  assert.deepEqual(r.candidates.map(c=>c.domain), ['beispielwerk.de'])
  assert.match(r.decisions[4].reason,/different hiring company/)
  assert.match(r.decisions[6].reason,/intermediary/)
})

test('brokers, supplier case studies and third-party copies of a named employer never become the operating account',()=>{
  const make=(url,title,text)=>({metadata:{url,title},text})
  const evidence='Unser Maschinenpark umfasst mehrere CNC-Drehmaschinen.'
  const cases=[
    make('https://strobel-industry.de/mittelserien/','Mittelserien | Strobel Industry',evidence+' Mittelserien von 500 bis 5.000 Stück: Wir prüfen Ihre Zeichnung und vermitteln sie an geprüfte Partnerbetriebe mit Stangenlader.'),
    make('https://mafu-sherpa.com/de/casestudy/mehr-spindelstunden/','14 Stunden mehr Spindelzeit bei SCHÖBEL | MAFU-SHERPA',evidence+' Deshalb haben wir gerade in eine neue CNC-Fräsmaschine investiert.'),
    make('https://talents.studysmarter.de/unternehmen/schnaidt/','CNC-Fräser bei Schnaidt | StudySmarter','Die Schnaidt GmbH sucht einen CNC-Fräser. Wir fertigen CNC-Drehteile. Beladen und Entladen der Maschinen im 3-Schichtbetrieb.'),
    buyerPage('Unsere Losgrößen liegen bei 50 bis 200 Stück. Wir fertigen die Drehteile im eigenen Werk. Für die Oberflächenveredelung arbeiten wir mit Partnerbetrieben.') ]
  const output=inspectDiscoveryResults(cases,5,'quantified_batch_size','2026-11-09')
  assert.deepEqual(output.decisions.map(r=>r.outcome),['skipped','skipped','skipped','kept'])
  assert.match(output.decisions[0].reason,/broker/)
  assert.match(output.decisions[1].reason,/Third-party/)
})

test('company-run job subdomain links the source vacancy to the named operator account',()=>{
  const url='https://job.beispielwerk.de/jobposting/8aa7'
  const title='CNC-Fräser (m/w/d) in der Dauernachtschicht | Beispielwerk Maschinenbau GmbH | 374'
  const page={metadata:{title,url},text:[title,'Stellenbeschreibung','Bereitschaft zur Arbeit in der Dauernachtschicht','Beispielwerk Maschinenbau GmbH'].join('\n')}
  const report=inspectDiscoveryResults([page],5,'cnc_shift_pattern','2026-11-09')
  assert.equal(report.candidates[0].domain,'beispielwerk.de')
  assert.equal(report.candidates[0].sourceUrl,url)
  assert.ok(report.candidates[0].facts.find(f=>f.code==='cnc_shift_pattern'))
})

test('discovery retains an explicit city without promoting it to verified DACH evidence',()=>{
  const url='https://www.sacs.aero/portfolio-items/cnc-fraeser'
  const title='CNC-Fräser (m/w/d) für die Dauernachtschicht | SACS Aerospace'
  const locality='Zur Erweiterung unseres Teams suchen wir für den Standort in Empfingen einen CNC-Fräser (m/w/d) für die Dauernachtschicht.'
  const row={metadata:{url,title},text:[title,locality,'Wir bieten Dir einen Arbeitsplatz in unserer Fertigung.'].join('\n')}
  const result=inspectDiscoveryResults([row],5,'cnc_shift_pattern','2026-11-09')
  assert.equal(result.candidates.length,1)
  const candidate=result.candidates[0]
  assert.equal(candidate.site,'Empfingen')
  assert.ok(candidate.sourceText.includes(locality))
  assert.ok(candidate.facts.some(f=>f.code==='cnc_shift_pattern'))
  assert.ok(!candidate.facts.some(f=>f.code==='dach'))
})

test('robot supplier marketing requires independent evidence of the operator process',()=>{
  const url='https://robot-supplier.example/produkte/cnc-beladung'
  const text='Mit unserem Beladeroboter automatisieren Sie Ihre CNC-Maschinen. Wir bieten Ihnen eine passende Roboterlösung für die Fertigung.'
  const result=inspectDiscoveryResults([{metadata:{url,title:'CNC Beladung | Robot Supplier'},text}],5)
  assert.equal(result.candidates.length,0)
  assert.equal(result.decisions[0].outcome,'skipped')
})
