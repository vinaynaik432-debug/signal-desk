import { assessBuyingSignals, combineBuyingSignals, trustedSignalSource } from './buying-signals.mjs';
import { sourceLocality, usesObservationFreshness } from './research-triggers.mjs';

// The score prioritises research. A public operating signal earns no buying-intent points.
export const SEGMENTS = [
  { id: 'capacity', label: 'Capacity expansion', pain: 'Adding a machine can change the loading workload. The source does not say how the new machine is fed.',
    question: 'Wie werden die Werkstücke an der neuen Maschine heute zugeführt?',
    subject: 'Teilezuführung nach dem Kapazitätsausbau', role: 'Produktionsleitung' },
  { id: 'hours', label: 'Shift operations', pain: 'Whether parts can run unattended between staffed periods depends on which steps need an operator.',
    question: 'Welche Arbeitsschritte brauchen im Schichtbetrieb eine Person an der Maschine?',
    subject: 'Maschinenbetreuung im Schichtbetrieb', role: 'Fertigungsleitung' },
  { id: 'manual', label: 'Part handling & series', pain: 'The loading method and time per batch determine whether a handling study is worthwhile.',
    question: 'Wie werden die Werkstücke Ihrer Serien heute eingelegt und entnommen?',
    subject: 'Eine Frage zum Teilehandling', role: 'Leitung Zerspanung' },
  { id: 'mixed', label: 'Varied parts & batch sizes', pain: 'Tooling changes may matter more than total volume. Actual changeover frequency needs confirmation.',
    question: 'Welche Teilefamilien kommen mit ähnlicher Geometrie und Aufspannung regelmäßig wieder?',
    subject: 'Teilehandling bei wechselnden Losgrößen', role: 'Fertigungsleitung' }
];

const research = { id: 'research', label: 'Research needed', pain: 'The evidence does not identify a current machine-tending use case.',
  question: 'Welche konkrete Maschine und welche Teilefamilie kommen am Standort überhaupt infrage?', role: 'Fertigungsleitung' };
const covered = { id: 'covered', label: 'Automation documented', pain: 'The source describes automation on the cited process.',
  question: 'Betrifft eine neue Anfrage eine andere Maschine oder einen anderen Arbeitsschritt?', role: 'Fertigungsleitung' };
const segments = Object.fromEntries(SEGMENTS.map(item => [item.id, item]));
const translations = {
  capacity: ['Kapazitätsausbau', 'Eine weitere Maschine kann den Aufwand für die Teilezuführung verändern. Die aktuelle Beladung ist unbekannt.', 'How are workpieces fed into the new machine today?', 'Part feeding after the capacity expansion', 'Head of production'],
  hours: ['Schichtbetrieb', 'Welche Aufträge ohne Personal laufen können, hängt von den Arbeitsschritten an der Maschine ab.', 'Which steps need an operator at the machine during a shift?', 'Staffing the machine across shifts', 'Manufacturing lead'],
  manual: ['Teilehandling und Serien', 'Beladungsart und Zeitaufwand pro Los bestimmen, ob sich eine Machbarkeitsprüfung lohnt.', 'How are parts loaded and unloaded in your production runs today?', 'A question about part handling', 'Machining lead'],
  mixed: ['Teilevielfalt und Losgrößen', 'Umrüstungen können stärker ins Gewicht fallen als das Gesamtvolumen. Ihre Häufigkeit ist noch offen.', 'Which part families recur with similar geometry and fixturing?', 'Part handling across different batch sizes', 'Manufacturing lead'],
  research: ['Weitere Recherche', 'Die Quellen belegen keine aktuelle Anwendung zur Maschinenbeladung.', 'Which machine and part family at this site warrant a closer look?', '', 'Manufacturing lead'],
  covered: ['Automatisierung belegt', 'Die Quelle dokumentiert Automatisierung für die genannte Anlage.', 'Does a new enquiry concern a different machine or process step?', '', 'Manufacturing lead']
};
for (const item of [...SEGMENTS,research,covered]) {
  [item.labelDe,item.painDe,item.questionEn,item.subjectEn,item.roleEn] = translations[item.id];
}
const day = 86400000;

