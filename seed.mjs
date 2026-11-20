// Undated pages have a null publication date. observedAt dates our own observation.
// Each entry covers a specific process, regardless of the parent group's other lines.
const observedAt = '2026-11-09';
const fact = (code, quote, sourceUrl) => ({ code, quote, ...(sourceUrl ? { sourceUrl } : {}) });
const signal = (name, domain, site, project, title, sourceUrl, date, quote, facts, contacts = []) => ({
  name, domain, site, project, title, sourceUrl, date, observedAt, quote, facts, contacts, origin: 'Curated research'
});

const spn = 'https://www.spn-drive.de/unternehmen/aktuellespresse/news/detailseite/spn-schwaben-praezision-investiert-ueber-eine-million-euro-in-neue-fertigungsmaschine';
const zt = 'https://www.zt-odenwald.de/2026/10/01/neue-hallen-fuer-die-zukunft-der-zerspanungstechnik/';
const eggersTeam = 'https://eggers-cnc.de/unternehmen/';
const rauSite = 'https://rau-ag.ch/location/';
const spaleckTeam = 'https://www.spaleck.de/kontakt/';
const spnSite = 'https://www.spn-drive.de/services/faq/fragen-informationen-zu-unseren-leistungen/werden-ihre-produkte-ausschliesslich-in-deutschland-gefertigt';

