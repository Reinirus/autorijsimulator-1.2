# Milestone 4C — testverslag, 5 november 2026

**DEMO — NIET CBR-GECERTIFICEERD.** Softwarecontrole voor de M4C-ontwikkelversie; menselijke juridische/WRM-/didactische review en M1-hardware-/duuracceptatie blijven open. Alleen branch milestone-4-rijmissies, uitgangscommit 8dd484a581eee533ea2940062d53e44aeec3766c (gecontroleerde M4B). Geen merge of publicatie.

## Omgeving en werkelijk uitgevoerde commando’s

Windows, Node v24.22.1, npm 10.9.2, Playwright 1.64.1 met Chromium 156.0.8078.4 (revision 1248). Werkmap: outputs/autorijsimulator-m4-rijmissies in deze Codex-werkruimte. Omdat npm niet op PATH staat, zijn npm-commando’s feitelijk uitgevoerd via `node ../../work/package/bin/npm-cli.js ...`. PLAYWRIGHT_BROWSERS_PATH verwijst naar work/browsers; de bestaande browserinstallatie is werkelijk gebruikt. package-lock.json is behouden en npm ci heeft alle afhankelijkheden daaruit opnieuw geïnstalleerd.

| Commando / controle | Werkelijk resultaat |
|---|---|
| npm ci --offline --cache C:/Users/Q038575/Documents/Codex/2026-11-03/je-x20/work/npm-cache --no-audit --no-fund | Laatste uitvoering exit 0, 168 packages in 23 s. Een voorafgaande herinstallatie gaf EPERM op esbuild.exe doordat de eigen Vite-server nog liep; server gestopt en dezelfde installatie geslaagd herhaald. Een eerdere installatie deze werksessie was eveneens geslaagd. |
| npm run lint | Exit 0, opnieuw uitgevoerd na de laatste bronwijzigingen. |
| npm run typecheck | Exit 0, opnieuw uitgevoerd na de laatste bronwijzigingen. |
| npm test | Laatste uitvoering exit 0: **136/136 tests, 14 bestanden, 3,16 s**. Inclusief alle bestaande M1/M2/M3/M4A/M4B-tests en twintig M4C-tests. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Exit 0; 43 modules, Vite-bouw 1,31 s. Bestaande chunkwaarschuwing: gedeelde Three.js-code circa 550,40 kB na minificatie. Geen fout of verborgen verruiming van de waarschuwing. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4573 --strictPort | Afzonderlijke lokale ontwikkelserver gebruikt voor Chromium. |
| npm run test:e2e | Volledige Windows-suite uitgevoerd: **34/35 geslaagd, 11,3 min**, exit 1. Alle zes complete ritten slagen. Alleen de strikte echte bestandsdownloadtest meldt `canceled`; zie hieronder. Dit was vóór de laatste gerichte aanpassingen aan fietsactivering, geel bij binnenkomst en de positie van het A1-bord. |
| npm run test:e2e -- tests/e2e/milestone3.spec.ts tests/e2e/milestone4c.spec.ts tests/e2e/milestone4c-displays.spec.ts | Exit 0: **13/13 geslaagd, 4,9 min** op de laatste broncode. Alle tien M3-browsercontroles, twee complete M4C-ritten en de M4C-scherm-/prestatiecontrole. De routebeelden van beide nieuwe missies zijn visueel bekeken. |
| BASE_PATH=/autorijsimulator-1.2/ node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4576 --strictPort | Afzonderlijke preview van de laatste productiebuild gestart. |
| npm run test:pages | Laatste build: **7/7 geslaagd, 16,6 s**, exit 0, exact /autorijsimulator-1.2/. Bestaande dynamische imports/zijvensters, M3-wisseling, D/R, spiegels en missies 3–6 laden correct. |
| git diff -- src/rules/traffic.ts src/rules/catalog.ts src/core/physics.ts src/displays/mirrors.ts src/displays/pixels.ts src/displays/sync.ts | Geen wijzigingen ten opzichte van de gecontroleerde M4B-basis: pure M3-regels en register, voertuigfysica, spiegelcamera’s, pixeltransformatie en sync-protocol behouden. Scenario- en NPC-adapters zijn wel gericht uitgebreid en opnieuw getest. |

De volledige e2e-suite blijft 35 actieve tests bevatten. Geen testskip, verwacht-falen-label of afgezwakte downloadassertie is toegevoegd om de suite groen te laten lijken. De volledige regressie van de uiteindelijke broncode is ook door de GitHub push-/PR-controles uitgevoerd en geslaagd; zie de resultaten hieronder.

