// Run records keep their original generated text. Render it in the requested
// language, leaving search terms, company names and source quotations intact.
const german = {
  'Review saved.':'Prüfstatus gespeichert.',
  'Source checked. Only supported observations contribute to the score.':'Quelle geprüft. Nur belegte Beobachtungen fließen in die Bewertung ein.',
  'Source checked.':'Quelle geprüft.',
  'Only supported observations contribute to the score.':'Nur belegte Beobachtungen fließen in die Bewertung ein.',
  'Invalid review status.':'Ungültiger Prüfstatus.',
  'Invalid request.':'Ungültige Anfrage.',
  'Account not found.':'Unternehmen nicht gefunden.',
  'No matching saved source to analyze.':'Keine passende gespeicherte Quelle für die Analyse gefunden.',
  'This page changed during analysis.':'Die Seite hat sich während der Analyse geändert.',
  'Recheck its latest evidence.':'Bitte die neu erfassten Belege prüfen.',
  'Unknown route.':'Unbekannter Pfad.',
  'Unknown action.':'Unbekannte Aktion.',
  'Method not supported.':'Diese Anfragemethode wird nicht unterstützt.',
  'This is a read-only workspace.':'Dieser Arbeitsbereich ist schreibgeschützt.',
  'This request must originate in the workspace.':'Diese Anfrage muss aus dem Arbeitsbereich stammen.',
  'JSON input is required.':'Die Anfrage muss JSON-Daten enthalten.',
  'Request too large.':'Die Anfrage ist zu groß.',
  'Malformed request.':'Die Anfrage konnte nicht gelesen werden.',
  'Enter a search between 3 and 260 characters.':'Geben Sie einen Suchtext mit 3 bis 260 Zeichen ein.',
  'Choose 5 or 12 source pages.':'Wählen Sie 5 oder 12 Quellseiten.',
  'Unknown buying signal.':'Unbekanntes Kaufsignal.',
  'Discovery requires Apify and Featherless secrets.':'Für die Suche sind Zugangsdaten für Apify und Featherless erforderlich.',
  'The workspace database is unavailable.':'Die Datenbank des Arbeitsbereichs ist nicht erreichbar.',
  'This operation is already running.':'Diese Aktion wird bereits ausgeführt.',
  'Refresh the workspace in a moment.':'Aktualisieren Sie den Arbeitsbereich in Kürze.',
  'The operation could not finish.':'Die Aktion konnte nicht abgeschlossen werden.',
  'Saved evidence is available; try again.':'Gespeicherte Belege sind weiterhin verfügbar. Bitte erneut versuchen.',
  'Waiting for provider results.':'Warten auf die Ergebnisse des Anbieters.',
  'Checking source evidence with Featherless.':'Featherless prüft die Belege aus den Quellen.',
  'Recent result reused.':'Vorhandenes Suchergebnis wiederverwendet.',
  'Machine sales page excluded after reviewing the source.':'Verkaufsseite für Maschinen nach Quellenprüfung ausgeschlossen.',
  'The operator filter now catches this case.':'Der Filter für Maschinenbetreiber berücksichtigt diesen Fall.',
  'Recorded research run.':'Gespeicherter Recherchelauf.',
  'Apify returned two operator sources for the same company.':'Apify fand zwei Betreiberquellen zum selben Unternehmen.',
  'Featherless checked both sources; reviewed evidence is labeled separately.':'Featherless prüfte beide Quellen. Redaktionell geprüfte Belege sind gekennzeichnet.',
  'Hunter found no named contact with a relevant reported role for this domain.':'Hunter fand für diese Domain keine namentlich genannte Person mit einer relevanten Funktion.',
  'Hunter found no named decision-maker with a relevant role for this domain.':'Hunter fand für diese Domain keine namentlich genannte Person mit einer relevanten Funktion.',
  'The target role remains available.':'Die gesuchte Funktion ist weiterhin hinterlegt.',
  'The run ended before a result was recorded.':'Der Lauf endete, bevor ein Ergebnis gespeichert wurde.',
  'Previously saved sources are available.':'Bereits gespeicherte Quellen sind verfügbar.',
  'These pages were recovered from the same run.':'Diese Seiten wurden aus demselben Suchlauf wiederhergestellt.',
  'Retry from the source in the account.':'Die Analyse kann in der Quellenansicht des Unternehmens erneut gestartet werden.',
  'No first-party machining operator matched this search.':'Die Suche fand keinen unmittelbar belegten Betreiber einer Zerspanungsanlage.',
  'Try “unser Maschinenpark” or a company-specific site: query.':'Versuchen Sie „unser Maschinenpark“ oder eine Suche mit dem Domainfilter site:.',
  'TED index or search page.':'TED-Übersichtsseite oder Suchseite.',
  'A specific official notice is required.':'Eine konkrete amtliche Bekanntmachung ist erforderlich.',
  'Multiple procurement lots.':'Die Bekanntmachung enthält mehrere Lose.',
  'The buyer, scope and deadline need a lot-level review.':'Käufer, Leistungsumfang und Frist müssen je Los geprüft werden.',
  'TED lists a buyer without its name and public website in the same organisation block.':'Bei TED waren Name und Website des Käufers nicht gemeinsam im Organisationsabschnitt belegt.',
  'The TED buyer website is missing or points to a procurement portal.':'Die Website des Käufers fehlt oder führt zu einem Vergabeportal.',
  'TED did not identify one buyer with its own verified website in a buyer-role block.':'Bei TED ließ sich kein einzelner Käufer mit eigener Website und ausgewiesener Käuferrolle zuordnen.',
  'TED buyer section and organisation role block disagree.':'Beschaffer und Organisationsrolle stimmen in der Bekanntmachung nicht überein.',
  'Verified TED buyer, but no explicit machine-tending project statement could be grounded.':'Der Käufer ist bestätigt. Eine konkrete Aufgabe zur Maschinenbeschickung ist nicht belegt.',
  'Procurement portal lacks a verified buyer-to-company mapping.':'Auf dem Vergabeportal ließ sich der Käufer keinem Unternehmen sicher zuordnen.',
  'Enter a supported buying-signal focus.':'Wählen Sie ein vorhandenes Kaufsignal aus.',
  'The TED buyer identity did not pass the source attribution check.':'Die Identität des Käufers ließ sich in der Bekanntmachung nicht bestätigen.',
  'TED notice closed, awarded or past the submission deadline.':'Die TED-Bekanntmachung ist abgeschlossen, vergeben oder die Angebotsfrist ist abgelaufen.',
  'TED notice has no verifiable open submission deadline.':'In der TED-Bekanntmachung ist keine offene Angebotsfrist belegt.',
  'Official notice type is unconfirmed.':'Die amtliche Bekanntmachungsart ist nicht belegt.',
  'A competition or contract notice is required.':'Eine Wettbewerbs- oder Auftragsbekanntmachung ist erforderlich.',
  'Official TED procurement notice with a named buyer, its own website and an open deadline.':'Amtliche TED-Bekanntmachung mit benanntem Beschaffer, eigener Website und offener Frist.',
  'The selected buying signal was not evidenced on this page.':'Auf dieser Seite fehlt ein Beleg für das ausgewählte Kaufsignal.',
  'Selected signal has a matching passage.':'Zum ausgewählten Signal liegt eine passende Textstelle vor.',
  'Apify could not confirm completion.':'Apify konnte den Abschluss des Suchlaufs nicht bestätigen.',
  'External recruiting platform without a verified end-employer domain.':'Externe Stellenplattform. Die Domain des tatsächlichen Arbeitgebers ist nicht bestätigt.',
  'Intermediary describes production at partner shops.':'Vermittler beschreibt die Fertigung seiner Partnerbetriebe.',
  'No focused research trigger found.':'Auf der Quelle ließ sich der gesuchte Recherchehinweis nicht belegen.',
  'Invalid result from Apify.':'Ungültiges Apify-Ergebnis.',
  'Missing or unsafe public source URL.':'Öffentliche Quelladresse fehlt oder ist nicht sicher.',
  'Directory, publisher, intermediary or equipment supplier.':'Verzeichnis, Verlag, Vermittler oder Ausrüster.',
  'Search result and fetched page identify different domains.':'Suchergebnis und abgerufene Seite gehören zu verschiedenen Domains.',
  'Page fetch failed.':'Die Seite konnte nicht abgerufen werden.',
  'Machine sales or configuration page aimed at equipment buyers.':'Verkaufs- oder Konfigurationsseite für Maschinenkäufer.',
  'Insufficient title or fetched page text.':'Seitentitel oder abgerufener Text reichen für eine Prüfung nicht aus.',
  'Third-party reporting, testimonial, or directory page.':'Fremdbericht, Kundenreferenz oder Verzeichniseintrag.',
  'No machining application found.':'Keine Zerspanungsanwendung gefunden.',
  'Recruiter describes a client company rather than its own machining process.':'Personalvermittler beschreibt den Betrieb eines Kunden.',
  'Could not establish that this company operates the machining process.':'Ob das Unternehmen den Zerspanungsprozess selbst betreibt, ließ sich nicht belegen.',
  'Company identity could not be confirmed from this page.':'Die Identität des Unternehmens ließ sich auf dieser Seite nicht bestätigen.',
  'No attributable manufacturing statement.':'Keine eindeutig zuordenbare Aussage zur Fertigung.',
  'No attributable operating statement.':'Keine eindeutig zuordenbare Aussage zum Betrieb.',
  'First-party operating statement on an index.':'Eigenaussage zum Betrieb auf einer Übersichtsseite.',
  'Project date is unknown.':'Das Projektdatum ist unbekannt.',
  'First-party machining operator evidence.':'Eigenaussage des Betreibers zur Zerspanung.',
  'Saved first-party operator source.':'Eigene Betreiberquelle gespeichert.',
  'This source page already appeared in this search.':'Diese Quelle erschien bereits in diesem Suchlauf.',
  'Enter a short or extended search depth of 5 or 12 pages.':'Wählen Sie einen Suchumfang von 5 oder 12 Seiten.',
  'Enter a short search phrase, using site: for a company domain.':'Geben Sie einen kurzen Suchtext ein. Mit site: lässt sich die Suche auf eine Domain beschränken.',
  'Apify returned incomplete run identifiers.':'Apify lieferte unvollständige Kennungen für den Suchlauf.',
  'Check the existing run in Apify Console before starting another.':'Prüfen Sie den laufenden Auftrag in der Apify-Konsole, bevor Sie einen weiteren starten.',
  'Apify returned an unexpected dataset.':'Apify lieferte einen unerwarteten Datensatz.',
  'A matching company source URL is required.':'Eine passende Quelladresse des Unternehmens ist erforderlich.',
  'The company source has no usable text.':'Die Unternehmensquelle enthält keinen verwertbaren Text.',
  'Featherless returned an unreadable analysis.':'Die Analyse von Featherless war nicht lesbar.',
  'Featherless returned no structured facts.':'Featherless lieferte keine strukturierten Beobachtungen.',
  'The original evidence is available.':'Der ursprüngliche Beleg ist weiterhin verfügbar.',
  'A public company domain is required.':'Eine öffentliche Unternehmensdomain ist erforderlich.',
  'Hunter returned an unexpected response.':'Hunter lieferte eine unerwartete Antwort.'
};

