# TESTVERSLAG — Milestone 3, gecontroleerde branch

Datum: 4 november 2026. Repository Reinirus/autorijsimulator-1.2, branch milestone-3-gecontroleerd. Uitgangspunt: bdbc9aa3e8256eb1e7474e32ddef6323ef052d73. Het opgegeven ZIP-pakket is volledig overgenomen; zie OVERDRACHT_M3.md voor herkomst en vergelijking. De oorspronkelijke src/, tests/, docs/ en .github/workflows/ zijn behouden. Er waren geen aantoonbare codefouten bij deze hercontrole en daarom zijn geen functionele reparaties aangebracht.

**Automatische lokale kwaliteitscontrole geslaagd. Geen formele hardware-, juridische of didactische acceptatie. M1 blijft formeel open. DEMO — NIET CBR-GECERTIFICEERD.**

## Werkelijk uitgevoerd

Schone branchclone met eigen npm-installatie. Windows, Node v24.22.1, npm 10.9.2, headless Playwright Chromium. npm is uitgevoerd als node ../../work/package/bin/npm-cli.js vanuit de projectmap; browserbestanden via PLAYWRIGHT_BROWSERS_PATH=../../work/browsers en npm-cache in work/npm-cache. Geen dependencies gekopieerd uit een eerder project.

| Commando | Resultaat |
|---|---|
| npm ci --no-audit --no-fund | Exit 0, 168 packages, 37 s; package-lock.json gebruikt. |
| npm run lint | Exit 0. |
| npm run typecheck | Exit 0. |
| npm test | Exit 0, 93/93 tests, 9 bestanden, 3,85 s. Inclusief 31 M1/M2- en 62 M3-tests. |
| npm run build | Exit 0, 33 modules, Vite 4,27 s; standaard relatief base-pad. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4473 --strictPort | Afzonderlijke ontwikkelserver van deze clone gestart. |
| npm run test:e2e -- --workers=1 | Exit 0, 23/23 tests, 1,8 minuut. |
| $env:BASE_PATH='/autorijsimulator-1.2/'; npm run build | Exit 0, 33 modules, Vite 1,51 s. |
| node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4476 --strictPort | Productiepreview met hetzelfde subpad gestart. |
| npm run test:pages -- --workers=1 | Exit 0, 2/2 tests, 9,5 s, exact /autorijsimulator-1.2/. |

Browsersuites gebruiken de echte Chromium/WebGL-app: bediening en loslaten/focusverlies, cockpit en drie echte spiegelcamera's, verkeerslichtcyclus, snelheid, kalibratie, drie schermmodi, canonieke toestand, verlies/herstel van bron of pakketten, sluiten/heropenen zijvensters, zes verkeerssituaties, beoordeling, richtingaanwijzers en scenariowisseling. Productiesubpadtests bezoeken zowel de oude demo als alle zes M3-situaties en gesynchroniseerde zijvensters. Nieuwe schermafbeeldingen staan in qa-*.png; qa-m3-beoordeling.png en qa-m3-breedbeeld.png zijn ook visueel bekeken. Dit is browserautomatisering met screenshotinspectie, geen handmatig gereden hardwareacceptatie.

De unit-tests omvatten regelbeslissingen, NPC-reacties, geometrische contacten en complete scenarioverlopen met de voertuigfysica. Een eindpositie bereiken betekent oefening afgerond, geen officiële slaagscore. Ontbrekende spiegelcontrole geldt niet als bewezen fout zonder waarneming.

## Prestaties en waarschuwingen

Korte headless-steekproef (qa-m2-performance.json): één scherm 41,9 FPS; breedbeeld 36,0 FPS; drie vensters midden 19,1 FPS, zijvensters 18,2/18,3 FPS. Klokspreiding 0,02945 s. M3-steekproef (qa-m3-performance.json): midden 19,6 FPS, zijvensters 19,8/19,7 FPS; klokspreiding 0,04663 s. Dit zijn korte monsters op deze computer, geen minimum-FPS, GPU-completion of fysieke monitorlatentie. Driervensterprestaties zijn een expliciet optimalisatiepunt voor M4.

Niet-fataal: Vite waarschuwt voor de JS-chunk van 515,28 kB (gzip 132,13 kB). npm meldt een verouderingswaarschuwing bij ESLint 9.39.5. npm audit is niet uitgevoerd. Geen falende uitgevoerde test.

## GitHub en publicatie

De CI-workflow draait op push en pull_request; Pages uitsluitend op workflow_dispatch. Deze opdracht gebruikt alleen de featurebranch en een pull request naar main. Er wordt niet gemerged en geen Pages-workflow gestart. De resultaten van de na deze broncontrole gestarte GitHub-runs worden in de pull request en de eindrapportage vermeld; dit verslag claimt vooraf geen geslaagde remote run. De eerdere M2-publicatie en herstelcontrole zijn historisch bewaard in TESTVERSLAG_M2_REPOSITORY_AUDIT.md; die gelden niet als huidige M3-test.

## Resterende acceptatie en basis voor M4

M3 is een geschikte technische ontwikkelbasis onder voorwaarden; zie M4_TECHNISCHE_BASIS.md. De zes situaties zijn begrensde deterministische oefeningen, geen algemeen Nederlands verkeersnetwerk. Voor tien missies zijn een missiemodel, doorlopende route/klok, herhaalde beoordelingsmomenten, voortgang/opslag/export en leer-/examenstand nog nodig. Parkeren, rotondes en snelwegen zijn nog geen complete missies.

RVV-bronnen, artikelen, datum en reviewstatus staan in REGELBRONNEN.md en RVV_BRONUITTREKSELS.txt. De historische bronnencontrole is bewaard; deze overdracht heeft geen nieuwe juridische verificatie of menselijke review uitgevoerd. Scenariofeiten zijn deels voorgedefinieerd; NPC's en botsingen zijn vereenvoudigd. Juridisch/didactische review door een deskundige blijft open. Hardwaretests op echte één/twee/drie schermen, DPI/uitlijning, stuur/pedalen, Edge, laptopbenchmark en twee duurproeven van 30 minuten zijn niet uitgevoerd. Geen formele M1/M2/M3-eindacceptatie of CBR-certificering.

De oude pakketrapporten zijn bewaard als historische documenten en vervangen geen bovenstaande actuele resultaten. Milestone 4 is bij deze opdracht niet ontwikkeld.