export const SEED = [
  signal('Koch Maschinenbau GmbH & Co. KG', 'kochmaschinenbau.de', 'Limbach-Oberfrohna, DE', 'Hermle C250',
    'Neue CNC-Fräsmaschine Hermle C250', 'https://www.kochmaschinenbau.de/2026/07/neue-cnc-fraesmaschine-hermle-c250/', '2026-07-02',
    'haben wir unseren Maschinenpark um eine neue 5-Achs-CNC-Fräsmaschine vom Typ Hermle C250 erweitert.',
    [fact('dach', '09212 Limbach-Oberfrohna', 'https://www.kochmaschinenbau.de/impressum/'),
      fact('cnc', '5-Achs-CNC-Fräsmaschine vom Typ Hermle C250'),
      fact('new_capacity', 'Mit dieser Investition erweitern wir unsere Fertigungskapazitäten'),
      fact('repeat_production', 'komplexer Einzelteile und Kleinserien')]),

  signal('SPALECK Präzisionstechnik', 'spaleck.de', 'Greiz, DE', 'POSmill H 800 U',
    'Mehr Fräskapazität für Präzisionsfrästeile',
    'https://www.spaleck.de/blog/mehr-fraeskapazitaet-fuer-praezisionsfraesteile/', '2026-07-07',
    'Mit der neuen 5-Achs-Bearbeitungsmaschine erweitert SPALECK gezielt die Fertigungskapazitäten für kleine und mittlere Präzisionsfrästeile.',
    [fact('dach', 'D-07973 Greiz', spaleckTeam), fact('cnc', '5-Achs-Bearbeitungsmaschine'),
      fact('new_capacity', 'erweitert SPALECK gezielt die Fertigungskapazitäten')]),

  signal('SPN Schwaben Präzision', 'spn-drive.de', 'Nördlingen, DE', 'INDEX R300',
    'SPN Schwaben Präzision investiert über eine Million Euro in neue Fertigungsmaschine', spn, '2026-10-08',
    'SPN hat in ein neues Dreh-Fräszentrum vom Typ INDEX R300 investiert und erweitert damit ihre Fertigungskapazitäten im Bereich Kegelradfräsen.',
    [fact('dach', 'Die wesentlichen Komponenten fertigen wir selbst in Nördlingen.', spnSite), fact('cnc', 'Dreh-Fräszentrum vom Typ INDEX R300'),
      fact('new_capacity', 'erweitert damit ihre Fertigungskapazitäten')]),

  signal('Alutronic Kühlkörper', 'alutronic.de', 'Halver, DE', 'CNC-Bearbeitung von Aluminiumprofilen',
    'Mechanische Bearbeitung', 'https://alutronic.de/mechanische-bearbeitung/', null,
    'Vom einfachen Profilabschnitt bis zur komplexen CNC-Bearbeitung: Wir bearbeiten Aluminiumprofile präzise nach Zeichnung',
    [fact('dach', '58553 Halver', 'https://alutronic.de/impressum/'), fact('cnc', 'komplexen CNC-Bearbeitung'),
      fact('high_mix', 'vom Prototyp und Kleinserienbedarf bis zur laufenden Serienfertigung'), fact('repeat_production', 'laufenden Serienfertigung')]),

  signal('Fietz Polyform GmbH', 'fietz.com', 'Burscheid, DE', 'Drehautomaten in Burscheid',
    'Maschinenbediener (m/w/d) für Drehautomaten',
    'https://fietz.com/jobs/maschinenbediener-mwd-fuer-drehautomaten', null,
    'Du füllst Material nach und überwachst den laufenden Produktionsprozess.',
    [fact('dach', '51399 Burscheid'), fact('cnc', 'hochpräzisen CNC-Drehmaschinen und Drehautomaten', 'https://fietz.com/kompetenzen/drehtechnik'),
      fact('extended_hours', 'Du bist bereit, im Zwei- oder Dreischichtbetrieb zu arbeiten')]),

  signal('Milltech GmbH', 'milltech.at', 'St. Marienkirchen, AT', 'CNC-Nachtschicht',
    'CNC Maschinenbediener – Dauernachtschicht', 'https://milltech.at/jobs/cnc-maschinenbediener-nachtschicht/', null,
    'CNC Maschinenbediener – Dauernachtschicht (M/W/D)',
    [fact('dach', 'Austria – Österreich'), fact('cnc', 'die Fertigung von Dreh- Bzw. Frästeilen auf modernsten CNC Maschinen'),
      fact('extended_hours', 'Schichtbereitschaft ( Dauernachtschicht )')]),

  signal('Schoeller-Bleckmann Precision Technology GmbH', 'sbot.co.at', 'Ternitz, AT', 'CNC-Zerspanung in Ternitz',
    'CNC-Zerspanungstechniker (m-w-d)', 'https://sbot.co.at/job/cnc-zerspanungstechniker-m-w-d/', '2026-10-19',
    'Bereitschaft zum 3-Schichtbetrieb und Mehrarbeit',
    [fact('dach', 'Ternitz, Niederösterreich, 2630, Österreich'), fact('cnc', 'Bedienen von CNC‑Dreh‑ und Fräsmaschinen'),
      fact('extended_hours', 'Bereitschaft zum 3-Schichtbetrieb und Mehrarbeit')]),

  signal('Rogenmoser Feinmechanik AG', 'rogenmoser-feinmechanik.ch', 'Neuheim, CH', 'CNC-Lohnfertigung',
    'CNC-Fertigung und mehr', 'https://www.rogenmoser-feinmechanik.ch/cnc-fertigung-und-mehr/', null,
    'Ob Einzelanfertigung, Prototypen, Kleinserien oder Grossserien: Rogenmoser Feinmechanik AG bietet Ihnen das ganze Spektrum der CNC-Lohnfertigung.',
    [fact('dach', 'CH-6345 Neuheim'), fact('cnc', 'CNC-Lohnfertigung'),
      fact('high_mix', 'Einzelanfertigung, Prototypen, Kleinserien oder Grossserien'), fact('repeat_production', 'Grossserien')]),

  signal('Lobba GmbH', 'lobba.at', 'Eggerding, AT', 'CNC-Drehen',
    'Lohnfertigung', 'https://www.lobba.at/leistungen/lohnfertigung/', null,
    'Mit modernster CNC Technik fertigen wir für unsere Kunden in Einzelfertigung, Kleinserien-Fertigung und Großserien-Fertigung Drehteile',
    [fact('dach', 'A-4773 Eggerding'), fact('cnc', 'CNC Technik'),
      fact('high_mix', 'Einzelfertigung, Kleinserien-Fertigung und Großserien-Fertigung'), fact('repeat_production', 'Großserien-Fertigung')]),

  signal('GFT e.U.', 'gft-cnc.at', 'Wels, AT', 'Lohnfertigung',
    'Drehen – Fräsen – Lohnfertigung', 'https://www.gft-cnc.at/leistungen/', null,
    'Wir sind Ihr Ansprechpartner für die Lohnfertigung von Einzelteilen und Serienfertigungen.',
    [fact('dach', 'A-4600 Wels'), fact('cnc', 'CNC-Fräsen'),
      fact('repeat_production', 'Serienfertigungen'), fact('high_mix', 'Lohnfertigung von Einzelteilen und Serienfertigungen')]),

  signal('Ralf Eggers CNC Dreh- und Frästechnik', 'eggers-cnc.de', 'Kiel, DE', 'Dreh- und Fräsmaschinen im Tätigkeitsprofil',
    'Produktionshelfer*in – Aufgaben', 'https://eggers-cnc.de/karriere/', null,
    'Bedienen von CNC-Dreh- und Fräsmaschinen, Teile einlegen, messen und kontrollieren.',
    [fact('dach', '24106 Kiel, Germany', eggersTeam), fact('cnc', 'CNC-Dreh- und Fräsmaschinen'),
      fact('manual_loading', 'Teile einlegen, messen und kontrollieren.')]),

  signal('ZT Odenwald GmbH', 'zt-odenwald.de', 'Erbach, DE', 'MAZAK Dreh- und Fräszentrum',
    'Neue Hallen für die Zukunft der Zerspanungstechnik', zt, '2026-10-01',
    'Dank Roboterautomation ermöglicht es den mannlosen Betrieb und die Komplettbearbeitung von Dreh-Frästeilen auf einer einzigen Maschine.',
    [fact('dach', 'D-64711 Erbach'), fact('cnc', 'Dreh- und Fräszentrums von MAZAK'),
      fact('automation_included', 'Dank Roboterautomation ermöglicht es den mannlosen Betrieb')]),

  signal('Rau AG', 'rau-ag.ch', 'Bülach, CH', '5-Achs-Fräsen mit 6-Achs-Roboter',
    'Kubische Teile', 'https://rau-ag.ch/production/cubic-machining/', null,
    'Komplexere Teile fertigen wir auf unseren 5-Achsen Fräsmaschinen mit Hilfe eines 6-Achsen Roboters auch in grossen Stückzahlen.',
    [fact('dach', '8180 Bülach', rauSite), fact('cnc', '5-Achsen Fräsmaschinen'),
      fact('robotic_assistance', 'mit Hilfe eines 6-Achsen Roboters'),
      fact('repeat_production', 'in grossen Stückzahlen')]),

  signal('BAUER Maschinen GmbH', 'bauer.de', 'Aresing, DE', 'Produktions- und Logistikhalle',
    'Erweiterung des BAUER-Werks in Aresing', 'https://equipment.bauer.de/de/spatenstich-im-werk-aresing', '2026-10-09',
    '22.000 m² große Halle für Materialwirtschaft, Vor- und Elektronikmontage, Qualitätssicherung und Versand',
    [fact('dach', 'BAUER-Werks in Aresing'), fact('new_capacity', 'Spatenstich für neue Produktions- und Logistikhalle')])
];

