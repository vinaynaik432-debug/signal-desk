// Research observations are independent of the buying score. A vacancy documents
// an assigned task, a capability page documents a production range, and an
// ordered interface documents preparation. None establishes an open purchase.
import {BUYING_SIGNALS, matchBuyingSignal, trustedSignalSource} from './buying-signals.mjs';

export const RESEARCH_TRIGGERS = [
  {
    id:'manual_cnc_duties', label:'Manual CNC loading duties', labelDe:'Manuelle CNC-Beladung',
    description:'The operator lists loading or removing workpieces as a human task in machining.',
    descriptionDe:'Der Betreiber nennt das Einlegen oder Entnehmen von Werkstücken als Aufgabe an einer Bearbeitungsmaschine.'
  },
  {
    id:'cnc_shift_pattern', label:'CNC shift staffing', labelDe:'Schichtbesetzung an CNC-Maschinen',
    description:'A machining role or process calls for multiple shifts or permanent nights.',
    descriptionDe:'Eine Stelle oder ein Bearbeitungsprozess ist für mehrere Schichten oder Dauernachtschicht vorgesehen.'
  },
  {
    id:'quantified_batch_size', label:'Machining lot size in units', labelDe:'Bearbeitungslosgröße in Stück',
    description:'The operator gives a unit count for a production lot, typical batch, or offered batch range.',
    descriptionDe:'Der Betreiber nennt eine Stückzahl für ein Fertigungslos, eine typische Losgröße oder den angebotenen Mengenbereich.'
  },
  {
    id:'automation_interface', label:'Robot interface prepared', labelDe:'Roboterschnittstelle vorbereitet',
    description:'The operator reports ordering or preparing an interface for a future robot at a machining asset.',
    descriptionDe:'Der Betreiber hat für eine Bearbeitungsmaschine die Schnittstelle zu einem künftigen Roboter bestellt oder vorbereitet.'
  }
];

