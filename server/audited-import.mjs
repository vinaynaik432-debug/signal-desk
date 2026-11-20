// The local backend initializes from the same public, contact-free evidence archive.
// Its source text contains accepted excerpts only. Existing local contact records
// and independent research are preserved. The public build never imports this module.
import archive from './audited-dataset.json' with {type:'json'};

// Keep the original marker so opening an existing local database does not replay
// the archive or replace evidence that its owner has already reviewed.
const marker = 'private-audit-2026-11-09-v1';
const notImported = "NOT EXISTS(SELECT 1 FROM settings WHERE id='"+marker+"')";

function stable(value) {
  if(Array.isArray(value))return value.map(stable);
  if(value && typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
  return value;
}

export async function legacyFingerprint(value) {
  // Older first-time demos assigned today's observation date during initialization.
  // All source content, provider output, origin and actual publication date must match.
  const {observedAt,...content}=value;
  const bytes=new TextEncoder().encode(JSON.stringify(stable(content)));
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
}

function contactVersions(payload) {
  return payload.byProvider || {[payload.provider || 'Company source']:payload};
}

function mergeContact(current,incoming) {
  // Retain competing providers independently. A stale import must not revive a
  // superseded mailbox or downgrade a later verification from the same provider.
  const versions={...contactVersions(current)};
  for(const [provider, observation] of Object.entries(contactVersions(incoming))) {
    const local=versions[provider];
    if(!local || (observation.verificationDate && local.verificationDate && observation.verificationDate>local.verificationDate)) {
      versions[provider]=observation;
    }
  }
  return {...current,byProvider:versions};
}

function chooseCapture(current,incoming) {
  if(!current)return incoming;
  if(!incoming)return current;
  if((incoming.observedAt || '') > (current.observedAt || ''))return incoming;
  // On an equal calendar day the host may already have refreshed the source.
  // Only fill a legacy empty citation; retain separately retrieved text.
  if(incoming.observedAt === current.observedAt && !current.sourceText && incoming.sourceText && current.quote===incoming.quote)return incoming;
  return current;
}

async function mergeSource(existing,row,known) {
  const current=JSON.parse(existing.payload), incoming=row.payload;
  if(JSON.stringify(current)===JSON.stringify(incoming))return null;
  let legacy=known.has(await legacyFingerprint(current));
  if(!legacy && current.apifyCapture && existing.origin==='Curated research') {
    // Independent provider captures can sit beside an unchanged historical seed.
    const {apifyCapture,alsoDiscovered,...base}=current;
    legacy=known.has(await legacyFingerprint(base)) || known.has(await legacyFingerprint({...base,alsoDiscovered}));
  }
  const priorDay=current.observedAt || '', incomingDay=incoming.observedAt || '';
  const older=priorDay && incomingDay && priorDay<incomingDay;
  const newer=priorDay && incomingDay && priorDay>incomingDay;
  // A recognized seed has no separately refreshed live page body. A later
  // observed provider record retains precedence, even if its URL is seeded.
  const replace=(legacy && (!newer || !current.sourceText)) || (older && existing.origin===row.origin);
  if(existing.origin==='Curated research' && row.origin==='Apify discovery') {
    const capture=chooseCapture(current.apifyCapture,incoming);
    if(capture===current.apifyCapture)return null;
    return {...existing,payload:{...current,apifyCapture:capture,alsoDiscovered:'Apify'}};
  }
  if(existing.origin==='Apify discovery' && row.origin==='Curated research') {
    // Promote the audited operator citation, retaining an independent host retrieval.
    const capture=legacy ? chooseCapture(incoming.apifyCapture,current) : chooseCapture(current,incoming.apifyCapture);
    return {...row,payload:{...incoming,apifyCapture:capture,alsoDiscovered:'Apify'}};
  }
  const result=replace ? {...incoming} : {...current};
  const capture=chooseCapture(current.apifyCapture,incoming.apifyCapture);
  if(capture) {result.apifyCapture=capture;result.alsoDiscovered='Apify';}
  return JSON.stringify(result)===JSON.stringify(current)?null:{...(replace?row:existing),payload:result};
}

const tableKeys = {
  accounts:['id','name','site','first_seen'],
  signals:['account_id','source_url','event_key','payload','origin'],
  contacts:['account_id','identity','payload'],
  runs:['id','action_key','query','status','message','created','finished'],
  run_pages:['run_id','decisions','search_query','focus','provider_stages']
};

function addBatches(db,list,sql,rows) {
  // Keep each bind below 48 KiB, independent of query text limits on D1. Only one
  // bound parameter is used per statement. All chunks share one atomic D1 batch.
  let chunk=[],size=2;
  const encoder=new TextEncoder();
  const flush=()=>{
    if(chunk.length)list.push(db.prepare(sql).bind(JSON.stringify(chunk)));
    chunk=[];size=2;
  };
  for(const row of rows) {
    const n=encoder.encode(JSON.stringify(row)).length+1;
    if(size+n>48000)flush();
    chunk.push(row);size+=n;
  }
  flush();
}

const src=name=>"json_extract(j.value,'$."+name+"')";

function insertRows(db,list,table,rows,extraCondition='') {
  const columns=tableKeys[table];
  const q='INSERT OR IGNORE INTO '+table+'('+columns.join(',')+') SELECT '+columns.map(src).join(',')+
    ' FROM json_each(?) AS j WHERE '+notImported+extraCondition;
  addBatches(db,list,q,rows);
}

function updateRows(db,list,table,keys,columns,rows,compareColumn) {
  const match=keys.map(k=>'t.'+k+'='+src(k)).join(' AND ');
  addBatches(db,list,'UPDATE '+table+' AS t SET '+columns.map(c=>c+'='+src(c)).join(',')+
    ' FROM json_each(?) AS j WHERE '+notImported+' AND '+match+' AND t.'+compareColumn+" IS "+src('prior'),rows);
}

const sourceKey=row=>JSON.stringify([row.account_id,row.source_url]);
const contactKey=row=>JSON.stringify([row.account_id,row.identity]);

async function importAudited(db) {
  // Consult only known account keys, leaving unrelated private evidence and reviews alone.
  const ids=JSON.stringify(archive.accounts.map(a=>a.id));
  const [liveSources,liveContacts]=await db.batch(['signals','contacts'].map(t=>
    db.prepare('SELECT * FROM '+t+' WHERE account_id IN (SELECT value FROM json_each(?))').bind(ids)));
  const oldSources=new Map(liveSources.results.map(r=>[sourceKey(r),r]));
  const oldContacts=new Map(liveContacts.results.map(r=>[contactKey(r),r]));
  const known=new Set(archive.legacyFingerprints);
  const inserts=[];
  insertRows(db,inserts,'accounts',archive.accounts);
  const accountRepairs=archive.legacyAccounts.map(old=>({
    ...archive.accounts.find(a=>a.id===old.id),oldName:old.name,oldSite:old.site
  }));
  addBatches(db,inserts,'UPDATE accounts AS t SET name='+src('name')+',site='+src('site')+
    ' FROM json_each(?) AS j WHERE '+notImported+' AND t.id='+src('id')+' AND t.name='+src('oldName')+' AND t.site='+src('oldSite'),accountRepairs);
  // Reviews stay local. The audited first sighting may predate creation of a local demo copy.
  addBatches(db,inserts,'UPDATE accounts AS t SET first_seen=min(t.first_seen,'+src('first_seen')+
    ') FROM json_each(?) AS j WHERE '+notImported+' AND t.id='+src('id')+' AND t.first_seen>'+src('first_seen'),archive.accounts);
  insertRows(db,inserts,'signals',archive.signals);
  const sourceUpdates=[];
  for(const row of archive.signals) {
    const old=oldSources.get(sourceKey(row));
    if(!old)continue;
    const result=await mergeSource(old,row,known);
    if(result)sourceUpdates.push({...result,prior:old.payload});
  }
  updateRows(db,inserts,'signals',['account_id','source_url'],['event_key','payload','origin'],sourceUpdates,'payload');
  insertRows(db,inserts,'contacts',archive.contacts);
  const contactUpdates=[];
  for(const row of archive.contacts) {
    const old=oldContacts.get(contactKey(row));
    if(!old || JSON.stringify(row.payload)===old.payload)continue;
    const next=mergeContact(JSON.parse(old.payload),row.payload);
    if(JSON.stringify(next)!==old.payload)contactUpdates.push({...row,payload:next,prior:old.payload});
  }
  updateRows(db,inserts,'contacts',['account_id','identity'],['payload'],contactUpdates,'payload');
  insertRows(db,inserts,'runs',archive.runs,' AND NOT EXISTS(SELECT 1 FROM runs r WHERE r.query='+src('query')+' AND r.created='+src('created')+')');
  // Legacy example IDs differ from the real IDs. Never duplicate an event or
  // associate a trace with a run that merely re-used an identifier.
  const lookup='r.query='+src('query')+' AND r.created='+src('created');
  addBatches(db,inserts,`INSERT INTO run_pages(run_id,decisions,search_query,focus,provider_stages)
    SELECT r.id,${src('decisions')},${src('search_query')},${src('focus')},${src('provider_stages')}
    FROM json_each(?) AS j JOIN runs r ON ${lookup}
    WHERE ${notImported} AND r.status!='Running'
    ON CONFLICT(run_id) DO UPDATE SET decisions=excluded.decisions,search_query=excluded.search_query,
      focus=excluded.focus,provider_stages=excluded.provider_stages
    WHERE run_pages.run_id LIKE 'example-%' OR run_pages.run_id LIKE 'verified:%'
      OR (run_pages.decisions=excluded.decisions AND run_pages.provider_stages IS NULL)`,archive.run_pages);
  // Official example copies can have a placeholder completion message. Only change
  // such pre-seeded copies of the *same* event; independent and running records retain their state.
  addBatches(db,inserts,'UPDATE runs AS r SET action_key='+src('action_key')+',status='+src('status')+
    ',message='+src('message')+',finished='+src('finished')+' FROM json_each(?) AS j WHERE '+notImported+' AND '+lookup+
    " AND (r.id LIKE 'example-%' OR r.id LIKE 'verified:%') AND r.status!='Running'",archive.runs);
  inserts.push(db.prepare('INSERT OR IGNORE INTO settings(id,value) VALUES(?,?)').bind(marker,'1'));
  await db.batch(inserts);
}

export async function ensureAuditedData(db) {
  if(!await db.prepare('SELECT value FROM settings WHERE id=?').bind(marker).first())await importAudited(db);
}
