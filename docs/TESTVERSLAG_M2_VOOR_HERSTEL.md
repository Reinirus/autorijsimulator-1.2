# TESTVERSLAG — Milestone 2, Nederlandse Autorijsimulator

Bijgewerkt: **4 november 2026**. Ontwikkeling gestart na lezen van het oorspronkelijke PROJECTSPEC.md (in de aangeleverde autorijsimulator_codex-map), README.md, docs/ARCHITECTUUR.md en het M1-testverslag. PROJECTSPEC.md is nu ook bij het project gevoegd. De gebruiker heeft M2 expliciet toegestaan terwijl M1 formeel openblijft.

**Eindoordeel: M2-softwareprototype gebouwd; alle hieronder genoemde lokale technische controles geslaagd. Geen hardwarevrijgave. Milestone 1 blijft formeel open voor hardware- en duurtests.** Er is niets gepubliceerd, gepusht, gecommit of op GitHub uitgevoerd. De oorspronkelijke OneDrive-bestanden zijn niet gewijzigd.

Het vorige M1-verslag is ongewijzigd bewaard in TESTVERSLAG_M1_HISTORIE.md. De bestaande M1-code voor fysica, verkeer, regels, vragen, beoordeling en keyboard is behouden; de renderer en opstart-/displaylaag zijn uitgebreid. De bestaande vijf M1-browsertests zijn opnieuw uitgevoerd.

## Omgeving en commando's

Windows, Node v24.22.1, npm 10.9.2, Vitest 3.2.7, Vite 7.3.7, Playwright Chromium 156.0.8078.4 (build 1248), headless WebGL. Geen fysieke schoolmonitoren, GPU-benchmarkopstelling of stuur/pedalen gebruikt. De bestaande geïnstalleerde dependencies en package-lock.json zijn hergebruikt; M2 heeft geen nieuwe npm-dependencies.

In deze omgeving verwijst npm naar `node ../../work/package/bin/npm-cli.js` vanuit de projectmap. PLAYWRIGHT_BROWSERS_PATH verwijst naar de eerder geïnstalleerde Chromium in work/browsers. Dit zijn omgevingshulpmiddelen, niet nodig op een gewone Node/npm-installatie.

| Werkelijk uitgevoerd commando | Resultaat |
|---|---|
| `npm run lint` | Exit 0; herhaald na toevoegen van de nieuwe broncode en tests. |
| `npm run typecheck` | Exit 0. Dekking: src, tests/unit en vite.config.ts volgens tsconfig.json. E2E-/Pages-bestanden worden door Playwright getransformeerd, niet volledig getypecheckt door dit script. |
| `npm test` / `npm run test` | Exit 0; **31/31 tests in 8 bestanden**, laatste volledige unit-run 2,16 s. De 19 bestaande tests plus 12 nieuwe scherm-/synchronisatietests. |
| `npm run build` | Exit 0; tsc -b en Vite-productiebouw geslaagd. Dynamische modules voor eigenaar en zijvensters gemaakt. |
| `node node_modules/playwright/cli.js test tests/e2e/displays.spec.ts --workers=1 --reporter=line` | Eerste M2-browserselectie: **5/5 geslaagd**, 28,7 s. Daarna nog twee gerichte browsertests toegevoegd. |
| `npm run test:e2e -- --workers=1` | Exit 0; **13/13 geslaagd**, door Playwright gerapporteerd als 1,1 minuut. Alle 8 M2-tests en alle 5 bestaande M1-browsertests. |
| `$env:BASE_PATH='/Autorijsimulator-1.1/'; npm run build` | Exit 0; HTML en dynamische chunks gebouwd voor het repositorysubpad. 26 modules getransformeerd. |
| `$env:BASE_PATH='/Autorijsimulator-1.1/'; node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4176` | Apart gestarte lokale previewsessie voor de hercontrole hieronder. |
| `npm run test:pages -- --workers=1` | Exit 0; **1/1 geslaagd**, 4,0 s totale testduur (laatste test zelf 3,0 s). Productie-cockpit én beide zijvensters geladen onder /Autorijsimulator-1.1/. Geen HTTP >=400 of pageerror. |
| GitHub Pages / GitHub Actions / deploy | Niet aangeroepen. |

### Omgevingsproblemen tijdens de uitvoering

De eerste browserpoging kon de lokale testserver niet starten wegens EACCES op 127.0.0.1:4173. Na expliciet verleende netwerktoegang startte de server en slaagden de tests. De Vite-opstart in playwright.config.ts gebruikt nu rechtstreeks node, zonder afhankelijkheid van een wereldwijd npm-commando voor de testserver.