function sameDomain(url, domain) {
  try {
    const page = new URL(url);
    const host = page.hostname.toLowerCase().replace(/^www\./, '');
    const expected = String(domain || '').toLowerCase().replace(/^www\./, '');
    return ['https:', 'http:'].includes(page.protocol) && expected && (host === expected || host.endsWith('.' + expected));
  } catch { return false; }
}

function dateValue(value) {
  if (!value) return null;
  if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && date.toISOString().slice(0, 10) !== value) return null;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function hiringSource(signal) {
  return /\/(?:jobs?|karriere|careers?|stellenangebote?|stellenanzeigen?)(?:\/|-|$)/i.test(signal.sourceUrl || '') ||
    /\((?:m\/w\/d|m-w-d|all genders)\)|Produktionshelfer\*in|Stellenausschreibung/i.test(signal.title || '');
}

function checkedFacts(signal, domain) {
  const facts = new Map();
  if (!trustedSignalSource({name:signal.name,domain},signal) || !String(signal.quote || '').trim()) return facts;
  for (const item of signal.facts || []) {
    if (!item || typeof item.quote !== 'string' || !item.quote.trim() || !(sameDomain(item.sourceUrl || signal.sourceUrl, domain) || (signal.sourceClass === 'official_procurement' && (!item.sourceUrl || item.sourceUrl===signal.sourceUrl)))) continue;
    if (hiringSource(signal) && ['explicit_interest', 'new_capacity'].includes(item.code)) continue;
    if (item.code === 'manual_loading' &&
        /\b(früher|vormals|ehemals|vorher|damals|zuvor|previously|formerly|used to|no longer|nicht mehr)\b/i.test(item.quote)) continue;
    if (item.code === 'new_capacity' &&
        /\b(geplant|planen|könnten|künftig geplant|proposed|planned|plan to|planning to|might|would|cancelled|abgesagt)\b/i.test(item.quote)) continue;
    // A job opening, sales offer, hypothetical, or completed case cannot establish buyer intent.
    if (item.code === 'explicit_interest') {
      const request = /(?:wir (?:suchen|planen|möchten|benötigen)|we (?:are (?:looking for|seeking)|need|plan to|want to)).{0,120}(?:automatisier|automation|automat(?:e|ing)|[Bb]elad(?:e)?roboter|robot(?:er|ic))/i;
      const handling = /maschinen(?:be(?:lad|schick)|bestück)|werkstück(?:hand|belad|zuführ)|teile(?:hand|zuführ)|beladeroboter|\b(?:[Bb]e- und Entlad|[Bb]eladung)|machine tend|machine load|load(?:ing)? (?:our|the) (?:CNC|lathe)|workpiece handling/i;
      const ambiguous = /keine?\b|nicht\b|bereits|damals|suchten|mitarbeit|fachkraft|bewerb|personal|kunden|customer|already|employee|engineer|nicht mehr|not\b/i;
      if (!request.test(item.quote) || !handling.test(item.quote) || ambiguous.test(item.quote)) continue;
    }
    facts.set(item.code, item);
  }
  return facts;
}

const normalized = value => String(value || '').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();

const strongestSegment = {loading_rfq:'manual',feasibility_pilot:'manual',loader_retrofit:'manual',unattended_goal:'hours',
  loading_bottleneck:'manual',budget_approved:'capacity',pilot_rollout:'capacity',series_contract:'manual',insourcing:'capacity',
  cnc_addition:'capacity',ergonomics_project:'manual',automation_owner_job:'manual'};

