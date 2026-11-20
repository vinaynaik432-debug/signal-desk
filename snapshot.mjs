import { evaluate } from './domain.mjs';
import { publicStages } from './public-data.mjs';

function fields(record, names) {
  return Object.fromEntries(names.filter(name => record[name] !== undefined).map(name => [name, record[name]]));
}

function snapshotSignal(signal) {
  return {
    ...fields(signal, ['id','site','project','title','sourceUrl','quote','date','observedAt','origin','alsoDiscovered','analysis','model','sourceAvailability']),
    facts: (signal.facts || []).map(f => fields(f, ['code','quote','contextQuote','sourceUrl','method'])),
    citations: (signal.citations || []).map(c => fields(c, ['title','sourceUrl','date']))
  };
}

function snapshotAccount(account, asOf, lang, publicDemo=false) {
  const contacts = (publicDemo ? [] : account.contacts || []).map(contact => {
    const out = fields(contact,['name','role','provider','roleProvider','type','independentRoleSourceUrl']);
    if ((contact.roleProvider || contact.provider || '').toLowerCase() !== 'hunter') {
      Object.assign(out,fields(contact,['sourceUrl','roleSourceUrl']));
    }
    return out;
  });
  // Public output is role based, even when accidentally passed a named draft.
  if(publicDemo) {
    const roleDraft=evaluate(account,null,asOf);
    account={...account,subject:lang==='de'?roleDraft.subject:roleDraft.subjectEn,body:lang==='de'?roleDraft.body:roleDraft.bodyEn};
  }
  const held = Boolean(account.hold || account.review === 'Hold');
  const draftByContact = Object.fromEntries(contacts.filter(c => c.name).map(contact => {
    if (held) return [contact.name, {subject:'',body:''}];
    if (account.draftByContact?.[contact.name]) return [contact.name, fields(account.draftByContact[contact.name],['subject','body'])];
    const draft = evaluate(account,contact,asOf);
    return [contact.name, {subject:lang === 'en' ? draft.subjectEn ?? draft.subject : draft.subject,body:lang === 'en' ? draft.bodyEn ?? draft.body : draft.body}];
  }));
  return {
    ...fields(account,['id','name','domain','site','project','sourceUrl','score','review','pain','question','role','targetRole','holdReason','asOf']),
    ...(Array.isArray(account.researchTriggers) ? {researchTriggers:account.researchTriggers.map(row => ({
      ...fields(row,['id','label','description','quote','contextQuote','sourceUrl','date','observedAt','site','project','status','origin','method','reason','points']),
      evidence:(row.evidence || []).map(e => fields(e,['quote','contextQuote','sourceUrl','date','observedAt','site','project','origin','method','status','reason']))
    }))} : {}),
    segment: fields(account.segment || {},['id','label']),
    breakdown: (account.breakdown || []).map(row => fields(row,['label','max','points','reason','quote','sourceUrl'])),
    buyingSignals: (account.buyingSignals || []).map(row => ({
      ...fields(row,['id','label','description','status','weight','points','reason']),
      evidence: (row.evidence || []).map(e => fields(e,['quote','sourceUrl','date','observedAt','origin','method','status','project','site','alsoDiscovered','deadline','expires','inScoredScope']))
    })),
    signalResults: (account.signalResults || []).map(r => fields(r,['project','site','sourceUrl','segment','hold','score'])),
    signals: (account.signals || []).map(snapshotSignal),
    contacts, draftByContact, hold: held,
    subject: held ? '' : account.subject || '',
    body: held ? '' : account.body || ''
  };
}

function snapshotState(state,lang,publicDemo=false) {
  return {
    asOf:state.asOf,
    ...fields(state,['capturedAt','assessedAt']),
    accounts:state.accounts.map(account => snapshotAccount(account,state.asOf,lang,publicDemo)),
    segments:state.segments.map(s => fields(s,['id','label','pain','question','subject','role'])),
    ...(Array.isArray(state.researchTriggerCatalog) ? {researchTriggerCatalog:state.researchTriggerCatalog.map(r => fields(r,['id','label','description']))} : {}),
    signalCatalog:(state.signalCatalog || []).map(s => fields(s,['id','label','description','weight'])),
    runs:state.runs.filter(run=>!publicDemo || !/Hunter/i.test(run.query || '')).map(run => ({
      ...fields(run,['id','query','searchQuery','focus','signalIds','status','statusLabel','message','created']),
      stages:publicStages(run.stages),
      decisions:(run.decisions || []).map(d => fields(d,['title','sourceUrl','domain','outcome','outcomeLabel','reason','accountId','accountState','signalIds','researchTriggerIds']))
    })),
    writable:false,
    providers:{apify:false,hunter:false,featherless:false}
  };
}

export function snapshot(stateEn, assets, stateDe = stateEn, initialLang = 'en', options = {}) {
  const data = {
    initialLang:initialLang === 'de' ? 'de' : 'en',
    ...(options.publicDemo ? {publicDemo:true,...fields(options,['capturedAt','assessedAt'])} : {}),
    locales:{en:snapshotState(stateEn,'en',options.publicDemo), de:snapshotState(stateDe,'de',options.publicDemo)}
  };
  const escaped=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const scripts='<script>window.SIGNAL_DESK_SNAPSHOT='+escaped+';</script><script>'+assets['/app.js'].content.replace(/<\/script/gi,'<\\/script')+'</script>';
  return assets['/index.html'].content
    .replace(/<link\b[^>]*href=["'][^"']*style\.css[^"']*["'][^>]*>/i,()=>'<style>'+assets['/style.css'].content+'</style>')
    .replace(/\.\/brand\/[\w.-]+/g,path => {
      const asset=assets[path.slice(1)];
      if(!asset?.base64) throw new Error('Missing embedded brand asset: '+path);
      return 'data:'+asset.type+';base64,'+asset.content;
    })
    .replace('</head>',() => {
      const fontNotices=Object.entries(assets).filter(([path])=>path.endsWith('-LICENSE.txt')).map(([,asset])=>asset.content);
      return '<template id="font-licenses">'+fontNotices.join('\n\n').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</template>\n</head>';
    })
    .replace(/<script\b[^>]*src=["'][^"']*app\.js[^"']*["'][^>]*><\/script>/i,'')
    .replace(/<\/body>/i,()=>scripts+'</body>');
}
