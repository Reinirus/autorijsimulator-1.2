# TESTVERSLAG — Milestone 4D

Datum: 5 november 2026. Repository Reinirus/autorijsimulator-1.2, uitsluitend branch milestone-4-rijmissies. Uitgangspunt: gecontroleerde M4C-commit 7cb4179f5700cc1714c26e5ab14c9f4c1ca77283. Historische resultaten blijven in TESTVERSLAG_M4C_HISTORIE.md bewaard; zij worden niet automatisch als nieuwe runs geteld.

**DEMO — NIET CBR-GECERTIFICEERD.** Missie 7 en 8 zijn volledige oefenroutes met echte voertuigfysica en Chromium-besturing. Missies 1–6 blijven behouden, 9/10 uitgeschakeld. M1-hardware-/duuracceptatie en menselijke juridische/WRM-/didactische review blijven open.

## Omgeving en echte commando’s

Windows, Node v24.22.1, npm 10.9.2, Playwright 1.64.1, Chromium 156.0.8078.4 revision 1248. npm is daadwerkelijk aangeroepen via `node ../../work/package/bin/npm-cli.js` vanuit outputs/autorijsimulator-m4-rijmissies. PLAYWRIGHT_BROWSERS_PATH wijst naar work/browsers. Geen dependencies toegevoegd of lockbestand gewijzigd.

| Commando | Werkelijk resultaat |
|---|---|
| npm ci --offline --cache C:/Users/Q038575/Documents/Codex/2026-11-03/je-x20/work/npm-cache --no-audit --no-fund | Exit 0: 168 packages, 22 s. |
| npm run lint | Exit 0; opnieuw uitgevoerd na de laatste wijzigingen. |
| npm run typecheck | Exit 0; uitgevoerd op de uitgewerkte broncode. |
| npm test | Exit 0: **160/160 tests, 15 bestanden, 12,22 s**, inclusief 24 M4D-tests en de behouden 136 eerdere tests. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Exit 0; 47 modules, laatste Vite-bouw 1,38 s. Chunkwaarschuwing circa 572,95 kB voor gedeelde Three.js-/simulatiecode; geen fout of verruimde waarschuwing. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4573 --strictPort | Eigen ontwikkelserver gebruikt; geen publicatie. |
| npm run test:e2e -- tests/e2e/milestone4d.spec.ts | Eerste Chromium-vrijgavecontrole: 4/4 volledige ritten, 7,3 min; beide missies in beide moeilijkheidsstanden. Dev-preview alleen gebruikt vóór vrijgave; deze preview is daarna verwijderd. |
| npm run test:e2e | **39/40 geslaagd, 19,2 min**, exit 1; alle acht complete missies en beide nieuwe moeilijkheidsvarianten slagen. Alleen de bestaande strikte Windows-downloadtest meldt canceled. Na deze run is één nieuwe overgangstest toegevoegd en de zichtbare DEMO-separator exact aangepast. Laatste gerichte herhaling: **npm run test:e2e -- tests/e2e/milestone4d-displays.spec.ts tests/e2e/milestone4d-state.spec.ts tests/e2e/smoke.spec.ts: 3/3 geslaagd, 47,3 s**. De volledige definitieve CI-selectie bevat 41 actieve tests; er wordt geen lokale 41/41-run geclaimd. |
| BASE_PATH=/autorijsimulator-1.2/ node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4576 --strictPort | Afzonderlijke preview van de echte productiebuild; geen GitHub Pages-deployment. |
| npm run test:pages | Exit 0: **9/9, 23,2 s** op de laatste productiebuild; exact /autorijsimulator-1.2/. Een eerdere productiecontrole gaf eveneens 9/9 in 27,0 s. |
| git diff 7cb4179 -- src/core/physics.ts src/displays/mirrors.ts src/displays/pixels.ts src/rules/traffic.ts | Geen inhoudelijke wijzigingen: voertuigfysica, drie spiegelcamera’s, pixeltransformatie en pure M3-regels behouden. Sync is alleen uitgebreid met een bufferreset bij seedwisseling. |

