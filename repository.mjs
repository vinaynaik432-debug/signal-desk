import { ensureAuditedData } from './server/audited-import.mjs';
import { researchTriggersFor } from './research-triggers.mjs';
import { evaluate } from './domain.mjs';

export function canonicalURL(input) {
  const u = new URL(input);
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) throw new Error('Invalid source URL.');
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
  u.hash = '';
  for (const key of [...u.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|srsltid$)/i.test(key)) u.searchParams.delete(key);
  }
  u.searchParams.sort();
  u.pathname=u.pathname.replace(/\/+$/, '') || '/';
  return u.href.replace(/\/$/, '');
}
export function accountDomain(input) {
  const u = new URL(input.includes('://') ? input : 'https://' + input);
  const id = u.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(id)) throw new Error('Invalid company domain.');
  const labels=id.split('.');
  // Collapse common editorial channels. A subsidiary with its own host stays distinct.
  while(labels.length >= 3 && /^(www|news|blog|karriere|careers|presse)$/.test(labels[0])) labels.shift();
  return labels.join('.');
}
function normal(s) {
  return (s || '').normalize('NFKC').toLowerCase().trim().replace(/[^\p{L}\d]+/gu, ' ').trim();
}
function contactSQL(db, id, c) {
  if (!c?.name || !c.role) return [];
  const email = String(c.email || '').toLowerCase();
  const identity = normal(c.name);
  const entry = {...c,provider:c.provider || 'Company source'};
  if(email) entry.email=email;
  const sources=JSON.stringify({[entry.provider]:entry});
  return [db.prepare(`INSERT INTO contacts(account_id,identity,payload) VALUES(?,?,?)
    ON CONFLICT(account_id,identity) DO UPDATE SET payload=json_set(contacts.payload,'$.byProvider',
      json_patch(COALESCE(json_extract(contacts.payload,'$.byProvider'),
        json_object(COALESCE(json_extract(contacts.payload,'$.provider'),'Company source'),json(contacts.payload))), json(?)))`)
    .bind(id,identity,JSON.stringify({...entry,byProvider:{[entry.provider]:entry}}),sources)];

}
export function saveContactList(db,id,contacts) {
  const items = contacts.flatMap(c => contactSQL(db,id,c));
  return items.length ? db.batch(items) : Promise.resolve([]);
}
function eventKey(c) {
  // The same headline can recur at the same plant for different machines or in different years.
  return JSON.stringify([normal(c.site),normal(c.project),c.date || '',normal(c.title),normal(c.quote)]);
}
function insertSignal(db,id,c,origin,refresh=false) {
  const url = canonicalURL(c.sourceUrl);
  const signal = {id:url, name:c.name, domain:id, site:c.site || '', title:c.title || c.name,
    sourceUrl:c.sourceUrl, quote:c.quote || '', date:c.date || '', project:c.project || '', draftOpening:c.draftOpening || '',
    observedAt:c.observedAt || new Date().toISOString().slice(0,10), facts:c.facts || [], origin,
    sourceAvailability:c.sourceAvailability || '',sourceCheckedAt:c.sourceCheckedAt || '',sourceHttpStatus:c.sourceHttpStatus || null,sourceClass:c.sourceClass || '',ownership:c.ownership || null,procurementStatus:c.procurementStatus || '',deadline:c.deadline || '',
    dateSource:c.dateSource || '',dateQuote:c.dateQuote || '',deadlineQuote:c.deadlineQuote || '',noticeType:c.noticeType || '',noticeTypeQuote:c.noticeTypeQuote || '',analysisVersion:c.analysisVersion || 0,
    sourceText:String(c.sourceText || '').slice(0,24000), analysis:c.analysis || '', model:c.model || ''};
  // Keep checked seed evidence. A revised live page must be reanalyzed before its
  // previous observations can drive a draft again. An identical replay is free.
  const comparePaths=['sourceText','title','quote','date','sourceClass','deadline','procurementStatus','ownership'];
  const changed=(path)=>comparePaths.map(k=>
    "coalesce(json_extract(signals.payload,'"+path+"."+k+"'),'') != coalesce(json_extract(excluded.payload,'$."+k+"'),'')"
  ).join(' OR ');
  const update=refresh ? `DO UPDATE SET
    payload=CASE WHEN signals.origin='Curated research'
      THEN json_set(signals.payload,'$.apifyCapture',json(excluded.payload),'$.alsoDiscovered','Apify')
      ELSE excluded.payload END,
    event_key=CASE WHEN signals.origin='Curated research' THEN signals.event_key ELSE excluded.event_key END
    WHERE (signals.origin='Apify discovery' AND (${changed('$')}))
       OR (signals.origin='Curated research' AND (json_type(signals.payload,'$.apifyCapture') IS NULL OR ${changed('$.apifyCapture')}))` : 'DO NOTHING';
  return db.prepare(`INSERT INTO signals(account_id,source_url,event_key,payload,origin) VALUES(?,?,?,?,?)
    ON CONFLICT(account_id,source_url) ${update}`).bind(id,url,eventKey(c),JSON.stringify(signal),origin);

}
function newAccount(db,c,origin,refresh=false) {
  const id = accountDomain(c.domain);
  return [db.prepare('INSERT OR IGNORE INTO accounts(id,name,site,first_seen) VALUES(?,?,?,?)').bind(id,c.name || id,c.site || '',new Date().toISOString()),
    ...[c,...(c.signals || [])].filter(s=>s.sourceUrl).map(s=>insertSignal(db,id,{...s,site:s.site || c.site,name:c.name},origin,refresh)),
    ...(c.contacts || []).flatMap(contact=>contactSQL(db,id,contact))];
}
export const initialize=ensureAuditedData;
export async function saveCandidates(db,candidates,newAccountIds=new Set()) {
  if (!candidates.length) return {accounts:0,signals:0};
  const statements=[];
  const offsets=[];
  for(const c of candidates){
    const id=accountDomain(c.domain);
    offsets.push(statements.length);
    statements.push(db.prepare('SELECT 1 FROM signals WHERE account_id=? AND source_url=?').bind(id,canonicalURL(c.sourceUrl)),
      ...newAccount(db,c,'Apify discovery',true));
  }
  const results=await db.batch(statements);
  let accounts=0,signals=0,updated=0;
  for(const [ix,i] of offsets.entries()){
    if(results[i+1].meta.changes) newAccountIds.add(accountDomain(candidates[ix].domain));
    accounts+=Number(results[i+1].meta.changes);
    if(results[i].results.length) updated+=Number(results[i+2].meta.changes);
    else signals+=Number(results[i+2].meta.changes);
  }
  return updated? {accounts,signals,updated} : {accounts,signals};
}
export async function getSource(db,id,url) {
  const row=await db.prepare('SELECT payload FROM signals WHERE account_id=? AND source_url=?').bind(id,canonicalURL(url)).first();
  return row?JSON.parse(row.payload):null;
}
export async function saveAnalysis(db,id,source,enriched) {
  const facts=new Map((enriched.facts || []).map(f=>[f.code,f]));
  if(source.origin==='Curated research') for(const f of source.facts || []) facts.set(f.code,f);
  // Compare the same capture that was analyzed: a checked record may also hold
  // a distinct Apify retrieval whose findings must retain their own provenance.
  const path=source.isApifyCapture ? '$.apifyCapture' : '$';
  const result=await db.prepare(`UPDATE signals SET payload=json_set(payload,'${path}.facts',json(?),'${path}.model',?,'${path}.analysis','Featherless','${path}.analysisVersion',2)
    WHERE account_id=? AND source_url=? AND origin=? AND json_extract(payload,'${path}.quote')=?
    AND coalesce(json_extract(payload,'${path}.date'),'')=? AND coalesce(json_extract(payload,'${path}.sourceText'),'')=?`)
    .bind(JSON.stringify([...facts.values()]),enriched.model || '',id,canonicalURL(source.sourceUrl),
      source.isApifyCapture?'Curated research':source.origin,source.quote,source.date || '',source.sourceText || '').run();
  return !!result.meta.changes;
}
function combinedContact(row) {
  const raw=JSON.parse(row.payload);
  const entries=Object.values(raw.byProvider || {legacy:raw});
  const primary=entries.find(c=>c.provider!=='Hunter') || entries[0];
  const mail=primary.email ? primary : entries.find(c=>c.email);
  const hunter=entries.find(c=>c.provider==='Hunter' && c.email && c.email===mail?.email);
  let emailSourceUrl=mail?.sourceUrl || '';
  try {
    const u=new URL(emailSourceUrl);
    if(/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(u.hostname) && (u.pathname==='/search' || u.searchParams.has('q'))) emailSourceUrl='';
  } catch {emailSourceUrl='';}
  // Hunter Domain Search supplies evidence for an address. A company contact
  // page or a separately checked source is needed to cite the employment role.
  const roleSourceUrl=primary.provider==='Hunter' ? (primary.independentRoleSourceUrl || '') : primary.sourceUrl;
  return {...primary,email:mail?.email || '',roleSourceUrl,independentRoleSourceUrl:roleSourceUrl,emailProvider:mail?.provider || '',
    emailProvenance:mail?.provenance || '',emailSourceUrl,confidence:hunter?.confidence ?? null,verification:hunter?.verification || '',verificationDate:hunter?.verificationDate || ''};
}
export async function readAccounts(db,withText=false) {
  const [companies, sources, people] = await db.batch([
    db.prepare('SELECT * FROM accounts ORDER BY name'),db.prepare('SELECT * FROM signals ORDER BY source_url'),
    db.prepare('SELECT * FROM contacts ORDER BY identity')
  ]);
  const byId = new Map(companies.results.map(a=>[a.id,{...a,domain:a.id,signals:[],contacts:[]}]));
  const grouped = new Map();
  for (const row of sources.results) {
    const a=byId.get(row.account_id); if (!a) continue;
    const signal=JSON.parse(row.payload);
    // A matching headline and opening line do not make the remainder of two pages interchangeable.
    const groupkey=JSON.stringify([a.id,eventKey(signal),signal.facts,signal.sourceText,signal.origin,signal.apifyCapture || null]);
    const same=grouped.get(groupkey);
    if (same) {
      same.citations.push({sourceUrl:signal.sourceUrl,title:signal.title,date:signal.date});
      // Each observation remains attached to its source. A reprint supplies a citation only.
    } else {
      signal.citations=[{sourceUrl:signal.sourceUrl,title:signal.title,date:signal.date}]; grouped.set(groupkey,signal);a.signals.push(signal);
    }
  }
  for(const row of people.results) byId.get(row.account_id)?.contacts.push(combinedContact(row));
  return [...byId.values()].map(a=>{
    const profiles=new Map();
    for(const signal of a.signals){
      for(const capture of [signal,signal.apifyCapture].filter(Boolean)){
        for(const item of researchTriggersFor(a,capture)){
          const {id,label,labelDe,description,descriptionDe,...proof}=item;
          if(!profiles.has(id)) profiles.set(id,{id,label,labelDe,description,descriptionDe,points:0,evidence:[]});
          const row=profiles.get(id);
          if(!row.evidence.some(e=>e.sourceUrl===proof.sourceUrl && e.quote===proof.quote && e.origin===proof.origin)) row.evidence.push(proof);
        }
      }
    }
    const assessed={...a,...evaluate(a),researchTriggers:[...profiles.values()]};
    if(!withText) for(const signal of assessed.signals){delete signal.sourceText;delete signal.apifyCapture;}
    return assessed;
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
}
export async function listRuns(db) {
  const cutoff=new Date().toISOString();
  await db.prepare(`UPDATE runs SET status='Interrupted',message='The run ended before a result was recorded. Previously saved sources are available.',finished=?
    WHERE status='Running' AND NOT EXISTS(SELECT 1 FROM leases WHERE leases.run_id=runs.id AND leases.expires>?)`).bind(cutoff,cutoff).run();
  const {results}=await db.prepare('SELECT r.id,r.query,r.status,r.message,r.created,p.decisions,p.search_query AS searchQuery,p.focus,p.provider_stages AS stages FROM runs r LEFT JOIN run_pages p ON p.run_id=r.id ORDER BY r.created DESC LIMIT 60').all();
  return results.map(r=>({...r,decisions:r.decisions?JSON.parse(r.decisions):[],stages:r.stages?JSON.parse(r.stages):[]}));
}
