import { evaluate, SEGMENTS } from './domain.mjs';
import { RESEARCH_TRIGGERS, researchTriggersFor } from './research-triggers.mjs';
import { BUYING_SIGNALS, assessBuyingSignals } from './buying-signals.mjs';
import { messageIn, runIn, accountIn, segmentIn } from './locale.mjs';
import { discover, analyze, contacts } from './providers.mjs';
import { initialize, readAccounts, listRuns, saveCandidates, saveContactList, saveAnalysis, getSource, accountDomain, canonicalURL } from './repository.mjs';
import { snapshot } from './snapshot.mjs';

const json = (value,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function analysisSource(source) {
  return source?.apifyCapture ? {...source.apifyCapture,isApifyCapture:true,origin:'Apify discovery'} : source;
}
const now = () => new Date().toISOString();
const minus = (ms) => new Date(Date.now()-ms).toISOString();
function fail(message,status) { throw Object.assign(new Error(message),{status}); }
function safeError(error) {
  const message=String(error.message || '');
  if (/^(Apify|Featherless|Hunter|A matching company|The company source|Enter a short)/.test(message)) return message.slice(0,250);
  return 'The operation could not finish. Saved evidence is available; try again.';
}
function expiresAfter(ms) { return new Date(Date.now()+ms).toISOString(); }
async function action(db,key,label,ttl,work) {
  const cached=await db.prepare("SELECT message,status FROM runs WHERE action_key=? AND status IN ('Completed','Partial') AND finished>? ORDER BY finished DESC LIMIT 1").bind(key,minus(ttl)).first();
  if(cached) return {message:'Recent result reused. '+cached.message,cached:true,partial:cached.status==='Partial'};
  const id=crypto.randomUUID();
  const reserved=await db.prepare(`INSERT INTO leases(action_key,run_id,expires) VALUES(?,?,?)
    ON CONFLICT(action_key) DO UPDATE SET run_id=excluded.run_id,expires=excluded.expires WHERE leases.expires<=?`).bind(key,id,expiresAfter(16*60000),now()).run();
  if(!reserved.meta.changes) fail('This operation is already running. Refresh the workspace in a moment.',409);
  try {
    const second=await db.prepare("SELECT message,status FROM runs WHERE action_key=? AND status IN ('Completed','Partial') AND finished>? ORDER BY finished DESC LIMIT 1").bind(key,minus(ttl)).first();
    if(second) return {message:'Recent result reused. '+second.message,cached:true,partial:second.status==='Partial'};
    await db.prepare('INSERT INTO runs(id,action_key,query,status,message,created) VALUES(?,?,?,?,?,?)').bind(id,key,label,'Running','Waiting for provider results.',now()).run();
    const update=async message=>db.prepare('UPDATE runs SET message=? WHERE id=?').bind(message,id).run();
    const recordPages=async (decisions,meta={})=>db.prepare('INSERT OR REPLACE INTO run_pages(run_id,decisions,search_query,focus,provider_stages) VALUES(?,?,?,?,?)').bind(id,JSON.stringify(decisions),meta.searchQuery || null,meta.focus || null,JSON.stringify(meta.stages || [])).run();
    const result=await work(update,recordPages);
    await db.prepare('UPDATE runs SET status=?,message=?,finished=? WHERE id=?').bind(result.partial?'Partial':'Completed',result.message,now(),id).run();
    return result;
  } catch(error) {
    await db.prepare("UPDATE runs SET status='Failed',message=?,finished=? WHERE id=?").bind(safeError(error),now(),id).run();
    throw error;
  } finally {
    await db.prepare('DELETE FROM leases WHERE action_key=? AND run_id=?').bind(key,id).run();
  }
}
function selectedSource(account) {
  return account.signals.find(s=>s.sourceUrl===account.sourceUrl) || account.signals[0];
}
async function analyzeOne(env,account,source) {
  const text=source.sourceText || [...new Set([source.quote,...(source.facts || []).filter(f=>!f.sourceUrl || canonicalURL(f.sourceUrl)===canonicalURL(source.sourceUrl)).map(f=>f.quote)].filter(Boolean))].join('\n');
  const analysis=await analyze(env,{...source,name:account.name,domain:account.domain,sourceText:text});
  return saveAnalysis(env.DB,account.id,source,{...analysis,model:analysis.analysisModel});
}
async function pipeline(env,query,pageLimit,focus,update,recordPages) {
  const discovered=await discover(env,query,pageLimit,focus);
  return ingestDiscovery(env,{...discovered,focus},update,recordPages);
}
// A provider run can finish after returning a partial dataset. Preserve the
// completed pages whether supplied on first retrieval or recovered from that run.
export async function ingestDiscovery(env,discovered,update,recordPages) {
  const {candidates,warnings,decisions=[]}=discovered;
  const newAccountIds=new Set();
  const saved=await saveCandidates(env.DB,candidates,newAccountIds);
  const kept=new Map(candidates.map(c=>[canonicalURL(c.sourceUrl),accountDomain(c.domain)]));
  const pages=decisions.map(d=>{
    const accountId=d.outcome==='kept' && d.sourceUrl ? kept.get(canonicalURL(d.sourceUrl)) : null;
    return accountId ? {...d,accountId,accountState:newAccountIds.has(accountId) ? 'new' : 'existing'} : d;
  });
  await recordPages(pages,discovered);
  const summary=saved.accounts+' new account(s), '+saved.signals+' new source(s)'+(saved.updated?', '+saved.updated+' updated source(s)':'')+'.';
  if(!candidates.length) return {message:summary+' '+warnings.join(' '),partial:!!discovered.partial};
  await update(summary+' Checking source evidence with Featherless.');
  let analyzed=0, failures=0, firstFailure='';
  for(const candidate of candidates) {
    const id=accountDomain(candidate.domain);
    const source=analysisSource(await getSource(env.DB,id,candidate.sourceUrl));
    if(!source || source.analysisVersion===2 || source.origin==='Curated research') continue;
    try {if(await analyzeOne(env,{id,name:candidate.name,domain:id},source)) analyzed++;}
    catch(error){failures++; firstFailure ||= safeError(error);}
  }
  const signalIds=new Set();
  for(const page of pages.filter(p=>p.accountId)){
    const source=analysisSource(await getSource(env.DB,page.accountId,page.sourceUrl));
    // Only the bytes received by Apify for this page can establish a discovery match.
    if(!source || source.origin!=='Apify discovery') continue;
    const owner={name:source.name || page.accountId,domain:page.accountId};
    const rows=assessBuyingSignals(owner,source);
    page.signalIds=rows.filter(r=>r.status==='confirmed').map(r=>r.id);
    page.researchTriggerIds=researchTriggersFor(owner,source).filter(r=>r.status!=='historical').map(r=>r.id);
    page.signalIds.forEach(id=>signalIds.add(id));
  }
  await recordPages(pages,discovered);
  const details=[summary,analyzed+' source(s) analyzed.',...warnings];
  if(failures) details.push(failures+' incomplete. '+firstFailure+' Retry from the source in the account.');
  return {message:details.join(' '),partial:failures>0 || !!discovered.partial,pagesReviewed:pages.length,signalIds:[...signalIds]};
}
function draftFor(account,contact,lang,asOf) {
  const evaluated=evaluate(account,contact,asOf);
  return {subject:lang==='de' ? evaluated.subject : evaluated.subjectEn,body:lang==='de' ? evaluated.body : evaluated.bodyEn};
}
export async function state(env,writable=true,lang='en',forExport=false) {
  const [raw,runs] = await Promise.all([readAccounts(env.DB,forExport),listRuns(env.DB)]);
  const asOf=now().slice(0,10);
  const accounts=raw.map(a=>{
    const out=accountIn(a,lang);
    if(forExport) {
      out.draftByContact=Object.fromEntries(a.contacts.map(c=>[c.name,draftFor(a,c,lang,asOf)]));
      out.signals=a.signals.map(({sourceText,apifyCapture,...publicSource})=>publicSource);
    }
    return out;
  });
  const signalCatalog=BUYING_SIGNALS.map(s=>({...s,label:lang==='de'?s.labelDe:s.label,description:lang==='de'?s.descriptionDe:s.description}));
  const researchTriggerCatalog=RESEARCH_TRIGGERS.map(s=>({...s,label:lang==='de'?s.labelDe:s.label,description:lang==='de'?s.descriptionDe:s.description}));
  return {accounts,researchTriggerCatalog,runs:runs.map(r=>runIn(r,lang)),segments:SEGMENTS.map(s=>segmentIn(s,lang)),signalCatalog,writable,lang,
    providers:{apify:!!env.APIFY_API_TOKEN,featherless:!!env.FEATHERLESS_API_KEY,hunter:!!env.HUNTER_API_KEY},model:env.FEATHERLESS_MODEL || 'Qwen/Qwen3-30B-A3B-Instruct-2507',asOf};
}
export async function routes(request,env,assets) {
  const url=new URL(request.url);
  const lang=url.searchParams.get('lang')==='de'?'de':'en';
  const response=(v,status=200)=>json({...v,...(v.message ? {message:messageIn(v.message,lang)} : {}),...(v.error ? {error:messageIn(v.error,lang)} : {})},status);
  try {
    if(!url.pathname.startsWith('/api/')) {
      const path=url.pathname==='/'?'/index.html':url.pathname;
      const file=assets[path];
      if (!file || !['GET','HEAD'].includes(request.method)) return new Response('Not found',{status:404});
      let body = null;
      if (request.method === 'GET') {
        body = file.base64 ? Uint8Array.from(atob(file.content),char => char.charCodeAt(0)) : file.content;
      }
      return new Response(body,{headers:{'Content-Type':file.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'"}});
    }
    const db=env.DB;
    if(!db) fail('The workspace database is unavailable.',503);
    await initialize(db);
    const readOnly=env.READ_ONLY==='1';
    if(request.method==='GET') {
      if(url.pathname==='/api/state') return json(await state(env,!readOnly,lang));
      if(url.pathname==='/api/draft') {
        const a=(await readAccounts(db,true)).find(a=>a.id===url.searchParams.get('id'));
        if(!a) fail('Account not found.',404);
        return json(draftFor(a,a.contacts.find(c=>c.name===url.searchParams.get('contact')),lang));
      }
      if(url.pathname==='/api/export') {
        const [en,de]=await Promise.all([state(env,false,'en',true),state(env,false,'de',true)]);
        return new Response(snapshot(en,assets,de,lang),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Disposition':'attachment; filename="Signal-Desk-Research.html"'}});
      }
      fail('Unknown route.',404);
    }
    if(request.method!=='POST') fail('Method not supported.',405);
    if(readOnly) fail('This is a read-only workspace.',403);
    const origin=request.headers.get('Origin');
    if(origin && origin!==url.origin) fail('This request must originate in the workspace.',403);
    if(!request.headers.get('Content-Type')?.startsWith('application/json')) fail('JSON input is required.',415);
    const text=await request.text();
    if(text.length>3000) fail('Request too large.',413);
    let input;try{input=JSON.parse(text);}catch{fail('Malformed request.',400);}
    if(!input || typeof input!=='object' || Array.isArray(input)) fail('Invalid request.',400);
    if(url.pathname==='/api/discover') {
      const q=String(input.query || '').trim().replace(/\s+/g,' ');
      if(q.length<3 || q.length>260) fail('Enter a search between 3 and 260 characters.',400);
      if(!env.APIFY_API_TOKEN || !env.FEATHERLESS_API_KEY) fail('Discovery requires Apify and Featherless secrets.',503);
      const pageLimit=input.pageLimit ?? 5;
      if(![5,12].includes(pageLimit)) fail('Choose 5 or 12 source pages.',400);
      const focus=String(input.focus || '');
      if(focus && ![...BUYING_SIGNALS,...RESEARCH_TRIGGERS].some(s=>s.id===focus)) fail('Unknown buying signal.',400);
      const key=(RESEARCH_TRIGGERS.some(t=>t.id===focus)?'discover:localized-v1:':'discover:v2:')+(focus?focus+':':'')+(pageLimit===5?'':'12:')+q.toLowerCase();
      return response(await action(db,key,'Discover · '+q,6*3600000,(update,recordPages)=>pipeline(env,q,pageLimit,focus,update,recordPages)));
    }
    const a=(await readAccounts(db,true)).find(a=>a.id===input.id);
    if(!a) fail('Account not found.',404);
    if(url.pathname==='/api/review') {
      if(!['Research','Prioritize','Hold',''].includes(input.status)) fail('Invalid review status.',400);
      await db.prepare('UPDATE accounts SET review=? WHERE id=?').bind(input.status,a.id).run();
      return response({message:'Review saved.'});
    }
    if(url.pathname==='/api/contacts') {
      if(!env.HUNTER_API_KEY) fail('Hunter is not configured.',503);
      return response(await action(db,'contacts:'+a.id,'Hunter · '+a.name,7*86400000,async()=>{
        const rows=(await contacts(env,a.domain)).filter(c=>c.name && c.role);
        await saveContactList(db,a.id,rows);
        return {message:rows.length ? rows.length+' named contact(s) with a reported role saved.' : 'Hunter found no named contact with a relevant reported role for this domain. The target role remains available.'};
      }));
    }
    if(url.pathname==='/api/analyze') {
      if(!env.FEATHERLESS_API_KEY) fail('Featherless is not configured.',503);
      const chosen=input.sourceUrl || selectedSource(a)?.sourceUrl;
      const source=chosen && analysisSource(await getSource(db,a.id,chosen));
      if(!source) fail('No matching saved source to analyze.',422);
      const signature=await crypto.subtle.digest('SHA-256',new TextEncoder().encode([env.FEATHERLESS_MODEL || 'default',source.quote,source.date,source.sourceText].join('\n')));
      const version='buy12-'+Array.from(new Uint8Array(signature)).slice(0,8).map(n=>n.toString(16).padStart(2,'0')).join('');
      return response(await action(db,'analyze:'+a.id+':'+source.id+':'+version,'Featherless · '+a.name,86400000,async()=>{
        if(!await analyzeOne(env,a,source)) return {partial:true,message:'This page changed during analysis. Recheck its latest evidence.'};
        return {message:'Source checked. Only supported observations contribute to the score.'};
      }));
    }
    fail('Unknown action.',404);
  } catch(error) { return response({error:error.status?error.message:safeError(error)},error.status || 502); }
}