Geen test is overgeslagen of als verwacht falend gemarkeerd om groen te worden. De strikte echte downloadtest blijft actief. Dit verslag beschrijft de feitelijk uitgevoerde lokale controles. De bijbehorende volledige Linux-controles en definitieve GitHub Actions-status worden afzonderlijk bij [PR #2](https://github.com/Reinirus/autorijsimulator-1.2/pull/2) vastgelegd; Linux-resultaten vervangen geen Windows-acceptatie.

## Volledige rijritten en geometrie

**Missie 7:** twee echte annulaire rijbanen, geen hernoemd recht kruispunt. Twee eilanden met straal 10,3 m, asfalt 10,3–17,7 m en aangesloten tweerichtingsarmen. Eerste afslag op de eerste ring, derde op de tweede. De browser registreert de werkelijke positie/hoek rond ieder eiland; de auto moet de ring daadwerkelijk volgen. Voor de derde afslag wordt meer dan 3,4 rad negatieve hoekverandering rond het tweede eiland geëist. De gemeten minimale voertuigcentrumstraal blijft buiten het eiland. Alle routepunten zijn fysiek bereikt en de eindstop vereist remmen en stilstaan.

B6/D1, haaientanden, zebra en afzonderlijke fietsoversteken zijn zichtbaar. NPC’s rijden via toeritten de ring op en verlaten deze; een extra druktevariant heeft een extra auto. De vier armen, NPC-autotrajecten en interpolatiepunten tussen leerlingroutepunten worden op aaneengesloten asfalt gecontroleerd. De complete fysicaritten controleren dat de auto nooit buiten het wegmodel komt.

**Missie 8:** circa 330 meter, meerdere echte bochten en herkenbare rand-/middenmarkeringen. Een expliciet A1-bord bepaalt 60 km/u; de code doet geen algemene aanname dat iedere buitenweg 60 is. Een langzamere auto en fietser rijden dezelfde richting; een aparte tegenliggerroute ligt op de andere rijstrook. Zicht wordt canoniek 45/28 m in het mistvak en 140 m daarbuiten. De browser meet echte koprichtingverandering groter dan 0,4 rad en de gekozen minimumzichtafstand. De leerling remt, houdt afstand en bereikt het eindvak zonder teleportatie of klokversnelling.

| Laatste volledige browserrit | Klok bij einde | Hoek rond tweede eiland | Minimum centrumstraal | Minimum modelzicht |
|---|---:|---:|---:|---:|
| 7 rustig | 105,68 s | -4,602 rad | 13,47 m | 140 m |
| 7 druk | 105,72 s | -4,601 rad | 13,49 m | 140 m |
| 8 rustig | 103,92 s | n.v.t. | n.v.t. | 45 m |
| 8 druk | 103,87 s | n.v.t. | n.v.t. | 28 m |

Alle vier bereiken hun volledige route/eindstop, zonder regel- of contactmelding in deze voorzichtige testritten. De maximale gemeten positieverandering per browserframe bleef onder 0,36 m en de klok liep nooit terug. De actuele routebeelden van beide missies zijn visueel bekeken.

De browserpiloot leest uitsluitend telemetrie en drukt via keydown/keyup de echte browserbediening in. Hij verandert geen voertuigpose, route-index of klok. Richtingaanwijzers worden via de productknoppen tijdig vóór de echte afrit gezet en daarna uitgezet. Het product zelf rijdt niet automatisch. Unit-tests met bewust geïnjecteerde grensposities zijn aparte grens-/NPC-tests en worden niet als complete rit geteld.

## Verkeersregels, NPC’s en foutenregistratie

- De pure M3-beslisser beoordeelt bekende B6-/oversteekfeiten. Voorrang wordt uit aanwezige tekens/feiten afgeleid, niet uit D1 of het woord rotonde. Er is geen verplichte linkerrichting bij nadering verzonnen. Twee uitrijmeetpunten registreren ontbrekende rechtsrichting afzonderlijk; onbetrouwbare geometrie geeft advies.
- NPC’s reageren op ringverkeer, de daadwerkelijke leerlingpose, geactiveerde voetgangers/fietsers en voorliggers. Beide complete druktefysicaritten controleren tevens alle NPC-paren op geometrische overlap. Een aparte grensproef controleert het remmen van een uitrijdende NPC vóór een geactiveerde oversteek, ook als de leerling verder achterop staat.
- ruralFindings scheidt de A1-snelheidswaarneming van twee-seconden- en zichtadvies. Unit-tests bewijzen dat minder dan twee seconden uitsluitend advies zonder juridische regel-ID is. Zicht-/remwegvergelijking is modeladvies bij artikel 19, geen automatische vaststelling voor een echte bestuurder.
- Zes verkeersmomenten in missie 7 en vier in missie 8 hebben elk een vaste unieke ID binnen de rit, globale begin/eindtijd, actorsoort en opdracht. Gebeurteniscodes zijn uniek binnen de poging; tijden lopen op. Herhaalde rotondepassages en twee uitrijmomenten blijven afzonderlijk rapporteerbaar.
- Lokale opslag, JSON/CSV en het teruglezen van oude rapporten zijn gecontroleerd. Nieuwe rapporten bevatten variant en seed. Herstart wist de actuele rit en behoudt de moeilijkheidskeuze; bewaarde rapporten blijven anoniem beschikbaar. Corrupt opgeslagen variantdata wordt geweigerd.
- Een seedwissel bij gelijke klok nul wist de snapshotbuffer; browser- en unit-tests controleren de nieuwe seed/NPC-lijst, herstel en gedeelde toestand. De zijvensters voeren geen eigen Simulation uit.
- De bestaande M1–M6-functies en tests blijven aanwezig: D/R, achteruit parkeren, cockpit, drie echte spiegelcamera’s, gas/stuur loslaten, focusverlies, pauze, schermkalibratie, pakket-/bronverlies, herladen en terugval.

## FPS en onderzoek van spiegel-readback

Viersecondensteekproeven per modus aan het begin van beide nieuwe missies, met draaiende klok; geen volledige hardwarebenchmark of drie-schermen-duuracceptatie. Ruwe data: qa-m4d-performance.json.

| Missie | Modus | FPS | Readback drie spiegels (ms/frame) |
|---|---|---:|---:|
| 7 | single | 34.6 | 3.07 |
| 7 | span | 33.8 | 2.76 |
| 7 | windows | 17.5 | 2.63 |
| 8 | single | 45.7 | 3.04 |
| 8 | span | 39.7 | 3.22 |
| 8 | windows | 21.9 | 2.91 |

Klokspreiding in de laatste steekproef: missie 7 71.4 ms, missie 8 42.2 ms. Eerdere meting vóór de extra A1-herhalingen: circa 34/30/16 en 41/36/21 FPS. Dit verschil is geen bewezen optimalisatiewinst; de spiegelketen is in beide metingen gelijk.

De bestaande keten blijft intact: drie 320×190-renderdoelen, synchronische readRenderTargetPixels, x-/rijtransformatie en putImageData. De bestaande profielmeters meten CPU-walltijd inclusief eventueel wachten op GPU-werk; dit is geen geïsoleerde GPU-timerquery. Er is geen onbewezen asynchrone, resolutie- of frequentiewijziging doorgevoerd. Drie verschillende gevulde spiegelbeelden, kloksynchronisatie, variantwissel en herstel zijn opnieuw gecontroleerd. De rotonde met drie vensters blijft rond de ondergrens van de korte steekproef; dit is geen garantie voor schoollaptops.

## Aangetroffen en herstelde ontwikkelfouten

1. Een NPC stopte aan het einde van een verbindingsweg op de leerlingroute. Zijn traject loopt nu door naar de volgende rotonde en een andere afslag; de leerling houdt ook afstand tot een voorligger op de ringroute.
2. De geometriecontrole vond dat de extra auto na het uitrijden verder reed dan het getekende asfalt. De noordelijke aansluiting is doorgetrokken en alle NPC-autotrajectpunten worden op asfalt gecontroleerd.
3. Een extra auto stond vóór activering op de ring en kon door een andere NPC worden geraakt. Hij nadert nu via een echte toerit, wordt tijdig geactiveerd en verleent bij zijn eigen B6 voorrang. De onderlinge-contacttest is actief gebleven en slaagt daarna.
4. De NPC-oversteeklogica is uitgebreid: auto’s houden rekening met geactiveerde kwetsbare oversteken; een wachtende voetganger kan reageren op een stilstaande NPC, zodat geen patstelling ontstaat als de leerling daarachter staat.
5. Een oorspronkelijke geometrieassertie eiste alle vier kwadranten voor de derde afslag. De werkelijk gereden derde afslag loopt door drie kwadranten; de test controleert daarom drie kwadranten plus een hoekbereik van meer dan 225°, naast de strengere werkelijke browserhoekmeting. Het eiland is niet verkleind en de route is niet in een recht traject veranderd.
6. Bij het verlaten van missie 7 bleef de nieuwe seedindicatie zichtbaar. De nieuwe overgangstest faalde daadwerkelijk op de niet-lege courseStatus; de indicatie wordt nu gewist en de test slaagt. De DEMO-tekst gebruikt exact de gevraagde em-dash.
7. Bij nieuwe wegvakken zijn A1-borden herhaald zodat de 30-km/u-oefenlimiet na een afslag expliciet zichtbaar blijft. Build, schermmetingen en subpadtests zijn daarna opnieuw uitgevoerd.
8. Een ongebruikte type-import is verwijderd na een echte lintfout. Historische menutests zijn bijgewerkt naar acht daadwerkelijk beschikbare en twee uitgeschakelde missies; bestaande rij- en verkeersasserties zijn behouden.

**Resterende lokale fout:** tests/e2e/mission-features.spec.ts, echte JSON/CSV-bestandsdownload: download.failure() is canceled. De eerste JSON-download faalt; de CSV-stap wordt in die strikte test niet bereikt. Dit is ook bij M4B/M4C bekend; de precieze oorzaak in deze Windows-uitvoering is niet definitief vastgesteld. Geen testskip of afgezwakte assertie. Opgeslagen rapporten, anonieme JSON-structuur, nieuwe variant/seed en CSV-formattering zijn apart gecontroleerd. Een Linux-CI-downloadsucces wordt niet als Windows-acceptatie aangemerkt.

## Niet uitgevoerd en resterende grenzen

Menselijke juridische/WRM-/verkeerskundige en didactische validatie van de nieuwe geometrie, bron-toepassing, voorrangsvensters en bordplaatsingen; doelgroep-/toegankelijkheidsacceptatie; Edge; fysieke monitoren/DPI-/randkalibratie; echte schoollaptops/GPU’s; stuur/pedalen en twee duurtests van 30 minuten zijn niet uitgevoerd. M1 blijft formeel open.

Het voertuigmodel is niet op banden, wegdek, ABS, wrijving of menselijke reactietijd gevalideerd. Mist is een ingestelde visuele/modelafstand en geen echte oog-/zichtlijnmeting. Er is geen volledig statisch botsingssysteem voor eiland/vegetatie, geen algemene verkeersstroom, meerstrooksrotonde of complete inhaalengine. De routevoortgang voorkomt afronden via een rechte afsnijding. Nieuwe juridische toepassingen houden reviewedByHuman:false; een modelobservatie is geen officieel examenresultaat. Geen niet-waargenomen spiegel- of dodehoekfout. Leer-/oefenexamenstand, missies 9/10 en de volledige tienmissierelease worden niet als voltooid gepresenteerd.

De actuele officiële RVV-pagina is rechtstreeks opgehaald (HTTP 200); web-open gaf 429. Versie, opnieuw gelezen artikelen, SHA256 en afbakening staan in REGELBRONNEN.md. Een technische broncontrole vervangt geen menselijke juridische goedkeuring.

## GitHub en oordeel

PR #2 blijft een concept tegen milestone-3-gecontroleerd. Alleen milestone-4-rijmissies wordt gecommit; main en M3 blijven behouden. De Pages-workflow is uitsluitend workflow_dispatch en wordt niet gestart. De GitHub-controles en exacte broncommit staan bij de PR.

Oordeel: de twee nieuwe missies zijn als technisch geteste oefenroutes beschikbaar, met de genoemde lokale downloadbeperking en open acceptatiepunten. Dit is geen volledige hardware-, juridische of opleidingsacceptatie. **DEMO — NIET CBR-GECERTIFICEERD.** Niets mergen of publiceren.