const clean = value => String(value || '').replace(/\s+/g,' ').trim();
const norm = value => clean(value).normalize('NFKC').toLowerCase().replace(/ß/g,'ss').replace(/[‑‐‒–—]/g,'-');
const machining = /\bcnc\b|cnc(?:fräs|dreh)|bearbeitungszentr|werkzeugmaschin|fräsmaschin|drehmaschin|fräszentr|drehzentr|zerspan|cnc[- ]?(?:bedien|operat|mill|machin)|machining cent(?:er|re)|\blathes?\b|milling machine/;
const job = /stellen(?:angebot|anzeige|beschreibung)|stellenprofil|karriere|\/jobs?\/|\/careers?\/|stellenbeschreibung|\bm\W{1,2}(?:w|f)\W{1,2}d\b|job description|wir suchen dich|join our team/;
const human = /(?:von|per) hand|manuell|händisch|manual|by hand|bedienperson|maschinenbedien|mitarbeit|unser team|unsere leute|our (?:staff|operators|employees)/;
const own = /\b(?:wir|unsere[nmrs]?|we|our)\b/;
const external = /unser(?:e[nmrs]?)? kunde (?:hat|haben|betreibt|plant|benötigt)|bei (?:unserem|einem) kunden|für ein kundenunternehmen|arbeitnehmerüberlassung|personalvermittlung|im auftrag (?:unseres|eines) kunden|on behalf of our client|at our customer|customer testimonial|customer case study|anwenderbericht|kundenreferenz/;
const selling = /unsere(?:n)? kunden (?:können|ermöglichen)|for your (?:machine|business)|we offer (?:you|our customers) (?:a |an )?(?:robot|machine tool)|für ihre maschine|kann optional bestellt werden|auf wunsch (?:bestellbar|lieferbar)|optionally available|optional accessory|für sie verfügbar/;
const negative = /\b(?:nicht mehr|kein(?:e[nmr]?)?|never|no longer|not required|does not|do not|formerly|previously|früher|ehemals)\b/;
const installed = /(?:bereits|schon|jetzt) (?:robotergestützt|automatisch|automatisiert)|roboter(?:zelle|beladung|system).{0,36}(?:installiert|in betrieb|übernimmt|belädt|beschickt)|(?:roboter|robot) (?:belädt|beschickt|loads)|already (?:installed|automated|in operation)|robot[- ]tended|automated robot loading|automatic loader installed/;
const listed = /job (?:is )?(?:closed|filled)|stelle (?:ist )?(?:besetzt|vergeben)|ausschreibung beendet|nicht mehr (?:verfügbar|ausgeschrieben)|no longer (?:available|accepting applications)/;
const batch = /losgrö(?:ss|ß)e[n]?|serienlos(?:e)?|st[uü]ckzahl(?:en)?|produktionslos|fertigungslos|\bbatch(?:es| size)?\b|lot sizes?|per (?:batch|lot)|pro (?:los|charge)|serien? (?:von|ab|bis)/;
const countPattern = /\d[\d.,'’\s]*(?:(?:bis(?: zu)?|to|[-…])\s*\d[\d.,'’\s]*)?\s*(?:stk\.?|stück\b|teile\b|units?\b|pieces?\b|parts?\b)/;
const ids = new Set(RESEARCH_TRIGGERS.map(d=>d.id));
const pairs = {
  manual_cnc_duties(q) {
    const paired = /(?:einlegen|einspannen).{0,52}(?:entnehm|abnehm|ausspann|herausnehm)|(?:(?:be[- ]? und )?entladen|be[- ]?und entladung|beladen und entladen|load(?:ing)? and unload(?:ing)?|load\/unload)/.test(q);
    return paired && /maschin|bearbeitungszentr|werkstück|(?:kunststoff|baute|roh|dreh|fertig)teil|\bteile(?:n)?\b|workpiece|machine|parts?\b|\blathes?\b|cnc/.test(q);
  },
  cnc_shift_pattern(q) {
    if (/ohne.{0,18}(?:nacht|schicht)|without.{0,18}(?:night|shift)|mannlos|unbemannt|unattended|lights.out|künftig|beabsichtig|\bwir (?:planen|wollen|möchten)|we (?:want|plan|aim)|perspektivisch|denkbar/.test(q))return false;
    return /(?:dauer|permanent(?:e)?[- ])nachtschicht|nachtschicht(?:betrieb|arbeit)?|(?:zwei|drei|2|3|mehr)[- ]?(?:oder (?:zwei|drei|2|3)[- ]?)?schicht(?:system|betrieb|modell|arbeit|en)?|(?:two|three|second|third|2|3)[- ]shift|permanent night(?: shift)?|night shift/.test(q);
  },
  quantified_batch_size(q) {
    return batch.test(q) && countPattern.test(q) && !/werkzeugspeicher|magazinplatz|palettenspeicher|magazinkapazität|gripper capacity|tool magazine|tool capacity|units per hour|stück pro stunde|ersatzteil.?set|packungsgrösse/.test(q);
  },
  automation_interface(q) {
    const coupling = /robot(?:er|ic)?[- ]?(?:schnittstelle|interface)|schnittstelle.{0,35}(?:roboter|roboterzelle)|interface.{0,25}(?:robot|robotic loader)|vorbereitung.{0,24}(?:roboterbeladung|robot loading)/.test(q);
    return coupling && /bestellt|vorgerüstet|vorbereit(?:et|ung)|ausgestattet|vorgesehen|eingeplant|ausgerüstet|ordered|reserved|prepared|prewired|pre-wired|equipped|specified|fitted/.test(q);
  }
};
export function matchResearchTrigger(id,statement) {
  const q=norm(statement);
  if (!ids.has(id) || q.length<8 || q.length>750 || external.test(q) || selling.test(q) || negative.test(q)) return false;
  return pairs[id](q);
}
function linesOf(text) {
  return String(text || '').split(/\n+|(?<=[.!?])\s+(?=[\p{Lu}])/u)
    .map(clean).filter(s=>s.length>3 && s.length<=750 && !/…$|\.\.\.$/.test(s));
}
function isoDay(value) {
  const match=String(value || '').match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
  if (!match) return null;
  const day=Date.parse(match[1]+'T00:00:00Z');
  return Number.isFinite(day) && new Date(day).toISOString().slice(0,10)===match[1] ? day : null;
}
// A machine-park or services page describes the offering observed at retrieval.
// Announcements, vacancies and procurement still depend on their event dates.
export function usesObservationFreshness(source) {
  let path;
  try { path = decodeURIComponent(new URL(source.sourceUrl).pathname); }
  catch { return false; }
  const title = norm(source.title);
  if (source.sourceClass === 'official_procurement' || job.test(path + ' ' + title) ||
      /\/(?:news|aktuelles|presse|blog|archiv|archive|20\d\d)(?:[\/_-]|$)/i.test(path) ||
      /neuanschaffung|investition|investiert|investment|announcement|kapazitätsausbau|inbetriebnahme|expansion/.test(title) ||
      BUYING_SIGNALS.some(def => matchBuyingSignal(def.id, source.quote))) return false;
  return /\/(?:maschinenpark|leistungen|fertigung|produktion|lohnfertigung|mechanische-bearbeitung|machining|manufacturing|capabilities|production|services|cnc-(?:drehen|fräsen|fraesen|bearbeitung|drehteile|fertigung)|dreherei)(?:[\/_.-]|$)/i.test(path);
}

