import test from 'node:test';
import assert from 'node:assert/strict';
import archive from './audited-dataset.json' with {type:'json'};
import {openDB} from '../local-db.mjs';
import {initialize,readAccounts} from '../repository.mjs';
import {publicFiles} from '../assets.mjs';

function rows(db,sql) {return db.prepare(sql).all().results.map(r=>({...r}));}
function parseColumns(records,columns) {
  return records.map(r=>{const item={...r};for(const k of columns)if(item[k]!=null)item[k]=JSON.parse(item[k]);return item;});
}

test('a fresh local database imports all public audited rows exactly and re-entry does no writes',async()=>{
  const db=openDB(':memory:');
  const batches=[];
  const auditDB={prepare:db.prepare,batch(queries){batches.push(queries.length);return db.batch(queries);}};
  try {
    await initialize(auditDB);
    assert.ok(batches.length<=2);
    assert.ok(Math.max(...batches)<25);
    const count=batches.length;
    await initialize(auditDB);
    assert.equal(batches.length,count);
    assert.equal(Object.hasOwn(publicFiles(),'/server/audited-dataset.json'),false);
    assert.deepEqual(rows(db,'SELECT id,name,site,first_seen FROM accounts ORDER BY id'),archive.accounts);
    assert.deepEqual(parseColumns(rows(db,'SELECT * FROM signals ORDER BY account_id,source_url'),['payload']),archive.signals);
    assert.deepEqual(parseColumns(rows(db,'SELECT * FROM contacts ORDER BY account_id,identity'),['payload']),archive.contacts);
    assert.deepEqual(rows(db,'SELECT * FROM runs ORDER BY created,id'),archive.runs);
    assert.deepEqual(parseColumns(rows(db,`SELECT r.id AS run_id,r.query,r.created,p.decisions,p.search_query,p.focus,p.provider_stages
      FROM run_pages p JOIN runs r ON r.id=p.run_id ORDER BY r.created,r.id`),['decisions','provider_stages']),archive.run_pages);
    assert.equal(rows(db,'PRAGMA foreign_key_check').length,0);
    assert.equal((await readAccounts(db)).length,archive.accounts.length);
  }finally{db.close();}
});

test('legacy replay IDs map to the correct run; review, independently changed evidence and later Hunter data survive',async()=>{
  const db=openDB(':memory:');
  try{
    const company=archive.accounts.find(a=>a.id==='spaleck.de');
    const baseline=archive.signals.find(s=>s.account_id===company.id);
    const recent={...baseline.payload,quote:'A later live site observation.',sourceText:'A different current production project was verified.',origin:'Apify discovery',observedAt:'2026-11-10'};
    db.prepare("INSERT INTO accounts VALUES (?,?,?,'Hold',?)").bind(company.id,company.name,company.site,company.first_seen).run();
    db.prepare('INSERT INTO signals VALUES(?,?,?,?,?)').bind(company.id,baseline.source_url,'host-event',JSON.stringify(recent),recent.origin).run();
    db.prepare('INSERT INTO signals VALUES(?,?,?,?,?)').bind(company.id,'https://spaleck.de/unrelated','independent',JSON.stringify({...recent,id:'other'}),recent.origin).run();
    const newer={name:'Alex Beispiel',role:'Manufacturing lead',provider:'Hunter',email:'new-observation@example.org',verificationDate:'2026-11-10',independentRoleSourceUrl:'https://example.org/role'};
    db.prepare('INSERT INTO contacts VALUES(?,?,?)').bind(company.id,'alex beispiel',JSON.stringify(newer)).run();
    const incoming=archive.run_pages.find(r=>r.query.includes('Hermle C250') && r.created.includes('19:18'));
    const original=archive.runs.find(r=>r.id===incoming.run_id);
    const legacyId='example-koch-nov-2026';
    db.prepare("INSERT INTO runs VALUES(?,?,?,'Completed','legacy message',?,?)").bind(legacyId,'example:koch',incoming.query,incoming.created,original.finished).run();
    db.prepare("INSERT INTO run_pages(run_id,decisions) VALUES(?,'[]')").bind(legacyId).run();
    db.prepare("INSERT INTO runs VALUES('private-host-action','private','User review','Completed','Kept',?,'2026-11-10')").bind('2026-11-10').run();
    db.prepare("INSERT INTO settings VALUES('seed-version-3','1')").run();
    await initialize(db);
    const upgraded=(await readAccounts(db,true)).find(a=>a.id===company.id);
    assert.equal(upgraded.review,'Hold');
    assert.ok(upgraded.signals.some(s=>s.apifyCapture?.sourceText===recent.sourceText && s.origin==='Curated research'));
    assert.ok(upgraded.signals.some(s=>s.id==='other'));
    const person=upgraded.contacts.find(p=>p.name===newer.name);
    assert.equal(person.email,newer.email);assert.equal(person.independentRoleSourceUrl,newer.independentRoleSourceUrl);
    assert.equal(db.prepare('SELECT count(*) n FROM runs WHERE query=? AND created=?').bind(incoming.query,incoming.created).first().n,1);
    assert.deepEqual(JSON.parse(db.prepare('SELECT decisions FROM run_pages WHERE run_id=?').bind(legacyId).first().decisions),incoming.decisions);
    assert.ok(db.prepare("SELECT 1 FROM runs WHERE id='private-host-action'").first());
    assert.equal((await readAccounts(db,true)).length,archive.accounts.length);
    await initialize(db);
    assert.equal(db.prepare('SELECT count(*) n FROM runs').first().n,archive.runs.length+1);
  }finally{db.close();}
});

test('a thrown import never writes a completion marker and can be safely retried',async()=>{
  const db=openDB(':memory:');
  try{
    let calls=0;
    const interrupt={prepare:db.prepare,batch(items){
      if(++calls===2)items.splice(Math.floor(items.length/2),0,db.prepare('INSERT INTO accounts(id) VALUES(null)'));
      return db.batch(items);
    }};
    await assert.rejects(initialize(interrupt));
    assert.equal(db.prepare('SELECT count(*) n FROM accounts').first().n,0);
    assert.equal(db.prepare('SELECT count(*) n FROM settings').first().n,0);
    await initialize(db);assert.equal(db.prepare('SELECT count(*) n FROM accounts').first().n,archive.accounts.length);
  }finally{db.close();}
});
