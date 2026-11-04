# TESTVERSLAG — M3 na herstel van Milestone 2 / repository 1.2

Datum: 4 november 2026. De herstelde M2-bron is naar Reinirus/autorijsimulator-1.2/main gepusht als **3c94eccf65c0c1b97f765dc6b874f032d0778f2b**. De GitHub-kwaliteitscontrole van die commit is geslaagd: https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/41831882367.

**M3-hercontrole technisch geslaagd.** De zes verkeerssituaties, RVV-regelmodule, NPC-interacties, uitlegbare observaties, cockpit, drie spiegels en meerdere vensters zijn behouden. Menselijke juridische/didactische review, hardware- en duuracceptatie blijven open. M1 blijft formeel open.

## Doorgevoerde integratie

De lokale M3-code had al de canonieke structuur. Alle 35 oorspronkelijke src/-, tests/- en workflowbestanden van M2 zijn aanwezig. De originele M3-uitbreidingen zijn behouden; er is geen oudere M2-code over geschreven. De Pages-test en README verwijzen nu naar het exacte kleine-letterpad /autorijsimulator-1.2/. Tests draaien op eigen poorten 4473 en 4476. Zie INTEGRATIE_M2_HERSTEL.md en STRUCTUURHERSTEL_M2.md.

Het vorige M3-verslag is bewaard als TESTVERSLAG_M3_VOOR_REPOSITORYHERSTEL.md. De inhoudelijke scenariobeschrijving, juridische bronnencontrole en bronuittreksels blijven in SCENARIOS.md, REGELBRONNEN.md en RVV_BRONUITTREKSELS.txt staan. Er zijn bij dit herstel geen nieuwe verkeersregels toegevoegd of gewijzigd.

## Werkelijk uitgevoerde hercontrole

Windows, Node v24.22.1, npm 10.9.2, Vitest 3.2.7, Vite 7.3.7 en Playwright Chromium 156.0.8078.4 (build 1248), headless WebGL. Dependencies/lockbestand zijn ongewijzigd. M2 heeft een echte npm ci doorlopen; M3 gebruikt de bestaande installatie met dezelfde versies. npm werd aangeroepen via node ../../work/package/bin/npm-cli.js; PLAYWRIGHT_BROWSERS_PATH verwijst naar work/browsers.

| Commando | Resultaat van deze hercontrole |
|---|---|
| npm run lint | Exit 0. |
| npm run typecheck | Exit 0; src, unit-tests en vite.config.ts volgens tsconfig. |
| npm test | Exit 0; **93/93** in 9 bestanden, **3,68 s**. Alle 31 M1/M2- en 62 M3-controles. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4473 --strictPort | Eigen M3-testserver gestart. |
| npm run test:e2e -- --workers=1 | Exit 0; **23/23**, **1,8 minuut** zoals Playwright rapporteerde. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Exit 0; tsc en Vite, 33 modules, Vite-bouw **1,41 s**. |
| node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4476 --strictPort met dezelfde BASE_PATH | Eigen M3-productiepreview gestart. |
| npm run test:pages -- --workers=1 | Exit 0; **2/2**, **10,0 s**. Zowel de behouden demo als alle zes M3-situaties, beide zijvensters en een scenariowisseling werken op /autorijsimulator-1.2/. |

De volledige M3-rittentests met echte fysica blijven slagen: vier keer naderen/stoppen/wachten/doorrijden, de rechtsafbocht na de fietser en wegrijden na achteropkomend verkeer. De browserregressies omvatten bron- en pakketverlies, herstel, kalibratie, terugval en spiegels. Er zijn geen geschreven-maar-niet-uitgevoerde controles als geslaagd geteld.

## Korte M3-meetgegevens

Laatste ruwe steekproef uit qa-m3-performance.json:

- Midden: Midden: 20.5 FPS · render 6.0 ms. links: pakket 82, klok 4.32 s, ouderdom 150 ms, 20.5 FPS | rechts: pakket 83, klok 4.37 s, ouderdom 83 ms, 20.4 FPS
- Zijvensters: 20.5 FPS · render 0.9 ms · pakketouderdom 99 ms · klok 4.57 s | 20.4 FPS · render 1.0 ms · pakketouderdom 49 ms · klok 4.58 s
- Eén gemeten spreiding tussen weergegeven klokken: 0.05937500000000018 s.

Dit zijn korte headless-steekproeven, geen minimum-FPS op schoolhardware, fysieke displaylatentie of duuracceptatie. CPU-render-aanroeptijd meet geen GPU-completion. De meetmomenten van statusregels en klokspreiding zijn niet exact hetzelfde frame.

## Publicatie: belangrijke afwijking bij de M2-push

De agent startte geen handmatige Pages-workflow. GitHub heeft echter door de bestaande repositoryinstelling bij de M2-herstelpush **automatisch Pages gepubliceerd**: https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/41831879414 (event dynamic, success). Dat is niet in overeenstemming met de gewenste 'geen deployment'-uitkomst. De run was voltooid voordat hij kon worden tegengehouden. De gebruiker is gewaarschuwd en gevraagd Source op GitHub Actions te zetten. De connector heeft geen Pages-beheer-/annuleerfunctie en er was geen niet-interactieve Git-authenticatie beschikbaar; de beheerinstelling is niet zelfstandig geverifieerd.

De gebruiker heeft bevestigd dat de Pages-instelling is aangepast. De auditnotitie en README zijn naar main gepusht als bdbc9aa3e8256eb1e7474e32ddef6323ef052d73. Bij de nacontrole is voor die commit alleen Kwaliteitscontrole gestart en geen nieuwe Pages-run waargenomen. **Deze M3-aanpassing is lokaal gebleven; geen M3-push of M3-deployment uitgevoerd.** De correcte lokale productie-subpadtest mag niet worden gelezen als verificatie van de automatisch gepubliceerde live site.

## Beperkingen

De eerder vastgelegde beperkingen blijven gelden: menselijke juridische/WRM-/didactische review, 1/2/3 echte schermen, schoolhardware, DPI/Edge/stuur/pedalen en twee duurtests van 30 minuten ontbreken. Geen CBR-certificering of officiële slaagscore. De Vite-bouw geeft de bekende niet-fatale waarschuwing voor een gedeelde chunk van circa 515 kB (circa 132 kB gzip). Geen nieuwe security-audit of toegankelijkheidsreview.

**Eindoordeel: herstelde M2-basis en M3-integratie technisch gecontroleerd. De broncode van M2 staat op GitHub met geslaagde CI; de M3-integratie is lokaal geleverd. De onverwachte automatische M2-Pages-publicatie is expliciet gerapporteerd.**


## Afsluiting auditnotitie

Auditcommit bdbc9aa3e8256eb1e7474e32ddef6323ef052d73 is bevestigd op main. De nieuwe GitHub-kwaliteitscontrole is geslaagd: https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/41835556137. Voor deze auditpush is bij de afsluitende controle geen nieuwe Pages-run aanwezig. De eerdere automatische publicatie blijft hierboven als incident vastgelegd. De lokale Git-checkout is inhoudelijk en met exact overeenkomende commit-hash gesynchroniseerd.
