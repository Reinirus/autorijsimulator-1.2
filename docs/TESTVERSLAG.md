# TESTVERSLAG — Milestone 4 ontwikkelversie

Datum: 5 november 2026. Repository Reinirus/autorijsimulator-1.2; uitsluitend branch milestone-4-rijmissies. Basis: gecontroleerde M3-commit e4737be6fff3e185d33fb7da8a48b4994d7b17ce. De aangeleverde losse bestanden zijn herleid naar hun oorspronkelijke paden; zie M4_AANLEVERING.json en M4_VOORTGANG.md. Het eerdere branchverslag is bewaard als TESTVERSLAG_M3_GECONTROLEERDE_BRANCH.md, de aangeleverde voortgang als M4_VOORTGANG_AANLEVERING.md.

**M4 is geen afgeronde tienmissierelease. Missies 1 en 2 hebben volledige fysica- en Chromium-ritten doorlopen. Missies 3–10 blijven in ontwikkeling en uitgeschakeld. M1 blijft formeel open. DEMO — NIET CBR-GECERTIFICEERD.**

## Omgeving en commando's

Windows, Node v24.22.1, npm 10.9.2, Vitest 3.2.7, Vite 7.3.7 en de geïnstalleerde Playwright Chromium (headless, WebGL). npm is aangeroepen als node ../../work/package/bin/npm-cli.js vanuit de projectmap. npm_config_cache verwijst naar work/npm-cache; PLAYWRIGHT_BROWSERS_PATH naar work/browsers. De volledige verse installatie gebruikt het bestaande, inhoudelijk ongewijzigde lockbestand. Geen npm-security-audit uitgevoerd.

| Werkelijk uitgevoerd | Laatste lokale resultaat |
|---|---|
| npm ci --offline --no-audit --no-fund | Exit 0; 168 packages, 55 s. De lokale cache bevatte alle vereiste pakketten. |
| npm run lint | Exit 0. |
| npm run typecheck | Exit 0. |
| npm test | Exit 0; 108/108 tests in 12 bestanden; laatste volledige run 10,72 s. Inclusief alle 93 M1/M2/M3-controles. |
| npm run build | Exit 0; 37 modules, Vite 6,82 s; standaard relatief base-pad. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4573 --strictPort | Eigen ontwikkelserver gestart en via HTTP 200 gecontroleerd. |
| npm run test:e2e -- --workers=1 | Exit 1; **28 geslaagd, 1 mislukt**, 3,3 minuten. De mislukking is de strikte bestandscontrole van JSON/CSV-download, zie hieronder. Geen groene volledige lokale browser-suite geclaimd. |
| $env:BASE_PATH='/autorijsimulator-1.2/'; npm run build | Exit 0; 37 modules, Vite 4,07 s. |
| node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4576 --strictPort met dezelfde BASE_PATH | Eigen productiepreview gestart. |
| npm run test:pages -- --workers=1 | Exit 0; 3/3 tests in 14,9 s op de laatste productiebuild. |

## Inhoudelijk uitgevoerd

Unit-tests controleren de bestaande fysica, invoer, spiegels, cameras, verkeersregels, NPC's en schermsynchronisatie. Nieuw: echte complete ritten voor missie 1 en 2 met integrateVehicle, remmen achteruit zonder omkering, D/R-blokkade tijdens rijden, volledig gedraaide voertuigcontour binnen het parkeervak, reset, opslagvalidatie, exportformattering en twee herhaalde verkeerslichtmeldingen met unieke encounter-ID's en doorlopende klok. De laatste encountertest injecteert grensposities en is nadrukkelijk geen volledige gecombineerde rit. Acht uitgeschakelde routevoorstellen en een eerste rijstrookvalidator zijn getest; dit maakt die missies niet speelbaar.

