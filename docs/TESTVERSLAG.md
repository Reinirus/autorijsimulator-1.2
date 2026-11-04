# TESTVERSLAG — herstel Milestone 2 / autorijsimulator-1.2

Datum: 4 november 2026. Repository: Reinirus/autorijsimulator-1.2. Uitgangscommit: 90ab8fbb9fbf44811ab6728d28228e4d096ec9ea. Referentie: het oorspronkelijke autorijsimulator-milestone2.zip.

**Oordeel: structuurherstel en alle onderstaande lokale technische controles geslaagd.** M1 blijft formeel open voor hardware- en duuracceptatie; geen handmatige Pages-workflow aangeroepen. Zie de hieronder vastgelegde onverwachte automatische publicatie.

## Inhoudsvergelijking en herstel

Alle 26 gevolgde repositorybestanden waren vóór herstel byte-identiek aan het corresponderende referentiebestand (volledige Git-blobhash vergeleken). 15 foutief geplaatste bestanden zijn verplaatst naar de canonieke map; 30 ontbrekende bestanden zijn aangevuld. Er is geen afwijkende of unieke repositorybron overschreven/verwijderd. Volledige oud/nieuw/hash-tabel: STRUCTUURHERSTEL.md. Het eerdere M2-testverslag is bewaard als TESTVERSLAG_M2_VOOR_HERSTEL.md.

Hersteld: src/ met core, renderer, world, traffic, rules, assessment, questions en displays; tests/unit, tests/e2e en tests/pages; docs/; .github/workflows/ci.yml en pages.yml; .gitignore. Imports zijn via TypeScript, Vite, Vitest en werkelijk geladen browsermodules gecontroleerd. De M2-toepassingsbron is inhoudelijk behouden. De Pages-test en README zijn aangepast naar het exacte pad /autorijsimulator-1.2/; testpoorten zijn 4373 en 4376.

## Werkelijke uitvoering

Windows, Node v24.22.1, npm 10.9.2, Vitest 3.2.7, Vite 7.3.7 en Playwright Chromium 156.0.8078.4 (build 1248). npm is hier aangeroepen via node ../../work/package/bin/npm-cli.js. PLAYWRIGHT_BROWSERS_PATH wijst naar de al aanwezige browserbinary in work/browsers. Er is daadwerkelijk een schone npm ci uitgevoerd in de herstelde checkout; geen gekopieerde node_modules als vervanging voor die controle.

| Commando | Werkelijk resultaat |
|---|---|
| npm ci --no-audit --no-fund | Exit 0, 168 pakketten geïnstalleerd in 34 s; package-lock.json behouden. Deprecated-melding eslint 9.39.5; geen audit uitgevoerd. |
| npm run lint | Exit 0. |
| npm run typecheck | Exit 0; dekking src, tests/unit en vite.config.ts volgens tsconfig. |
| npm test | Exit 0; 31/31 tests in 8 bestanden, 2,38 s. |
| npm run build | Exit 0; TypeScript en Vite-productiebouw geslaagd. |
| node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4373 --strictPort | Apart gestarte server in deze herstelde checkout. |
| npm run test:e2e -- --workers=1 | Exit 0; 13/13 geslaagd, 1,1 minuut zoals Playwright rapporteerde. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Exit 0; 26 modules, 3,41 s Vite-bouw; assets onder het juiste kleine-letterpad. In PowerShell: $env:BASE_PATH='/autorijsimulator-1.2/' vóór het buildcommando. |
| node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4376 --strictPort met dezelfde BASE_PATH | Lokale productiepreview gestart op /autorijsimulator-1.2/. |
| npm run test:pages -- --workers=1 | Exit 0; 1/1 geslaagd, 4,4 s. Cockpit, dynamische JS/CSS, versnellen en beide zijvensters geladen onder het exacte subpad; geen HTTP >=400 of pageerror. |

Een eerste serverstart op 4173 gaf EACCES. Een eerste browserpoging op die poort is afgebroken en telt niet als geslaagde volledige run. De hele suite is opnieuw uitgevoerd tegen de expliciet in de herstelde checkout gestarte server op 4373. De poorten zijn daarvoor ook in de testconfiguraties gewijzigd. Er zijn geen niet-uitgevoerde tests als geslaagd aangemerkt.