// Retain historic excerpts from the former job URLs. Both returned HTTP 404
// on direct verification; the active records above use current company pages.
SEED.find(account => account.domain === 'alutronic.de').signals = [{
  site: 'Halver, DE', project: 'CNC-Bearbeitung von Aluminiumteilen', title: 'CNC-Maschinenbediener/in (m/w/d)',
  sourceUrl: 'https://alutronic.de/de/unternehmen/karriere/', date: null, observedAt,
  sourceAvailability: 'unavailable', sourceCheckedAt: observedAt, sourceHttpStatus: 404,
  quote: 'Einlegen und Entnehmen von Aluminium-Teilen in die CNC-Maschinen',
  facts: [fact('dach', '58553 Halver', 'https://alutronic.de/impressum/'), fact('cnc', 'CNC-Maschinen'),
    fact('manual_loading', 'Einlegen und Entnehmen von Aluminium-Teilen in die CNC-Maschinen'),
    fact('extended_hours', '3-Schicht Betrieb inkl. Schichtzulagen für Spät- & Nachtschichten')]
}];
SEED.find(account => account.domain === 'fietz.com').signals = [{
  site: 'Burscheid, DE', project: 'CNC-Drehen in der Einzelteilfertigung', title: 'Maschinenbediener (m/w/d) CNC - Einzelteilfertigung',
  sourceUrl: 'https://fietz.com/jobs/maschinenbediener-mwd-fuer-drehautomaten-burscheid', date: null, observedAt,
  sourceAvailability: 'unavailable', sourceCheckedAt: observedAt, sourceHttpStatus: 404,
  quote: 'Werkstücke nach Vorgabe einlegen, spannen und entnehmen.',
  facts: [fact('dach', '51399 Burscheid'), fact('cnc', 'Eingerichtete CNC-Drehmaschinen in der Einzelteilfertigung bedienen und überwachen.'),
    fact('manual_loading', 'Werkstücke nach Vorgabe einlegen, spannen und entnehmen.')]
}];