Chromium heeft beide missies volledig gereden via de echte browserinvoerhandlers. De uiteindelijke rijtest stuurt per requestAnimationFrame toetsenbordevenementen op basis van alleen-lezen rendertelemetrie; geen voertuigpositie, routefase, tijdversnelling of simulatiestap wordt door de test veranderd. Laatste volledige browserritten: missie 1 19,2 s en missie 2 38,0 s. De oorspronkelijke tests gebruiken daarnaast native Playwright-toetsen voor indrukken, loslaten en focusverlies. Afronding, nul snelheid, lokale opslag, export-start en herstart zijn gecontroleerd. Nieuwe schermbeelden qa-m4-missie-1.png en qa-m4-missie-2.png zijn visueel bekeken.

Alle bestaande M1/M2/M3-browsertests slagen in de volledige run: drie echte spiegelbeelden, juiste camerazijden na sturen, lichtfasen, snelheids-/invoerbediening, vraagpauze, kalibratie, breedbeeld, zijvensters, pop-upterugval, verlies en herstel van bron/pakketten en de zes M3-situaties. Nieuwe M4-schermtest controleert missie-ID, D/R en voertuigtoestand, zijvensterherladen, terugval en reset. De productie-subpadtests controleren beide M4-missies naast de oude demo, alle zes M3-situaties en zijvensters.

## Resterende lokale downloadmislukking

De strikte test verwacht dat Chromium het echte downloadbestand opslaat en leest daarna de JSON-/CSV-inhoud van schijf. Chromium geeft lokaal bij de eerste JSON-download canceled; daardoor wordt CSV in diezelfde test niet bereikt. Exportknoppen starten wel een download-event met de juiste bestandsnaam. Pure CSV-formattering, opslag en rapportvorming zijn apart geslaagd; dat is geen bewijs van een geslaagde bestandsdownload.

Browserdiagnostiek meldde tevens Access denied bij een profielbestand-hernoeming. Gerichte extra schrijftoegang, een eigen downloadmap en een andere tijdelijke profielmap namen canceled niet weg. De precieze oorzaak van de downloadannulering is dus niet definitief vastgesteld. Dit blijft een open Windows-/sandboxbeperking of browserprobleem totdat de download buiten deze omgeving bevestigd is. De strikte test blijft actief in GitHub Actions, zonder skip of afgezwakte assertie. Een geslaagde Linux-CI-run mag niet worden gelezen als geslaagde Windows-downloadacceptatie.

## Herstelde fouten en eerdere pogingen

- De aanlevering had geen volledige parkeerroute en alleen vooruitfysica. Toegevoegd: doorlopende route, sturen, D/R, rem-/stilstandlogica, voorvak en begrensde achteruitparkeeracceptatie.
- De eerste browser-parkeerrit liep op de uitlijneis voor het voorvak vast; het voorvak is een tussenstop, de volledige contour-/uitlijntest geldt voor het eindvak.
- De aanvankelijke externe testbesturing hield stuurtoetsen door communicatievertraging te lang vast en liep soms in cirkels. Vervangen door browserframe-besturing via de echte invoerhandlers; daarna beide volledige ritten geslaagd. Dit is geen menselijke hardwaretest.
- Aantoonbare UI-fout: Bewaar oefenrapport bleef bij een stilstaande rit uitgeschakeld, doordat alleen afstands-/doelwijzigingen opnieuw werden gerenderd. De klok-startstatus zit nu in de rendersleutel; de test met uitgeschakelde localStorage slaagt.
- Onvolledige opgeslagen rapportobjecten konden CSV-export laten crashen. Parser valideert nu getallen, arrays en gebeurtenissen. Corrupte rapporten worden geweigerd.
- Rapportstatus werd onmiddellijk overschreven door de voortgang. Opslagstatus staat nu afzonderlijk. Richtingknoppen blijven na afloop van het M3-wegrijdmoment zichtbaar; opdracht staat ook in de cockpit.
- De eerste lint/typecheck/test-pogingen begonnen terwijl npm ci nog liep en vonden hun executables niet. Ze zijn na installatie opnieuw uitgevoerd. Netwerkblokkades en een hangende lokale preview-opruiming veroorzaakten afgebroken browserpogingen; de uiteindelijke suites gebruiken expliciete eigen servers. Pages en e2e hebben nu afzonderlijke artifactmappen. Deze eerdere pogingen zijn geen geslaagde volledige suites.

