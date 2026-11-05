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