// Eggers names a separate Hermle installation explicitly. Preserve this negative
// evidence alongside the job description: the latter does not name that machine.
SEED.find(account => account.domain === 'eggers-cnc.de').signals = [{
  site: 'Kiel, DE', project: 'Hermle-Fräszentrum', title: 'Firmengeschichte', sourceUrl: eggersTeam,
  date: null, observedAt, quote: 'Die modernste Roboterautomation von Hermle wurde 2024 in Betrieb genommen',
  facts: [fact('automated', 'Die modernste Roboterautomation von Hermle wurde 2024 in Betrieb genommen')]
}];

// Short paraphrases to reference a public observation in a draft without treating
// the observation as the recipient's stated problem. The original excerpts remain above.
const openings = {
  'kochmaschinenbau.de': 'in Ihrer Meldung vom 2. Juli beschreiben Sie die neue Hermle C250 für komplexe Einzelteile und kleine Serien. Mich interessiert, wie Sie die Teile bei wechselnden Aufträgen zuführen.',
  'spaleck.de': 'in Ihrem Bericht über den Standort Greiz habe ich gelesen, dass die neue POSmill H 800 U dort kleinere und mittlere Präzisionsfrästeile bearbeitet.',
  'spn-drive.de': 'Sie haben die Fertigung für Kegelräder um eine INDEX R300 erweitert. Mich interessiert, wie die Werkstücke bei wechselnden Aufträgen zur Maschine kommen.',
  'alutronic.de': 'Ihre Beschreibung der mechanischen Bearbeitung reicht vom Prototyp bis zur laufenden Serienfertigung von Aluminiumprofilen.',
  'fietz.com': 'in Ihrem Tätigkeitsprofil für die Drehautomaten in Burscheid nennen Sie das Nachfüllen von Material und die Bereitschaft zum Zwei- oder Dreischichtbetrieb.',
  'milltech.at': 'in Ihrer Beschreibung der CNC-Stelle für die Dauernachtschicht nennen Sie Dreh- und Fräsarbeiten.',
  'sbot.co.at': 'in Ihrem Tätigkeitsprofil für die Zerspanung in Ternitz nennen Sie große Werkstücke und die Bereitschaft zum Dreischichtbetrieb.',
  'rogenmoser-feinmechanik.ch': 'in Neuheim fertigen Sie sowohl Prototypen als auch Serien. Bei diesem Spektrum interessiert mich, welche Teile in ähnlicher Form wiederkehren.',
  'lobba.at': 'bei Ihnen in Eggerding reicht die Drehteilfertigung von Einzelstücken bis zu Großserien. Mich interessiert, wie sich die Teilezuführung bei diesen unterschiedlichen Losgrößen gestaltet.',
  'gft-cnc.at': 'Sie fertigen in Wels sowohl Einzelteile als auch Serien. Bei diesem Auftragsmix interessiert mich, wie oft dieselben Aufspannungen wiederkehren.',
  'eggers-cnc.de': 'bei Ihnen in Kiel ist die Hermle-Zelle bereits automatisiert. Daneben beschreiben Sie das Einlegen von Teilen im Tätigkeitsprofil für die Fertigungshilfe.'
};
for (const account of SEED) account.draftOpening = openings[account.domain] || '';
