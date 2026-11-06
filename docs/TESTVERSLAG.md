# TESTVERSLAG — Milestone 4E

6 november 2026. Reinirus/autorijsimulator-1.2, uitsluitend milestone-4-rijmissies. Uitgangspunt cfb2eeb48d14ea052598c2292a92fc2d1a488582. Historie: TESTVERSLAG_M4D_HISTORIE.md. Historische successen tellen niet als nieuwe runs.

**DEMO — NIET CBR-GECERTIFICEERD.** Tien speelbare oefenmissies; volledige Windows-, hardware- en juridische acceptatie is niet bereikt. M1 blijft formeel open.

## Omgeving en werkelijke commando’s

Windows, Node v24.22.1, npm 10.9.2, Vitest 3.2.7, Playwright 1.64.1, Chromium 156.0.8078.4 revision 1248. npm is werkelijk aangeroepen als `node ../../work/package/bin/npm-cli.js` vanuit de projectmap. PLAYWRIGHT_BROWSERS_PATH verwijst naar work/browsers. Geen dependencies of lockbestand gewijzigd.

| Commando | Resultaat |
|---|---|
| npm ci --offline --cache C:/Users/Q038575/Documents/Codex/2026-11-03/je-x20/work/npm-cache --no-audit --no-fund | Exit 0, 168 packages, 34 s. |
| npm run lint | Exit 0, ook na vrijgave en rapportmetadatawijziging. |
| npm run typecheck | Exit 0. |
| npm test -- --reporter=default --reporter=json --outputFile=../../work/m4e-vitest.json | **173/173**, 17 bestanden, 11,08 s. Alle 160 behouden tests plus 13 M4E-tests. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Exit 0; 50 modules, 1,62 s. Gedeelde chunk 590,15 kB; >500-kB-waarschuwing blijft zichtbaar. |
| npm run test:e2e | **45/47, 32,9 min, exit 1**. Verdwenen browsercontext bij missie 3 en Windows-downloadannulering. |
| npm run test:e2e -- tests/e2e/milestone4b.spec.ts tests/e2e/milestone4e-state.spec.ts tests/e2e/missions.spec.ts tests/e2e/milestone4d-state.spec.ts tests/e2e/smoke.spec.ts --grep 'missie 3\|missiemenu\|M4E\|M4D verlaten\|start, missie en stop' | **6/6**, 1,7 min, exit 0. Inclusief volledige herhaling van missie 3 en gewone tienmissieselectie. |
| npm run test:pages | **11/11**, 34,4 s, exit 0, op /autorijsimulator-1.2/. Beide nieuwe missies, drie spiegels en zijvensters laden; development-diagnosequery schakelt productiebeelden niet uit. |

De Vite-server is gestart met `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4573 --strictPort`. Productie wordt met BASE_PATH=/autorijsimulator-1.2/ lokaal op previewpoort 4576 bediend. Een lokaal hulpproces start server en npm binnen dezelfde uitvoering en sluit de server daarna. Geen publicatie. Browsercontroles gebruiken één worker; de subpadconfiguratie gebruikt nu ook één worker tegen gelijktijdige software-GPU-belasting.

De volledige regressie was vóór het vrijgeven van de selectievlaggen. Daarna zijn alleen selectie-/beschrijvingsteksten en rapportmetadata verduidelijkt, waaronder actortype en snelheid/maximum per gebeurtenis. Routefysica, NPC-regels en geometrie bleven gelijk. De laatste unit-tests, zes gerichte browsercontroles en productie-subpadtest controleren de afsluiting. De tijdelijke DEV-preview is verwijderd.

## Complete browserritten

De piloot leest telemetrie en geeft echte browser-keydown/keyup voor gas, rem en stuur. Richtingaanwijzers worden via productknoppen bediend. Geen voertuigpose, klok, route-index of actorpositie wordt door de browserpiloot veranderd. Geen klokversnelling of overslaan van wegdelen. Unit-grensproeven met geïnjecteerde posities zijn afzonderlijk en tellen niet als browserrit.

| Nieuwe volledige rit | Eindklok | Route | Grootste stap/browserframe |
|---|---:|---:|---:|
| 9 rustig, leerstand | 107,02 s | circa 712 m | 0,637 m |
| 9 druk, leerstand | 109,73 s | circa 712 m | 0,489 m |
| 10 rustig, leerstand | 299,58 s | circa 1.287 m | 0,665 m |
| 10 druk, oefenexamen | 298,62 s | circa 1.287 m | 0,644 m |

