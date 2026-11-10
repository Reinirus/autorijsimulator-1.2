# Nederlandse Autorijsimulator — Milestone 5B ontwikkelversie

**DEMO — NIET CBR-GECERTIFICEERD. Geen vervanging voor rijles.** Milestone 1 blijft formeel open voor hardware- en duurtests. De gebruiker heeft de ontwikkeling van Milestone 2 en 3 uitdrukkelijk toegestaan terwijl die acceptatie openstaat.

## Milestone 5B — bewegende gevaarherkenning

De knop **Gevaarherkenning in beweging** opent tien korte 3D-situaties. Kies leerstand met uitleg of oefentoets met uitleg achteraf. Bekijk de film en doorloop Kijk, Voorspel en Beslis. De rijmissie wacht tijdens de les; pauze/herhaling en toetsenbordbediening zijn beschikbaar. Alleen het laatste complete anonieme resultaat wordt lokaal bewaard. Conceptinhoud, nog niet menselijk juridisch of didactisch gevalideerd.

Alle tien rijmissies en vijftien M5A-vragen blijven behouden. Actuele controles en beperkingen: docs/M5B_TESTVERSLAG.md. Alleen concept-PR naar milestone-5-theorie-inzicht na groene CI; niet mergen of publiceren.

## Milestone 5A

Branch milestone-5-theorie-inzicht voegt de knop **Theorie & gevaarherkenning** toe aan de behouden tien rijmissies. Kies Verkeersregels, Gevaarherkenning, Verkeersinzicht of alle onderwerpen. Oefenen geeft direct uitleg; oefentoets geeft het volledige rapport achteraf. De vijftien tekstvragen zijn eigen conceptmateriaal, niet menselijk juridisch of didactisch gevalideerd. Geen officiële CBR-toets of slaaggrens.

Theorie pauzeert de rit. Het laatste complete resultaat wordt anoniem lokaal opgeslagen; een geblokkeerde opslag verhindert oefenen niet. CSV-export is aanwezig, maar daadwerkelijke bestandsdownloads worden in deze Windows-testomgeving geannuleerd. Lint/typecheck/build, 186 unit-tests en 13 productie-subpadtests slagen; volledige Chromium-suite: 53/55, beide fouten zijn strikte downloads. Zie docs/M5_TESTVERSLAG.md en docs/M5_VOORTGANG.md. Alleen een concept-PR naar de M4-branch na groene CI; niet mergen of publiceren.

## Milestone 4E

Branch milestone-4-rijmissies biedt tien selecteerbare oefenmissies, met behoud van de acht bestaande routes, D/R en achteruit parkeren, cockpit, drie echte spiegels, drie schermmodi en anonieme lokale rapportage met JSON/CSV.

Missie 9 rijdt circa 712 meter over een echte toerit, invoegstrook, twee doorgaande rijstroken, uitvoegstrook en afrit. Het is een specifiek A1-60-werkvak met G1/J16, geen algemene snelweglimiet. Missie 10 verbindt circa 1.287 meter woonwijk, kruispunten, verkeerslichten, een echte rotonde, gebogen buitenweg en snelweg met één wereldtoestand en klok. Beide nieuwe missies zijn met echte toetsenbordritten in Rustig/Druk gecontroleerd. Leerstand biedt uitleg; oefenexamenstand toont tijdens de rit alleen navigatie en achteraf het rapport. Geen officiële CBR-slaagcriteria.

Lint, typecheck, build, 173 unit-tests en 11 productie-subpadtests slagen. De volledige browserrun is 45/47; de onderbroken woonwijkrit slaagt in de afzonderlijke herhaling (6/6 afsluitende controles). De bekende Windows-downloadannulering blijft open en de strikte exporttest blijft actief. De drievensterweergave met software-rendering blijft traag; een onstabiele optimalisatie is teruggedraaid, geen FPS-winst geclaimd.

Zie docs/M4_VOORTGANG.md en docs/TESTVERSLAG.md voor feitelijke resultaten, bronnen, prestaties en resterende Windows-, juridische en hardwarevalidatie. M1 blijft formeel open. PR #2 blijft concept tegen milestone-3-gecontroleerd. Niet mergen of publiceren.

## Nieuw in Milestone 3

Kies bij **Verkeerssituaties** één van de zes oefeningen: gelijkwaardig kruispunt, B6/haaientanden, verkeerslichten, rechtsaf naast een fietser, zebra of wegrijden uit een parkeervak. De oorspronkelijke M1/M2-demo blijft de standaardoptie. Een situatie kiezen zet de rit stil en wist die oefenpoging; klik daarna op Start missie.

Gebruik Richting links / rechts / uit voor de richtingaanwijzers. NPC's reageren op de nadering, verkeerslichten, een stilstaande auto en voorspelde botsingen. Open de observaties rechts voor positie, tijd, snelheid, bron en alternatief. Bereiken van een eindpositie is alleen het afronden van een oefening, geen officiële slaagscore.

De zes situaties zijn volledig met de voertuigfysica doorgelopen in automatische tests, naast de browser- en regressiecontroles. De gebruikte RVV-artikelen zijn rechtstreeks aan de actuele officiële geconsolideerde tekst gecontroleerd. Menselijke juridische/didactische review en hardware-/duuracceptatie blijven open. Details: docs/REGELBRONNEN.md, docs/RVV_BRONUITTREKSELS.txt en docs/SCENARIOS.md.