De eerste Pages-test rapporteerde de test zelf als geslaagd, maar bleef hangen bij opruimen van de automatisch gestarte Windows-testserver. Die opdracht is afgebroken en wordt niet als geslaagde volledige run geteld. De Pages-configuratie kan nu buiten CI een al draaiende preview hergebruiken. De volledige Pages-opdracht is daarna opnieuw uitgevoerd met de hierboven genoemde aparte preview: exit 0 en 1/1 geslaagd. Op CI wordt een eigen server gestart; de GitHub-run zelf is niet uitgevoerd.

## Wat is gebouwd

- Eén scherm met de bestaande cockpit, missiebediening, snelheidsmeter en drie echte spiegelcamera's.
- Breed beeld: drie verschillende perspectieven links/midden/rechts in één canvas, met instelbare verdeling.
- Drie vensters: het bestaande middenvenster als enige simulatie-eigenaar, twee alleen-weergavezijvensters. Geen aparte fysica of NPC-simulatie in de zijvensters.
- Synchronisatie via snapshots: complete canonieke wereldtoestand, één klok, bron-epoch, volgnummer en timestamp. 50 ms zendinterval waar de browser dat toestaat; gezamenlijke doelvertraging van 100 ms en interpolatie van beweging/rotatie. Geen extrapolatie bij uitval.
- Kalibratie: linker-/rechterhoek, verticale FOV, horizon/kanteling, gelijke delen of 25/50/25, eenvoudige randruimte, pixelschaal en kalibratiekruis. Instellingen worden naar de zijvensters meegestuurd en per tab bewaard.
- Optionele schermdetectie/plaatsing na een expliciete klik en browsertoestemming; handmatig verplaatsen blijft beschikbaar. Geen pop-ups bij automatisch opstarten.
- Verbindingsmelding bij verouderde pakketten, automatisch herstel na ontvangst, herladen van zijvenster en bron, terugval naar één scherm bij sluiten van een bekend zijvenster of geblokkeerde pop-ups.
- Zichtbare FPS, render-aanroeptijd en pakketouderdom. Renderresources worden bij dispose opgeruimd.

## Werkelijk geteste dekking

### Unit-tests (31)

De bestaande 19 controles op keyboard, physics, determinisme, snelheidsomrekening, verkeerslichtcyclus, regel-demomodel en spiegeloriëntatie blijven slagen. De 12 nieuwe tests controleren:

1. Interpolatie van klok en pose zonder bronmutatie.
2. Bevriezen zonder extrapolatie en stale-detectie.
3. Weigeren van dubbele/achterhaalde pakketten.
4. Nieuwe bronepoch en weigeren van vertraagde oude pakketten.
5. Missiereset zonder interpolatiesprong over de vorige rit.
6. Kortste boog bij hoekinterpolatie.
7. Geen mutatie van de canonieke toestand door herhaald bemonsteren.
8. Exacte breedteverdeling en breed middenpaneel.
9. Kalibratiegrenzen en defaults bij ongeldige getallen.
10. Gelijke oogpositie en verschillende linker/midden/rechterkijkrichting.
11. Camerarichting na voertuigbocht, FOV, aspectratio en horizon.
12. Snelle spiegelpixelkopie bewaart alle RGBA-kanalen en dezelfde horizontale/verticale omkering.

### Browser (13 + 1 productie)

- Breedbeeld, kalibratie-aanpassing en terugval terwijl de missie en spiegels behouden blijven.
- Echt openen van twee zijvensters; gedeelde klok met maximaal 0,3 s toegestane spreiding in die regressietest. Zijvenster-toetsen starten geen eigen besturing.
- Doorsturen van kalibratie en herladen van een zijvenster.
- Bronverlies tijdens herladen: zijvensters tonen verbindingsverlies en nemen daarna automatisch de nieuwe bron over. Eigenaar-reload reset de missie op 0; geen voortzetting van de oude rit geclaimd.
- Sluiten van een zijvenster sluit het andere en schakelt de eigenaar terug naar één scherm.
- Geblokkeerde pop-ups vallen terug naar één scherm.
- Tijdelijk stoppen van ontvangen pakketten: zijbeeld wordt na veroudering verborgen, weergegeven klok bevriest, ontvangst hervatten herstelt automatisch.
- Ontbrekende getScreenDetails-API houdt handmatige plaatsing beschikbaar.
- Korte prestatiesteekproef in alle drie de modi.
- Pijltjestoetsen in een kalibratieveld wijzigen het veld zonder gas te geven. De nieuwe invoervelden worden van de rijbesturing uitgesloten.
- Alle vijf M1-browsertests: bediening en key-up/blur/vraagpauze, cockpit en drie veranderende spiegelbeelden, volledige lichtcyclus, echte WebGL-spiegeloriëntatie met gekleurde achterobjecten inclusief na 90° draaien, start/missie/stop.
- Afzonderlijke productiecontrole: CSS/JS en dynamische eigenaar-/zijmodules onder het Pages-subpad, WebGL-start, versnellen, beide zijvensters, terugschakelen en ontbreken van HTTP-/paginafouten.