Alle vier bereiken de echte eindstop, alle routepunten en vijf/twaalf encounters. De klok loopt nooit terug. Contactasserties slagen, gebeurteniscodes zijn uniek en rapporten zijn werkelijk lokaal bewaard. Afronden bewijst geen juridisch foutloos rijden: snelheid, afstand en geel kunnen oefenadvies opleveren. Route- en eindbeelden qa-m4e-*.png zijn gemaakt; de nieuwe routebeelden en examenweergave zijn visueel bekeken.

De bestaande volledige ritten 1, 2, 4, 5, 6 en beide varianten van 7/8 slagen in dezelfde regressie. Missie 3 werd onderbroken met `Execution context was destroyed, most likely because of a navigation`. De precieze oorzaak is niet vastgesteld. De afzonderlijke volledige herhaling slaagt met dezelfde assertions. Dit wordt niet achteraf als een 47/47-run voorgesteld.

De behouden M7-ritten meten circa -4,60 rad rond het tweede eiland en een minimumcentrumstraal van 13,51/13,53 m. M8 doorloopt echte bochten met 45/28 m modelzicht. Nieuwe unit-tests controleren verbonden wegdelen, de M10-ringboog en M9-invoeg-/wissel-/uitvoeggeometrie.

## Regels, verkeer, bediening en gegevens

- M3 decideTraffic blijft behouden voor rechts, B6 en lichten. De nieuwe rotonde-NPC verleent bij zijn eigen B6 voorrang aan de leerling op de ring; een expliciete grensproef controleert dit. Volledige fysicaritten controleren ook alle NPC-paren en vinden geen overlap.
- NPC’s remmen voor de leerling, volgen voorliggers en behouden identiteit/positie. Snelwegtrajecten duren de volledige rit. Dit is een eindig scenariomodel; dichtheid later in M10 hangt mede van wachttijden af.
- Seed, moeilijkheid, ritstand, encounters, globale tijden, snelheid, positie, maximum, uitleg en bron-ID’s gaan mee in het rapport. Een fietser wordt als fietser geregistreerd. Oude rapporten blijven leesbaar; ongeldige modusdata wordt geweigerd.
- Complete fysicaproeven controleren na afronden ook herstart: klok/index nul, lege actuele events/encounters, geen finishClock en behouden moeilijkheid. De browser controleert modusbehoud, pauze zonder feedbacklek, beëindigen en het latere examenrapport.
- Eén scherm, breedbeeld en drie vensters zijn voor de nieuwe missies gecontroleerd: drie verschillende gevulde spiegelbeelden, gedeelde mission-ID en verbinding. Bestaande regressies controleren cameraoriëntatie, achterobjecten, loslaten, focusverlies, kalibratie, pakketverlies, herladen en terugval. Zijvensters simuleren niets zelfstandig.
- D/R en werkelijk achteruit parkeren blijven getest. Niet gemeten oog-, spiegel- of dodehoekgedrag wordt niet als fout beoordeeld. Nieuwe ruimtelijke conclusies blijven oefenfeedback zolang menselijke review ontbreekt; twee seconden is geen zelfstandige wettelijke norm.

## FPS en spiegelonderzoek

Viersecondensteekproeven, viewport 1280×1000, geen schoolhardware-/duuracceptatie. Chromium Headless Shell meldt **ANGLE / SwiftShader Device (Subzero)**, softwareweergave. CPU-walltijden kunnen GPU-wachten bevatten; geen geïsoleerde GPU-timerqueries.

| M7-diagnose | Eén scherm | Breedbeeld | Drie vensters |
|---|---:|---:|---:|
| Spiegelketen uit, ontwikkelproef | 41,8 FPS | 30,5 FPS | 17,7 FPS |
| Alleen spiegelrenderingen | 37,5 | 28,7 | 17,0 |
| Inclusief GPU-readback | 34,3 | 26,3 | 17,0 |
| Inclusief pixelkopie | 35,4 | 27,1 | 17,4 |
| Volledige keten met canvasoverdracht | 30,8 | 27,0 | 15,1 |

M7-readback circa 2,9–3,4 ms/frame voor drie spiegels, pixelkopie 0,43–0,47 ms en canvasoverdracht 0,12–0,16 ms. Ook zonder spiegels blijft drievensterweergave rond 18 FPS. Dit wijst op een belangrijke bijdrage van softwarematige scèneweergave en extra rendercontexten; readback alleen verklaart de lage FPS niet. Geen volledige causale profielanalyse van schoollaptops.

