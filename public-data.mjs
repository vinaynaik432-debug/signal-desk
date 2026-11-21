import { evaluate, SEGMENTS } from './domain.mjs';
import { BUYING_SIGNALS, assessBuyingSignals } from './buying-signals.mjs';
import { RESEARCH_TRIGGERS, researchTriggersFor } from './research-triggers.mjs';
import { accountIn, runIn, segmentIn } from './locale.mjs';

// These dates describe the recorded research and this reproducible assessment.
// Building the public demo never claims to have retrieved a page again.
export const PUBLIC_CAPTURED_AT = '2026-11-09';
export const PUBLIC_ASSESSED_AT = '2026-11-20';
const email = /[\w.+%-]+@[\w.-]+\.[a-z]{2,}/i;
const secret = /(?:authorization\s*[:=]|bearer\s+\S+|(?:set-)?cookie\s*[:=]|(?:api[_ -]?(?:key|token)|password|secret)\s*[:=]|apify_api_[\w-]{12,}|gh[pousr]_[\w]{20,}|github_pat_[\w]{20,}|-----BEGIN .*PRIVATE KEY)/i;
const phone = /(?:tel(?:ephone)?|telefon|mobile|mobil|fax)\s*[:.]?\s*\+?\d[\d\s()/.-]{5,}/i;
const normal = value => String(value || '').normalize('NFKC').replace(/\s+/g,' ').trim();
const fields = (record,names) => Object.fromEntries(names.filter(name=>record[name] !== undefined).map(name=>[name,record[name]]));

export function publicText(value, excludedNames = []) {
  if (typeof value !== 'string') return value;
  if (email.test(value) || secret.test(value) || phone.test(value) || excludedNames.some(name=>name && value.toLowerCase().includes(name.toLowerCase()))) return '';
  return value;
}

export function publicURL(value) {
  try {
    const url = new URL(value);
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password || email.test(value)) return '';
    if ([...url.searchParams.keys()].some(key=>/token|secret|password|api.?key|auth|cookie|session/i.test(key))) return '';
    return value;
  } catch { return ''; }
}

function safeFields(record,names,excludedNames=[]) {
  const out={};
  for(const [key,value] of Object.entries(fields(record,names))) {
    if(value === null || typeof value === 'boolean' || typeof value === 'number') out[key]=value;
    else if(typeof value === 'string') {
      const safe=/(?:url|source)$/i.test(key) && /^https?:/.test(value) ? publicURL(value) : publicText(value,excludedNames);
      if(safe || value === '')out[key]=safe;
    }
  }
  return out;
}

export function publicStages(stages) {
  if(typeof stages==='string') {try{stages=JSON.parse(stages);}catch{return [];}}
  return (Array.isArray(stages)?stages:[]).map(stage=>({
    ...safeFields(stage,['stage','status']),
    ...Object.fromEntries(['requestedResults','rawResultRows','organicResults','originalUrlsSelected','excludedDuringSelection','urlCount','returnedPages','missingPages']
      .filter(key=>Number.isInteger(stage[key]) && stage[key]>=0).map(key=>[key,stage[key]]))
  }));
}