qa-m2-span.png en qa-m2-side.png zijn daadwerkelijk bekeken: drie verschillende vooruit-/zijperspectieven, behouden spiegels in het midden en kalibratie-uitlijning zichtbaar. qa-pages-build.png toont de gebouwde productieversie.

## Exacte korte prestatiesteekproef

Waarden uit de laatste volledige e2e-run, ook opgeslagen in qa-m2-performance.json. Per modus 3,5 s gewacht; hieronder staat de laatst getoonde rollende circa 1 s FPS/CPU-renderwaarde, geen gemiddelde over een lange sessie.

| Modus | Midden FPS | Midden render-aanroep | Links FPS / render | Rechts FPS / render |
|---|---:|---:|---:|---:|
| Eén scherm | 38,5 | 6,6 ms | — | — |
| Breed beeld | 36,3 | 6,9 ms | — | — |
| Drie vensters | 18,5 | 6,0 ms | 18,3 / 1,0 ms | 19,1 / 1,0 ms |

In de drievenstersteekproef: **klokspreiding 0,04745762711864643 s (circa 47,5 ms)** tussen de weergegeven toestanden. De gelezen pakketouderdom op de zijvensters was 108 en 56 ms. De uitlezing gebeurt vlak na elkaar en is geen meting van fysieke monitorlatentie. CPU-render-aanroep is geen GPU-framecompletion. Dit bewijst geen minimum-FPS op schoolhardware en geen framesynchronisatie op drie fysieke monitoren. De daling bij drie vensters is een reëel resterend prestatierisico. Eerdere runs vóór optimalisatie varieerden van 11,6 tot 17,0 FPS voor het middenvenster. De spiegelkopie hergebruikt nu buffers en kopieert hele RGBA-pixels, zonder een tijdelijk subarray-object per pixel. Na die wijziging zijn alle unit- en browserregressies opnieuw uitgevoerd; de WebGL-spiegeltest bewaakt de beeldoriëntatie. De bovenstaande laatste meting is geen gecontroleerd hardwarevergelijkingsonderzoek.

## GitHub Pages en publicatie

Base /Autorijsimulator-1.1/ is lokaal gebouwd en met alle drie vensters getest. Beide workflows gebruiken npm ci en voeren M1-/M2-e2e plus de productie-subpadtest uit; het repositorysubpad wordt uit de repositorynaam afgeleid. De Pages-workflow start nog uitsluitend via workflow_dispatch. Er is niets naar GitHub geschreven of gepubliceerd. Repository-instellingen en de echte CI-/hostingsomgeving zijn niet getest.

## Resterend voor fysieke acceptatie

- Windows Chrome/Edge met de daadwerkelijke 1/2/3 monitoren, verschillende DPI's, vensterplaatsing en horizon-/kijkhoekkalibratie; echte getScreenDetails-toestemming, weigering en schermindeling zijn niet op hardware getest. De ontbrekende-API-terugval is wel getest.
- Twee duurtesten van 30 minuten, FPS-minimum op doelhardware, geen spiegelbevriezing en USB-stuur/pedalenacceptatie. **M1 blijft daarom formeel open.**
- Browserthrottling/gesuspendeerde eigenaar kan de simulatie stilzetten of vertragen; geen onafhankelijke side-window-simulatie en geen genlock. Verplaats bediening/focus naar de eigenaar.
- Randruimte is geen optisch gekalibreerde bezelcorrectie. Verschillende kijkhoeken/FOV kunnen overlap/naden geven; fysieke afstelling blijft nodig. Schermdetectie kiest de eerste drie horizontaal gesorteerde schermen; andere opstellingen vereisen handmatig plaatsen.
- Drie spiegels gebruiken nog dure GPU-readback met vaste resolutie. Het zijvenster kan geen eigenaar overnemen bij definitieve bronuitval; na bronherstart begint de rit opnieuw.
- Geen extra verkeersregelvalidatie, botsingsmodel, conflictvermijdende NPC-AI of juridische review. De bestaande M1-demo-beperkingen blijven gelden.

**Conclusie: lokale technische M2-controles geslaagd (31 unit + 13 e2e + 1 productie-browsertest). M1 blijft open; M2 heeft nog geen hardware-/duuracceptatie. Geen publicatie.**
