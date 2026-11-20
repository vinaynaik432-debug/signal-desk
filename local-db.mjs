import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

export function openDB(path) {
  const db=new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000');
  const journal=JSON.parse(readFileSync(new URL('./server/schema/meta/_journal.json',import.meta.url),'utf8'));
  let installed=db.prepare('PRAGMA user_version').get().user_version;
  // The original local release installed the first migration before recording versions.
  if(!installed && db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='accounts'").get()) installed=1;
  for(const migration of journal.entries.slice(installed)){
    db.exec('BEGIN IMMEDIATE');
    try{
      db.exec(readFileSync(new URL('./server/schema/'+migration.tag+'.sql',import.meta.url),'utf8'));
      db.exec('PRAGMA user_version='+Number(migration.idx+1));
      db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');throw error;}
  }
  function query(sql,params=[]) {
    const stmt=db.prepare(sql);
    return {
      bind:(...values)=>query(sql,values),
      all:()=>({results:stmt.all(...params)}),
      first:()=>stmt.get(...params) || null,
      run:()=>({meta:{changes:Number(stmt.run(...params).changes)}}),
      execute:()=>stmt.columns().length ? {results:stmt.all(...params)} : {meta:{changes:Number(stmt.run(...params).changes)}}
    };
  }
  return {prepare:query,batch(items){ db.exec('BEGIN IMMEDIATE');try{const results=items.map(i=>i.execute());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}},close:()=>db.close()};
}