function sentenceDE(s) {
  if (german[s]) return german[s];
  const rules=[
    [/^Reviewed (\d+) source page\(s\)\.$/,(_,n)=>'Geprüfte Quellseiten: '+n+'.'],
    [/^Retained (\d+) operator account\(s\)\.$/,(_,n)=>'Übernommene Betreiber: '+n+'.'],
    [/^Excluded (\d+) intermediary page\(s\) after source verification\.$/,(_,n)=>'Nach Quellenprüfung ausgeschlossene Vermittlerseiten: '+n+'.'],
    [/^German web search returned (\d+) organic result\(s\); no eligible original company URL could be selected\.$/,(_,n)=>'Die deutschsprachige Suche lieferte '+n+' Treffer. Keine geeignete Originalseite konnte ausgewählt werden.'],
    [/^German web search returned (\d+) organic result\(s\)\.$/,(_,n)=>'Die deutschsprachige Suche lieferte '+n+' Treffer.'],
    [/^Original-page crawl failed: (.+)$/,(_,err)=>'Die Originalseiten konnten nicht abgerufen werden. '+messageIn(err,'de')],
    [/^(\d+) selected original page\(s\) did not return a document\.$/,(_,n)=>'Für '+n+' ausgewählte Originalseiten liegt kein Dokument vor.'],
    [/^(\d+) new account\(s\), (\d+) new source\(s\)(?:, (\d+) updated source\(s\))?\.$/,(_,a,b,c)=>'Neue Unternehmen: '+a+'. Neue Quellen: '+b+'.'+(c?' Aktualisierte Quellen: '+c+'.':'')],
    [/^(\d+) source\(s\) analyzed\.$/,(_,n)=>'Analysierte Quellen: '+n+'.'],
    [/^(\d+) result\(s\) omitted as duplicates, supplier or media pages, or pages lacking operator evidence\.$/,(_,n)=>'Ausgesonderte Treffer: '+n+' (Duplikate, Anbieter, Medien oder fehlender Betreiberbeleg).'],
    [/^Apify timed out after returning (\d+) pages\.$/,(_,n)=>'Apify erreichte das Zeitlimit nach '+n+' Seiten.'],
    [/^Recovered (\d+) available page\(s\) from the same run\.$/,(_,n)=>'Wiederhergestellte Seiten aus demselben Suchlauf: '+n+'.'],
    [/^Apify (?:run )?(?:ended with status |ended |reported )?([A-Z-]+)\.$/,(_,v)=>'Apify-Lauf mit Status '+v+' beendet.'],
    [/^Apify (.+) and its dataset had no pages\.$/,()=> 'Der Apify-Lauf endete ohne wiederherstellbare Seiten.'],
    [/^Check the existing run in Apify Console before trying a narrower search\.$/,()=> 'Prüfen Sie den Auftrag in der Apify-Konsole. Grenzen Sie die nächste Suche ein.'],
    [/^(\d+) (?:analysis request\(s\) )?incomplete\.$/,(_,n)=>'Unvollständige Analysen: '+n+'.'],
    [/^(\d+) named contact\(s\) with a reported role saved\.$/,(_,n)=>'Gespeicherte Kontakte mit belegter Funktion: '+n+'.'],
    [/^(Apify|Featherless|Hunter) is not configured\.$/ ,(_,v)=>v+' ist nicht konfiguriert.'],
    [/^(Apify|Featherless|Hunter) returned HTTP (\d+)\.$/ ,(_,v,n)=>v+' meldete HTTP '+n+'.'],
    [/^(Apify|Featherless|Hunter) could not be reached\.$/ ,(_,v)=>v+' war nicht erreichbar.'],
    [/^(Apify|Featherless|Hunter) timed out\.$/ ,(_,v)=>v+' hat das Zeitlimit erreicht.'],
    [/^No automatic retry was started\.$/ ,()=> 'Es wurde kein weiterer Auftrag gestartet.'],
    [/^(Apify|Featherless|Hunter) returned an empty response\.$/ ,(_,v)=>v+' lieferte eine leere Antwort.'],
    [/^(Apify|Featherless|Hunter) exceeded the response size limit\.$/ ,(_,v)=>'Die Antwort von '+v+' überschritt die zulässige Größe.'],
    [/^(Apify|Featherless|Hunter) returned unreadable JSON\.$/ ,(_,v)=>v+' lieferte unlesbare JSON-Daten.']
  ];
  for(const [pattern,format] of rules) if(pattern.test(s)) return s.replace(pattern,format);
  return '';
}
export function messageIn(value,lang,fallback='Der Vorgang konnte nicht vollständig ausgewertet werden.') {
  if(lang!=='de' || !value) return value;
  if(german[value]) return german[value];
  return value.split(/(?<=\.)\s+(?=[A-ZÄÖÜ0-9])/).map(part=>sentenceDE(part) || fallback).join(' ');
}

