// Research-priority weights. Detection needs a complete, attributable statement;
// dates, buyer identity, process context and current stage are checked separately.
export const BUYING_SIGNALS = [
  ['loading_rfq',60,'Open RFQ for machine loading','Offene Ausschreibung zur Maschinenbeladung','A buyer invites bids for a loading cell with a verifiable submission deadline.','Ein Käufer bittet um Angebote für die Maschinenbeladung und nennt eine prüfbare Frist.'],
  ['feasibility_pilot',55,'Invitation to a feasibility study or pilot','Einladung zur Machbarkeitsprüfung oder zum Pilotprojekt','The operator asks an external partner to test a specific handling application.','Ein Betreiber sucht externe Partner für den Test einer konkreten Handhabungsaufgabe.'],
  ['loader_retrofit',52,'Replacement or retrofit of a loader','Ersatz oder Nachrüstung eines Ladesystems','A named loading installation is due for replacement or an upgrade.','Ein Betreiber kündigt den Ersatz oder die Modernisierung eines Ladesystems an.'],
  ['unattended_goal',43,'Goal of unattended production','Ziel einer unbemannten Produktion','The operator explicitly wants future unattended machining or lights-out hours.','Der Betreiber möchte Maschinen künftig ohne Personal betreiben.'],
  ['loading_bottleneck',45,'Manual loading limits output','Manuelles Beladen begrenzt den Durchsatz','The operator explicitly links manual loading with idle time, queues or lost output.','Der Betreiber führt Wartezeit, Stillstand oder geringeren Ausstoß auf manuelles Beladen zurück.'],
  ['budget_approved',50,'Automation budget approved for a line','Automatisierungsbudget für eine Linie freigegeben','Funding is approved for automation of an identifiable line or cell.','Mittel für die Automatisierung einer benannten Linie oder Zelle sind freigegeben.'],
  ['pilot_rollout',47,'Successful pilot to be rolled out','Erfolgreicher Pilot soll ausgeweitet werden','A completed pilot will be extended to another machine or site.','Ein erfolgreicher Pilot soll auf eine weitere Maschine oder einen Standort übertragen werden.'],
  ['series_contract',26,'New series contract brings recurring volume','Neuer Serienauftrag mit wiederkehrendem Volumen','A newly awarded production contract creates recurring machining work.','Ein neuer Auftrag bringt wiederkehrende Fertigungslose oder konkretes Serienvolumen.'],
  ['insourcing',30,'Machining moves in-house','Zerspanung wird ins Haus geholt','The operator is bringing previously outsourced machining into its own plant.','Der Betreiber übernimmt bisher extern vergebene Bearbeitung im eigenen Werk.'],
  ['cnc_addition',23,'New CNC machine or cell','Neue CNC-Maschine oder Zelle','The operator adds or has ordered a specific CNC asset. Loading and interest remain open.','Der Betreiber ergänzt oder bestellt eine konkrete CNC-Anlage. Teilezuführung und Kaufinteresse bleiben offen.'],
  ['ergonomics_project',34,'Safety or ergonomics project for handling','Arbeitsschutzprojekt für manuelle Handhabung','An active project addresses lifting or other handling risks at a production step.','Ein konkretes Projekt behandelt körperliche Belastung beim Heben oder Handhaben von Werkstücken.'],
  ['automation_owner_job',39,'Job owns a loading automation project','Stelle verantwortet ein Beladungsprojekt','A named job duty assigns implementation of automated machine loading.','Eine konkrete Stellenaufgabe überträgt Verantwortung für die automatisierte Maschinenbeladung.']
].map(([id,weight,label,labelDe,description,descriptionDe]) => ({id,weight,label,labelDe,description,descriptionDe}));