## Inhoudelijke testdekking

- **Missie 5:** drie afzonderlijke signaalpassages (kruisende auto, geregelde zebra/voetganger, licht boven B6), echte voertuigfysica en browser-keydown/keyup, stop/optrekken en eindstop. Alle encounters afgerond, globale klok niet teruggelopen, geen teleportatie, geen regel- of contactmelding op de voorzichtige testrit. De tweede en derde lichten worden niet opnieuw gestart. Unit-tests controleren alle fasen, ontruiming, conflicterend groen, onafhankelijke offsets, de zichtbare lampkleuren en de overeenkomst van getekende en beoordeelde stopstreep.
- **Geel:** dezelfde integrateVehicle-remfysica bij meerdere actuele snelheden, voldoende/onvoldoende afstand, onzekere scherpe stuurbeweging en achteropkomende auto, plus binnenkomst tijdens een al lopende geelfase. De oude vaste 0,7-s-toeslag is verwijderd. Geen getal in dit model wordt als wettelijke remgrens gepresenteerd. De afstand, modelremweg, stoptijd en onzekerheid zijn uitlegbaar. Een geel-modelafwijking blijft advies.
- **Missie 6:** fietser van rechts, daadwerkelijk achter de auto geactiveerde fietser bij rechts afslaan, gedraaide zebra op de oostelijke weg, ruimtelijk geactiveerde voetganger achter een bestelbus met seed 603. Een echte rechtsafbocht, doorlopende wereldpose, voor laten gaan, anticiperend remmen en eindstop. Dezelfde seed/invoer geeft exact dezelfde gebeurtenissen in unit-tests. De veiligheidssituatie krijgt geen automatische zebra-/schuldbeoordeling.
- **NPC’s:** kruisende auto bereikt daadwerkelijk zijn rode stoplijn, wacht en trekt bij groen weer op; geregelde voetganger begint alleen bij eigen groen; voorspeld conflict/overlap met de speler geeft een NPC-noodremreactie. De bestaande 62 M3-tests blijven aanwezig voor voorrang, uitzonderingen, afslaan, geel, richting, contact en uitlegbare beoordeling.
- **Registratie:** unieke encounter-ID’s en eventcodes binnen de rit; begin/einde, oplopende globale tijden, feiten, regel-ID’s en handelingsalternatief. Iedere afgeronde nieuwe rit wordt werkelijk in lokale opslag bewaard en na herladen teruggelezen. Herstart wist de actuele klok, route, gebeurtenissen en encounters. JSON/CSV-formattering met nieuwe eventId/missionId 5 en 6 en oude rapporten wordt door unit-tests gecontroleerd. De generieke strikte browserdownloadtest leest echte JSON/CSV-bestanden wanneer het platform dit toestaat; lokaal faalt deze zoals hieronder beschreven.
- **Behoud:** volledige browserritten 1–4, sturen en loslaten, focusverlies, pauze, D/R, achteruit parkeren, drie verschillende echte spiegelbeelden, kalibratie, pop-upterugval, bron-/pakketverlies en herstel. De nieuwe M4C-schermtest controleert missie-/encounter-ID, NPC-soort, drie gevulde en verschillende spiegelbeelden, zijvensterherladen, klokspreiding en terug naar één scherm.

Geen ontbrekende spiegel- of dodehoekcontrole wordt als bewezen fout geregistreerd. Een remactie na de hazardtrigger is uitsluitend een bedieningsobservatie, geen bewijs dat de leerling het gevaar of een spiegel heeft bekeken.

## Werkelijke FPS en spiegelonderzoek

Korte steekproeven van circa vier seconden per schermmodus aan het begin van beide missies, met draaiende wereldklok. Geen volledige drie-schermen-duurtest of hardwarebenchmark. De exacte ruwe waarden staan in qa-m4c-performance.json. Alle spiegelstappen zijn behouden: drie 320×190-renderdoelen, synchronische readRenderTargetPixels, spiegel-/rijtransformatie en canvasoverdracht. Alleen CPU-walltijdinstrumentatie is toegevoegd.

| Missie | Modus | Gemeten FPS | Readback drie spiegels (ms/frame) |
|---|---|---:|---:|
| 5 | single | 38.7 | 4.13 |
| 5 | span | 34.9 | 4.07 |
| 5 | windows | 18.4 | 3.97 |
| 6 | single | 41.4 | 3.19 |
| 6 | span | 32.2 | 3.54 |
| 6 | windows | 18.8 | 2.95 |