function chronology(s,asOf,closed) {
  const assessed=isoDay(asOf instanceof Date?asOf.toISOString():asOf);
  const published=isoDay(s.date),observed=isoDay(s.observedAt);
  if(assessed===null || (s.date && published===null) || (published!==null && published>assessed) || (observed!==null && observed>assessed)) return null;
  if(s.sourceAvailability==='unavailable' || closed) return 'historical';
  const observationBasis=usesObservationFreshness(s) && observed!==null;
  const day=observationBasis?observed:published??observed;
  if(day===null) return null;
  if(assessed-day>365*86400000)return 'historical';
  return observationBasis || published===null?'observed':'dated';
}
function sourceItems(s) {
  const curated=s.origin==='Curated research' || !!s.curated;
  const raw=curated?[]:linesOf(s.sourceText);
  const corpus=norm(raw.join(' '));
  const cues=raw.map(q=>({q,method:'source rule'}));
  if(!s.sourceText || curated || corpus.includes(norm(s.quote)))cues.push({q:clean(s.quote),method:curated?'reviewed excerpt':'source rule'});
  if(s.title)cues.push({q:clean(s.title),method:curated?'reviewed excerpt':'source rule'});
  for(const f of s.facts||[]) {
    if(!f?.quote || (f.sourceUrl && f.sourceUrl!==s.sourceUrl))continue;
    const original=raw.find(line=>norm(line).includes(norm(f.quote)));
    if(original)cues.push({q:original,method:ids.has(f.code) && f.method==='Featherless'?'Featherless':'source rule'});
    else if(curated)cues.push({q:clean(f.quote),method:'reviewed excerpt'});
  }
  const unique=new Map();
  for(const item of cues) {
    if(!item.q || item.q.length>750)continue;
    const old=unique.get(norm(item.q));
    if(!old || item.method==='Featherless')unique.set(norm(item.q),item);
  }
  return {items:[...unique.values()],raw};
}