const clean = value => String(value || '').replace(/\s+/g,' ').trim();
const norm = value => clean(value).normalize('NFKC').toLowerCase().replace(/ß/g,'ss').replace(/[‐‑‒–—]/g,'-');
const handling = /maschinen(?:be(?:lad|schick|stück)|zuführ)|werkstück(?:hand|zuführ|wechs|belad)|teile(?:hand|zuführ)|belade(?:roboter|zelle|system)|beladung|bestückung|einlegen|be- und entlad|beschickung|machine tend|machine load|loading (?:our|the|of|cell|robot|system|cnc|machine|lathe)|load(?:ing)? (?:our|the|a) (?:cnc|lathe|machine)|part handling|workpiece handling|pick[- &]+and[- ]+place/;
const cnc = /cnc|drehmaschine|fräsmaschine|dreh-fräszentr|bearbeitungs(?:zentrum|maschine)|fräszentrum|drehzentrum|machining cent(?:er|re)|milling machine|\blathe\b|machining cell|zerspanung/;
const automation = /automat|robot|unattended|mannlos|unbemannt/;
const newAsset = /(?:hinzu|ergänz|erweiter|erhielt|investier|gekauft|angeschafft|beschafft|bestellt|ausgebaut|in betrieb genommen|installier|purchased|ordered|adding|added|expanded|commissioned|installed|invested)/;
// Ambiguous mixed assertions stay unconfirmed. Never score an investment just
// because the purchase verb also appears in a denial.
const assetDenial = /\b(?:not|never|no|without|nicht|nie|niemals|ohne|kein(?:e[nrms]?|en|em|er|es)?)\b|n['’]t\b/;
const namedLine = /(?:linie|zelle|cell|line|machine|maschine)\s+(?:nr\.?\s*)?(?:\d+[\w-]*|[a-z][-_]\d+|[a-z]\d+|[a-z]{2,}[- ]?\d+)|(?:verpackungs|fertigungs|montage|dreh|fräs|cnc)[- ]?(?:linie|zelle)\s+(?:\d+|[a-z]\b)|\b[A-Z]{1,5}[- ]?\d{2,4}\b/i;
const tests = {
  loading_rfq: q => handling.test(q) && /ausschreibung|angebots(?:anfrage|frist|abgabe)|bitt(?:en|et) um (?:angebote|ein angebot)|aufforderung zur angebotsabgabe|\brfq\b|tender|invites? bids|request(?:ing)? (?:for |a )?quotation|submit (?:a |your )?(?:bid|quotation)|beschaff(?:en|t) (?:wir |eine?n? )?/.test(q),
  feasibility_pilot: q => handling.test(q) && /machbarkeit|pilot(?:projekt|partner|versuch|test)?|proof.of.concept|feasibility|pilot trial/.test(q) && /wir suchen|suchen wir|laden.{0,30}ein|wir.{0,40}bitten|partner gesucht|einreich|bewerben|looking for|seeking|invite|call for|requesting/.test(q),
  loader_retrofit: q => /lader\b|ladesystem|belade(?:system|roboter|zelle)|beladevorrichtung|loading (?:system|cell|robot)|\bloader\b/.test(q) && /nachrüst|ersatz|ersetzen|ersetzt werden|erneuern|erneuert werden|modernisieren|modernisiert werden|replacement|replace|retrofit|upgrade/.test(q),
  unattended_goal: q => /mannlos|unbemannt|unbeaufsichtigt|geisterschicht|lights.out|unattended/.test(q) && /wollen|möchten|beabsichtig|planen|unser ziel|streben|ziel ist|intend|planning|we (?:want|aim|plan)|our goal/.test(q),
  loading_bottleneck: q => handling.test(q) && /manuell|händisch|von hand|per hand|manual|by hand/.test(q) && /engpass|nadelöhr|stillstand|wartezeit|leerzeit|begrenzt.{0,18}(?:durchsatz|ausstoss)|bottleneck|idle time|idle for|lost output|downtime|limits (?:our |the )?(?:throughput|output)/.test(q),
  budget_approved: q => automation.test(q) && (namedLine.test(q) || /(?:cnc[- ]linie|cnc[- ]zelle|line|cell) (?:alpha|beta|gamma|delta|omega)/.test(q)) && /budget|mittel|investition|funding|capital expenditure/.test(q) && /freigegeben|bewilligt|genehmigt|approved|authoris|authoriz|secured/.test(q),
  pilot_rollout: q => /pilot|proof.of.concept/.test(q) && /erfolgreich|erprobt|success|proven/.test(q) && /weitere[nr]? (?:cnc[- ]?)?(?:drehmaschine|fräsmaschine|maschine|werk|standort|linie)|zweite[nr]? (?:maschine|standort|linie)|another (?:site|machine|line|plant)|second (?:site|machine|line)|additional (?:site|machine|line)/.test(q) && /rollen|rollout|roll.out|ausrollen|übertrag|ausweit|plan|wollen|werden|soll|extend|expan|will/.test(q),
  series_contract: q => /auftrag|liefervertrag|serienvertrag|contract|order/.test(q) && /gewonnen|erhalten|unterzeichnet|neu(?:er|en|e) (?:serienauftrag|liefervertrag)|zuschlag|awarded|signed|won|secured|new (?:series|production) contract/.test(q) && /serie|wiederkehr|monatlich|jährlich|pro (?:monat|jahr)|recurring|monthly|annual|per (?:month|year)|each (?:month|year)/.test(q),
  insourcing: q => /fräs|dreh|zerspan|bearbeitung|machining|milling|turning/.test(q) && /fremdvergeb|fremdbez|ausgelagert|extern|outsourc|supplier|subcontract/.test(q) && /ins haus|im eigenen (?:haus|werk)|intern|inhouse|in.house|eigenfertigung|eigene[nr]? fertigung|selbst (?:herstellen|fertigen|bearbeiten)|zurückhol|back (?:to|into) our/.test(q),
  cnc_addition: q => cnc.test(q) && newAsset.test(q) && /neu(?:e|en|er|em|es)?\b|weiter(?:e|en|er|es)|\bnew\b|additional|zusätzli|bestellt|ordered|invest|purchased|angeschafft|gekauft|(?:anlage|maschine|cnc|zentrum).{0,38}in betrieb genommen/.test(q) && !/geplant|wir erwägen|prüfen.{0,20}(?:kauf|anschaffung)|consider(?:ing)?|available to order/.test(q),
  ergonomics_project: q => /ergonom|arbeitsschutz|sicherheit|hebe(?:belast|hilfe)|safety|lifting injur|strain|musculoskeletal/.test(q) && /handhab|werkstück|heben|tragen|handling|lifting|belad|bestück/.test(q) && /projekt|massnahme|initiativ|eingeleitet|gefahrdungsbeurteilung|gefährdungsbeurteilung|projektstart|programme|program|project|assessment/.test(q),
  automation_owner_job: q => handling.test(q) && automation.test(q) && /verantwort|projektleit|leiten sie|implementieren sie|sie übernehmen|du übernimmst|lead (?:the |our )?(?:project|implementation|deployment)|responsible for|own the|project ownership/.test(q)
};
export function matchBuyingSignal(id, statement) {
  const q = norm(statement);
  if (id === 'cnc_addition' && assetDenial.test(q)) return false;
  return !!tests[id] && q.length >= 12 && q.length <= 850 && tests[id](q);
}

function host(url) {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u.hostname.toLowerCase().replace(/^www\./,'') : '';
  } catch { return ''; }
}
function belongs(url, domain) {
  const h = host(url);
  const d = String(domain || '').toLowerCase().replace(/^www\./,'');
  return !!d && (d === h || h.endsWith('.' + d));
}
export function trustedSignalSource(account, s) {
  if (s.sourceClass !== 'official_procurement') return belongs(s.sourceUrl,account.domain);
  const o = s.ownership || {};
  if (host(s.sourceUrl) !== 'ted.europa.eu' || host(o.sourceUrl) !== 'ted.europa.eu') return false;
  const corpus = norm(s.sourceText);
  const name = norm(o.buyerName);
  const domain = norm(account.domain);
  const website = clean(o.websiteQuote).match(/(?:https?:\/\/|www\.)[^\s<>)]+/i)?.[0];
  const buyerUrl = website?.startsWith('www.') ? 'https://'+website : website;
  return !!name && norm(account.name) === name && norm(o.buyerDomain) === domain && belongs(buyerUrl,domain) &&
    norm(o.quote).includes(name) && /buyer|beschaffer|auftraggeber/.test(norm(o.roleQuote)) &&
    [o.quote,o.websiteQuote,o.roleQuote].every(v => clean(v) && corpus.includes(norm(v)));
}

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTime = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d\d:\d\d)$/i;
function time(value) {
  if (value instanceof Date) return value.getTime();
  if (!dateOnly.test(value || '') && !isoDateTime.test(value || '')) return NaN;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return NaN;
  if (dateOnly.test(value) && new Date(t).toISOString().slice(0,10) !== value) return NaN;
  return t;
}
function deadlineTime(value) {
  const t = time(value);
  // A date-only deadline has no verified cutoff hour; don't treat it as open on that day.
  return t;
}
const issuer = /\bwir\b|\bunser(?:e[nrms]?)?\b|\bwe\b|\bour\b/;
const thirdParty = /bei (?:unserem|unseren|einem) kunden|für (?:unseren|einen) kunden|unser kunde|für kunden|(?:our|a) customer (?:is|was|plans|has)|for (?:our|a) (?:customer|client)|case study|kundenstimme|anwenderbericht|unser(?:e[nrms]?)? (?:partner|lieferant|mitbewerber) (?:kauft|hat|möchte|plant|wird)|our (?:partner|supplier|client) (?:has|will|plans|wants|is)/;
const fiction = /\b(?:beispiel|hypothetisch|könnte[n]?|würde[n]?|could|would|suppose|if|wenn|falls|ohne bedarf|no plans|do not|does not|did not|nicht geplant|nicht vorgesehen|nicht freigegeben|kein(?:en|e|er)? (?:auftrag|budget|projekt|bedarf|engpass|interesse)|wollen (?:wir )?nicht|wir (?:wollen|planen|suchen) nicht|not approved|no (?:approved )?(?:budget|bottleneck|plan|contract))\b/;
const seller = /unser(?:e[nrms]?)? kunden können|für ihre fertigung bieten|wir bieten.{0,40}(?:kunden|ihnen)|für sie (?:an|im angebot)|we (?:offer|supply|sell).{0,65}(?:your|customer)|your company can/;
const closed = /bereits vergeben|zuschlag (?:wurde )?erteilt|bieterfrist abgelaufen|ausschreibung (?:beendet|aufgehoben)|submission (?:period )?closed|contract awarded to|awarded to another|project cancelled|verfahren (?:ist )?abgeschlossen|challenge beendet|deadline (?:has )?passed/;
const historical = /\b(früher|ehemals|vormals|schon damals|bislang.{0,30}jetzt automatisiert|previously|formerly|used to|no longer|nicht mehr)\b/;
const filled = /stelle (?:ist )?besetzt|job (?:is )?filled|vacancy closed/;
const jobSource = s => /\/jobs?\/|\/karriere\/|\/stellen|\/careers?\/|\(m[\/-]w[\/-]d\)|stellenausschreibung|job description|we are hiring/.test(norm(s.sourceUrl + ' ' + s.title));
const archiveSource = s => /\/(?:aktuelles|news|presse|meldungen|blog|newsroom|archiv|archive)(?:\/index\.(?:html?|php))?\/?(?:[?#].*)?$/i.test(s.sourceUrl || '');
const buyerRole = /ausschreibung|rfq|procurement|tender|buyer|beschaffer|auftraggeber/;
function subjectConfirmed(account,s,q) {
  const n = norm(q);
  const token = norm(account.name).split(/[^\p{L}\d]+/u).find(w => w.length > 2 && !['gmbh','cnc','technik','maschinenbau','the','company'].includes(w));
  return issuer.test(n) || (token && n.includes(token)) || (s.sourceClass === 'official_procurement' && buyerRole.test(n)) ||
    (jobSource(s) && (n.includes('sie ') || n.includes('du ') || n.includes('responsible for') || n.includes('you will')));
}
function matchingStatements(s) {
  const trustedCurated = s.origin === 'Curated research' || (!s.origin && !!s.curated);
  // Curated rows may also carry an Apify body in storage. The reviewed excerpt
  // and its cited facts are the only curated observations; the capture is assessed separately.
  const raw = String(trustedCurated ? '' : s.sourceText || '').split(/\n+|(?<=[.!?])\s+(?=[\p{Lu}])/u).map(clean).filter(Boolean);
  const corpus = norm(raw.join(' '));
  const excerpts = new Map();
  function add(quote, method, fact) {
    const q = clean(quote);
    if (!q || q.length > 850 || /…$|\.\.\.$/.test(q)) return;
    const key = norm(q);
    const old = excerpts.get(key);
    if (!old || method === 'Featherless') excerpts.set(key,{quote:q,method,fact});
  }
  for (const q of raw) add(q,'source rule');
  if (!raw.length || corpus.includes(norm(s.quote))) add(s.quote,trustedCurated ? 'reviewed excerpt' : 'source rule');
  for (const f of s.facts || []) {
    if (!f?.quote || (f.sourceUrl && f.sourceUrl !== s.sourceUrl)) continue;
    const q = clean(f.quote);
    const original = raw.find(line => norm(line).includes(norm(q)));
    if (original) add(original,tests[f.code] && /featherless/i.test(f.method || s.analysis || '') ? 'Featherless' : 'source rule',f);
    else if (trustedCurated && !raw.length) add(q,'reviewed excerpt',f);
  }
  return [...excerpts.values()];
}
function newRow(def) {
  return {...def,status:'unknown',points:0,reason:'No qualifying evidence for this process.',reasonDe:'Kein ausreichender Beleg für diesen Prozess.',evidence:[]};
}
function statusFor(id,s,statement,now) {
  if(s.sourceAvailability==='unavailable') return 'historical';
  const q = norm(statement);
  const published = time(s.date);
  const observed = time(s.observedAt);
  const deadline = deadlineTime(s.deadline);
  const status = norm(s.procurementStatus || '');
  const today = Math.floor(now/86400000);
  if ((Number.isFinite(observed) && Math.floor(observed/86400000) > today) || (Number.isFinite(published) && Math.floor(published/86400000) > today)) return 'unknown';
  if (s.date && !Number.isFinite(published)) return 'unknown';
  if ((id !== 'series_contract' && closed.test(q)) || /closed|awarded|cancelled|expired|geschlossen|vergeben/.test(status) ||
      (Number.isFinite(deadline) && now >= deadline) || (id !== 'cnc_addition' && historical.test(q)) ||
      (id === 'automation_owner_job' && filled.test(q))) return 'historical';
  if (id === 'loading_rfq' && (!Number.isFinite(deadline) || (s.sourceClass === 'official_procurement' && status !== 'open'))) return 'unknown';
  if (Number.isFinite(deadline) && deadline > now && id === 'loading_rfq') return 'confirmed';
  if (!Number.isFinite(published)) return 'unknown';
  const years = [...q.matchAll(/\b(?:19|20)\d\d\b/g)].map(m => Number(m[0]));
  const currentYear = new Date(now).getUTCFullYear();
  if (years.length && Math.max(...years) < currentYear - 1) return 'historical';
  return today - Math.floor(published/86400000) > 365 ? 'historical' : 'confirmed';
}

function scopeMarkers(text) {
  const unpack = norm(text);
  const modelCodes = [...unpack.matchAll(/\b([a-z]{1,8})[ -]?(\d{2,4})\b/g)].filter(m=>!['jahr','year','in','since','seit','von','bis','ab'].includes(m[1])).map(m=>m[1]+m[2]);
  const lines = [...unpack.matchAll(/\b(?:cnc[- ]?)?(linie|line|zelle|cell)\s+(\d+[a-z]?|alpha|beta|gamma|delta|omega)\b/g)]
    .map(m=>'line:'+m[2]);
  return [...modelCodes,...lines];
}
function projectMatch(q,s) {
  const target = scopeMarkers(s.project);
  const mentioned = scopeMarkers(q);
  if (target.length && mentioned.length && !target.some(k=>mentioned.includes(k))) return false;
  const statedSite = norm(q).match(/(?:am standort|at (?:our|the) site in) ([a-zäöü-]{3,})/);
  const storedCity = norm(s.site).split(',')[0];
  if (statedSite && storedCity && !storedCity.includes('://') && !storedCity.includes(statedSite[1])) return false;
  return true;
}
export function assessBuyingSignals(account,s,asOf=new Date()) {
  const now = time(asOf);
  const rows = BUYING_SIGNALS.map(newRow);
  if (!Number.isFinite(now) || !trustedSignalSource(account,s)) return rows;
  const archive = archiveSource(s);
  const external = s.sourceClass === 'official_procurement';
  const officialCompetition = external && s.noticeType==='competition' && !!s.noticeTypeQuote &&
    norm(s.sourceText).includes(norm(s.noticeTypeQuote)) && !!s.deadlineQuote && norm(s.sourceText).includes(norm(s.deadlineQuote));
  const hiring = jobSource(s);
  for (const {quote,method,fact} of matchingStatements(s)) {
    const q = norm(quote);
    if (archive || !projectMatch(quote,s) || thirdParty.test(q) || seller.test(q) || fiction.test(q)) continue;
    const curated = s.origin === 'Curated research' || s.curated;
    if (/gabelstapler|lkw[- ]?beladung|lastwagen|truck loading|loading dock|bookkeeping|buchhaltung|werbekampagne|surgical|operationssaal/.test(q)) continue;
    const selectedProcurementLine = external && [s.quote,s.title].some(v=>norm(v)===q || norm(v).replace(/^(title|description|titel|beschreibung): /,'') === q.replace(/^(title|description|titel|beschreibung): /,''));
    if (external && !selectedProcurementLine) continue;
    const validatedStatement = fact?.code && tests[fact.code] && /source rule|Featherless/i.test(fact.method || '') &&
      String(s.sourceText || '').includes(clean(quote)) && !thirdParty.test(q);
    if (!subjectConfirmed(account,s,q) && !curated && !selectedProcurementLine && !validatedStatement) continue;
    for (const row of rows) {
      const procurementMatch = row.id==='loading_rfq' && officialCompetition && selectedProcurementLine && handling.test(q);
      if ((!matchBuyingSignal(row.id,q) && !procurementMatch) || (external && !officialCompetition)) continue;
      if (hiring && row.id !== 'automation_owner_job') continue;
      if (row.id === 'automation_owner_job' && !hiring && !/sie übernehmen|du übernimmst|you will|your role/.test(q)) continue;
      if (row.id === 'pilot_rollout' && !handling.test(q) && !cnc.test(q)) continue;
      if (row.id === 'series_contract' && !cnc.test(q) && !/(?:dreh|fräs|precision|präzisions|gear|getriebe|bearbeit|werkstück)/.test(q)) continue;
      if (row.id === 'ergonomics_project' && !cnc.test(q) && !handling.test(q) && !/werkstück|workpiece/.test(q)) continue;
      if (row.id === 'unattended_goal' && !cnc.test(q) && !/produktion|fertig|production|machin|betrieb/.test(q)) continue;
      if (row.id === 'budget_approved' && !handling.test(q) && !cnc.test(q)) continue;
      const status = statusFor(row.id,s,q,now);
      const origin = s.origin || (s.curated ? 'Curated research' : 'Public source');
      const deadline = s.deadline || '';
      const expires = deadline || (Number.isFinite(time(s.date)) ? new Date(time(s.date)+366*86400000).toISOString().slice(0,10) : null);
      row.evidence.push({quote,sourceUrl:s.sourceUrl,date:s.date || null,observedAt:s.observedAt || null,origin,
        method:method === 'Featherless' && fact?.code !== row.id ? 'source rule' : method,status,project:s.project || '',site:s.site || '',deadline,expires});
    }
  }
  return summarizeSignalRows(rows);
}
const rank = {confirmed:2,historical:1,unknown:0};
export function summarizeSignalRows(rows) {
  for (const row of rows) {
    row.evidence = row.evidence.filter((e,i,all) => all.findIndex(v =>
      v.sourceUrl===e.sourceUrl && norm(v.quote)===norm(e.quote) && v.origin===e.origin && v.status===e.status)===i);
    row.evidence.sort((a,b)=>rank[b.status]-rank[a.status] || String(b.date || '').localeCompare(String(a.date || '')) || String(a.sourceUrl).localeCompare(String(b.sourceUrl)));
    row.status = row.evidence[0]?.status || 'unknown';
    if (row.status === 'historical') {
      row.reason='Evidence is historical, closed or outside the validity window.'; row.reasonDe='Historischer, geschlossener oder abgelaufener Nachweis.';
    } else if (row.status === 'confirmed') {
      row.reason='Current source supports this signal for the stated process.'; row.reasonDe='Die aktuelle Quelle belegt das Signal für den genannten Prozess.';
    } else if (row.evidence.length) {
      row.reason='Relevant wording found; timing or the submission deadline is unverified.'; row.reasonDe='Passender Text gefunden. Datum oder Angebotsfrist bleiben ungeklärt.';
    }
  }
  return rows;
}
export function combineBuyingSignals(sets) {
  return summarizeSignalRows(BUYING_SIGNALS.map((def,i) => ({...newRow(def),evidence:sets.flatMap(rows => rows[i].evidence)})));
}