export function sanitizeSource(source, account, excludedNames=[]) {
  const out=safeFields(source,['id','name','domain','site','project','title','sourceUrl','quote','date','observedAt','origin','alsoDiscovered','draftOpening',
    'sourceAvailability','sourceCheckedAt','sourceHttpStatus','sourceClass','procurementStatus','deadline','dateSource','dateQuote','deadlineQuote','noticeType','noticeTypeQuote','analysisVersion'],excludedNames);
  if(!publicURL(out.sourceUrl))throw new Error('Public evidence requires a public source URL.');
  out.id=out.sourceUrl;
  out.facts=(source.facts || []).map(f=>safeFields(f,['code','quote','contextQuote','sourceUrl','method'],excludedNames)).filter(f=>f.code && f.quote);
  if(source.ownership)out.ownership=safeFields(source.ownership,['buyerName','buyerDomain','quote','websiteQuote','roleQuote','sourceUrl'],excludedNames);
  const excerpts=[];
  const add=value=>{const text=publicText(value,excludedNames);if(typeof text==='string' && text.trim() && !excerpts.includes(text.trim()))excerpts.push(text.trim());};
  const raw=normal(source.sourceText);
  const belongsHere=f=>!f.sourceUrl || f.sourceUrl===source.sourceUrl;
  const literal=value=>!raw || raw.includes(normal(value));
  // Another page's address or technical description must not become evidence
  // captured on this page. Preserve its separate fact URL instead.
  for(const value of [source.title,source.quote,source.dateQuote,source.deadlineQuote,source.noticeTypeQuote])if(value && literal(value))add(value);
  for(const fact of out.facts)if(belongsHere(fact))for(const value of [fact.quote,fact.contextQuote])if(value && literal(value))add(value);
  // Preserve accepted statements and the exact nearby CNC heading that made
  // an observation admissible, rather than retaining the retrieved page body.
  for(const row of assessBuyingSignals(account,source,PUBLIC_ASSESSED_AT))for(const proof of row.evidence)add(proof.quote);
  for(const proof of researchTriggersFor(account,source,PUBLIC_ASSESSED_AT)){add(proof.contextQuote);add(proof.quote);}
  for(const value of Object.entries(out.ownership || {}).filter(([key])=>/quote$/i.test(key)).map(([,value])=>value))if(literal(value))add(value);
  // Preserve the original ordering of retained excerpts. A later fact must not
  // displace the actual first qualifying statement or change its nearby heading.
  excerpts.sort((a,b)=>{
    const ai=raw.indexOf(normal(a)),bi=raw.indexOf(normal(b));
    return (ai<0?Infinity:ai)-(bi<0?Infinity:bi) || b.length-a.length;
  });
  out.sourceText=excerpts.join('\n');
  out.sourceTextKind='accepted evidence excerpts';
  if(source.apifyCapture && source.apifyCapture.sourceUrl===source.sourceUrl)out.apifyCapture=sanitizeSource(source.apifyCapture,account,excludedNames);
  return out;
}

export function sanitizeArchive(input) {
  const excludedNames=[...new Set((input.contacts || []).flatMap(row=>{
    const p=typeof row.payload==='string'?JSON.parse(row.payload):row.payload;
    return [p?.name,...Object.values(p?.byProvider || {}).map(v=>v.name)].filter(Boolean);
  }))];
  const accounts=input.accounts.map(a=>safeFields(a,['id','name','site','first_seen'],excludedNames));
  const owners=new Map(accounts.map(a=>[a.id,{...a,domain:a.id}]));
  const signals=input.signals.map(row=>{
    const payload=sanitizeSource(row.payload,owners.get(row.account_id),excludedNames);
    return {account_id:row.account_id,source_url:publicURL(row.source_url),event_key:JSON.stringify([payload.site,payload.project,payload.date,payload.title,payload.quote]),origin:row.origin,payload};
  });
  const runMap=new Map();
  const runs=(input.runs || []).filter(r=>/^Discover · /.test(r.query) && publicText(r.query,excludedNames)).map((r,index)=>{
    const id='public-run-'+String(index+1).padStart(3,'0');runMap.set(r.id,id);
    return {...safeFields(r,['query','status','message','created','finished'],excludedNames),id,action_key:'public:'+id};
  });
  const run_pages=(input.run_pages || []).filter(row=>runMap.has(row.run_id)).map(row=>({
    ...safeFields(row,['query','created','search_query','focus'],excludedNames),run_id:runMap.get(row.run_id),
    decisions:(row.decisions || []).map(d=>({
      ...safeFields(d,['title','sourceUrl','domain','outcome','reason','accountId','accountState'],excludedNames),
      ...(/^Directory, publisher, intermediary or .+-owned site\.$/.test(d.reason || '')?{reason:'Directory, publisher, intermediary or equipment supplier.'}:{}),
      ...(Array.isArray(d.signalIds)?{signalIds:d.signalIds.filter(id=>BUYING_SIGNALS.some(s=>s.id===id))}:{}),
      ...(Array.isArray(d.researchTriggerIds)?{researchTriggerIds:d.researchTriggerIds.filter(id=>RESEARCH_TRIGGERS.some(s=>s.id===id))}:{})
    })).filter(d=>!d.sourceUrl || publicURL(d.sourceUrl)),
    provider_stages:row.provider_stages ? publicStages(row.provider_stages) : null
  }));
  return {metadata:{publicDemo:true,capturedAt:PUBLIC_CAPTURED_AT,assessedAt:PUBLIC_ASSESSED_AT,sourceText:'Accepted evidence excerpts only. Full retrieved pages and contact records are excluded.'},
    legacyFingerprints:input.legacyFingerprints || [],accounts,signals,contacts:[],runs,run_pages,legacyAccounts:input.legacyAccounts || []};
}