function allocate(rows,hold) {
  if (hold) return {strong:null,extra:0};
  const confirmed = rows.filter(r=>r.status==='confirmed').sort((a,b)=>b.weight-a.weight);
  const strong = confirmed[0];
  if (!strong) return {strong:null,extra:0};
  const proof = strong.evidence.find(e=>e.status==='confirmed');
  strong.points=strong.weight;
  const used = new Set([normalized(proof.quote)]);
  const project = normalized(proof.project);
  let extra=0;
  for (const row of confirmed.slice(1)) {
    const other = row.evidence.find(e=>e.status==='confirmed' && project && normalized(e.project)===project &&
      normalized(e.site)===normalized(proof.site) && !used.has(normalized(e.quote)));
    if (!other || extra === 10) continue;
    used.add(normalized(other.quote));
    row.points = Math.min(10-extra,Math.floor(row.weight/10));
    extra+=row.points;
  }
  return {strong,extra};
}
function reasonPair(en,de) {return {reason:en,reasonDe:de};}
function researchScore(account, signal, asOf, scopedAutomation, siblings) {
  const facts=checkedFacts({...signal,name:account.name},account.domain);
  const has=key=>facts.has(key);
  const today=dateValue(asOf);
  const pub=dateValue(signal.date);
  const seen=dateValue(signal.observedAt);
  const reference=usesObservationFreshness(signal) ? seen??pub : pub??seen;
  const current=(!signal.date || pub!==null) && (pub===null || pub<=today) &&
    (!signal.observedAt || seen!==null) && (seen===null || seen<=today) &&
    reference!==null && (today-reference)/day<=365;
  const assessments=[];
  for (const s of siblings) {
    assessments.push(assessBuyingSignals(account,s,asOf));
    if (s.apifyCapture && s.apifyCapture.sourceUrl===s.sourceUrl) {
      // Human-reviewed date/site are not evidence that Apify captured those fields.
      assessments.push(assessBuyingSignals(account,{...s.apifyCapture,origin:'Apify discovery'},asOf));
    }
  }
  const buyingSignals=combineBuyingSignals(assessments);
  const currentRows=buyingSignals.filter(r=>r.status==='confirmed').sort((a,b)=>b.weight-a.weight);
  const active=currentRows[0];
  const coverage=facts.get('automated') || facts.get('automation_included') || scopedAutomation;
  // A documented plan to replace an installed loader is a new scope. An existing
  // robot alone cannot open a campaign; only an explicit replacement can do so.
  const replacement=currentRows.some(r=>r.id==='loader_retrofit');
  let segment=research;
  if (signal.sourceAvailability==='unavailable') segment=research;
  else if (coverage && !replacement) segment=covered;
  else if (has('robotic_assistance') && !active && !has('manual_loading')) segment=research;
  else if ((current || active) && has('dach') && has('cnc')) {
    if (active) segment=segments[strongestSegment[active.id]];
    else if (has('manual_loading')) segment=segments.manual;
    else if (has('extended_hours')) segment=segments.hours;
    else if (has('high_mix')) segment=segments.mixed;
    else if (has('repeat_production')) segment=segments.manual;
  }
  const humanHold=account.review==='Hold';
  const hold=humanHold || segment===research || segment===covered;
  let holdText={reason:'',reasonDe:''};
  if(humanHold) holdText=reasonPair('A reviewer placed this account on hold.','Eine Person hat die Bearbeitung zurückgestellt.');
  else if(signal.sourceAvailability==='unavailable') holdText=reasonPair('The cited page was unavailable during the source check. Obtain current evidence before outreach.','Die angegebene Seite war bei der Prüfung nicht erreichbar. Vor der Ansprache ist ein aktueller Beleg erforderlich.');
  else if(segment===covered && coverage.code==='automation_included') holdText=reasonPair('The cited project includes robotic automation. Confirm its loading scope before outreach.','Das genannte Projekt umfasst Roboterautomatisierung. Vor der Ansprache ist deren Beladungsumfang zu prüfen.');
  else if(segment===covered) holdText=reasonPair('Automation is documented for this process.','Die Automatisierung dieses Prozesses ist belegt.');
  else if(!current && !active) holdText=reasonPair('Source timing needs verification.','Der Zeitpunkt der Quelle muss geprüft werden.');
  else if(!has('dach')) holdText=signal.site
    ? reasonPair('The source names '+signal.site+'. Its country still needs verification for the DACH scope.',
      'Die Quelle nennt '+signal.site+'. Das Land ist für die DACH-Eingrenzung noch zu belegen.')
    : reasonPair('A DACH location for this operator still needs verification.','Ein DACH-Standort des Betreibers ist noch zu belegen.');
  else if(!has('cnc')) holdText=reasonPair('No machining application is established for this process.','Eine Zerspanungsanwendung für diesen Prozess ist nicht belegt.');
  else if(hold && has('robotic_assistance')) holdText=reasonPair('Robot-assisted machining is documented. An open loading task on this machine still needs to be established.','Robotergestützte Bearbeitung ist dokumentiert. Eine offene Beladungsaufgabe an dieser Maschine ist noch zu belegen.');
  else if(hold) holdText=reasonPair('No campaign segment with adequate evidence.','Für ein Kampagnensegment fehlt der Beleg.');
  const {strong,extra}=allocate(buyingSignals,hold);
  for (const row of buyingSignals.filter(r=>r.status==='confirmed')) {
    if (hold) Object.assign(row,reasonPair('Verified evidence. The account or process is held; no priority credit.','Beleg vorhanden. Der Vorgang ist zurückgestellt und erhält keine Punkte.'));
    else if (row===strong) Object.assign(row,reasonPair('Strongest confirmed signal; full weight.','Stärkstes belegtes Signal; volle Gewichtung.'));
    else if (row.points) Object.assign(row,reasonPair('Distinct evidence corroborates the same project.','Ein eigener Nachweis bestätigt dasselbe Projekt.'));
    else Object.assign(row,reasonPair('No extra points: shared evidence, unverified project linkage, or the 10-point cap.','Keine Zusatzpunkte: gleicher Beleg, unklare Projektzuordnung oder zehn Zusatzpunkte erreicht.'));
  }
  function fit(label,labelDe,max,code,yes,no,yesDe,noDe) {
    const f=facts.get(code);
    return {label,labelDe,max,points:f ? max : 0,...reasonPair(f ? yes : no,f ? yesDe : noDe),
      ...(f ? {quote:f.quote,sourceUrl:f.sourceUrl || signal.sourceUrl} : {})};
  }
  const best=strong?.evidence.find(e=>e.status==='confirmed');
  const breakdown=[
    fit('DACH site','DACH-Standort',10,'dach','Location documented.','Site still to confirm.','Standort belegt.','Standort noch offen.'),
    fit('Machining fit','Zerspanung',20,'cnc','Machining application documented.','No machining process confirmed.','Zerspanungsanwendung belegt.','Kein Zerspanungsprozess belegt.'),
    {label:'Strongest buying signal',labelDe:'Stärkstes Kaufsignal',max:60,points:strong?.weight || 0,
      ...reasonPair(strong ? strong.label : 'No eligible, current buying signal.',strong ? strong.labelDe : 'Kein anrechenbares aktuelles Kaufsignal.'),
      ...(best ? {quote:best.quote,sourceUrl:best.sourceUrl} : {})},
    {label:'Corroborating signals',labelDe:'Bestätigende Signale',max:10,points:extra,
      ...reasonPair('A distinct statement for the same named project earns one tenth of its weight, rounded down. Maximum 10.',
        'Ein eigener Nachweis für dasselbe benannte Projekt bringt ein Zehntel seines Gewichts, abgerundet. Höchstens 10 Punkte.')}
  ];
  let score=breakdown.reduce((total,row)=>total+row.points,0);
  if(hold) {
    const proof=segment===covered ? coverage : !has('dach') ? sourceLocality(signal) : null;
    breakdown.push({label:'Eligibility adjustment',labelDe:'Zurückstellung',max:0,points:-score,...holdText,
      ...(proof ? {quote:proof.quote,sourceUrl:proof.sourceUrl || signal.sourceUrl} : {})});
    score=0;
  }
  let {pain,painDe,question,questionEn}=segment;
  if (current && segment===research && !has('dach') && has('cnc') && (has('extended_hours') || has('cnc_shift_pattern'))) {
    pain='The source documents CNC shift staffing. Country verification remains open, along with machine utilisation and loading tasks.';
    painDe='Die Quelle belegt Schichtbesetzung an CNC-Maschinen. Land, Maschinenauslastung und Beladungsaufgaben sind noch zu prüfen.';
    question='In welchem Land liegt der genannte Standort, und welche Aufgaben umfasst die CNC-Schicht?';
    questionEn='In which country is the cited site, and which tasks does its CNC shift cover?';
  } else if (!active && segment.id==='manual' && has('manual_loading')) {
    pain='People load parts in the cited process. Its frequency and time cost are unknown.';
    painDe='Das Einlegen ist als Tätigkeit belegt. Häufigkeit und Zeitaufwand sind offen.';
    question='Welche Handgriffe beim Einlegen und Entnehmen wiederholen sich auch bei wechselnden Werkstücken?';
    questionEn='Which loading or unloading steps recur even when the workpiece changes?';
  } else if (!active && segment.id==='manual') {
    pain='Series production is documented. The loading method, repeat volume and operator time are unknown.';
    painDe='Serienfertigung ist belegt. Beladungsart, Wiederholmenge und Bedienzeit sind offen.';
  } else if (!active && segment.id==='hours' && hiringSource(signal)) {
    pain='The role description mentions shift work. Machine hours and operator tasks still need confirmation.';
    painDe='Die Stellenbeschreibung nennt Schichtarbeit. Maschinenlaufzeit und Aufgabenumfang sind noch zu prüfen.';
  }
  if (active && discoveryQuestions[active.id]) [question,questionEn]=discoveryQuestions[active.id];
  if (active && messages[active.id]) [pain,painDe]=messages[active.id];
  return {signal,segment,score,breakdown,buyingSignals,hold,holdReason:holdText.reason,holdReasonDe:holdText.reasonDe,
    pain,painDe,question,questionEn,active};
}