// A locality is useful even when the source does not establish its country.
// Return the original statement so callers can explain that precise gap.
export function sourceLocality(source) {
  for (const {q} of sourceItems(source).items) {
    if (/\b(?:kunden|customer|client|partner|kein|nicht|not|formerly|früher|ehemals)\b/i.test(q)) continue;
    const prefix=/\b(?:standort|firmensitz|hauptsitz|sitz|werk|produktionsstätte|headquarters|production site|site)\s+(?:(?:liegt|befindet sich|ist|is located|is based|is)\s+)?(?:in|im)\s+/i.exec(q);
    if (!prefix) continue;
    const rest=q.slice(prefix.index+prefix[0].length);
    const locality=rest.match(/^[\p{Lu}][\p{L}-]{1,54}(?:\s+[\p{Lu}][\p{L}-]{1,35}){0,3}/u)?.[0];
    if (locality) return {label:locality,quote:q,sourceUrl:source.sourceUrl};
  }
  return null;
}
const heading = /\b(?:m|w|f)\s*[/|\-]\s*(?:w|f|m)\s*[/|\-]\s*d\b|\b(?:maschinenbediener|maschinenführer|cnc[- ]fräser|cnc[- ]dreher|maschinenoperator|machinist|machine operator)\b/;
function processContext(s,item,raw,jobs) {
  if(machining.test(norm(item)))return item;
  if(machining.test(norm(s.title)) && (job.test(norm(s.title)) || !jobs || heading.test(norm(s.title))))return s.title;
  // On job indexes an earlier, unrelated role cannot supply the CNC scope.
  const pos=raw.indexOf(item);
  if(pos<0)return '';
  const prev=raw.slice(Math.max(0,pos-(jobs?3:6)),pos);
  for(const q of prev.reverse()) {
    if(jobs && heading.test(norm(q)))return machining.test(norm(q))?q:'';
    if(!jobs && machining.test(norm(q)))return q;
  }
  return '';
}
function reasonFor(id,q) {
  if(id==='quantified_batch_size') {
    if(/wir fertigen|fertigen wir|wir produzieren|we (?:produce|manufacture|machine)|we have (?:produced|machined)|produzieren wir|tatsächlich gefertigt|gefertigt wurden/.test(q))
      return ['reported production range','The operator describes its manufacturing volumes. A new order is unconfirmed.','Der Betreiber beschreibt Fertigungsmengen. Ein neuer Auftrag ist nicht belegt.'];
    return ['offered or typical range','Advertised or typical lot size. Recurrence and demand remain unverified.','Angebotene oder typische Losgröße. Wiederholung und Nachfrage sind ungeklärt.'];
  }
  if(id==='manual_cnc_duties')return ['handling task','An operating duty is documented. Frequency, idle time and interest are unknown.','Eine Bedienaufgabe ist dokumentiert. Häufigkeit, Stillstand und Interesse sind offen.'];
  if(id==='cnc_shift_pattern')return ['staffing pattern','The CNC role or process describes shift coverage. Machine utilisation remains unknown.','Die CNC-Stelle oder der Prozess nennt Schichtarbeit. Die tatsächliche Auslastung ist offen.'];
  return ['interface preparation','An interface was specified or prepared. Check whether a loader was subsequently installed.','Eine Schnittstelle wurde bestellt oder vorbereitet. Zu prüfen ist, ob inzwischen ein Lader installiert wurde.'];
}
export function researchTriggersFor(account,source,asOf=new Date()) {
  // Research profiles are operator observations. Procurement publishers use the buying-signal path.
  if(!source?.quote || source.sourceClass==='official_procurement' || !trustedSignalSource(account,source))return [];
  const title=norm(source.title);
  const {items,raw}=sourceItems(source);
  const companyJob=job.test(norm(source.sourceUrl)+' '+title);
  const closed=listed.test(title) || listed.test(norm(source.quote));
  const status=chronology(source,asOf,closed);
  if(!status)return [];
  const results=[];
  for(const definition of RESEARCH_TRIGGERS) {
    for(const {q,method} of items) {
      if(!matchResearchTrigger(definition.id,q))continue;
      const n=norm(q);
      const context=processContext(source,q,raw,companyJob);
      if(!context)continue;
      if(definition.id==='manual_cnc_duties' && ((!companyJob && !human.test(n)) || installed.test(n) || /vollautomatisch.{0,20}(?:be-|einlegen)|automated loading and unloading/.test(n)))continue;
      if(definition.id==='cnc_shift_pattern' && !companyJob && !own.test(n))continue;
      if(definition.id==='automation_interface') {
        const pos=raw.indexOf(q);
        const next=pos>=0?raw.slice(pos,pos+4):[q];
        if(!own.test(n) || next.some(v=>installed.test(norm(v))))continue;
      }
      if(definition.id==='quantified_batch_size' && !own.test(n) && !/(?:typisch|typical|fertigen|produktionslos|fertigungslos|wir |unser|our |we |kleinserienbereich)/.test(norm(context)+' '+n))continue;
      const [basis,reason,reasonDe]=reasonFor(definition.id,n);
      results.push({...definition,quote:q,contextQuote:norm(context)===n?'':context,sourceUrl:source.sourceUrl,site:source.site||sourceLocality(source)?.label||'',
        project:source.project||'',date:source.date||null,observedAt:source.observedAt||null,status,basis,reason,reasonDe,points:0,
        origin:source.origin || (source.curated?'Curated research':'Public source'),method});
      break;
    }
  }
  return results;
}