export function assertPublicArchive(archive) {
  if(archive.metadata?.publicDemo!==true || archive.contacts?.length)throw new Error('The public build requires a contact-free reviewed archive.');
  function inspect(value) {
    if(typeof value==='string' && (email.test(value) || secret.test(value) || phone.test(value)))throw new Error('Private data is not allowed in the public evidence archive.');
    if(Array.isArray(value))value.forEach(inspect);
    else if(value && typeof value==='object')for(const [key,item] of Object.entries(value)) {
      if(/^(email|phone|mobile|cookie|cookies|authorization|credentials|apiKey|apiToken|byProvider|draftByContact)$/i.test(key))throw new Error('Private fields are not allowed in the public evidence archive.');
      inspect(item);
    }
  }
  inspect(archive);
  for(const row of archive.signals)for(const source of [row.payload,row.payload.apifyCapture].filter(Boolean)) {
    if(source.sourceTextKind!=='accepted evidence excerpts')throw new Error('Public source text must consist of accepted evidence excerpts.');
    if(!publicURL(source.sourceUrl))throw new Error('Public evidence requires a public source URL.');
  }
}

export function publicState(archive,lang='en') {
  const accounts=archive.accounts.map(company=>{
    const account={...company,domain:company.id,review:'',contacts:[],signals:archive.signals.filter(s=>s.account_id===company.id).map(s=>({...s.payload,citations:[{sourceUrl:s.payload.sourceUrl,title:s.payload.title,date:s.payload.date}]}))};
    const profiles=new Map();
    for(const signal of account.signals)for(const source of [signal,signal.apifyCapture].filter(Boolean))for(const proof of researchTriggersFor(account,source,PUBLIC_ASSESSED_AT)){
      const {id,label,labelDe,description,descriptionDe,...evidence}=proof;
      if(!profiles.has(id))profiles.set(id,{id,label,labelDe,description,descriptionDe,points:0,evidence:[]});
      const row=profiles.get(id);
      if(!row.evidence.some(e=>e.quote===evidence.quote && e.sourceUrl===evidence.sourceUrl && e.origin===evidence.origin))row.evidence.push(evidence);
    }
    return accountIn({...account,...evaluate(account,null,PUBLIC_ASSESSED_AT),researchTriggers:[...profiles.values()]},lang);
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name,'en'));
  const runs=archive.runs.map(run=>{
    const pages=archive.run_pages.find(r=>r.run_id===run.id);
    return runIn({...run,decisions:pages?.decisions || [],searchQuery:pages?.search_query || '',focus:pages?.focus || '',stages:publicStages(pages?.provider_stages)},lang);
  }).sort((a,b)=>b.created.localeCompare(a.created) || b.id.localeCompare(a.id));
  return {accounts,runs,segments:SEGMENTS.map(s=>segmentIn(s,lang)),
    signalCatalog:BUYING_SIGNALS.map(s=>({...s,label:lang==='de'?s.labelDe:s.label,description:lang==='de'?s.descriptionDe:s.description})),
    researchTriggerCatalog:RESEARCH_TRIGGERS.map(s=>({...s,label:lang==='de'?s.labelDe:s.label,description:lang==='de'?s.descriptionDe:s.description})),
    asOf:PUBLIC_ASSESSED_AT,capturedAt:PUBLIC_CAPTURED_AT,assessedAt:PUBLIC_ASSESSED_AT,writable:false,providers:{apify:false,featherless:false,hunter:false}};
}