Gemeten klokspreiding: missie 5 31.0 ms; missie 6 53.3 ms. Dit is een korte steekproef met de bestaande interpolatiebuffer, geen hardware-genlock.

De readbackmeting omvat CPU-wachten op mogelijk eerder GPU-werk en is geen geïsoleerde GPU-timerquery. De totale spiegelkosten bevatten daarnaast ongeveer 1,2–1,4 ms renderaanroepen, 0,4–0,5 ms pixelkopie en 0,1–0,2 ms canvasoverdracht per frame voor de drie spiegels samen. Er is geen bewezen optimalisatie geïmplementeerd: geen lagere spiegelfrequentie/resolutie en geen nieuwe asynchrone keten. Verschillende camera-inhoud en sync/herstel zijn getest. Circa 18–19 FPS bij drie vensters blijft een relevante prestatiebeperking en geen geslaagde schoolhardwareacceptatie.

## Fouten tijdens ontwikkeling en herstel

De eerste fysieke M6-testbestuurder stuurde op ver weg liggende doelen en verliet daardoor de rijlijn; de testbestuurder gebruikt nu een lokaal vooruitkijkpunt. Het product bestuurt de auto niet automatisch. De complete voorzichtige rit slaagt daarna zonder contact. Een oude registratietest verwachtte nog vier speelbare routes; die is aangepast aan de werkelijk uitgewerkte zes, met vier uitgeschakelde missies. Een vroege Chromium-M6-poging is onderbroken door een eigen Vite-HMR-bronwijziging (`Execution context was destroyed`); deze poging is niet als productfout of geslaagde rit geteld en de ritten zijn na bevriezen van de broncode herhaald. De tijdelijke npm-ci-EPERM is opgelost door de eigen ontwikkelserver te stoppen. Geen bestanden of gebruikerswerk zijn daarvoor verwijderd.

**Resterende lokale fout:** tests/e2e/mission-features.spec.ts, echte anonieme JSON/CSV-bestandsdownload: `download.failure()` geeft `canceled`. De JSON-stap faalt, zodat de CSV-stap in deze strikte test niet wordt bereikt. Dit is ook op de ongewijzigde M4B-basis bekend. De precieze oorzaak in deze Windows-uitvoeringsomgeving is niet definitief vastgesteld. Opgeslagen rapportgegevens, anonieme serialisatie, downloadnaam en formattering zijn wel afzonderlijk gecontroleerd; daarmee wordt geen geslaagde lokale bestandsdownload geclaimd. Linux-CI-resultaten worden afzonderlijk vermeld en vervangen geen Windows-acceptatie.

## Niet uitgevoerd / open

Menselijke juridische/WRM-/verkeerskundige en didactische validatie, gebruikersonderzoek met 15–18-jarigen, toegankelijkheidsacceptatie, Edge, echte monitoren en DPI-/randkalibratie, schoollaptop-GPU’s, stuur/pedalen en twee duurtests van dertig minuten zijn niet uitgevoerd. Geen algemene stadsverkeersstroom, volledige statische botsingswereld, banden-/wegdekvalidatie, oogtracking of gecertificeerde VRI. Missies 7–10 blijven uitgeschakeld. Leer-/oefenexamenstand, rotondes en snelwegen worden niet als voltooid geclaimd.

Officiële RVV-versie 01-07-2026 opnieuw rechtstreeks opgehaald (HTTP 200), artikelen 68/79 opnieuw gelezen; web-open gaf 429. Hash en de afbakening staan in REGELBRONNEN.md. Broncontrole is geen menselijke goedkeuring; alle reviewvlaggen blijven false.

## GitHub en oordeel

**Broncommit 03b5fa81de96925cf47f26f5ea085894002cecdc: volledige Linux-CI geslaagd.**

| GitHub Actions | Werkelijk resultaat uit de joblogs |
|---|---|
| [Pushcontrole 42043255611](https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/42043255611) | success; npm ci (169 packages, 5 s), lint, typecheck, 136/136 tests (3,27 s), build (1,53 s), 35/35 Chromium-e2e (11,9 min), 7/7 productiesubpadtests (24,5 s). |
| [PR-controle 42043266133](https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/42043266133) | success; npm ci (169 packages, 3 s), lint, typecheck, 136/136 tests (3,84 s), build (1,44 s), 35/35 Chromium-e2e (12,3 min), 7/7 productiesubpadtests (27,5 s). |

