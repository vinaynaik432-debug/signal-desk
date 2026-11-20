(() => {
  "use strict";

  const workspace = document.querySelector("#workspace");
  const accountDialog = document.querySelector("#account-dialog");
  const discoveryDialog = document.querySelector("#discovery-dialog");
  const toast = document.querySelector("#toast");
  const snapshot = window.SIGNAL_DESK_SNAPSHOT;
  const publicDemo = snapshot?.publicDemo === true;
  const german = {
    "Industrial automation research": "Recherche zur Industrieautomatisierung",
    "Current scope · CNC manufacturers in Germany, Austria and Switzerland.": "Aktueller Fokus · CNC-Fertigungsunternehmen in Deutschland, Österreich und der Schweiz.",
    "Research workspace": "Recherche-Arbeitsbereich",
    "Independent portfolio project · Vinay Naik": "Eigenständiges Portfolioprojekt · Vinay Naik",
    "Recorded research": "Gespeicherte Recherche",
    "Research priority": "Recherchepriorität",
    "Accounts with scored signals": "Unternehmen mit bewerteten Signalen",
    "Accounts on hold": "Zurückgestellte Unternehmen",
    "Unreviewed": "Noch nicht geprüft",
    "Explore recorded searches": "Gespeicherte Suchen erkunden",
    "Recorded searches": "Gespeicherte Suchen",
    "Choose a recorded search": "Eine gespeicherte Suche auswählen",
    "Open recorded results": "Gespeicherte Ergebnisse öffnen",
    "CNC night-shift staffing": "CNC-Personal für die Nachtschicht",
    "Manual CNC loading duties": "Manuelle CNC-Beladung im Aufgabenprofil",
    "Machining batch sizes": "Losgrößen in der Zerspanung",
    "Robot interface preparation": "Vorbereitung einer Roboterschnittstelle",
    "Recorded": "Erfasst am",
    "Account assessment": "Unternehmensbewertung",
    "Publication and observation dates appear in Sources.": "Veröffentlichungs- und Abrufdaten stehen unter Quellen.",
    "Recorded results. Exploring this demo makes no new provider requests.": "Gespeicherte Ergebnisse. Beim Erkunden dieser Demo werden keine neuen Anbieteranfragen ausgelöst.",
    "Original source links open external websites.": "Links zu Originalquellen öffnen externe Websites.",
    "Saved decisions show the outcome of that search. Account profiles show the later assessment date above.": "Gespeicherte Entscheidungen zeigen das Ergebnis der damaligen Suche. Firmenprofile zeigen den oben genannten späteren Bewertungsstand.",
    "Search results returned": "Zurückgegebene Suchergebnisse",
    "Original URLs selected": "Ausgewählte Original-URLs",
    "Original pages returned": "Zurückgegebene Originalseiten",
    "Missing original pages": "Fehlende Originalseiten",
    "Retained companies": "Übernommene Unternehmen",
    "Recorded page decisions": "Gespeicherte Seitenentscheidungen",
    "Results count unrecorded": "Ergebniszahl nicht erfasst",
    "Source stages": "Erfasste Suchschritte",
    "German web search": "Deutsche Websuche",
    "Original company pages": "Originale Unternehmensseiten",
    "SUCCEEDED": "Erfolgreich",
    "FAILED": "Fehlgeschlagen",
    "TIMED-OUT": "Zeitlimit erreicht",
    "ABORTED": "Abgebrochen",
    "All recorded activity": "Alle gespeicherten Aktivitäten",
    "Recorded search results": "Gespeicherte Suchergebnisse",
    "Clear search selection": "Suchauswahl zurücksetzen",
    "Selected recorded search": "Ausgewählte gespeicherte Suche",
    "No retained companies in this search.": "In dieser Suche wurden keine Unternehmen übernommen.",
    "Source timing": "Quellenzeitpunkt",
    "Priority breakdown": "Zusammensetzung der Priorität",
    "Source code on GitHub": "Quellcode auf GitHub",
    "valid": "gültig",
    "invalid": "ungültig",
    "unknown": "unbekannt",
    "accept_all": "Catch-all",
    "webmail": "Webmail",
    "disposable": "Wegwerfadresse",
    "Other process": "Anderer Prozess",
    "Scored scope": "Bewerteter Prozess",
    "company-wide signals supported": "Signale im Unternehmen belegt",
    "Actual search query": "Tatsächliche Suchanfrage",
    "Signals confirmed in this run": "In diesem Lauf belegte Signale",
    "reviewed excerpt": "manuell geprüfter Auszug",
    "Candidate · unverified": "Möglicher Hinweis · ungeprüft",
    "Evidence for this excerpt": "Status dieses Auszugs",
    "Submission deadline": "Angebotsfrist",
    "Recheck by": "Erneut prüfen bis",
    "Research triggers": "Recherchehinweise",
    "All research triggers": "Alle Recherchehinweise",
    "Filter by research trigger": "Nach Recherchehinweis filtern",
    "Operational evidence guides discovery questions and contributes zero buying-signal points.": "Betriebliche Hinweise helfen bei der Vorbereitung von Fragen. Sie bringen null Kaufsignalpunkte.",
    "Dated operational evidence": "Datierter betrieblicher Beleg",
    "Observed · publication date unknown": "Abgerufen · Veröffentlichungsdatum unbekannt",
    "Operating evidence": "Betrieblicher Hinweis",
    "Evidence needs review": "Beleg prüfen",
    "No saved evidence": "Kein Beleg gespeichert",
    "No research trigger confirmed on this page": "Auf dieser Seite ist kein Recherchehinweis belegt",
    "No recorded research trigger": "Kein Recherchehinweis erfasst",
    "Trigger check unrecorded": "Prüfung der Recherchehinweise nicht erfasst",
    "See catalog and evidence rules": "Katalog und Belegregeln ansehen",
    "View run results": "Suchergebnisse im Verlauf ansehen",
    "Retained accounts": "Übernommene Unternehmen",
    "Account at time of search": "Unternehmen zum Suchzeitpunkt",
    "New in this run": "In diesem Lauf neu",
    "Already in workspace": "Bereits im Arbeitsbereich",
    "Previous account status unrecorded": "Früherer Unternehmensstatus nicht erfasst",
    "Confirmed on retained pages": "Auf übernommenen Seiten belegt",
    "No buying signal confirmed": "Kein Kaufsignal belegt",
    "Signal check unrecorded": "Signalprüfung nicht erfasst",
    "Some page checks unrecorded": "Signalprüfung für einzelne Seiten nicht erfasst",
    "Exact provider query unrecorded": "Tatsächliche Suchanfrage beim Anbieter nicht erfasst",
    "Confirmed on this page": "Auf dieser Seite belegt",
    "No buying signal confirmed on this page": "Auf dieser Seite ist kein Kaufsignal belegt",
    "Original source title": "Originaltitel der Quelle",
    "Language": "Sprache",
    "Accounts": "Unternehmen",
    "Segments": "Segmente",
    "Signals": "Signale",
    "Buying signals": "Kaufsignale",
    "Run history": "Verlauf",
    "Workspace": "Arbeitsbereich",
    "Skip to workspace": "Zum Arbeitsbereich",
    "Loading account research…": "Unternehmensrecherche wird geladen…",
    "Language could not be loaded. Please retry.": "Die Sprache konnte nicht geladen werden. Bitte erneut versuchen.",
    "The service is unreachable. Please retry.": "Der Dienst ist nicht erreichbar. Bitte erneut versuchen.",
    "Account": "Unternehmen",
    "Account A–Z": "Unternehmen A–Z",
    "Account brief": "Firmenprofil",
    "Account discovery": "Unternehmenssuche",
    "Account research": "Hersteller recherchieren",
    "Account score": "Prioritätspunktzahl",
    "Account sections": "Profilbereiche",
    "Accounts in research": "Unternehmen in Recherche",
    "Accounts with contacts": "Unternehmen mit Kontakt",
    "Activity log": "Aktivitätsprotokoll",
    "Additional citation": "Weitere Quelle",
    "Additional evidence": "Weitere Belege",
    "Address from": "Adresse von",
    "All evidence": "Alle Belege",
    "All review stages": "Alle Prüfstatus",
    "All segments": "Alle Segmente",
    "Also found via": "Auch gefunden über",
    "Analyze this source": "Diese Quelle analysieren",
    "Analyze with Featherless": "Mit Featherless analysieren",
    "Analyzing source evidence…": "Quellenbelege werden analysiert…",
    "Analyzing…": "Analyse läuft…",
    "Apify actor charges are capped at $0.05 per run. Pages and qualifying companies can be fewer. Eligible pages go to Featherless for analysis.": "Pro Suchlauf gilt für den Apify-Actor ein Limit von 0,05 USD. Die Zahl der Seiten und geeigneten Unternehmen kann geringer ausfallen. Featherless analysiert geeignete Seiten.",
    "Apify discovery": "Über Apify gefunden",
    "Apify search": "Apify-Suche",
    "Automation documented": "Automatisierung belegt",
    "Awaiting a discovery question.": "Noch keine Gesprächsfrage hinterlegt.",
    "Awaiting a hypothesis.": "Noch keine Hypothese hinterlegt.",
    "Brief": "Kurzprofil",
    "Buying team": "Einkaufsteam",
    "Clear filters": "Filter zurücksetzen",
    "Clipboard unavailable": "Zwischenablage nicht verfügbar",
    "Clipboard unavailable. Select and copy the text in the panel.": "Zwischenablage nicht verfügbar. Bitte den Text im Bereich markieren und kopieren.",
    "Close": "Schließen",
    "Close account brief": "Firmenprofil schließen",
    "Close discovery": "Unternehmenssuche schließen",
    "Company website": "Unternehmenswebsite",
    "Contact lookup completed.": "Kontaktsuche abgeschlossen.",
    "Contact lookup requires a configured Hunter connection.": "Für die Kontaktsuche ist eine eingerichtete Hunter-Verbindung erforderlich.",
    "Contacts & draft": "Kontakte & Entwurf",
    "Copy brief": "Kurzprofil kopieren",
    "Copy draft": "Entwurf kopieren",
    "Could not load the workspace": "Arbeitsbereich konnte nicht geladen werden",
    "Discover accounts": "Unternehmen finden",
    "Discovering…": "Suche läuft…",
    "Discovery completed. Review the research queue or run history.": "Suche abgeschlossen. Ergebnisse stehen in der Firmenliste und im Verlauf.",
    "Discovery in progress": "Suche läuft",
    "Discovery question": "Gesprächsfrage",
    "Discovery requires configured search and analysis providers in the writable workspace.": "Die Suche erfordert eingerichtete Such- und Analysedienste im bearbeitbaren Arbeitsbereich.",
    "Draft": "Entwurf",
    "Draft paused while this account is on hold.": "Der Entwurf ist pausiert, solange das Unternehmen zurückgestellt ist.",
    "Draft recipient": "Empfänger des Entwurfs",
    "Email source": "Quelle der E-Mail-Adresse",
    "Enter at least three characters.": "Bitte mindestens drei Zeichen eingeben.",
    "Evidence analysis completed.": "Quellenanalyse abgeschlossen.",
    "Original source for this brief": "Originalquelle zum Kurzprofil",
    "Original title and excerpt": "Originaltitel und Originalauszug",
    "Original source excerpt": "Originalauszug",
    "Export demo": "Demo exportieren",
    "Extracted facts": "Extrahierte Angaben",
    "Fact": "Angabe",
    "Featherless analysis": "Featherless-Analyse",
    "Filter by review status": "Nach Prüfstatus filtern",
    "Filter by segment": "Nach Segment filtern",
    "Find manufacturers in Germany, Austria and Switzerland. Check how they load their CNC machines.": "Finden Sie Hersteller in Deutschland, Österreich und der Schweiz. Prüfen Sie, wie sie ihre CNC-Maschinen beschicken.",
    "First contact": "Erstkontakt",
    "Outreach template": "Ansprachevorlage",
    "Highest score first": "Höchste Punktzahl zuerst",
    "Hold": "Zurückgestellt",
    "Hunter confidence": "Hunter-Konfidenz",
    "Hunter verification": "Hunter-Prüfstatus",
    "Include a process and geography, or use a company-specific site query.": "Fertigungsverfahren und Region eingeben oder gezielt auf einer Unternehmenswebsite suchen.",
    "See which searches found manufacturers and which sources support each result.": "Sehen Sie, welche Suchanfragen zu Herstellern geführt haben und welche Quellen die Ergebnisse belegen.",
    "Linked sources": "Verknüpfte Quellen",
    "Look up named contacts with Hunter": "Ansprechpersonen mit Hunter suchen",
    "Look up with Hunter": "Mit Hunter suchen",
    "Looking up contacts for this account…": "Kontakte für dieses Unternehmen werden gesucht…",
    "Looking up…": "Suche läuft…",
    "Manual review stage": "Manueller Prüfstatus",
    "Manual review stage saved.": "Prüfstatus gespeichert.",
    "Manual review": "Manuelle Prüfung",
    "Manually prioritized": "Manuell priorisiert",
    "Market segments": "Marktsegmente",
    "Newest scored source": "Neueste bewertete Quelle",
    "No linked signal": "Kein verknüpfter Beleg",
    "No matching accounts": "Keine passenden Unternehmen",
    "No named contact saved. The segment suggests a role to research.": "Keine Ansprechperson gespeichert. Das Segment schlägt eine Zielrolle für die Recherche vor.",
    "No outreach draft available for this selection.": "Für diese Auswahl ist kein Entwurf verfügbar.",
    "No rationale supplied.": "Keine Begründung hinterlegt.",
    "No recorded runs": "Keine erfassten Läufe",
    "No score breakdown": "Keine Einzelbewertung",
    "No segment definitions": "Keine Segmentdefinitionen",
    "No source evidence": "Keine Quellenbelege",
    "Observed": "Abgerufen",
    "Open brief": "Kurzprofil öffnen",
    "Review original source": "Originalquelle prüfen",
    "Open source": "Quelle öffnen",
    "Outreach draft": "Nachrichtenentwurf",
    "Outreach is paused by manual review.": "Die Ansprache wurde bei der manuellen Prüfung pausiert.",
    "Pain hypothesis": "Hypothese zum Bedarf",
    "Partial result.": "Teilergebnis.",
    "Preparing draft…": "Entwurf wird erstellt…",
    "Prioritize": "Priorisieren",
    "Process / machine": "Verfahren / Maschine",
    "Provider request": "Dienstanfrage",
    "Provider requests and their outcomes appear here.": "Hier erscheinen die Anfragen an externe Dienste und ihre Ergebnisse.",
    "Provider-listed source": "Vom Anbieter genannte Quelle",
    "Public source": "Öffentliche Quelle",
    "Publication date unknown": "Veröffentlichungsdatum unbekannt",
    "Question to validate": "Frage zur Klärung",
    "Read original": "Original lesen",
    "Read-only workspace": "Schreibgeschützte Ansicht",
    "Recheck this source using Featherless": "Diese Quelle mit Featherless erneut prüfen",
    "Research": "In Recherche",
    "Research a market": "Markt recherchieren",
    "Research hold": "Recherche zurückgestellt",
    "Research needed": "Recherchebedarf",
    "Research queue": "Firmenliste",
    "Retry draft": "Entwurf erneut laden",
    "Review": "Prüfstatus",
    "Review required": "Prüfung erforderlich",
    "Compare production challenges by segment and choose a question for your first sales conversation.": "Vergleichen Sie mögliche Herausforderungen in der Fertigung und wählen Sie eine Frage für das Erstgespräch.",
    "Role reported by Hunter. Site assignment unconfirmed.": "Funktion laut Hunter. Die Zuordnung zum Standort ist unbestätigt.",
    "Independent role source": "Unabhängiger Beleg zur Funktion",
    "Found on a public page": "Auf einer öffentlichen Seite gefunden",
    "Inferred from the company’s email pattern": "Aus dem Adressmuster des Unternehmens abgeleitet",
    "Previously found. Current listing unconfirmed": "Früher gefunden. Der aktuelle Nachweis ist unbestätigt",
    "Email origin unconfirmed": "Herkunft der E-Mail-Adresse ungeklärt",
    "Address-discovery reference": "Fundstelle zur E-Mail-Adresse",
    "Source unavailable at verification": "Quelle bei der Prüfung nicht erreichbar",
    "Automation included in the project": "Automatisierung im Projektumfang",
    "Robot-assisted machining": "Robotergestützte Bearbeitung",
    "Named contacts can help route the conversation. Their authority for this project still needs confirmation.": "Die genannten Personen können bei der Zuordnung helfen. Ihre Entscheidungsbefugnis für dieses Projekt ist noch zu klären.",
    "Role reported by": "Funktion laut",
    "Role source": "Quelle zur Funktion",
    "Role unavailable": "Funktion unbekannt",
    "Role-based draft": "Allgemeiner Entwurf für die Zielrolle",
    "Run discovery": "Suche starten",
    "Saved accounts will appear here after discovery.": "Nach der Suche erscheinen hier gespeicherte Unternehmen.",
    "Saving review stage…": "Prüfstatus wird gespeichert…",
    "Score": "Punkte",
    "Scorecard": "Bewertung",
    "Scored evidence": "Bewerteter Beleg",
    "Scored process": "Bewerteter Prozess",
    "Scored source": "Bewertete Quelle",
    "Scores rank research priority for the cited process. Open a score to inspect fit and buying intent.": "Die Punktzahl priorisiert den beschriebenen Fertigungsprozess für die Recherche. Ein Klick zeigt Eignung und Hinweise auf Kaufinteresse.",
    "Search accounts or signals": "Unternehmen oder Signale suchen",
    "Search accounts, domains and signals": "Unternehmen, Domains und Signale durchsuchen",
    "Search depth": "Suchtiefe",
    "Search query": "Suchanfrage",
    "Searching public sources and analyzing evidence. You can close this panel while the request runs.": "Öffentliche Quellen werden durchsucht und ausgewertet. Dieses Fenster kann währenddessen geschlossen werden.",
    "Seen": "Abgerufen",
    "Segment": "Segment",
    "Segment definitions will appear here when available.": "Verfügbare Segmentdefinitionen erscheinen hier.",
    "Selected for account score": "Für die Unternehmensbewertung ausgewählt",
    "Set manual review stage": "Manuellen Prüfstatus festlegen",
    "Site": "Standort",
    "Snapshot": "Datenstand",
    "Sort queue": "Liste sortieren",
    "Source": "Quelle",
    "Source decisions": "Entscheidungen je Quelle",
    "Source not recorded": "Keine Quelle erfasst",
    "Source record": "Quellendatensatz",
    "Source result": "Suchergebnis",
    "Sources": "Quellen",
    "Subject unavailable": "Betreff nicht verfügbar",
    "Suggested role for this segment": "Empfohlene Rolle für dieses Segment",
    "Suggested role": "Empfohlene Rolle",
    "Supporting source": "Quelle zum Beleg",
    "The action completed. Reload the workspace to see the saved result.": "Aktion abgeschlossen. Arbeitsbereich neu laden, um das Ergebnis zu sehen.",
    "Automation is documented for this process.": "Für diesen Prozess ist Automatisierung dokumentiert.",
    "The request could not be completed.": "Die Anfrage konnte nicht abgeschlossen werden.",
    "The research queue is empty": "Die Firmenliste ist leer",
    "The service returned an unreadable response.": "Die Antwort des Dienstes ist nicht lesbar.",
    "There are no saved criteria for this account.": "Für dieses Unternehmen sind keine Bewertungskriterien gespeichert.",
    "These sources identify professional roles. Buying authority for this project still needs confirmation.": "Die Quellen dokumentieren berufliche Funktionen. Die Entscheidungsbefugnis für dieses Projekt ist noch zu klären.",
    "Try a different search or segment.": "Bitte eine andere Suche oder ein anderes Segment wählen.",
    "Try again": "Erneut versuchen",
    "Unclassified": "Unklassifiziert",
    "Unconfirmed": "Unbestätigt",
    "Unnamed contact": "Kontakt ohne Namen",
    "Up to 12 pages": "Bis zu 12 Seiten",
    "Up to 5 pages": "Bis zu 5 Seiten",
    "View": "Anzeigen",
    "View source record": "Quellendatensatz öffnen",
    "Workspace totals": "Kennzahlen des Arbeitsbereichs",
    "[Observation from the company’s source]": "[Beobachtung aus der Unternehmensquelle]",
    "at [Company]": "bei [Unternehmen]",
    "e.g. CNC machine loading in Germany": "z. B. CNC-Maschinenbeschickung in Deutschland",
    "A current, relevant application still needs to be established.": "Ein aktueller, relevanter Anwendungsfall muss noch belegt werden.",
    "A linked source is required to substantiate a signal.": "Um ein Signal zu belegen, wird eine verknüpfte Quelle benötigt.",
    "AI analysis requires a configured Featherless connection.": "Für die KI-Analyse ist eine eingerichtete Featherless-Verbindung erforderlich.",
    "Signal focus": "Signalschwerpunkt",
    "Any signal": "Alle Signale",
    "If this is relevant, we would be happy to look at a sample part together.": "Wenn das für Sie interessant ist, sehen wir uns gern ein Beispielteil gemeinsam an.",
    "Subject": "Betreff",
    "Hello [Name],": "Guten Tag [Name],",
    "Check what each buying signal requires and how many points the evidence earns.": "Prüfen Sie, welche Belege für ein Kaufsignal zählen und wie viele Punkte es dafür gibt.",
    "DACH location": "DACH-Standort",
    "CNC machining": "CNC-Bearbeitung",
    "New capacity": "Neue Kapazität",
    "Shift work": "Schichtarbeit",
    "Manual loading": "Manuelle Beladung",
    "Series production": "Serienfertigung",
    "High-mix work": "Variantenreiche Fertigung",
    "Installed automation": "Installierte Automatisierung",
    "Explicit interest": "Konkretes Interesse",
    "Source observation": "Quellenangabe",
    "Supported": "Belegt",
    "Historical / closed": "Historisch / abgeschlossen",
    "No current evidence": "Kein aktueller Beleg",
    "Published": "Veröffentlicht",
    "Signal assessment unavailable": "Signalbewertung nicht verfügbar",
    "The saved account has no signal matrix.": "Für dieses Unternehmen liegt keine Signalmatrix vor.",
    "Process unspecified": "Prozess nicht näher beschrieben",
    "signals supported": "Signale belegt",
    "effective signal points": "angerechnete Signalpunkte",
    "Signal": "Signal",
    "Evidence status": "Belegstatus",
    "Weight": "Gewicht",
    "Applied": "Wirksam",
    "Signal catalog unavailable": "Signalkatalog nicht verfügbar",
    "No signal definitions were returned.": "Keine Signaldefinitionen verfügbar.",
    "How to read the score": "So entsteht die Punktzahl",
    "Location and machining fit contribute up to 30 points. The strongest supported buying signal contributes up to 60, and corroborating evidence adds up to 10. When a process is held, its final priority is zero.": "Standort und Bearbeitungsverfahren bringen bis zu 30 Punkte. Das stärkste belegte Kaufsignal bringt bis zu 60 Punkte, ergänzende Belege bis zu 10. Ein zurückgestellter Prozess erhält insgesamt null Punkte.",
    "Weight is the signal’s maximum value. Applied points show its actual contribution for this process. Source links, dates and collection methods appear in each account.": "Das Gewicht gibt den Höchstwert eines Signals an. Die wirksamen Punkte zeigen seinen tatsächlichen Beitrag für den Prozess. Quellen, Datumsangaben und Erhebungsmethoden stehen im Firmenprofil.",
    "Signal catalog": "Signalkatalog",
    "definitions": "Definitionen",
    "Inspect all buying signals": "Alle Kaufsignale prüfen",
    "Curated research": "Manuell geprüfte Recherche",
    "company website": "Unternehmenswebsite",
    "source rule": "Quellenregel",
    "configured": "eingerichtet",
    "unavailable": "nicht verfügbar",
    "accounts": "Unternehmen",
    "account": "Unternehmen",
    "runs": "Läufe",
    "run": "Lauf",
    "points": "Punkte",
    "possible points": "mögliche Punkte",
    "adjustment": "Korrektur",
    "copied.": "kopiert.",
    "Assessed": "Bewertet am",
    "Reload the workspace to refresh saved results.": "Arbeitsbereich neu laden, um gespeicherte Ergebnisse zu sehen.",
    "Explain score for": "Bewertung anzeigen für",
    "Open brief for": "Kurzprofil öffnen für",
    "Request failed": "Anfrage fehlgeschlagen",
    "kept": "Übernommen",
    "skipped": "Übersprungen",
    "duplicate": "Duplikat",
    "Completed": "Abgeschlossen",
    "Running": "Läuft",
    "Waiting": "Ausstehend",
    "Partial": "Teilweise abgeschlossen",
    "Interrupted": "Unterbrochen",
    "Failed": "Fehlgeschlagen"
  };
  let language = snapshot?.initialLang === "de" ? "de" : "en";
  try {
    const saved = localStorage.getItem("signalDeskLanguage");
    if (saved === "de" || saved === "en") language = saved;
  } catch { /* File and private browsing contexts can restrict storage. */ }
  const t = key => language === "de" && Object.hasOwn(german,key) ? german[key] : key;
  const reviews = ["Research", "Prioritize", "Hold"];
  const views = ["accounts", "segments", "signals", "runs"];
  const tabs = { brief: "Brief", score: "Scorecard", signals:"Buying signals", sources: "Sources", outreach: "Contacts & draft" };
  const filters = { search: "", segment: "", review: "", trigger: "", order: "score" };
  let data = null;
  let selectedId = null;
  let selectedTab = "brief";
  let chosenContact = "";
  let currentDraft = null;
  let draftRequest = 0;
  let notice = "";
  let noticeIsError = false;
  let toastTimer;
  let busy = "";
  let busyAccount = "";
  let busySource = "";
  let pageLimit = 5;
  let signalFocus = "";
  let selectedRunId = "";
  let recordedChoice = "";
  let discoveryText = "CNC-Fräsmaschine Maschinenpark erweitert Kleinserien Deutschland";
  let discoveryMessage = "";
  let discoveryError = false;
  let loadingState = 0;

  const iconPaths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
    right: '<path d="m8 5 7 7-7 7"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    out: '<path d="M13 5h6v6m0-6-9 9M10 5H5v14h14v-5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1"/><path d="M15 8V4H4v12h4"/>',
    down: '<path d="M12 3v11m-5-5 5 5 5-5M4 16v4h16v-4"/>',
    gauge: '<path d="M3 16a9 9 0 0118 0M12 15l4-5"/><circle cx="12" cy="16" r="1"/>'
  };

  function catalog() {
    const rows = list(data?.signalCatalog);
    return rows.length ? rows : list(data?.accounts.find(item => list(item.buyingSignals).length)?.buyingSignals);
  }
  function triggerCatalog() { return list(data?.researchTriggerCatalog); }
  function focusLabel(id) {
    return [...catalog(),...triggerCatalog()].find(entry => entry.id === id)?.label || id;
  }
  function focusOptions() {
    const options = rows => rows.map(row => option(row.id,signalFocus,row.label)).join("");
    if (!triggerCatalog().length) return options(catalog());
    return '<optgroup label="' + t("Buying signals") + '">' + options(catalog()) + '</optgroup>' +
      '<optgroup label="' + t("Research triggers") + '">' + options(triggerCatalog()) + '</optgroup>';
  }
  function triggerRows(item) {
    const rows = new Map(triggerCatalog().map(row => [row.id,{...row,evidence:[]}]));
    for (const record of list(item.researchTriggers)) {
      if (!rows.has(record.id)) rows.set(record.id,{...record,evidence:[]});
      const evidence = list(record.evidence);
      if (evidence.length) rows.get(record.id).evidence.push(...evidence);
      else if (record.quote && record.sourceUrl) rows.get(record.id).evidence.push(record);
    }
    return [...rows.values()];
  }
  function currentTrigger(e) {
    return Boolean(e.sourceUrl && e.quote && ["dated","observed","confirmed","current"].includes(e.status));
  }
  function triggerStatus(e) {
    return t(({dated:"Dated operational evidence",observed:"Observed · publication date unknown",confirmed:"Supported",
      current:"Supported",historical:"Historical / closed",unknown:"Candidate · unverified"})[e.status] || "Candidate · unverified");
  }
  function accountTriggers(item) {
    if (!triggerCatalog().length && !list(item.researchTriggers).length) return "";
    const rows = triggerRows(item).sort((a,b) => Number(b.evidence.some(currentTrigger)) - Number(a.evidence.some(currentTrigger)));
    const records = rows.map(row => {
      const evidence = row.evidence.map(e => {
        const meta = [triggerStatus(e),t(e.origin || "Public source"),e.method && t(e.method),processScope(e),
          e.date && t("Published") + " " + humanDate(e.date),e.observedAt && t("Observed") + " " + humanDate(e.observedAt)];
        return '<div class="signal-proof"><p class="eyebrow">' + t("Original source excerpt") + '</p><blockquote>' + esc(e.quote) + '</blockquote>' +
          (e.contextQuote && e.contextQuote !== e.quote ? '<blockquote>' + esc(e.contextQuote) + '</blockquote>' : '') +
          (e.reason ? '<p class="small">' + esc(e.reason) + '</p>' : '') +
          '<p class="proof-meta">' + meta.filter(Boolean).map(esc).join(' · ') + '</p>' + external(e.sourceUrl,t("Review original source")) + '</div>';
      }).join("");
      const status = row.evidence.some(currentTrigger) ? t("Operating evidence") :
        row.evidence.length ? t("Evidence needs review") : t("No saved evidence");
      return '<details class="score-line trigger-rule" data-keep="trigger-' + esc(row.id) + '"><summary><span>' + esc(row.label) +
        '</span><span>' + status + '</span></summary><p>' + esc(row.description) + '</p>' + evidence + '</details>';
    }).join("");
    return '<section class="trigger-section"><h3>' + t("Research triggers") + '</h3><p class="plain">' + t("Operational evidence guides discovery questions and contributes zero buying-signal points.") +
      '</p><div class="score-rows">' + records + '</div></section>';
  }
  function triggerMethodology() {
    const rows = triggerCatalog();
    if (!rows.length) return "";
    return '<section class="panel trigger-section"><div class="panel-head"><h2>' + t("Research triggers") + '</h2><span class="counter">' + rows.length + ' ' + t("definitions") + '</span></div>' +
      '<p class="trigger-explainer plain">' + t("Operational evidence guides discovery questions and contributes zero buying-signal points.") + '</p><div class="catalog-list">' +
      rows.map(row => '<div class="catalog-row"><div><h3>' + esc(row.label) + '</h3><p class="plain">' + esc(row.description) + '</p></div><div><span class="eyebrow">' + t("Applied") + '</span><strong class="mono">0</strong></div></div>').join("") + '</div></section>';
  }

  function languageButtons() {
    return '<div class="language-control" role="group" aria-label="' + t("Language") + '">' +
      ["en","de"].map(code => '<button data-lang="' + code + '" lang="' + code + '" aria-label="' + (code === "en" ? "English" : "Deutsch") + '" aria-pressed="' + (language === code) + '">' + code.toUpperCase() + '</button>').join("") + '</div>';
  }
  function renderChrome() {
    document.documentElement.lang = language;
    const switcher = document.getElementById("language-control");
    switcher.innerHTML = languageButtons();
    switcher.removeAttribute("role");
    switcher.removeAttribute("aria-label");
    const navLabels = {accounts:"Accounts",segments:"Segments",signals:triggerCatalog().length ? "Signals" : "Buying signals",runs:"Run history"};
    document.querySelectorAll("[data-nav]").forEach(link => {link.textContent = t(navLabels[link.dataset.nav]);});
    document.querySelector("nav.nav").setAttribute("aria-label", t("Workspace"));
    document.querySelector(".brand").setAttribute("aria-label", "Signal Desk · " + t("Accounts"));
    document.querySelector("#project-credit").textContent = t("Independent portfolio project · Vinay Naik");
    document.querySelector("#source-code").textContent = t("Source code on GitHub");
    document.querySelector(".skip").textContent = t("Skip to workspace");
    document.querySelector(".loading-screen")?.replaceChildren(t("Loading account research…"));
  }
  async function changeLanguage(next) {
    if (!["en","de"].includes(next) || language === next) return;
    const previous = language;
    const activeTab = selectedTab;
    const openSections = [...document.querySelectorAll("details[open]")].map(d => d.dataset.keep).filter(Boolean);
    const scroll = accountDialog.querySelector(".detail")?.scrollTop || 0;
    draftRequest++;
    currentDraft = null;
    language = next;
    notice = ""; discoveryMessage = "";
    try {
      await load();
      if (language !== next) return;
      try {localStorage.setItem("signalDeskLanguage",next);} catch {}
      if (accountDialog.open) {selectedTab = activeTab; renderAccount();}
      if (discoveryDialog.open) renderDiscovery();
      document.querySelectorAll("details[data-keep]").forEach(d => {if (openSections.includes(d.dataset.keep)) d.open = true;});
      const detail = accountDialog.querySelector(".detail");
      if (detail) detail.scrollTop = scroll;
    } catch {
      if (language !== next) return;
      language = previous;
      renderChrome();
      const message = t("Language could not be loaded. Please retry.");
      if (accountDialog.open) {notice = message;noticeIsError = true;renderAccount();}
      else if (discoveryDialog.open) {discoveryMessage = message;discoveryError = true;renderDiscovery();}
      else announce(message);
    }
  }
  function factName(code) {
    const catalogEntry = catalog().find(entry => entry.id === code);
    return catalogEntry?.label || t(({dach:"DACH location",cnc:"CNC machining",new_capacity:"New capacity",extended_hours:"Shift work",manual_loading:"Manual loading",repeat_production:"Series production",high_mix:"High-mix work",automated:"Installed automation",automation_included:"Automation included in the project",robotic_assistance:"Robot-assisted machining",explicit_interest:"Explicit interest"})[code] || "Source observation");
  }
  function signalStatus(status) {
    return t(({confirmed:"Supported",historical:"Historical / closed",unknown:"No current evidence"})[status] || "No current evidence");
  }
  function evidenceBlock(e) {
    const channel = [e.inScoredScope === false ? t("Other process") : e.inScoredScope === true ? t("Scored scope") : "", t(e.origin || "Public source"),e.alsoDiscovered && (t("Also found via") + " " + e.alsoDiscovered),e.method && t(e.method)].filter(Boolean).join(" · ");
    const timing = [e.date && (t("Published") + " " + humanDate(e.date)),e.observedAt && (t("Observed") + " " + humanDate(e.observedAt)),e.deadline ? (t("Submission deadline") + " " + humanDate(e.deadline)) : e.expires && (t("Recheck by") + " " + humanDate(e.expires))].filter(Boolean).join(" · ");
    return '<div class="signal-proof"><p class="eyebrow">' + t("Original source excerpt") + '</p>' +
      (e.quote ? '<blockquote>' + esc(e.quote) + '</blockquote>' : '') +
      '<div class="proof-meta"><b>' + t("Evidence for this excerpt") + ' · ' + (e.status === "unknown" ? t("Candidate · unverified") : signalStatus(e.status)) + '</b><br>' + [channel,processScope(e),timing].filter(Boolean).map(esc).join(' · ') + '</div>' +
      external(e.sourceUrl,t("Review original source")) + '</div>';
  }
  function signalView(item) {
    const rank = {confirmed:2,historical:1,unknown:0};
    const records = [...list(item.buyingSignals)].sort((a,b) =>
      (b.points - a.points) || (rank[b.status] - rank[a.status]) || (list(b.evidence).length - list(a.evidence).length)
    );
    if (!records.length) return noData(t("Signal assessment unavailable"),t("The saved account has no signal matrix.")) + accountTriggers(item);
    const current = records.filter(s=>s.status === "confirmed").length;
    const supportedPoints = records.reduce((sum,s)=>sum + (Number(s.points) || 0),0);
    return '<div class="signal-intro"><p class="eyebrow">' + t("Scored process") + '</p><h3>' + esc(processScope(item) || t("Process unspecified")) + '</h3><p class="plain">' + esc(current) + ' / ' + records.length + ' ' + t("company-wide signals supported") + ' · ' + supportedPoints + ' ' + t("effective signal points") + '</p></div>' +
      '<div class="signal-grid"><div class="signal-line signal-head"><span>' + t("Signal") + '</span><span>' + t("Evidence status") + '</span><span>' + t("Weight") + '</span><span>' + t("Applied") + '</span></div>' +
      records.map(row => '<details class="signal-rule" data-keep="signal-' + esc(row.id) + '"><summary class="signal-line"><b>' + esc(row.label) + '</b><span class="signal-status st-' + esc(row.status) + '">' + esc(row.status === "unknown" && list(row.evidence).length ? t("Candidate · unverified") : signalStatus(row.status)) + '</span><span>' + esc(row.weight) + '</span><strong>' + esc(row.points ?? 0) + '</strong></summary><div class="signal-detail"><p>' + esc(row.description) + '</p><p class="small muted">' + esc(row.reason) + '</p>' + list(row.evidence).map(evidenceBlock).join("") + '</div></details>').join("") + '</div>' + accountTriggers(item);
  }
  function methodologyPage() {
    const rows = catalog();
    if (!rows.length) return '<div class="panel">' + noData(t("Signal catalog unavailable"),t("No signal definitions were returned.")) + '</div>';
    return '<div class="method-note panel"><h2>' + t("How to read the score") + '</h2><p>' +
      t("Location and machining fit contribute up to 30 points. The strongest supported buying signal contributes up to 60, and corroborating evidence adds up to 10. When a process is held, its final priority is zero.") +
      '</p><p>' + t("Weight is the signal’s maximum value. Applied points show its actual contribution for this process. Source links, dates and collection methods appear in each account.") + '</p></div>' +
      '<section class="panel"><div class="panel-head"><h2>' + t("Signal catalog") + '</h2><span class="counter">' + rows.length + ' ' + t("definitions") + '</span></div><div class="catalog-list">' +
      rows.map(row => '<div class="catalog-row"><div><h3>' + esc(row.label) + '</h3><p class="plain">' + esc(row.description) + '</p></div><div><span class="eyebrow">' + t("Weight") + '</span><strong class="mono">' + esc(row.weight) + '</strong></div></div>').join("") + '</div></section>' + triggerMethodology();
  }

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" aria-hidden="true">' + iconPaths[name] + '</svg>';
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch]));
  }
  function list(value) { return Array.isArray(value) ? value : []; }
  function uri(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }
  function external(value, label) {
    const url = uri(value);
    return url ? '<a class="source-link" target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + esc(label || new URL(url).hostname) + icon("out") + '</a>' : "";
  }
  function humanDate(value, withTime = false) {
    if (!value) return "";
    const iso = String(value);
    if (!withTime && /^\d{4}(-\d{2})?$/.test(iso)) return iso;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const options = { day:"numeric", month:"short", year:"numeric" };
    if (withTime) Object.assign(options, { hour:"2-digit", minute:"2-digit", timeZone:"Europe/Berlin", timeZoneName:"short" });
    else options.timeZone = "UTC";
    return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-GB",options).format(date);
  }
  function option(value, current, label) {
    return '<option value="' + esc(value) + '"' + (String(value) === String(current) ? ' selected' : '') + '>' + esc(label) + '</option>';
  }
  function noData(title, description, extra = "") {
    return '<div class="empty"><h3>' + esc(title) + '</h3><p>' + esc(description) + '</p>' + extra + '</div>';
  }
  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
  }
  function errMessage(error) { return error && error.message || t("The request could not be completed."); }
  async function request(path, body) {
    const options = { cache:"no-store", headers:{ Accept:"application/json" } };
    if (body !== undefined) {
      options.method = "POST";
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const address = new URL(path,location.href);
    address.searchParams.set("lang",language);
    let response;
    try { response = await fetch(address,options); }
    catch { throw new Error(t("The service is unreachable. Please retry.")); }
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || result?.message || ((t("Request failed") + " (") + response.status + ').'));
    if (!result) throw new Error(t("The service returned an unreadable response."));
    return result;
  }
  function view() {
    const current = location.hash.slice(1);
    return views.includes(current) ? current : "accounts";
  }
  function account() { return data?.accounts.find(item => String(item.id) === selectedId); }
  function reviewOf(item) { return reviews.includes(item.review) ? item.review : "Unreviewed"; }
  function scoreOf(item) { return Number.isFinite(Number(item.score)) && item.score != null ? Number(item.score) : null; }
  function displayScore(item) { return scoreOf(item) ?? "—"; }
  function priorityText(item) { return scoreOf(item) === null ? "—" : displayScore(item) + "/100"; }
  function getSegment(item) { return item.segment?.label || t("Unclassified"); }
  function reviewTag(value) { return '<span class="status ' + esc(value.toLowerCase()) + '">' + esc(t(value)) + '</span>'; }
  function sortedSignals(item) {
    return [...list(item.signals)].sort((a,b) => (Date.parse(b.date)||0) - (Date.parse(a.date)||0));
  }
  function scoredSource(item) {
    return list(item.signals).find(s => s.sourceUrl === item.sourceUrl);
  }
  function scopedSignals(item) {
    const selected = scoredSource(item);
    return selected ? [selected, ...sortedSignals(item).filter(s => s !== selected)] : sortedSignals(item);
  }
  function processScope(signal) {
    return [signal?.site,signal?.project].filter(Boolean).join(" · ");
  }
  function focusId(id) { document.getElementById(id)?.focus(); }
  function writable() { return !snapshot && Boolean(data?.writable); }
  function canRun(provider) { return writable() && Boolean(data.providers?.[provider]) && !busy; }
  function issue(text, error = false) {
    return text ? '<p class="notice' + (error ? ' error' : '') + '" role="' + (error ? 'alert' : 'status') + '">' + esc(text) + '</p>' : "";
  }

  async function load() {
    const counter = ++loadingState;
    const result = snapshot?.locales?.[language] || snapshot || await request("/api/state");
    if (counter !== loadingState) return;
    data = { ...result, accounts:list(result.accounts), segments:list(result.segments), runs:list(result.runs) };
    document.querySelector("#workspace-mode").textContent = publicDemo ? t("Recorded research") : snapshot && data.asOf ? (t("Snapshot") + " · ") + humanDate(data.asOf) : writable() ? t("Research workspace") : t("Read-only workspace");
    workspace.setAttribute("aria-busy","false");
    renderPage();
  }

  function actions() {
    const exportLink = writable() ? '<a class="btn secondary" href="/api/export?lang=' + language + '" download>' + icon("down") + (t("Export demo") + "</a>") : '';
    const discover = writable() ? '<button class="btn primary" data-action="discover">' + icon("plus") + (busy === "discover" ? t("Discovery in progress") : t("Discover accounts")) + '</button>' : '';
    const recorded = publicDemo ? '<button class="btn primary" data-action="recorded-discovery">' + icon("search") + t("Explore recorded searches") + '</button>' : '';
    return '<div class="action-row">' + exportLink + discover + recorded + '</div>';
  }
  function snapshotContext() {
    if (!snapshot) return "";
    const dates = [...new Set(recordedRuns().map(run => String(run.created || "").slice(0,10)).filter(Boolean))].sort();
    const recorded = dates.length ? '<span><b>' + t("Recorded searches") + '</b> · ' + dates.map(day => esc(humanDate(day))).join(' – ') + '</span>' : '';
    const assessedAt = data.asOf || data.assessedAt || snapshot.assessedAt;
    const assessment = assessedAt ? '<span><b>' + t("Account assessment") + '</b> · ' + esc(humanDate(assessedAt)) + '</span>' : '';
    return '<div class="snapshot-context"><div class="context-dates">' + recorded + assessment + '</div>' +
      (publicDemo ? '<p>' + t("Recorded results. Exploring this demo makes no new provider requests.") + '</p>' : '') + '</div>';
  }
  function intro(title, description) {
    return ('<div class="page-intro"><div><p class="kicker">' + t("Independent portfolio project · Vinay Naik") + "</p><h1>") + esc(title) + '</h1><p class="subhead">' + esc(description) + '</p></div>' + actions() + '</div>' + snapshotContext();
  }
  function metrics() {
    const sources = new Set(data.accounts.flatMap(item => list(item.signals).flatMap(signal => [signal.sourceUrl, ...list(signal.citations).map(c => c.sourceUrl), ...list(signal.facts).map(f => f.sourceUrl)]).filter(Boolean)));
    const activity = publicDemo ?
      [[data.accounts.filter(item => list(item.buyingSignals).some(signal => signal.points > 0)).length,t("Accounts with scored signals")],
        [data.accounts.filter(item => item.hold || item.review === "Hold").length,t("Accounts on hold")]] :
      [[data.accounts.filter(item => reviewOf(item) === "Prioritize").length,t("Manually prioritized")],
        [data.accounts.filter(item => list(item.contacts).length).length,t("Accounts with contacts")]];
    const values = [[data.accounts.length,t("Accounts in research")],[sources.size,t("Linked sources")],...activity];
    return ('<div class="metrics" aria-label="' + t("Workspace totals") + '">') + values.map(([number,label]) => '<div class="metric"><span class="metric-value">' + esc(number) + '</span><span class="metric-label">' + esc(label) + '</span></div>').join("") + '</div>';
  }
  function filterData() {
    const needle = filters.search.trim().toLocaleLowerCase();
    const items = data.accounts.filter(item => {
      const haystack = [item.name, item.domain, item.site, getSegment(item), ...list(item.signals).map(s => s.title)].filter(Boolean).join(" ").toLocaleLowerCase();
      return (!needle || haystack.includes(needle)) && (!filters.segment || item.segment?.id === filters.segment) && (!filters.review || reviewOf(item) === filters.review) &&
        (!filters.trigger || triggerRows(item).some(row => row.id === filters.trigger && row.evidence.some(currentTrigger)));
    });
    return items.sort((a,b) => {
      if (filters.order === "name") return String(a.name).localeCompare(String(b.name));
      if (filters.order === "recent") return (Date.parse(scoredSource(b)?.date)||0) - (Date.parse(scoredSource(a)?.date)||0);
      return (scoreOf(b) ?? -Infinity) - (scoreOf(a) ?? -Infinity) || String(a.name).localeCompare(String(b.name));
    });
  }
  function segmentChoices() {
    const choices = new Map(data.segments.map(segment => [segment.id,segment.label]));
    data.accounts.forEach(item => { if (item.segment?.id) choices.set(item.segment.id, getSegment(item)); });
    return [...choices].sort((a,b) => String(a[1]).localeCompare(String(b[1])));
  }
  function accountTable() {
    return ('<section class="panel" aria-labelledby="queue-title"><div class="panel-head"><h2 id="queue-title">' + t("Research queue") + '</h2><span class="counter" id="queue-count"></span></div><div class="filters">') +
      '<label class="search-box">' + icon("search") + ('<span class="sr">' + t("Search accounts, domains and signals") + '</span><input type="search" id="search" placeholder="' + t("Search accounts or signals") + '" value="') + esc(filters.search) + '"></label>' +
      ('<label><span class="sr">' + t("Filter by segment") + '</span><select id="segment-filter">') + option("",filters.segment,t("All segments")) + segmentChoices().map(([id,label]) => option(id,filters.segment,label)).join("") + '</select></label>' +
      ('<label><span class="sr">' + t("Filter by review status") + '</span><select id="review-filter">') + option("",filters.review,t("All review stages")) + ["Unreviewed",...reviews].map(value => option(value,filters.review,t(value))).join("") + '</select></label>' +
      (triggerCatalog().length ? '<label><span class="sr">' + t("Filter by research trigger") + '</span><select id="trigger-filter">' + option("",filters.trigger,t("All research triggers")) + triggerCatalog().map(row => option(row.id,filters.trigger,row.label)).join("") + '</select></label>' : '') +
      ('<label><span class="sr">' + t("Sort queue") + '</span><select id="sort">') + [["score",t("Highest score first")],["recent",t("Newest scored source")],["name",t("Account A–Z")]].map(([v,l]) => option(v,filters.order,l)).join("") + '</select></label></div><div id="queue-body"></div></section>';
  }
  function renderRows() {
    const target = document.querySelector("#queue-body");
    if (!target) return;
    const items = filterData();
    document.querySelector("#queue-count").textContent = items.length + " / " + data.accounts.length + " " + t("accounts");
    if (!items.length) {
      const action = data.accounts.length ? ('<button class="btn secondary" data-action="clear">' + t("Clear filters") + "</button>") : '';
      target.innerHTML = noData(data.accounts.length ? t("No matching accounts") : t("The research queue is empty"), data.accounts.length ? t("Try a different search or segment.") : t("Saved accounts will appear here after discovery."),action);
      return;
    }
    target.innerHTML = ('<div class="table-wrap"><table class="accounts-table"><colgroup><col class="col-account"><col class="col-segment"><col class="col-score"><col class="col-signal"><col class="col-review"><col class="col-go"></colgroup><thead><tr><th scope="col">' + t("Account") + '</th><th scope="col">' + t("Segment") + '</th><th scope="col">' + t("Research priority") + '</th><th scope="col" class="hide-small">' + t("Scored evidence") + '</th><th scope="col" class="hide-small">' + t("Review") + '</th><th scope="col" class="go-cell"><span class="sr">' + t("Open brief") + "</span></th></tr></thead><tbody>") +
      items.map(item => {
        const signal = scoredSource(item);
        const id = esc(item.id);
        return '<tr class="account-row" data-row="' + id + '"><td><button class="account-name text-btn" data-action="open" data-id="' + id + '">' + esc(item.name) + '</button><div class="domain">' + esc(item.domain || item.site) + '</div><div class="mobile-evidence">' + esc(item.hold ? item.holdReason || t("Research hold") : signal?.title || t("No linked signal")) + '</div></td><td class="segment-cell">' + esc(getSegment(item)) + '</td><td><button class="score" data-action="score" data-id="' + id + ('" aria-label="' + t("Explain score for") + " ") + esc(item.name) + '">' + esc(priorityText(item)) + icon("gauge") + '</button></td><td class="hide-small"><span class="signal-title">' + esc(signal?.title || t("No linked signal")) + '</span><div class="date">' + esc(signal?.date ? t("Published") + " " + humanDate(signal.date) : signal?.observedAt ? (t("Seen") + " ") + humanDate(signal.observedAt) : t("Publication date unknown")) + '</div></td><td class="hide-small">' + reviewTag(reviewOf(item)) + '</td><td class="go-cell"><button class="chev" data-action="open" data-id="' + id + ('" aria-label="' + t("Open brief for") + " ") + esc(item.name) + '">' + icon("right") + '</button></td></tr>';
      }).join("") + ('</tbody></table></div><div class="data-note">' + t("Scores rank research priority for the cited process. Open a score to inspect fit and buying intent.")) + (data.asOf ? (" " + t("Assessed") + " ") + esc(humanDate(data.asOf)) + '.' : '') + '</div>';
  }
  function segmentsPage() {
    if (!data.segments.length) return '<div class="panel">' + noData(t("No segment definitions"),t("Segment definitions will appear here when available.")) + '</div>';
    return '<div class="view-grid">' + data.segments.map(segment => {
      const count = data.accounts.filter(item => item.segment?.id === segment.id).length;
      return '<article class="segment-card"><h2>' + esc(segment.label) + ('</h2><div><p class="eyebrow">' + t("Pain hypothesis") + "</p><p>") + esc(segment.pain || t("Awaiting a hypothesis.")) + ('</p></div><div><p class="eyebrow">' + t("Discovery question") + "</p><p>") + esc(segment.question || t("Awaiting a discovery question.")) + '</p></div>' + (segment.subject ? ('<details class="segment-template"><summary>' + t("Outreach template") + "</summary><p><b>") + t("Subject") + '</b> · ' + esc(segment.subject) + ' ' + t("at [Company]") + '</p><p>' + t("Hello [Name],") + '</p><p>' + t("[Observation from the company’s source]") + '</p><p>' + esc(segment.question) + '</p><p>' + t("If this is relevant, we would be happy to look at a sample part together.") + '</p></details>' : '') + '<button class="link-btn" data-action="segment" data-id="' + esc(segment.id) + ('">' + t("View") + " ") + count + " " + t(count === 1 ? "account" : "accounts") + icon("arrow") + '</button></article>';
    }).join("") + '</div>';
  }
  function recordedAccountState(value) {
    if (value === "new") return t("New in this run");
    if (value === "existing") return t("Already in workspace");
    return t("Previous account status unrecorded");
  }

  function recordedRuns() {
    const choices = [
      {query:'Maschinenbediener CNC "Be- und Entladen" Stellenangebot',label:"Manual CNC loading duties"},
      {query:'CNC Fräser "Dauernachtschicht" Karriere',label:"CNC night-shift staffing"},
      {query:'CNC Drehteile "Losgrößen von" Stück Lohnfertigung',label:"Machining batch sizes"},
      {query:'CNC "Roboterschnittstelle" Maschinenpark Nachrüstung Fertigung',label:"Robot interface preparation"}
    ];
    const runs = [...list(data?.runs)].sort((a,b) => (Date.parse(b.created)||0) - (Date.parse(a.created)||0));
    return choices.flatMap(choice => {
      const run = runs.find(entry => (entry.searchQuery || String(entry.query || '').replace(/^(?:Discover|Recherche) · /,'')) === choice.query);
      return run ? [{...run,recordedLabel:choice.label}] : [];
    });
  }
  function runStageSummary(run) {
    const stages = list(run.stages);
    const decisions = list(run.decisions);
    const retained = new Set(decisions.filter(page => page.outcome === 'kept').map(page => page.accountId || page.domain).filter(Boolean)).size;
    const countLabels = [
      ['organicResults','Search results returned'],['originalUrlsSelected','Original URLs selected'],
      ['returnedPages','Original pages returned'],['missingPages','Missing original pages']
    ];
    const stageBlocks = stages.map(stage => {
      const counts = countLabels.filter(([key]) => Number.isFinite(stage[key]));
      if (!counts.length && !stage.stage && !stage.status) return '';
      return '<div class="recorded-stage"><p><b>' + esc(t(stage.stage || "Source")) + '</b>' +
        (stage.status ? ' <span class="small muted">· ' + esc(t(stage.status)) + '</span>' : '') +
        '</p><dl class="recorded-counts">' + counts.map(([key,label]) => '<div><dt>' + t(label) + '</dt><dd>' + esc(stage[key]) + '</dd></div>').join('') + '</dl></div>';
    }).join('');
    return '<div class="recorded-summary" aria-label="' + t("Source stages") + '">' +
      (stageBlocks || '<p class="small muted">' + t("Results count unrecorded") + '</p>') +
      '<dl class="recorded-counts outcome-counts"><div><dt>' + t("Recorded page decisions") + '</dt><dd>' + decisions.length + '</dd></div>' +
      '<div><dt>' + t("Retained companies") + '</dt><dd>' + (decisions.length ? retained : '—') + '</dd></div></dl></div>';
  }
  function renderRecordedDiscovery() {
    const runs = recordedRuns();
    if (!runs.some(run => run.id === recordedChoice)) recordedChoice = runs[0]?.id || "";
    const selected = runs.find(run => run.id === recordedChoice);
    discoveryDialog.innerHTML = '<div class="head-line"><div><p class="eyebrow">' + t("Recorded research") + '</p><h2 id="discovery-title">' + t("Explore recorded searches") + '</h2></div><div class="head-actions">' + languageButtons() +
      '<button class="icon-btn" data-action="close-discovery" aria-label="' + t("Close discovery") + '">' + icon("close") + '</button></div></div>' +
      '<p class="plain recorded-explainer">' + t("Recorded results. Exploring this demo makes no new provider requests.") + '</p>' +
      (selected ? '<label class="form-label" for="recorded-run-select">' + t("Choose a recorded search") + '</label><select id="recorded-run-select">' +
        runs.map(run => option(run.id,recordedChoice,t(run.recordedLabel))).join('') + '</select>' +
        '<div class="recorded-preview"><p class="eyebrow">' + t("Actual search query") + '</p><p class="recorded-query">' + esc(selected.searchQuery || selected.query) + '</p>' +
        '<p class="small muted recorded-date">' + t("Recorded") + ' · ' + esc(humanDate(selected.created,true)) + ' · ' + esc(selected.statusLabel || t(selected.status)) + '</p>' + runStageSummary(selected) + '</div>' :
        noData(t("No recorded runs"),t("Provider requests and their outcomes appear here."))) +
      '<p class="small muted">' + t("Original source links open external websites.") + '</p><div class="actions"><button class="btn secondary" data-action="close-discovery">' + t("Close") + '</button>' +
      (selected ? '<button class="btn primary" data-action="open-recorded-run">' + t("Open recorded results") + icon("arrow") + '</button>' : '') + '</div>';
  }
  function runAccounts(decisions, expanded = false) {
    const kept = new Map();
    for (const decision of decisions) {
      if (decision.outcome !== "kept") continue;
      const id = decision.accountId || decision.domain;
      if (!id) continue;
      if (!kept.has(id)) kept.set(id,[]);
      kept.get(id).push(decision);
    }
    if (!kept.size) return expanded && decisions.length ? '<p class="run-empty">' + t("No retained companies in this search.") + '</p>' : "";
    const eventHasTriggers = decisions.some(d => Array.isArray(d.researchTriggerIds));
    const rows = [...kept].map(([id,pages]) => {
      const account = data.accounts.find(item => item.id === id);
      const isNew = pages.some(page => page.accountState === "new");
      const isExisting = pages.some(page => page.accountState === "existing");
      const stateLabel = recordedAccountState(isNew ? "new" : isExisting ? "existing" : "");
      const checks = pages.filter(page => Array.isArray(page.signalIds));
      const signalIds = [...new Set(checks.flatMap(page => page.signalIds))];
      const signals = signalIds.map(id => catalog().find(signal => signal.id === id)?.label || id);
      const missing = checks.length < pages.length;
      const result = signals.length ? esc(signals.join(", ")) :
        checks.length === 0 ? t("Signal check unrecorded") : t("No buying signal confirmed");
      const more = missing && checks.length ? '<br><span class="small muted">' + t("Some page checks unrecorded") + '</span>' : '';
      const company = account ? '<button class="link-btn" data-action="open" data-id="' + esc(id) + '">' + esc(account.name) + '</button>' : esc(id);
      const triggerChecks = pages.filter(page => Array.isArray(page.researchTriggerIds));
      const triggers = [...new Set(triggerChecks.flatMap(page => page.researchTriggerIds))];
      const triggerResult = triggers.length ? triggers.map(id => esc(focusLabel(id))).join(", ") :
        triggerChecks.length ? t("No recorded research trigger") : t("Trigger check unrecorded");
      return '<tr><td>' + company + '</td><td>' + esc(stateLabel) + '</td><td>' + result + more + '</td>' +
        (eventHasTriggers ? '<td>' + triggerResult + '</td>' : '') + '</tr>';
    }).join("");
    return '<details class="run-trace"' + (expanded ? ' open' : '') + '><summary>' + t("Retained accounts") + ' (' + kept.size + ')</summary>' +
      '<div class="table-wrap"><table class="run-accounts"><thead><tr><th>' + t("Account") + '</th><th>' + t("Account at time of search") +
      '</th><th>' + t("Confirmed on retained pages") + '</th>' + (eventHasTriggers ? '<th>' + t("Research triggers") + '</th>' : '') + '</tr></thead><tbody>' + rows + '</tbody></table></div></details>';
  }
  function runsPage() {
    const entries = [...data.runs].filter(run => !selectedRunId || run.id === selectedRunId).sort((a,b) => (Date.parse(b.created)||0) - (Date.parse(a.created)||0));
    if (!entries.length) return '<div class="panel">' + noData(t("No recorded runs"),t("Provider requests and their outcomes appear here.")) + '</div>';
    const selectedNotice = selectedRunId ? '<div class="run-selection"><div><p class="eyebrow">' + t("Selected recorded search") + '</p><p class="small">' + t("Saved decisions show the outcome of that search. Account profiles show the later assessment date above.") + '</p></div><button class="btn secondary" data-action="clear-run-filter">' + t("Clear search selection") + '</button></div>' : '';
    return selectedNotice + ('<section class="panel"><div class="panel-head"><h2>' + t(selectedRunId ? "Recorded search results" : publicDemo ? "All recorded activity" : "Activity log") + '</h2><span class="counter">') + entries.length + (" " + t(entries.length === 1 ? "run" : "runs") + '</span></div><ul class="event-list">') + entries.map(run => {
      const decisions = list(run.decisions);
      const recorded = recordedRuns().find(entry => entry.id === run.id);
      const trace = decisions.map(d => {
        const saved = d.accountId && data.accounts.find(item => String(item.id) === String(d.accountId));
        const foundState = d.outcome === "kept" && d.accountState ? '<p class="small"><b>' + esc(recordedAccountState(d.accountState)) + '</b></p>' : "";
        const confirmed = Array.isArray(d.signalIds) ? '<p class="small muted">' +
          (d.signalIds.length ? t("Confirmed on this page") + ' · ' + d.signalIds.map(id => esc(catalog().find(s => s.id === id)?.label || id)).join(', ') : t("No buying signal confirmed on this page")) + '</p>' : "";
        return '<li><div class="row"><b>' + esc(d.title || d.domain || t("Source result")) + '</b><span class="small">' + esc(d.outcomeLabel || t(d.outcome)) + '</span></div>' +
          foundState + '<p class="small muted">' + esc(d.reason) + '</p>' + confirmed +
          (Array.isArray(d.researchTriggerIds) ? '<p class="small muted">' + (d.researchTriggerIds.length ? t("Research triggers") + ' · ' + d.researchTriggerIds.map(id => esc(focusLabel(id))).join(', ') : t("No research trigger confirmed on this page")) + '</p>' : '') + '<div class="action-row">' + external(d.sourceUrl,t("Review original source")) +
          (saved ? '<button class="link-btn" data-action="run-source" data-id="' + esc(saved.id) + '" data-source="' + esc(d.sourceUrl) + ('">' + t("View source record") + " ") + icon("arrow") + '</button>' : '') + '</div></li>';
      }).join("");
      return '<li><time class="small muted mono">' + esc(humanDate(run.created,true)) + '</time><div><strong class="run-title">' + esc(recorded ? t(recorded.recordedLabel) : run.query || t("Provider request")) + '</strong><p class="small muted">' + esc(run.message) + '</p>' +
        (run.searchQuery ? '<p class="small run-query"><b>' + t("Actual search query") + '</b><br><span class="recorded-query">' + esc(run.searchQuery) + '</span></p>' :
          /^(?:Discover|Recherche) · /.test(run.query || "") ? '<p class="small muted">' + t("Exact provider query unrecorded") + '</p>' : '') +
        (run.focus ? '<p class="small"><b>' + t("Signal focus") + '</b> · ' + esc(focusLabel(run.focus)) + '</p>' : '') +
        (Array.isArray(run.signalIds) && run.signalIds.length ? '<p class="small"><b>' + t("Signals confirmed in this run") + '</b> · ' + run.signalIds.map(id => esc(catalog().find(s => s.id === id)?.label || id)).join(', ') + '</p>' : '') +
        (selectedRunId || list(run.stages).length ? runStageSummary(run) : '') +
        runAccounts(decisions,Boolean(selectedRunId)) +
        (trace ? ('<details class="run-trace"' + (selectedRunId ? ' open' : '') + '><summary>' + t("Source decisions") + " (") + decisions.length + ')</summary><ul>' + trace + '</ul></details>' : '') + '</div><span class="status">' + esc(run.statusLabel || t(run.status)) + '</span></li>';
    }).join("") + '</ul></section>';
  }
  function renderPage() {
    if (!data) return;
    const active = view();
    renderChrome();
    document.querySelectorAll("[data-nav]").forEach(link => { if (link.dataset.nav === active) link.setAttribute("aria-current","page"); else link.removeAttribute("aria-current"); });
    if (active === "accounts") {
      workspace.innerHTML = intro(t("Industrial automation research"),t("Current scope · CNC manufacturers in Germany, Austria and Switzerland.")) + metrics() + accountTable();
      renderRows();
    } else if (active === "segments") {
      workspace.innerHTML = intro(t("Market segments"),t("Compare production challenges by segment and choose a question for your first sales conversation.")) + segmentsPage();
    } else if (active === "signals") {
      workspace.innerHTML = intro(t(triggerCatalog().length ? "Signals" : "Buying signals"),t("Check what each buying signal requires and how many points the evidence earns.")) + methodologyPage();
    } else {
      workspace.innerHTML = intro(t("Run history"),t("See which searches found manufacturers and which sources support each result.")) + runsPage();
    }
    document.title = "Signal Desk · " + ({ accounts:t("Industrial automation research"), segments:t("Market segments"), signals:t("Buying signals"), runs:t("Run history") }[active]);
  }

  function accountUrl(item) { return uri(item.site) || uri(item.domain ? "https://" + item.domain : ""); }
  function textBox(label, text) {
    return '<div><p class="eyebrow">' + esc(label) + '</p><p>' + esc(text || t("Unconfirmed")) + '</p></div>';
  }
  function accountHeader(item) {
    return ('<div class="drawer-head"><div class="head-line"><div><p class="eyebrow">' + t("Account brief") + '</p><h2 id="account-title">') + esc(item.name) + '</h2><div class="domain">' + (external(accountUrl(item),item.domain || t("Company website")) || esc(item.site)) + '</div></div><div class="head-actions">' + languageButtons() + ('<button class="icon-btn" data-action="close-account" aria-label="' + t("Close account brief") + '">') + icon("close") + ('</button></div></div></div><div class="tabs" role="group" aria-label="' + t("Account sections") + '">') + Object.entries(tabs).map(([key,label]) => '<button aria-pressed="' + (selectedTab === key) + '" data-action="tab" data-tab="' + key + '">' + esc(t(key === 'signals' && triggerCatalog().length ? 'Signals' : label)) + '</button>').join("") + '</div>';
  }
  function showHold(item) {
    if (!item.hold && item.review !== "Hold") return "";
    const reason = item.holdReason || (item.review === "Hold" ? t("Outreach is paused by manual review.") : item.segment?.id === "covered" ? t("Automation is documented for this process.") : t("A current, relevant application still needs to be established."));
    return issue((t("Research hold") + " · ") + reason);
  }
  function briefView(item) {
    const signal = scoredSource(item);
    const review = ('<div class="row"><div><p class="eyebrow">' + t("Manual review stage") + "</p>") + reviewTag(reviewOf(item)) + '</div>' +
      (writable() ? ('<label><span class="sr">' + t("Set manual review stage") + '</span><select id="manual-review" aria-label="' + t("Set manual review stage") + '"') + (busy ? ' disabled' : '') + '>' + option("",item.review || "",t("Unreviewed")) + reviews.map(value => option(value,item.review,t(value))).join("") + '</select></label>' : '') + '</div>';
    const site = item.site && !uri(item.site) && item.site !== item.domain ? textBox(t("Site"),item.site) : '';
    return '<div class="stack">' + showHold(item) + ('<div class="box alt"><div class="row"><div><p class="eyebrow">' + t("Segment") + "</p><h3>") + esc(getSegment(item)) + '</h3></div><button class="btn secondary" data-action="tab" data-tab="score">' + icon("gauge") + (t("Research priority") + " ") + esc(priorityText(item)) + '</button></div></div>' +
      '<div class="box pain-grid">' + textBox(t("Pain hypothesis"),item.pain) + textBox(t("Question to validate"),item.question) + textBox(t("Suggested role for this segment"),item.targetRole || item.role) + site + (item.project ? textBox(t("Process / machine"),item.project) : "") + '</div>' +
      (signal ? ('<div class="box"><p class="eyebrow">' + t("Original source for this brief") + "</p><h3>") + esc(signal.title || t("Public source")) + '</h3><p class="source-timing">' + esc(signal.date ? t("Published") + " " + humanDate(signal.date) : t("Publication date unknown")) +
        (signal.observedAt ? ' · ' + esc(t("Observed") + " " + humanDate(signal.observedAt)) : '') + '</p>' + (signal.quote ? '<blockquote>' + esc(signal.quote) + '</blockquote>' : '') + '<div class="row">' + external(signal.sourceUrl,t("Open source")) + ('<button class="link-btn" data-action="tab" data-tab="sources">' + t("All evidence") + " ") + icon("arrow") + '</button></div></div>' : '') +
      '<div class="box">' + review + '</div><div class="action-row"><button class="btn secondary" data-action="copy-brief">' + icon("copy") + (t("Copy brief") + "</button>") +
      (writable() ? ('<button class="btn secondary" title="' + t("Recheck this source using Featherless") + '" data-action="analyze"') + (!canRun("featherless") ? ' disabled' : '') + '>' + (busyAccount === selectedId && busy === "analyze" && busySource === item.sourceUrl ? t("Analyzing…") : t("Analyze with Featherless")) + '</button>' : '') + '</div>' +
      (writable() && !data.providers?.featherless ? ('<p class="small muted">' + t("AI analysis requires a configured Featherless connection.") + "</p>") : '') + '</div>';
  }
  function scoreView(item) {
    const rows = list(item.breakdown);
    return '<div class="score-head"><strong>' + esc(displayScore(item)) + '<small>/100</small></strong><span>' + t("Research priority") +
      (data.asOf ? '<br><span class="score-assessed">' + t("Assessed") + ' ' + esc(humanDate(data.asOf)) + '</span>' : '') + '</span></div>' + showHold(item) +
      (processScope(item) ? ('<p class="score-scope"><b>' + t("Scored process") + "</b> · ") + esc(processScope(item)) + '</p>' : '') +
      '<p class="small muted score-date-note">' + t("Publication and observation dates appear in Sources.") + '</p>' +
      (rows.length ? '<div class="priority-equation" aria-label="' + t("Priority breakdown") + '">' + rows.map((entry,index) => '<span><b>' + (index > 0 && entry.points >= 0 ? '+' : '') + esc(entry.points) + '</b><small>' + esc(entry.label) + '</small></span>').join('') + '<span class="equation-total"><b>= ' + esc(displayScore(item)) + '</b><small>' + t("Research priority") + '</small></span></div>' : '') +
      '<button class="btn secondary score-signals" data-action="tab" data-tab="signals">' + t("Inspect all buying signals") + icon("arrow") + '</button>' +
      (rows.length ? '<div class="score-rows">' + rows.map((entry,index) => '<details class="score-line"' + (index === 0 ? ' open' : '') + '><summary><span>' + esc(entry.label) + '</span><span>' + (entry.max === 0 ? esc(entry.points) + (" " + t("adjustment")) : esc(entry.points) + ' / ' + esc(entry.max)) + '</span></summary><p>' + esc(entry.reason || t("No rationale supplied.")) + '</p>' +
        (entry.quote ? '<blockquote>' + esc(entry.quote) + '</blockquote>' : '') + external(entry.sourceUrl,t("Supporting source")) + '</details>').join("") + '</div>' : noData(t("No score breakdown"),t("There are no saved criteria for this account.")));
  }
  function sourcesView(item) {
    const signals = scopedSignals(item);
    if (!signals.length) return noData(t("No source evidence"),t("A linked source is required to substantiate a signal."));
    return '<div class="stack">' + signals.map(signal => {
      const facts = list(signal.facts);
      const result = list(item.signalResults).find(r => r.sourceUrl === signal.sourceUrl);
      const scope = processScope(signal);
      const segment = segmentChoices().find(([id]) => id === result?.segment)?.[1] || ({covered:t("Automation documented"),research:t("Research needed")}[result?.segment]);
      const sourceNote = [
        signal.sourceUrl === item.sourceUrl ? t("Selected for account score") : t("Additional evidence"),
        scope,
        result && segment ? segment + " · " + result.score + (" " + t("points")) : ""
      ].filter(Boolean).join(" · ");
      const supporting = list(signal.citations).filter(c => c.sourceUrl && c.sourceUrl !== signal.sourceUrl);
      const provenance = [t(signal.origin), signal.alsoDiscovered && signal.origin !== 'Apify discovery' ? (t("Also found via") + " ") + signal.alsoDiscovered : '', signal.analysis, signal.model, signal.observedAt ? (t("Observed") + " ") + humanDate(signal.observedAt) : ""].filter(Boolean).join(" · ");
      return '<article class="box source-card" data-source="' + esc(signal.sourceUrl) + '" tabindex="-1"><div class="row"><p class="eyebrow">' + esc((signal.sourceUrl && uri(signal.sourceUrl) ? new URL(signal.sourceUrl).hostname : "") || t("Source record")) + '</p><time class="date">' + esc(humanDate(signal.date) || t("Publication date unknown")) + '</time></div><h3>' + esc(signal.title || t("Public source")) + '</h3>' +
        '<p class="small muted">' + t("Original title and excerpt") + '</p><p class="scope-note">' + esc(sourceNote) + '</p>' + (signal.quote ? '<blockquote>' + esc(signal.quote) + '</blockquote>' : '') + external(signal.sourceUrl,t("Read original")) + (signal.sourceAvailability === 'unavailable' ? '<p class="notice">' + t("Source unavailable at verification") + '</p>' : '') + (provenance ? '<p class="small muted provenance">' + esc(provenance) + '</p>' : '') + supporting.map(c => '<p>' + external(c.sourceUrl, c.title || t("Additional citation")) + '</p>').join("") +
        (facts.length ? ('<details class="detail-actions"><summary class="small">' + t("Extracted facts") + " (") + facts.length + ')</summary><ul class="fact-list">' + facts.map(fact => '<li><b>' + esc(factName(fact.code)) + '</b> · ' + esc(fact.quote) + (fact.method ? ' <span class="small muted">(' + esc(t(fact.method)) + ')</span>' : '') + ' ' + (fact.sourceUrl && fact.sourceUrl !== signal.sourceUrl ? external(fact.sourceUrl,t("Source")) : '') + '</li>').join("") + '</ul></details>' : '') +
        (writable() && signal.sourceUrl ? '<div class="detail-actions"><button class="btn secondary" data-action="analyze" data-source="' + esc(signal.sourceUrl) + '"' + (!canRun("featherless") ? ' disabled' : '') + '>' + (busy === "analyze" && busyAccount === selectedId && busySource === signal.sourceUrl ? t("Analyzing…") : t("Analyze this source")) + '</button></div>' : '') + '</article>';
    }).join("") + '</div>';
  }
  function evidenceLink(url, label) {
    const href = uri(url);
    if (!href) return "";
    const link = new URL(href);
    const domain = link.hostname.toLowerCase();
    const searchEngine = /^(?:www\.)?(?:google\.[a-z.]+|bing\.com|duckduckgo\.com|ecosia\.org|startpage\.com|baidu\.com|yandex\.[a-z.]+)$/.test(domain)
      || /^(?:search\.yahoo\.|search\.brave\.com$)/.test(domain);
    if (searchEngine || /^(?:\/[^/]+)?\/(?:search|suche|search-results)\/?$/i.test(link.pathname)) return "";
    return external(href,label);
  }
  function contactLabel(contact) { return contact.name || contact.email || t("Unnamed contact"); }
  function contactsView(item) {
    const contacts = list(item.contacts);
    const people = contacts.map(contact => {
      const provider = contact.roleProvider || contact.provider || t("Source not recorded");
      const hunterRole = provider.toLowerCase() === "hunter";
      const roleUrl = contact.independentRoleSourceUrl || (hunterRole ? "" : contact.roleSourceUrl || contact.sourceUrl);
      const roleEvidence = evidenceLink(roleUrl,hunterRole ? t("Independent role source") : t("Role source"));
      const roleNote = hunterRole ? t("Role reported by Hunter. Site assignment unconfirmed.") : t("Role reported by") + " " + t(provider);
      const emailProvider = contact.emailProvider || contact.provider || "";
      const isHunterAddress = emailProvider.toLowerCase() === "hunter";
      const origin = contact.emailProvenance || (isHunterAddress ? contact.provenance : "") || "";
      const emailOriginText = {
        found:"Found on a public page", inferred:"Inferred from the company’s email pattern",
        previously_found:"Previously found. Current listing unconfirmed"
      }[origin] || "Email origin unconfirmed";
      const emailLink = (!isHunterAddress || ["found","previously_found"].includes(origin))
        ? evidenceLink(contact.emailSourceUrl,isHunterAddress ? t("Address-discovery reference") : t("Email source")) : "";
      const emailDetails = [
        emailProvider && t("Address from") + " " + t(emailProvider),
        isHunterAddress && t(emailOriginText),
        contact.confidence != null && contact.confidence !== "" ? t("Hunter confidence") + " " + contact.confidence + "/100" : "",
        contact.verification && t("Hunter verification") + " " + t(contact.verification),
        contact.verificationDate && humanDate(contact.verificationDate)
      ].filter(Boolean).join(" · ");
      return '<div class="contact-card"><strong>' + esc(contactLabel(contact)) + '</strong><p>' + esc(contact.role || t("Role unavailable")) + '</p>' +
        '<p class="small muted">' + esc(roleNote) + (roleEvidence ? ' · ' + roleEvidence : '') + '</p>' +
        (contact.email ? '<p class="mono small contact-email">' + esc(contact.email) + '</p><p class="small muted">' + esc(emailDetails) + (emailLink ? ' · ' + emailLink : '') + '</p>' : '') + '</div>';
    }).join("");
    return '<div class="stack">' + showHold(item) + ('<div class="box"><div class="row"><div><p class="eyebrow">' + t("Suggested role for this segment") + "</p><h3>") + esc(item.targetRole || item.role || t("Buying team")) + '</h3></div>' +
      (writable() ? ('<button class="btn secondary" data-action="contacts" title="' + t("Look up named contacts with Hunter") + '"') + (!canRun("hunter") ? ' disabled' : '') + '>' + (busyAccount === selectedId && busy === "contacts" ? t("Looking up…") : t("Look up with Hunter")) + '</button>' : '') + '</div>' +
      (people ? ('<p class="small muted contact-context">' + t("Named contacts can help route the conversation. Their authority for this project still needs confirmation.") + "</p>") + people : ('<p class="plain">' + t("No named contact saved. The segment suggests a role to research.") + "</p>")) +
      (writable() && !data.providers?.hunter ? ('<p class="small muted">' + t("Contact lookup requires a configured Hunter connection.") + "</p>") : '') + '</div>' +
      ('<div class="box"><div class="row"><div><p class="eyebrow">' + t("Outreach draft") + "</p><h3>" + t("First contact") + "</h3></div>") +
      (!item.hold && item.review !== "Hold" && contacts.some(person => person.name) ? ('<label><span class="sr">' + t("Draft recipient") + '</span><select id="draft-recipient">') + option("",chosenContact,t("Role-based draft")) + contacts.filter(person => person.name).map(person => option(person.name,chosenContact,person.name)).join("") + '</select></label>' : '') + '</div><div id="draft-area"></div></div></div>';
  }
  function getSavedDraft(item) {
    return chosenContact ? item.draftByContact?.[chosenContact] : {subject:item.subject || "",body:item.body || ""};
  }
  function renderDraft(draft) {
    const area = accountDialog.querySelector("#draft-area");
    if (!area) return;
    if (!draft || (!draft.body && !draft.subject)) {
      area.innerHTML = ('<p class="plain">' + t("No outreach draft available for this selection.") + "</p>");
      return;
    }
    area.innerHTML = '<p class="draft-subject">' + esc(draft.subject || t("Subject unavailable")) + '</p><div class="draft-text">' + esc(draft.body) + '</div><button class="btn secondary" data-action="copy-draft">' + icon("copy") + (t("Copy draft") + "</button>");
  }
  async function fetchDraft() {
    const item = account();
    if (!item || selectedTab !== "outreach") return;
    const counter = ++draftRequest;
    const area = accountDialog.querySelector("#draft-area");
    if (item.hold || item.review === "Hold") {
      currentDraft = null;
      if (area) area.innerHTML = ('<p class="plain">' + t("Draft paused while this account is on hold.") + "</p>");
      return;
    }
    if (snapshot) { currentDraft = getSavedDraft(item); renderDraft(currentDraft); return; }
    currentDraft = null;
    if (area) area.innerHTML = ('<p class="small muted" role="status">' + t("Preparing draft…") + "</p>");
    try {
      const draft = await request("/api/draft?" + new URLSearchParams({ id:item.id, contact:chosenContact }));
      if (counter !== draftRequest || item.id !== account()?.id || selectedTab !== "outreach") return;
      currentDraft = draft;
      renderDraft(draft);
    } catch (error) {
      if (counter !== draftRequest || item.id !== account()?.id || selectedTab !== "outreach") return;
      if (area) area.innerHTML = issue(errMessage(error),true) + ('<button class="btn secondary detail-actions" data-action="retry-draft">' + t("Retry draft") + "</button>");
    }
  }
  function renderAccount() {
    const item = account();
    if (!item) return;
    if (chosenContact && !list(item.contacts).some(person => person.name === chosenContact)) chosenContact = "";
    const current = {brief:briefView,score:scoreView,signals:signalView,sources:sourcesView,outreach:contactsView}[selectedTab];
    accountDialog.innerHTML = accountHeader(item) + '<div class="detail"><div class="stack">' + issue(notice,noticeIsError) + '<div>' + current(item) + '</div></div></div>';
    if (selectedTab === "outreach") fetchDraft();
  }
  function openAccount(id, tabName = "brief") {
    selectedId = String(id);
    selectedTab = tabs[tabName] ? tabName : "brief";
    if (!account()) return;
    notice = "";
    chosenContact = "";
    currentDraft = null;
    renderAccount();
    if (!accountDialog.open) accountDialog.showModal();
    accountDialog.querySelector('[data-action="close-account"]')?.focus();
  }
  function switchTab(tabName) {
    if (!tabs[tabName]) return;
    selectedTab = tabName;
    notice = "";
    renderAccount();
    accountDialog.querySelector('.tabs [data-tab="' + tabName + '"]')?.focus();
  }

  function renderDiscovery() {
    if (publicDemo) { renderRecordedDiscovery(); return; }
    const canSearch = writable() && data.providers?.apify && data.providers?.featherless;
    const running = busy === "discover";
    discoveryDialog.innerHTML = ('<div class="head-line"><div><p class="eyebrow">' + t("Account discovery") + '</p><h2 id="discovery-title">' + t("Research a market") + '</h2></div><div class="head-actions">') + languageButtons() + ('<button class="icon-btn" data-action="close-discovery" aria-label="' + t("Close discovery") + '">') + icon("close") + '</button></div></div>' +
      ('<form id="discover-form"><label class="form-label" for="query">' + t("Search query") + '</label><textarea id="query" name="query" required minlength="3" maxlength="260" placeholder="' + t("e.g. CNC machine loading in Germany") + '"') + (running ? ' disabled' : '') + '>' + esc(discoveryText) + ('</textarea><p class="small muted">' + t("Include a process and geography, or use a company-specific site query.") + "</p>") +
      '<div class="discovery-focus"><label for="discovery-focus" class="form-label">' + t("Signal focus") + '</label><select id="discovery-focus"' + (running ? ' disabled' : '') + '>' + option("",signalFocus,t("Any signal")) + focusOptions() + '</select></div>' +
      ('<div class="discovery-depth"><label for="discovery-depth" class="form-label">' + t("Search depth") + '</label><select id="discovery-depth"') + (running ? ' disabled' : '') + '>' + option(5,pageLimit,t("Up to 5 pages")) + option(12,pageLimit,t("Up to 12 pages")) + ('</select></div><p class="small muted">' + t("Apify actor charges are capped at $0.05 per run. Pages and qualifying companies can be fewer. Eligible pages go to Featherless for analysis.") + "</p>") +
      ('<div class="provider-line"><span><b>' + t("Apify search") + "</b> · ") + (data.providers?.apify ? t("configured") : t("unavailable")) + ("</span><span><b>" + t("Featherless analysis") + "</b> · ") + (data.providers?.featherless ? t("configured") : t("unavailable")) + '</span></div>' +
      (discoveryMessage ? '<div class="detail-actions">' + issue(discoveryMessage,discoveryError) +
        (!running && data.runs.length ? '<button type="button" class="link-btn results-link" data-action="view-runs">' + t("View run results") + icon("arrow") + '</button>' : '') + '</div>' : '') +
      (!canSearch ? ('<p class="notice detail-actions">' + t("Discovery requires configured search and analysis providers in the writable workspace.") + "</p>") : '') +
      ('<div class="actions"><button class="btn secondary" type="button" data-action="close-discovery">' + t("Close") + '</button><button class="btn primary" type="submit"') + (!canSearch || busy ? ' disabled' : '') + '>' + icon("search") + (running ? t("Discovering…") : t("Run discovery")) + '</button></div></form>';
  }
  async function runDiscovery() {
    if (busy || !writable()) return;
    const query = discoveryDialog.querySelector("#query");
    const text = query.value.trim();
    if (text.length < 3) { query.setCustomValidity(t("Enter at least three characters.")); query.reportValidity(); return; }
    discoveryText = text;
    busy = "discover";
    const requestedLang = language;
    discoveryMessage = t("Searching public sources and analyzing evidence. You can close this panel while the request runs.");
    discoveryError = false;
    renderDiscovery();
    renderPage();
    let interval;
    try {
      interval = setInterval(() => { if (view() === "runs") load().catch(() => {}); },15000);
      const result = await request("/api/discover",{query:text,pageLimit,...(signalFocus ? {focus:signalFocus} : {})});
      discoveryMessage = (result.partial ? (t("Partial result.") + " ") : "") + ((requestedLang === language && result.message) || t("Discovery completed. Review the research queue or run history."));
    } catch (error) {
      discoveryMessage = requestedLang === language ? errMessage(error) : t("The request could not be completed.");
      discoveryError = true;
    } finally {
      clearInterval(interval);
      busy = "";
      try { await load(); } catch { discoveryMessage += (" " + t("Reload the workspace to refresh saved results.")); renderPage(); }
      if (discoveryDialog.open) renderDiscovery(); else announce(discoveryMessage);
      if (accountDialog.open) renderAccount();
    }
  }
  async function accountMutation(action, payload = {}) {
    const item = account();
    if (!item || !writable() || busy) return;
    const id = String(item.id);
    busy = action;
    const requestedLang = language;
    busyAccount = id;
    busySource = payload.sourceUrl || item.sourceUrl || "";
    notice = action === "contacts" ? t("Looking up contacts for this account…") : action === "analyze" ? t("Analyzing source evidence…") : t("Saving review stage…");
    noticeIsError = false;
    renderAccount();
    let saved = false;
    try {
      const result = await request("/api/" + action,{id:item.id,...payload});
      saved = true;
      await load();
      if (selectedId === id) notice = (requestedLang === language && result.message) || ({contacts:t("Contact lookup completed."),analyze:t("Evidence analysis completed."),review:t("Manual review stage saved.")}[action]);
    } catch (error) {
      if (selectedId === id) { notice = saved ? t("The action completed. Reload the workspace to see the saved result.") : requestedLang === language ? errMessage(error) : t("The request could not be completed."); noticeIsError = true; }
    } finally {
      busy = "";
      busyAccount = "";
      busySource = "";
      if (accountDialog.open) renderAccount();
      if (discoveryDialog.open) renderDiscovery();
    }
  }
  async function copyText(value, label) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error(t("Clipboard unavailable"));
      await navigator.clipboard.writeText(value);
    } catch {
      const node = document.createElement("textarea");
      node.value = value;
      node.style.cssText = "position:fixed;left:-99999px;top:0";
      (accountDialog.open ? accountDialog : document.body).appendChild(node);
      node.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { /* Use selectable text when clipboard access is unavailable. */ }
      node.remove();
      if (!copied) { notice = t("Clipboard unavailable. Select and copy the text in the panel."); noticeIsError = true; renderAccount(); return; }
    }
    notice = t(label) + " " + t("copied.");
    noticeIsError = false;
    if (accountDialog.open) {
      const section = accountDialog.querySelector(".detail");
      const confirmation = document.createElement("p");
      confirmation.className = "small";
      confirmation.setAttribute("role","status");
      confirmation.textContent = notice;
      section.querySelector(".copy-confirmation")?.remove();
      confirmation.classList.add("copy-confirmation");
      section.appendChild(confirmation);
      confirmation.scrollIntoView({block:"nearest"});
    } else announce(notice);
  }
  function briefText(item) {
    const lines = [item.name, (t("Segment") + " · ") + getSegment(item), (t("Research priority") + " · ") + priorityText(item), (t("Manual review") + " · ") + t(reviewOf(item))];
    if (processScope(item)) lines.push((t("Scored process") + " · ") + processScope(item));
    if (item.pain) lines.push((t("Pain hypothesis") + " · ") + item.pain);
    if (item.question) lines.push((t("Discovery question") + " · ") + item.question);
    if (item.targetRole || item.role) lines.push((t("Suggested role") + " · ") + (item.targetRole || item.role));
    if (item.hold) lines.push((t("Hold") + " · ") + (item.holdReason || t("Review required")));
    scopedSignals(item).forEach(signal => lines.push("", (signal.sourceUrl === item.sourceUrl ? (t("Scored source") + " · ") : (t("Additional evidence") + " · ")) + String(signal.title || t("Public source")), processScope(signal), signal.quote || "", uri(signal.sourceUrl)));
    return lines.filter(line => line !== undefined).join("\n");
  }
  function resetFilters() {
    Object.assign(filters,{search:"",segment:"",review:"",trigger:"",order:"score"});
    renderPage();
  }

  document.addEventListener("click",event => {
    const langButton = event.target.closest("[data-lang]");
    if (langButton) { changeLanguage(langButton.dataset.lang); return; }
    const button = event.target.closest("[data-action]");
    if (!button) {
      const row = event.target.closest("tr[data-row]");
      if (row && !event.target.closest("a,button")) openAccount(row.dataset.row);
      return;
    }
    if (button.disabled) return;
    const action = button.dataset.action;
    if (action === "open" || action === "score") openAccount(button.dataset.id,action === "score" ? "score" : "brief");
    if (action === "run-source") {
      openAccount(button.dataset.id,"sources");
      const target = [...accountDialog.querySelectorAll(".source-card")].find(card => card.dataset.source === button.dataset.source);
      if (target) target.focus();
    }
    if (action === "close-account") accountDialog.close();
    if (action === "close-discovery") discoveryDialog.close();
    if (action === "view-runs") {
      discoveryDialog.close();
      location.hash = "runs";
      renderPage();
      workspace.querySelector(".event-list summary")?.focus();
    }
    if (action === "tab") switchTab(button.dataset.tab);
    if (action === "clear") resetFilters();
    if (action === "segment") { Object.assign(filters,{search:"",segment:button.dataset.id,review:"",trigger:""}); location.hash = "accounts"; renderPage(); }
    if (action === "discover" || action === "recorded-discovery") {
      renderDiscovery(); if (!discoveryDialog.open) discoveryDialog.showModal(); if (!busy) focusId("query");
      if (publicDemo) focusId("recorded-run-select");
    }
    if (action === "open-recorded-run" && publicDemo && recordedRuns().some(run => run.id === recordedChoice)) {
      selectedRunId = recordedChoice;
      discoveryDialog.close();
      location.hash = "runs";
      renderPage();
      workspace.querySelector('[data-action="clear-run-filter"]')?.focus();
    }
    if (action === "clear-run-filter") { selectedRunId = ""; renderPage(); }
    if (action === "contacts") accountMutation(action);
    if (action === "analyze") accountMutation(action, {sourceUrl:button.dataset.source || account()?.sourceUrl});
    if (action === "copy-brief" && account()) copyText(briefText(account()),t("Account brief"));
    if (action === "copy-draft" && currentDraft) copyText([currentDraft.subject,currentDraft.body].filter(Boolean).join("\n\n"),t("Draft"));
    if (action === "retry-draft") fetchDraft();
    if (action === "retry-load") boot();
  });
  document.addEventListener("input",event => {
    if (event.target.id === "search") { filters.search = event.target.value; renderRows(); }
    if (event.target.id === "query") { discoveryText = event.target.value; event.target.setCustomValidity(""); }
  });
  document.addEventListener("change",event => {
    const id = event.target.id;
    const value = event.target.value;
    if (id === "segment-filter" || id === "review-filter" || id === "trigger-filter" || id === "sort") {
      filters[{"segment-filter":"segment","review-filter":"review","trigger-filter":"trigger",sort:"order"}[id]] = value;
      renderRows();
    }
    if (id === "manual-review" && (reviews.includes(value) || value === "")) accountMutation("review",{status:value});
    if (id === "recorded-run-select" && publicDemo) { recordedChoice = value; renderRecordedDiscovery(); focusId("recorded-run-select"); }
    if (id === "discovery-depth") pageLimit = Number(value) === 12 ? 12 : 5;
    if (id === "discovery-focus") signalFocus = value;
    if (id === "draft-recipient") { chosenContact = value; fetchDraft(); }
  });
  document.addEventListener("submit",event => {
    if (event.target.id === "discover-form") { event.preventDefault(); runDiscovery(); }
  });
  window.addEventListener("hashchange",renderPage);
  for (const dlg of [accountDialog,discoveryDialog]) {
    dlg.addEventListener("click",event => {
      if (event.target !== dlg) return;
      const rect = dlg.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dlg.close();
    });
  }
  accountDialog.addEventListener("close",() => { draftRequest++; currentDraft = null; });
  async function boot() {
    try { await load(); }
    catch (error) {
      workspace.setAttribute("aria-busy","false");
      workspace.innerHTML = ('<div class="page-intro"><h1>' + t("Account research") + '</h1></div><div class="panel">') + noData(t("Could not load the workspace"),errMessage(error),('<button class="btn secondary" data-action="retry-load">' + t("Try again") + "</button>")) + '</div>';
    }
  }
  renderChrome();
  boot();
})();