export function runIn(run,lang) {
  const outcomes={kept:'Übernommen',skipped:'Übersprungen',duplicate:'Duplikat'};
  const statuses={Completed:'Abgeschlossen',Partial:'Teilweise abgeschlossen',Running:'Läuft',Failed:'Fehlgeschlagen',Interrupted:'Unterbrochen'};
  return {...run,query:lang==='de'?run.query.replace(/^Discover · /,'Recherche · ').replace(/^Account review · /,'Unternehmensprüfung · '):run.query,
    statusLabel:lang==='de'?(statuses[run.status] || run.status):run.status,message:messageIn(run.message,lang),
    decisions:run.decisions.map(d=>({...d,outcomeLabel:lang==='de'?(outcomes[d.outcome]||d.outcome):d.outcome,
      reason:messageIn(d.reason,lang,'Die Quelle konnte nicht eindeutig zugeordnet werden.')}))};
}

export function segmentIn(s,lang) {
  const de=lang==='de';
  return {...s,label:(de?s.labelDe:s.label)||s.label,pain:(de?s.painDe:s.pain)||s.pain,
    question:(de?s.question:s.questionEn)||s.question,subject:(de?s.subject:s.subjectEn)||s.subject,role:(de?s.role:s.roleEn)||s.role};
}
export function accountIn(a,lang) {
  const de=lang==='de';
  return {...a,segment:{...a.segment,label:(de?a.segment.labelDe:a.segment.label)||a.segment.label},
    pain:(de?a.painDe:a.pain)||a.pain,question:(de?a.question:a.questionEn)||a.question,
    role:(de?a.role:a.roleEn)||a.role,targetRole:(de?a.targetRole:a.targetRoleEn)||a.targetRole,
    subject:(de?a.subject:a.subjectEn)??a.subject,body:(de?a.body:a.bodyEn)??a.body,
    holdReason:(de?a.holdReasonDe:a.holdReason)||a.holdReason,
    breakdown:a.breakdown.map(b=>({...b,label:de?(b.labelDe||b.label):b.label,reason:de?(b.reasonDe||b.reason):b.reason})),
    researchTriggers:(a.researchTriggers || []).map(t=>({...t,label:de?t.labelDe:t.label,description:de?t.descriptionDe:t.description,
      evidence:t.evidence.map(e=>({...e,reason:de?e.reasonDe:e.reason}))})),
    buyingSignals:(a.buyingSignals || []).map(b=>({...b,label:de?b.labelDe:b.label,description:de?b.descriptionDe:b.description,reason:de?b.reasonDe:b.reason}))};
}