Ook de actieve strikte echte JSON/CSV-bestandsdownloadtest is op Linux geslaagd. De resterende Windows-downloadacceptatie wordt daarmee niet als geslaagd aangemerkt. De hierop volgende commit vult uitsluitend deze documentatie aan; de uitvoerbare code en tests blijven gelijk aan de hierboven volledig gecontroleerde broncommit.

Oordeel: missies 5 en 6 vormen technisch geteste speelbare oefenroutes. Missies 1–4 en de bestaande scherm-/spiegelfuncties zijn behouden en de volledige regressie slaagt in Linux-CI. Dit is geen volledige hardware-, juridische of opleidingsacceptatie: de hierboven genoemde punten blijven open en missies 7–10 blijven uitgeschakeld.

PR #2 blijft concept tegen milestone-3-gecontroleerd; main en M3 zijn niet gewijzigd. Pages is alleen workflow_dispatch en is niet aangeroepen. M1-acceptatie blijft formeel open. Geen CBR-certificering, merge of publicatie.

---

# Historisch testverslag Milestone 4B (onderstaande resultaten betreffen de eerdere versie)


# TESTVERSLAG — Milestone 4B

Datum: 5 november 2026. Repository Reinirus/autorijsimulator-1.2, uitsluitend branch milestone-4-rijmissies. Uitgangspunt: 56be2a00ab2d8848cf59741ebed382d2e26a259a, de gecontroleerde M4A-versie op M3. M4A-resultaten zijn bewaard in TESTVERSLAG_M4A_HISTORIE.md en M4_VOORTGANG_M4A_HISTORIE.md. Eerdere testresultaten worden niet automatisch als nieuwe run geteld.

**Missie 3 en 4 zijn volledig als oefenrit doorlopen in Chromium en met de echte voertuigfysica. Missies 1 en 2 blijven behouden en zijn opnieuw volledig gereden. Missies 5–10 blijven uitgeschakeld. Geen afgeronde tienmissierelease of CBR-certificering. M1 blijft formeel open voor hardware- en duuracceptatie.**

## Werkelijk uitgevoerde commando's

Windows, Node v24.22.1, npm 10.9.2, Vite 7.3.7, Vitest 3.2.7 en Playwright Chromium headless/WebGL. npm is uitgevoerd als node ../../work/package/bin/npm-cli.js vanuit de projectmap. npm_config_cache verwijst naar work/npm-cache, PLAYWRIGHT_BROWSERS_PATH naar work/browsers. Het lockbestand en de dependencies zijn inhoudelijk niet gewijzigd.

| Commando | Feitelijk lokaal resultaat |
|---|---|
| npm ci --offline --no-audit --no-fund | Eerste poging faalde EPERM in bestaande node_modules-mappen. Na gerichte schrijftoegang opnieuw uitgevoerd: exit 0, 168 packages in 32 s. |
| npm run lint | Exit 0; na de laatste bron-/testwijziging opnieuw uitgevoerd. |
| npm run typecheck | Exit 0; na de laatste bron-/testwijziging opnieuw uitgevoerd. |
| npm test | Exit 0; **116/116 tests in 13 bestanden**, laatste volledige run **4,51 s**. Alle 108 M4A/M1/M2/M3-tests inbegrepen, plus 8 M4B-tests. |
| npm run build | Exit 0; 39 modules; laatste standaardbuild Vite **3,46 s**. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4573 --strictPort | Afzonderlijke ontwikkelserver voor deze projectmap gestart. |
| npm run test:e2e -- --workers=1 | Exit 1; **31 geslaagd, 1 mislukt van 32**, **7,1 minuten**. De enige mislukking is de bestaande Windows-downloadannulering; zie hieronder. |
| node node_modules/playwright/cli.js test tests/e2e/milestone4b.spec.ts --workers=1 | Na correctie van de zijbalktijd opnieuw uitgevoerd: exit 0, **2/2 complete ritten, 3,2 minuten**. |
| $env:BASE_PATH='/autorijsimulator-1.2/'; npm run build | Exit 0; 39 modules, laatste Vite-bouw **1,30 s**. |
| node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4576 --strictPort met dezelfde BASE_PATH | Afzonderlijke productiepreview gestart. |
| npm run test:pages -- --workers=1 | Exit 0; **5/5, 18,2 s** op de laatste productiebuild. Exact subpad /autorijsimulator-1.2/. |
| node work/m4-source-audit.cjs (vanaf de werkruimteroot) | Acht bestaande M3-regel-/scenario-/verkeersimplementaties inhoudelijk ongewijzigd. Geen wijziging in bestaande core-fysica of sync-protocol bij deze M4B-stap. |