## Prestaties en beperkingen

Laatste korte M4-steekproef uit qa-m4-performance.json: één scherm 36,1 FPS; breedbeeld 33,2 FPS; drie vensters midden 18,1 FPS, zijvensters 17,9/17,9 FPS. Gemeten klokspreiding 0,03651 s. Andere korte runs geven afwijkende FPS, mede door headless rendering en gelijktijdige testbelasting. Dit zijn geen minimum-FPS of prestatieacceptatie op schoollaptops. Render-aanroeptijd is geen GPU-completion. Drievensterprestaties blijven een optimalisatie-/hardwarepunt. De actuele JSON-metingen blijven bewaard; bestaande M1/M2/M3-PNG's blijven historische referenties, nieuwe M4-PNG's zijn van deze run.

Vite waarschuwt voor een chunk van 531,32 kB (gzip 137,99 kB). npm meldt de deprecation van ESLint 9.39.5. Geen dependency-upgrade op basis van alleen een waarschuwing. De drie echte spiegelcamera's blijven behouden; de bestaande GPU-readback is een prestatiebeperking.

M3-regels, bronnen, artikelen, versiedatum en reviewstatus zijn behouden; acht regel-/scenario-/verkeersbestanden zijn met HEAD vergeleken en ongewijzigd. Geen nieuwe juridische verificatie of menselijke review uitgevoerd. Nieuwe route-aanwijzer-/snelheidsfeedback is als oefenadvies gescheiden van bestaande M3-regelmeldingen. Geen beoordeling van onbewezen spiegel- of dodehoekcontrole. NPC's/botsingen blijven een begrensd scenariomodel; stilstaande gebouwen/weggrenzen zijn geen volledig botsingsnetwerk.

Niet uitgevoerd: tien complete missies, volledig semantisch verkeersnetwerk, afgeronde leer-/examenstand, doelgroep-/toegankelijkheidsacceptatie, Edge, echte 1/2/3 schermen/DPI, stuur/pedalen, twee duurtests van 30 minuten, formele voertuigkalibratie, juridische/didactische menselijke review en nieuwe security-audit. M4_VOORTGANG.md vermeldt per onvoltooide missie het resterende werk.

## GitHub en publicatie

### Uitgevoerde GitHub-controle

Broncommit **56544b1a32b5b392f086a2b233b01454366e3e68** heeft alle stappen op Ubuntu / Node 22 doorlopen: [Kwaliteitscontrole 42005897583](https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/42005897583), conclusie **success**. npm ci, lint, typecheck en build slagen; **108/108 unit-tests, 29/29 Chromium-e2e (3,6 minuten) en 3/3 productie-subpadtests (17,1 s)**. De strikte exporttest is daarbij niet overgeslagen: de echte JSON- en CSV-downloadbestanden zijn gelezen en gevalideerd; herladen en wissen slagen. Dit bevestigt de export op die Linux-browseromgeving, niet de nog open downloadacceptatie op de lokale Windows-sandbox.

Deze aanvulling verandert uitsluitend documentatie. De uitvoerbare code is dezelfde als in de geslaagde broncontrole. Een volgende PR-controle wordt afzonderlijk gevolgd; geen merge of Pages-publicatie uitgevoerd.

Alleen milestone-4-rijmissies wordt bijgewerkt. main en milestone-3-gecontroleerd worden niet gewijzigd. Pages blijft alleen workflow_dispatch; geen merge of deployment uitvoeren. De pushcontrole blijft inclusief de strikte exporttest. Een PR naar main wordt pas gemaakt nadat GitHub Actions slaagt. De geslaagde broncontrole is hierboven vastgelegd; de actuele PR-controle wordt ook in de eindrapportage gekoppeld. main bevat nog de M2-basis; de M4-PR omvat daarom ook de gecontroleerde M3-voorouder. M3-PR #1 blijft afzonderlijk ter beoordeling.