// Each hypothesis follows the particular event rather than the broader campaign.
const messages={
  loading_rfq:['A loading requirement exists. Confirm the acceptance criteria and required interfaces.','Ein Beladungsbedarf ist ausgeschrieben. Abnahmekriterien und Schnittstellen sind zu prüfen.','Technical question about the loading RFQ','Technische Frage zur ausgeschriebenen Beladung'],
  feasibility_pilot:['The operator is seeking a trial. Confirm the test part and the criterion for a successful result.','Der Betreiber sucht einen Versuchspartner. Musterteil und Erfolgskriterium sind noch abzustimmen.','Your machine-loading trial','Ihr Versuch zur Maschinenbeladung'],
  loader_retrofit:['Keeping the existing machine and its interfaces in service may constrain the replacement.','Vorhandene Maschinen und Schnittstellen können die Auswahl des neuen Laders einschränken.','Replacing the existing loader','Ersatz des vorhandenen Laders'],
  unattended_goal:['A buffer or an intervention may limit how long the machine can run on its own.','Puffer und notwendige Eingriffe können die erreichbare Laufzeit ohne Personal begrenzen.','Your target for unattended running','Ihr Ziel für die unbetreute Maschinenlaufzeit'],
  loading_bottleneck:['The operator links manual loading to lost time. The size of that loss and its cause still need measurement.','Der Betreiber beschreibt einen Engpass beim manuellen Beladen. Umfang und Ursache sind zu messen.','Time lost during loading','Zeitaufwand beim Beladen'],
  budget_approved:['A line has funding. Which handling tasks the budget covers still needs confirmation.','Für eine Linie sind Mittel freigegeben. Welche Handhabungsaufgaben sie abdecken, ist offen.','Scope of the automation budget','Umfang der Automatisierungsfreigabe'],
  pilot_rollout:['A pilot is being extended. Differences between machines or sites can affect what can be reused.','Ein Pilot soll ausgeweitet werden. Unterschiede zwischen Maschinen oder Standorten können Anpassungen erfordern.','Extending the pilot to the next machine','Übertragung des Piloten auf die nächste Anlage'],
  series_contract:['Recurring orders can make a repeatable handling routine worthwhile. Batch size and loading time remain open.','Wiederkehrende Aufträge können einen einheitlichen Ablauf ermöglichen. Losgröße und Beladungszeit sind offen.','Part handling for the new series order','Teilehandling im neuen Serienauftrag'],
  insourcing:['An incoming process needs a material flow inside the plant. The source does not name its feeding method.','Die übernommene Bearbeitung braucht einen internen Materialfluss. Die Art der Zuführung ist noch offen.','Part feeding for the in-house operation','Teilezuführung bei der Eigenfertigung'],
  ergonomics_project:['The operator identifies handling strain. A sample movement and workpiece weight can establish what assistance is needed.','Der Betreiber nennt eine Belastung bei der Handhabung. Bewegung und Werkstückgewicht helfen bei der Prüfung.','Handling workpieces in the ergonomics project','Werkstückhandhabung im Ergonomieprojekt'],
  automation_owner_job:['The employer assigns a machine-loading automation project. Its milestone and buying authority remain open.','Die Stelle umfasst ein Beladungsprojekt. Meilenstein und Einkaufsverantwortung sind noch zu klären.','First milestone for automated loading','Erster Meilenstein für die automatisierte Beladung']
};
const discoveryQuestions={
  loading_rfq:['Welches Werkstück und welche Maschinenschnittstelle sind für die technische Abnahme maßgeblich?','Which workpiece and machine interface govern technical acceptance?'],
  feasibility_pilot:['An welchem Musterteil und anhand welcher Kriterien möchten Sie die Machbarkeit prüfen?','Which sample part and acceptance criteria would you use for the feasibility trial?'],
  loader_retrofit:['Welche Schnittstellen des vorhandenen Laders müssen beim Umbau erhalten bleiben?','Which interfaces on the existing loader must the retrofit preserve?'],
  unattended_goal:['Wie lange soll die Maschine ohne Nachfüllen oder Eingriff laufen können?','How long should the machine run without replenishment or intervention?'],
  loading_bottleneck:['Wie viel Maschinenstillstand entsteht beim Einlegen und Entnehmen pro Los?','How much machine idle time does loading and unloading cause per batch?'],
  budget_approved:['Welche Station und welche Abnahmekriterien umfasst die Freigabe?','Which station and acceptance criteria are covered by the approved budget?'],
  pilot_rollout:['Welche Unterschiede zur Pilotzelle müssen Sie beim nächsten Standort berücksichtigen?','What differs between the pilot cell and the next machine or site?'],
  series_contract:['Welches Los aus dem neuen Serienauftrag kommt am häufigsten wieder?','Which batch from the new production contract will recur most often?'],
  insourcing:['Welche Werkstücke wechseln zuerst in die eigene Fertigung?','Which workpieces will move into your plant first?'],
  ergonomics_project:['Welcher Handgriff belastet das Team am stärksten und wie schwer ist das Werkstück?','Which movement puts the most strain on operators, and how heavy is the workpiece?'],
  automation_owner_job:['Welchen ersten Meilenstein soll die Projektleitung bei der Maschinenbeladung erreichen?','What first milestone should the project owner reach for machine loading?']
};