De eerste gerichte M4B-unitrun vond twee ontwikkelfouten: encountergegevens werden nog niet op opslagvaliditeit gecontroleerd en de asfaltcontrole behandelde een wachtende voetganger ten onrechte als voertuig op asfalt. De parser is aangevuld; de geometriecontrole onderscheidt rijbaan en voetpad. Daarna slagen alle 116 tests. Een typecheck-aanroep vanuit een verkeerde werkmap vond aanvankelijk het npm-hulppad niet; vanuit de projectmap is de echte typecheck opnieuw uitgevoerd en geslaagd.

## Complete ritten en betekenis van de tests

Missie 3 rijdt circa 195 meter over één doorlopende woonwijkweg met een fietser van rechts, een voetganger op een zebra en een auto van rechts. Missie 4 rijdt circa 265 meter langs vier opeenvolgende kruispunten: twee keer B6/haaientanden en twee keer gelijkwaardig, met zowel auto's als fietsers. De wegen sluiten aan; de zebra veroorzaakt geen extra kruising. A1-borden tonen 30, de relevante kruisingen hebben de bestaande M3-B6/haaientanden, en huizen en trottoirs maken de route herkenbaar.

De browserritten sturen de echte invoerhandlers via toetsenbordevenementen per requestAnimationFrame op basis van alleen-lezen rendertelemetrie. Geen voertuigpositie, klok, actorpositie, route-index of tijdversnelling wordt door deze volledige ritten aangepast. De leerlingauto nadert en remt werkelijk; NPC's kruisen volgens het bestaande M3-model. De testrit wacht conservatief tot de NPC is gepasseerd. Dat is een teststrategie, geen nieuwe regel dat je altijd moet stoppen bij een leeg kruispunt. Opdrachten vereisen geen onnodige verplichte stop bij iedere kruising; alleen het eindvak heeft een stopdoel.

Gecontroleerd: alle verkeersmomenten afgewerkt, geen klokterugloop, geen voertuigsprong naar een volgende situatie, correcte eindpositie/stilstand, anoniem opgeslagen rapport met alle unieke encounter-IDs, begin-/eindtijden en uitleg, en volledige reset. Playwright rapporteerde voor de complete M4B-ritten **1,4 minuut voor missie 3** en **1,8 minuut voor missie 4**; dit zijn de afgeronde testtijden van Playwright. De ritten van missie 1 en 2 slaagden opnieuw in de volledige suite (18,9 s en 38,1 s).

De unit-tests doen daarnaast een onveilige rit over de echte missie-4-route zonder voor te laten gaan. Meerdere afzonderlijke voorrangsfouten krijgen verschillende encounter-IDs, tijdstippen, bestaande regelverwijzingen en verbeteradviezen. De gecontroleerde M3-regelmodule en NPC-code zijn niet aangepast. Een fietser op de kruisende weg gebruikt dezelfde bestuurder-/voorrangsfeiten; de uitleg noemt daarbij ook daadwerkelijk de fietser. Menselijke validatie van de nieuwe ruimtelijke toepassing blijft open.

Bij visuele controle bleek de oude M3-zijbalk lokale scenariotijden te tonen terwijl het hoofdrapport al globale tijden had. Voor M4B toont de zijbalk nu de globale tijd en encounter-ID. De twee volledige ritten zijn daarna herhaald met een assertie op overeenstemming met het opgeslagen rapport. Deze gerichte hercontrole komt bovenop de eerder uitgevoerde volledige 32-test-suite. Start- en eindbeelden staan in qa-m4b-missie-3/4-start/einde.png; de beide start- en eindbeelden zijn visueel geïnspecteerd.

## Bestaande functies en schermmodi

Alle bestaande M1/M2/M3- en M4A-regressies zijn opnieuw uitgevoerd: indrukken/loslaten/focusverlies, vraagpauze, snelheid, alle verkeerslichtfasen, camerastandpunten, drie levende spiegelbeelden, achteruitrijden, parkeren, kalibratie, breedbeeld, zijvensters, pop-upterugval, bron-/pakketverlies en herstel, en de zes afzonderlijke M3-situaties. De nieuwe schermtest doorloopt alle drie modi voor missie 3 én 4 en controleert NPC-soort, missie-/encounter-ID, zijvensterherladen, klokspreiding en terugkeer naar één scherm. Deze test slaagde in de volledige suite (36,2 s).