Ongewijzigde keten: M9-startmetingen circa 36,6–38,4 / 30,7–31,3 / 19,3–20,1 FPS. M10 varieert circa 21,4–28,6 / 17,2–23,8 / 11,3–15,7 FPS. Sommige softwaremetingen liggen onder de beoogde ondergrens. Apart gestart volledig Chromium in headless-modus haalde circa 60 FPS; die andere binary is geen applicatiewinst of vergelijkbare Headless-Shell-meting.

Een tijdelijke statische geometriebatchingproef gebruikte dezelfde viewport, gepauzeerde beginpose/klok nul en binary. Alle drie spiegelpixelhashes bleven exact gelijk in alle modi voor beide nieuwe missies. M9 ging eenmaal van 36,6/31,3/20,1 naar 43,4/35,7/22,3 FPS, maar de herhaling kwam op 37,0/28,6/19,8. M10 verbeterde niet. **Alles teruggedraaid; geen FPS-winst geclaimd.** Drie 320×190-camera’s, readback, pixeloriëntatie en frequentie blijven behouden. De diagnoseparameter werkt alleen in development; de productietest controleert dat mirrorProbe de spiegels niet uitschakelt. Ruwe qa-m4e-performance-*.json bewaren ook tegenvallende experimenten.

## Windows-downloadonderzoek

De strikte echte JSON/CSV-exporttest blijft actief en faalt opnieuw: `download.failure()` is `canceled`. De eerste JSON-download faalt, CSV wordt in die test niet bereikt. Geen skip of afgezwakte assertion. JSON-inhoud, CSV-formattering, anonimiteit en opslag worden apart gecontroleerd.

Daarnaast zijn acht minimale JSON-proeven uitgevoerd: Blob en HTTP Content-Disposition, elk met standaardmap en expliciete projectmap, in volledig Chromium én Headless Shell. **8/8 canceled**, op een lege pagina zonder simulator. Een uitsluitend door simulator-Blobcode veroorzaakte fout is daarmee onwaarschijnlijk; de precieze Windows-/browser-/beleidsoorzaak is niet vastgesteld. Downloadbeleidswaarden zijn alleen gelezen, geen beveiliging uitgeschakeld. Zie qa-m4e-*download-diagnostic.json. Oude Linux-successen zijn geen nieuwe Windows-acceptatie.

## Hersteld, niet getest en grenzen

Een drukke snelwegrit vond modelcontact bij wisselen: de conflictmeting gebruikte de schuine rijlijn in plaats van de doorgaande rijstrookas. Die as en bewaking vóór de hele beweging zijn hersteld; daarna slagen beide complete varianten zonder contact. De eerste interne preview ontsloot alleen missie 9; selectieassertie/preview zijn hersteld en beide M10-ritten daarna echt uitgevoerd. Een expliciete NPC-B6-controle is vóór de uiteindelijke regressie toegevoegd. Ongebruikte import en development-locatieaanroep in Node-tests zijn hersteld. De batchingproef is teruggedraaid. Eerdere afgebroken/mislukte ontwikkelruns tellen niet als volledige successen.

Niet uitgevoerd: menselijke juridische/WRM-/didactische review, doelgroep/toegankelijkheid, Edge, schoollaptops/GPU’s, fysieke monitoren/DPI, stuur/pedalen en twee duurtests van 30 min. Geen fysiek gekalibreerde banden/wrijving/ABS/zichtlijnen/reactietijd, complete statische botsingswereld, algemene verkeers-AI, routeherberekening of volledige automatische toetsing van alle snelwegverboden van RVV 43. Eigen schematische borden/wegen zijn geen CROW/BABW-certificering.

RVV is op 6 november rechtstreeks opgehaald (HTTP 200); web-open gaf 429. Versie/artikelen/SHA256 staan in REGELBRONNEN.md. reviewedByHuman blijft false. Geen officiële CBR-punten of slaagcriteria.

## GitHub en oordeel

Alleen milestone-4-rijmissies wordt gecommit; PR #2 blijft concept tegen milestone-3-gecontroleerd. Exacte commit en afzonderlijke Actions-status staan bij de PR; lopende CI wordt niet als geslaagd geclaimd. main en M3 blijven behouden. Pages is uitsluitend workflow_dispatch en wordt niet gestart.

**Oordeel: tien technisch geteste speelbare oefenmissies; geen volledig geslaagde Windows-, hardware- of juridische acceptatie.** Downloadfout, eenmalige browseronderbreking en lage software-FPS blijven zichtbaar. Niet mergen of publiceren. DEMO — NIET CBR-GECERTIFICEERD.

Ruwe actuele uitvoer: qa-m4e-e2e.log, qa-m4e-e2e-herhaling.log, qa-m4e-pages.log, qa-m4e-unit.json en qa-m4e-download-matrix.json.