function scopeKey(s) {
  // Site-level sources with no process key are ambiguous. Different articles at
  // the same site cannot establish that two distinctly identified machines match.
  const site = String(s.site || '').trim().toLowerCase();
  const project = String(s.project || '').trim().toLowerCase();
  return site && project ? site + '|' + project : String(s.sourceUrl || '');
}

const englishOpenings={
  'kochmaschinenbau.de':'Your 2 July announcement describes the new Hermle C250 for complex individual parts and small batches.',
  'spaleck.de':'Your Greiz plant announcement describes the POSmill H 800 U for small and medium-sized precision parts.',
  'spn-drive.de':'You expanded bevel-gear machining capacity with an INDEX R300.',
  'alutronic.de':'Your machining page describes producing aluminium profiles from prototypes and small batches through to series production.',
  'fietz.com':'Your vacancy in Burscheid mentions replenishing material and a willingness to work two or three shifts.',
  'milltech.at':'Your CNC night-shift job profile describes turning and milling work.',
  'sbot.co.at':'Your Ternitz machining job profile mentions large workpieces and availability for three-shift work.',
  'rogenmoser-feinmechanik.ch':'Your Neuheim operation handles both prototypes and production runs.',
  'lobba.at':'Your Eggerding turning service covers individual parts through to large production runs.',
  'gft-cnc.at':'Your Wels machining service covers individual parts and production runs.',
  'eggers-cnc.de':'Your Kiel operation already has an automated Hermle cell. A separate production-support profile mentions loading parts.'
};
function englishRole(role, fallback) {
  if (!role) return fallback;
  const map={'Geschäftsführung':'Managing director','Geschäftsführer':'Managing director','Einkauf':'Purchasing',
    'Produktionsleitung':'Production management','Spannfutter':'Clamping chucks','Leiter Produktionstechnologien':'Head of production technologies',
    'Fertigungsleiter, Greiz':'Manufacturing manager, Greiz','Leitung Fertigung':'Manufacturing lead','Leitung Zerspanung':'Machining lead',
    'Fertigungsleitung':'Manufacturing lead','Leiter Fräserei':'Head of milling','Technischer Leiter':'Technical director'};
  return map[role] || role.split(/,\s*/).map(term=>map[term] || term).join(', ');
}
function draft(account, selected, contact) {
  const { signal, segment, hold } = selected;
  const role = contact?.role || segment.role;
  const named = contact?.name && contact.type !== 'generic';
  const greeting = named ? 'Guten Tag ' + contact.name + ',' : 'Guten Tag,';
  // A published position may shape the question; it does not prove decision authority.
  const executive = /geschäftsführ|managing director|\bceo\b|inhaber|owner/i.test(role);
  const purchasing = /einkauf|procurement|purchasing/i.test(role);
  const production = /fertigung|produktion|zerspanung|betriebsl|fräserei|dreherei|werk\s?s?leit|production|manufactur|plant manager|operations|engineering|technisch\w* leit|technical director/i.test(role);
  const otherRole = contact && !executive && !purchasing && !production;
  const executiveQuestions = {
    capacity: 'Unter welchen Bedingungen wäre die automatische Beladung der neuen Maschine für Sie wirtschaftlich interessant?',
    hours: 'Bei welchen Aufträgen würde eine längere Maschinenlaufzeit für Sie wirtschaftlich einen Unterschied machen?',
    manual: 'Bei welcher Teilefamilie wäre es für Sie sinnvoll, den heutigen Ablauf und die Kosten pro Los zu prüfen?',
    mixed: 'Welche wiederkehrende Teilefamilie hat für Sie genügend Volumen, um eine gemeinsame Prüfung zu rechtfertigen?'
  };
  let question = selected.question;
  let questionEn = selected.questionEn;
  const executiveEn = {
    capacity:'What would make automated loading economically worthwhile for this operation?',
    hours:'For which orders would longer machine uptime make an economic difference?',
    manual:'For which part family would it be useful to examine the current process and cost per batch?',
    mixed:'Which recurring part family has enough volume to justify a feasibility study?'
  };
  if (purchasing) {question = 'Wer kann die technischen Anforderungen und die Kriterien für eine mögliche Beschaffung einschätzen?';questionEn='Who can advise on the technical requirements and purchasing criteria?';}
  else if (otherRole) {question = 'An wen in der Fertigung kann ich mich mit einer Frage zur Teilezuführung wenden?';questionEn='Who in manufacturing would be the right person to ask about part feeding?';}
  else if (executive && !production && (!selected.active || selected.active.id==='cnc_addition')) {question=executiveQuestions[segment.id];questionEn=executiveEn[segment.id];}
  const reference = signal.date ? 'Veröffentlichung vom ' + signal.date
    : signal.observedAt ? 'abgerufen am ' + signal.observedAt : 'ohne Veröffentlichungsdatum';
  const fallbackOpening = 'auf Ihrer Website bin ich auf den Beitrag „' + (signal.title || 'Fertigung') + '“ gestoßen.';
  const message=messages[selected.active?.id];
  const subject=message?.[3] || segment.subject;
  const subjectEn=message?.[2] || segment.subjectEn;
  const official=signal.sourceClass==='official_procurement' && selected.active?.id==='loading_rfq';
  const introDe=official ? 'wir prüfen die technischen Anforderungen Ihrer veröffentlichten Ausschreibung zur Maschinenbeladung.' : signal.draftOpening || fallbackOpening;
  const introEn=official ? 'We are reviewing the technical requirements in your published machine-loading procurement notice.' :
    (signal.draftOpening && englishOpenings[account.domain]) || 'I read your published description, “'+(signal.title || 'Manufacturing')+'”.';
  const noteEn = signal.date ? 'published '+signal.date : signal.observedAt ? 'seen '+signal.observedAt : 'publication date unavailable';
  const bodyEn=hold ? '' : [named ? 'Hello '+contact.name+',' : 'Hello,',introEn,questionEn,
    official ? 'We can provide the technical information through the stated procurement channel.' : otherRole ?
      'I would appreciate a pointer to the appropriate team.' : 'If this is relevant, we would be happy to review one sample part together.',
    'Kind regards','Source ('+noteEn+') '+signal.sourceUrl].join('\n\n');
  const body = hold ? '' : [greeting, introDe, question,
    official ? 'Die technischen Unterlagen können wir über den angegebenen Vergabekanal bereitstellen.' : otherRole ? 'Über einen Hinweis zur richtigen Ansprechperson würde ich mich freuen.'
      : 'Wenn das für Sie interessant ist, sehen wir uns gern ein Beispielteil gemeinsam an.',
    'Freundliche Grüße', 'Quelle (' + reference + ') ' + signal.sourceUrl].join('\n\n');
  return { role, roleEn:englishRole(contact?.role,segment.roleEn), targetRole: segment.role, targetRoleEn:segment.roleEn, subjectEn:hold ? '' : subjectEn+' at '+account.name, bodyEn, recipientBasisDe:named ? 'Genannte Person mit veröffentlichter Rolle. Einkaufsbefugnis offen.' : 'Vorgeschlagene Rolle. Keine namentliche Ansprechperson.', recipientBasis: named ? 'Listed contact with a reported role; buying authority unconfirmed.' : 'Suggested role; no named recipient.',
    subject: hold ? '' : subject + ' bei ' + account.name, body };
}