De productie-subpadtests omvatten nu vijf gevallen: beide nieuwe lange wegen inclusief zijvensters, de bestaande M4-missies, de oude demo en alle zes M3-situaties. Screenshots van eerdere M1/M2/M3/M4A-tests blijven historische referenties; nieuwe M4B-beelden en actuele meet-JSON worden apart bewaard.

Laatste korte M4B-steekproef (qa-m4b-performance.json):

| Missie | Eén scherm | Breedbeeld | Drie vensters midden / zij | Gemeten klokspreiding |
|---|---|---|---|---|
| 3 | 42,0 FPS | 37,7 FPS | 19,6 / 19,7 / 19,4 FPS | 0,04124 s |
| 4 | 39,9 FPS | 33,4 FPS | 19,0 / 19,1 / 19,1 FPS | 0,07282 s |

Statusregels worden op iets verschillende momenten bemonsterd. Dit zijn korte headless-metingen, geen minimum-FPS, schoollaptopbenchmark, fysieke monitorlatentie of genlock. Instanced huizen beperken de drawcalls; de bestaande spiegel-GPU-readback blijft een prestatiebeperking. Niet-fatale Vite-waarschuwing: JS-chunk 539,21 kB (gzip 140,39 kB). npm meldt de bestaande deprecation van ESLint 9.39.5. Geen security-audit of dependency-upgrade uitgevoerd.

## Resterende lokale mislukking en open validatie

De onverkorte downloadtest faalt lokaal opnieuw met Chromium canceled bij de eerste JSON-bestandsdownload. Daardoor bereikt die ene test de CSV-bestandslezing en wiscontrole niet. Dat is geen geslaagde downloadtest. De test blijft actief en ongewijzigd in de nieuwe GitHub Actions-run. Eerdere M4A-Linux-CI was groen, maar wordt niet als M4B-test geteld. De precieze Windows-oorzaak is nog niet definitief vastgesteld; de bekende sandbox-/browserbeperking blijft open.

Nog niet uitgevoerd: echte 1/2/3 monitoren met DPI/uitlijning, Edge, stuur/pedalen, twee duurproeven van 30 minuten, doelgroep-/toegankelijkheidsacceptatie en menselijke WRM-/juridische/didactische review. Geen gemeten oog-/hoofdcontrole en geen bewezen spiegel- of dodehoekfouten. De NPC's blijven per actief moment beperkt tot één primaire deelnemer; dit is geen volledige verkeersstroom, stadskaart of gevalideerde botsingswereld voor gebouwen. Rapportafronding betekent geen juridisch geslaagde rit.

Missies 5–10 blijven uitgeschakeld en worden niet als speelbaar of voltooid geclaimd. Alle assets zijn eigen procedurele geometrie. Status: **DEMO — NIET CBR-GECERTIFICEERD**; M1 blijft formeel open.

## GitHub

### Werkelijk uitgevoerde M4B-controles

Broncommit **e18aa30d18646d2677b431860557dbdbe3134ce8** is op Ubuntu / Node 22 volledig geslaagd: [pushcontrole 42020938008](https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/42020938008) en [PR-controle 42020945240](https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/42020945240), beide **success**. De gecontroleerde logs tonen npm ci, lint, typecheck en build geslaagd; **116/116 unit-tests (2,24 s), 32/32 Chromium-e2e (7,1 minuten), 5/5 subpadtests (16,6 s)**. De onverkorte JSON/CSV-downloadtest slaagt daar inclusief het lezen van de echte bestanden. Dat bevestigt Linux-browserexport, maar vervangt de nog open lokale Windows-downloadacceptatie niet.

Deze aanvulling wijzigt alleen documentatie. De uitvoerbare code blijft die van de geslaagde broncommit. De actuele opvolgcontrole staat bij PR #2; geen merge of Pages-publicatie uitgevoerd.

PR #2 is gecontroleerd en gericht op milestone-3-gecontroleerd (e4737be), omdat main nog de M2-commit bdbc9aa bevat. Alleen milestone-4-rijmissies krijgt de M4B-code. De daadwerkelijk uitgevoerde broncontroles staan hierboven; de actuele opvolgcontrole wordt ook in de eindrapportage gekoppeld. Geen merge en geen Pages-workflow gestart.