## Starten

Node.js 22+ en een WebGL-browser (open index.html niet rechtstreeks als lokaal bestand):

```sh
npm ci
npm run dev
```

Open de lokale Vite-URL. Start de missie. W/↑ gas, S/↓/spatie rem, A/← en D/→ sturen. Laat toetsen los om gas/stuurinput te beëindigen; de auto rolt uit. Bij focusverlies wordt de bediening gewist. Bestuur vanuit het middenvenster.

## Schermmodi

Onder de cockpit staat **Beeldschermen · Milestone 2**:

- **Eén scherm:** de bestaande M1-cockpit met drie echte spiegels en missiebediening.
- **Breed beeld:** één browsercanvas met drie verschillende perspectieven links/midden/rechts. Spreid het browservenster zelf over de fysieke monitoren. Een brede monitor kan dezelfde weergave gebruiken.
- **Drie vensters:** klik **Open / herstel zijvensters**. De bestaande pagina blijft het middenvenster, met bediening en spiegels. Twee aparte vensters tonen zijaanzichten. Dit zijn geen extra spiegels. Sta zo nodig pop-ups voor deze website toe. Vensters openen uitsluitend na deze klik.

Sleep zijvensters handmatig naar links en rechts. **Verdeel over gedetecteerde schermen** vraagt pas na een klik browsertoestemming voor schermdetectie, als deze API beschikbaar is. Bij ontbrekende toestemming/API of minder dan drie schermen blijft handmatig plaatsen mogelijk. Automatische plaatsing is niet op fysieke monitoren gevalideerd.

**Terug naar één scherm** sluit de zijvensters. Bij het sluiten van een bekend zijvenster valt de eigenaar automatisch terug naar één scherm. Een vastgelopen of onbereikbaar zijvenster geeft daarnaast een waarschuwing in het middenvenster.

## Kalibratie

Open **Schermkalibratie**. Stel de linker/rechter kijkhoek, het verticale gezichtsveld, horizon/kanteling, de schermindeling (gelijke delen of 25/50/25), de randruimte en de maximale pixelschaal in. Het kalibratiekruis is een uitlijnhulp. De randruimte is geen fysiek gevalideerde bezelcorrectie; perspectieven kunnen overlappen of een naad tonen totdat kijkhoeken en gezichtsveld op de opstelling zijn afgestemd. Kalibratie geldt ook voor de zijvensters. Lagere pixelschaal kan de GPU-belasting verminderen; spiegels hebben vaste 320×190-renderdoelen.

Instellingen en het kanaal-ID worden alleen per browsertab in sessionStorage bewaard. Geen leerlingnamen of opgeslagen ritresultaten. **Herstel kalibratie** zet de standaardwaarden terug.

## Verbinding en herstel

Alleen het middenvenster simuleert. Dezelfde klok, voertuigpose, acteurs en verkeerslichtstatus gaan naar de zijvensters. De drie vensters tonen een circa 100 ms gebufferd beeld. Bij ontbrekende pakketten langer dan 1,5 seconde wordt het zijbeeld verborgen met een verbindingsmelding. Nieuwe pakketten herstellen het beeld vanzelf. Herladen van een zijvenster sluit weer aan. Herladen van het middenvenster start opnieuw op 0 in de standaarddemo; de bestaande zijvensters volgen die nieuwe bron. Kies zo nodig de gewenste M3-situatie opnieuw. Er is geen herstel van de oude rit na een bronherstart.

Open geen tweede zelfstandige eigenaar voor dezelfde rit. Communicatie werkt binnen dezelfde browser/origin; geen ondersteuning voor verschillende computers of browsers. Achtergrondtabbladen kunnen door de browser worden vertraagd. Dit is geen hardwarematige framesynchronisatie.

## Testen

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=1
```

Voor de afzonderlijke productie-subpadtest in PowerShell:

```powershell
$env:BASE_PATH='/autorijsimulator-1.2/'
npm run build
npm run test:pages -- --workers=1
```

Bij een andere repositorynaam: stel BASE_PATH bij bouwen en PAGES_BASE bij de test op hetzelfde subpad in. De Pages-test start zelf een lokale previewserver. De e2e-suite bevat een korte prestatiesteekproef en schrijft docs/qa-m2-performance.json. Deze cijfers zijn geen garantie voor leerlinghardware.

## GitHub en overdracht

De M4-ontwikkelversie staat voor beoordeling op branch milestone-4-rijmissies van Reinirus/autorijsimulator-1.2. De CI-workflow controleert push en pull requests. Pages wordt alleen via workflow_dispatch gestart; deze overdracht publiceert niet en merge naar main vereist beoordeling.

Lees docs/TESTVERSLAG.md voor de werkelijk uitgevoerde controles en beperkingen, docs/OVERDRACHT_M3.md voor de pakketvergelijking, docs/M4_TECHNISCHE_BASIS.md voor het oordeel over M4 en docs/ARCHITECTUUR.md voor de opbouw. Historische verslagen zijn afzonderlijk bewaard. De zes M3-situaties zijn een begrensd verkeersmodel; menselijke juridische/didactische review en hardware-/duuracceptatie blijven open. Eigen code MIT, procedurele geometrie, geen gekopieerde CBR-content.