function accountSignalMatrix(options,selected) {
  const scored=scopeKey(selected.signal);
  const rows=combineBuyingSignals(options.map(option=>option.buyingSignals.map(row=>({
    ...row,evidence:row.evidence.map(proof=>({...proof,inScoredScope:scopeKey(option.signal)===scored}))
  }))));
  for(const [i,row] of rows.entries()) {
    const local=selected.buyingSignals[i];
    row.points=local.points;
    row.countsForScore=local.points>0;
    if(row.status===local.status) {
      row.reason=local.reason;
      row.reasonDe=local.reasonDe;
    } else if(row.status==='confirmed') {
      Object.assign(row,reasonPair('Confirmed for another project or site. It adds no points to this project.',
        'Für einen anderen Standort oder ein anderes Projekt bestätigt. Hierfür gibt es keine Punkte.'));
    }
  }
  return rows;
}
export function evaluate(account, contact = null, asOf = new Date()) {
  if (contact instanceof Date || typeof contact === 'string') {
    asOf = contact;
    contact = null;
  }
  const asOfDay = dateValue(asOf);
  if (asOfDay === null) throw new TypeError('A valid assessment date is required.');
  // A persisted account is a container: its summary sourceUrl is copied from the
  // last evaluation. A seed may instead carry one real signal on the root.
  const nested = Array.isArray(account.signals) ? account.signals : [];
  const rootSignal = account.sourceUrl && Array.isArray(account.facts) && !nested.some(s => s.sourceUrl === account.sourceUrl);
  const records = (rootSignal ? [account, ...nested] : nested).filter(signal => signal?.sourceUrl).map(signal => {
    if (signal.site || !trustedSignalSource(account,signal)) return signal;
    const locality=sourceLocality(signal);
    return locality ? {...signal,site:locality.label} : signal;
  });
  const automationByScope = new Map();
  for (const signal of records) {
    const facts=checkedFacts(signal, account.domain);
    const proof = facts.get('automated') || facts.get('automation_included');
    // A later-dated article cannot establish what was already known on an earlier as-of date.
    const date = dateValue(signal.date);
    const seen = dateValue(signal.observedAt);
    if (proof && (!signal.date || date !== null) && (date === null || date <= asOfDay) && (seen === null || seen <= asOfDay)) {
      const previous=automationByScope.get(scopeKey(signal));
      if (!previous || proof.code==='automated') automationByScope.set(scopeKey(signal), { ...proof, sourceUrl: proof.sourceUrl || signal.sourceUrl });
    }
  }
  const options = (records.length ? records : [account]).map(signal =>
    researchScore(account, signal, asOf, automationByScope.get(scopeKey(signal)), records.filter(s=>scopeKey(s)===scopeKey(signal))));
  options.sort((a, b) => Number(a.hold) - Number(b.hold) || b.score - a.score);
  const selected = options[0];
  const { signal, segment, score, breakdown, hold } = selected;
  return { score, breakdown, segment: { id: segment.id, label: segment.label, labelDe: segment.labelDe }, buyingSignals:accountSignalMatrix(options,selected), pain: selected.pain, painDe:selected.painDe, question: selected.question, questionEn:selected.questionEn,
    hold, holdReason: selected.holdReason, holdReasonDe:selected.holdReasonDe, ...draft(account, selected, contact), sourceUrl: signal.sourceUrl || '', date: signal.date || null,
    observedAt: signal.observedAt || null, site: signal.site || '', project: signal.project || '', quote: signal.quote || '',
    asOf: new Date(asOfDay).toISOString().slice(0, 10),
    signalResults: options.map(s => ({ project: s.signal.project || '', site: s.signal.site || '', sourceUrl: s.signal.sourceUrl,
      segment: s.segment.id, hold: s.hold, score: s.score })) };
}