De 13 browsertests controleren bestaande cockpit, echte spiegels inclusief pixeloriëntatie, snelheidsweergave, besturing en key-up, focusverlies, vraagpauze, lichtcyclus, één/breed/drie vensters, kalibratie, bron- en pakketverlies, herladen en terugval. De Pages-test gebruikt relatieve ./-navigatie en controleert dat de zijvensters hetzelfde subpad houden.

## Korte meetgegevens

Ruwe meetgegevens staan in qa-m2-performance.json; korte headless-steekproeven, geen hardwaregarantie:

- single: Midden: 36.0 FPS · render 6.9 ms.
- span: Midden: 33.3 FPS · render 7.4 ms.
- windows: Midden: 15.5 FPS · render 7.0 ms. links: pakket 199, klok 12.10 s, ouderdom 130 ms, 15.5 FPS | rechts: pakket 200, klok 12.10 s, ouderdom 78 ms, 15.6 FPS 15.6 FPS · render 1.1 ms · pakketouderdom 103 ms · klok 12.33 s | 15.8 FPS · render 1.0 ms · pakketouderdom 59 ms · klok 12.35 s

Klokspreiding van de drie weergegeven toestanden in die steekproef: 0.007142857142858006 s. CPU-render-aanroeptijd is geen fysieke GPU-/monitorlatentie. Geen langdurige minimum-FPS-claim.

## GitHub en publicatie

Pages.yml start uitsluitend met workflow_dispatch. CI controleert push/pull_request en bouwt met /${{ github.event.repository.name }}/; de Pages-subpadtest krijgt hetzelfde PAGES_BASE. Er is geen Pages-workflow aangeroepen. Een bestaande automatische Pages-run van vóór deze herstelopdracht is waargenomen; vóór verdergaan is de gebruiker gevraagd de Pages-bron op GitHub Actions te zetten. De gebruiker heeft daarna 'ga verder' gegeven. Die beheerinstelling kon niet via de connector worden gelezen en is niet als zelfstandig geverifieerd geclaimd.

## Bevestigde push en onverwachte automatische Pages-run

Herstelcommit 3c94eccf65c0c1b97f765dc6b874f032d0778f2b is als normale fast-forward naar main gepusht. De GitHub-treehash 5492041c0a643dcf7017de4e786452f9219b494c is exact gelijk aan de gecontroleerde lokale Git-index. De GitHub-kwaliteitscontrole voor deze commit is geslaagd: https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/41831882367.

**GitHub startte door de bestaande Pages-instelling bij de push ook automatisch een Pages-build/deployment**, event dynamic: https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/41831879414. Die run is voltooid met success. Er is geen workflow_dispatch of andere expliciete deployment-opdracht door de agent uitgevoerd, maar de uitkomst voldoet daardoor niet aan de gewenste 'geen deployment'-voorwaarde. Dit wordt nadrukkelijk niet als 'niets gepubliceerd' gerapporteerd.

De connector heeft geen Pages-instellings- of workflow-annuleerfunctie; de eerdere browserbediening was automatisch gestopt wegens onbetrouwbare URL-herkenning. Er was geen niet-interactieve Git-authenticatie beschikbaar om de run via de API te annuleren. De gebruiker is direct gewaarschuwd en gevraagd de Pages-bron op GitHub Actions te zetten. De run was al voltooid. Er zijn geen herstel-/terugdraaideployments uitgevoerd. Deze auditnotitie is na de push aangevuld. De gebruiker heeft daarna bevestigd dat de Pages-instelling is aangepast. De auditnotitie wordt met een afzonderlijke documentatiecommit vastgelegd; er wordt geen deployment-workflow aangeroepen.

## Beperkingen

Geen hardware- en duurtests van twee keer 30 minuten, geen acceptatie op 1/2/3 echte schoolmonitoren of stuur/pedalen, geen Edge-/DPI-matrix, geen juridische/WRM-review of toegankelijkheidsreview. M2 blijft een technisch prototype met de eerder beschreven model- en synchronisatiebeperkingen. M3-verkeerssituaties worden afzonderlijk op deze herstelde basis bijgewerkt en getest; zij worden niet ongemerkt met deze M2-herstelcommit vermengd.
