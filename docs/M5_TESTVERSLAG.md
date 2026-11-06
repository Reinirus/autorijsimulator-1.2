# Milestone 5A — integratie en werkelijke kwaliteitscontrole

Datum: 6 november 2026. Branch: milestone-5-theorie-inzicht. Uitgangspunt: gecontroleerde M4E-commit 396e4540d4419c99f38ee659865f15afe4d3f904. **DEMO — NIET CBR-GECERTIFICEERD.**

## Aanlevering en behoud

Het genoemde ZIP-bestand was niet als ZIP beschikbaar. De uiteindelijk aangeleverde 164 losse bestanden zijn op basis van imports, bestandsinhoud en vergelijking met M4E op hun oorspronkelijke plaats geïntegreerd. docs/M5_AANLEVERING.json legt de mapping vast. Het aangeleverde, nog onvolledige verslag staat apart in M5_TESTVERSLAG_AANLEVERING.md. Dit verslag beschrijft uitsluitend de nu uitgevoerde controles.

Alle tien M4E-missies en de bestaande tests blijven aanwezig. Buiten nieuwe theoriecode zijn uitsluitend het koppelpunt src/app.ts en aanvullende CSS functioneel gewijzigd. Voertuigfysica, rijroutes, verkeersregelmodule, NPC's, spiegels en schermsynchronisatie zijn behouden. Historische M4-meetbestanden zijn teruggezet naar hun oorspronkelijke bytes; nieuwe regressiemetingen hebben qa-m5-regressie-* als naam.

## Commando's en resultaten

Windows, Node 24.22.1, npm 10.9.2, Playwright 1.64.1, Chromium 156.0.8078.4 (rev. 1248), één worker. npm is uitgevoerd via node ../../work/package/bin/npm-cli.js omdat npm niet in PATH staat. Cache en browsers stonden in de workspace. De server en testclient draaiden samen in één procesomgeving; losse servers uit verschillende toolprocessen waren hier niet betrouwbaar bereikbaar.

| Werkelijk uitgevoerd | Resultaat |
|---|---|
| npm ci --offline --cache C:/Users/Q038575/Documents/Codex/2026-11-03/je-x20/work/npm-cache --no-audit --no-fund | Geslaagd: 168 packages, circa 32 s. Lockfile ongewijzigd. Geen online audit uitgevoerd. |
| npm run lint | Geslaagd, ook na de laatste toetsenbordcorrectie. |
| npm run typecheck | Geslaagd, ook na de laatste toetsenbordcorrectie. |
| npm test -- --reporter=default --reporter=json --outputFile=../../work/m5-vitest.json | 186/186 geslaagd, 19 bestanden, 10,32 s. Daarvan 173 behouden M4-tests en 13 theorie-tests. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Geslaagd; laatste build 53 modules, 1,48 s. Grootste gedeelde chunk 590,15 kB (gzip 157,87 kB); waarschuwing boven 500 kB blijft. |
| npm run test:e2e | **53/55 geslaagd, 2 mislukt, 33,4 min.** Volledige bestaande en nieuwe suite, geen overgeslagen strikte downloadtest. |
| PAGES_BASE=/autorijsimulator-1.2/ npm run test:pages | **13/13 geslaagd, 36,0 s**, op de productiebuild met dit BASE_PATH. Geen publicatie. |

PowerShell gebruikte $env:BASE_PATH en $env:PAGES_BASE voor bovenstaande omgevingsvariabelen. De browserrunners startten Vite op 4573 en preview op 4576 en riepen de echte npm-scripts aan. Ruwe resultaten: qa-m5-unit.json, qa-m5-chromium.log, qa-m5-pages.log.

Voorafgaande M5-browsersteekproef: 5/6 geslaagd; CSV-download geannuleerd. Daarna zijn native spatiebediening en corrupte opslag apart gecontroleerd: 2/2 geslaagd. De volledige 55-test-run hierboven gebruikte de definitieve code en omvat die controles opnieuw.

## Wat Chromium werkelijk controleerde

- Alle tien rijmissies volledig gereden met bestaande voertuigfysica en toetsenbordpilots; voor 7–10 ook Rustig/Druk. Missie 9 eindigde rond 711,40 m; missie 10 rond 1.286,93 m, met 299,72/298,50 simulatieseconden, geen teruglopende klok en geen contactmelding in de gecontroleerde ritten. Het is geautomatiseerde browserinvoer, geen menselijke verkeerskundige acceptatierit.
- M1–M4-regressies: cockpit, gas/rem/sturen en loslaten/focusverlies, drie levende spiegelcamera's en juiste achteraanzichten, D/R/achteruit parkeren, verkeerslichtfasen, M3-regelobservaties, NPC's, encounters, rapportage, herstart, drie schermmodi en herstel na verbindingsverlies. De eerder onderbroken woonwijkrit slaagde deze keer in de volledige suite.
- Theorieknop, alle 15 vragen precies eenmaal, reproduceerbare shuffle op opgeslagen seed, onderwerpkeuze, bewust fout antwoord, oefenfeedback na elke keuze, geen antwoorduitleg tijdens oefentoets, volledig eindrapport met gekozen en juiste antwoorden. Screenshots qa-m5-oefenen.png en qa-m5-oefentoets.png visueel bekeken.
- Theorie pauzeert voertuig en wereldklok; rijden krijgt geen dialoogtoetsen. Spatie activeert de normale antwoordknop. De theorieknop is verborgen tijdens de M4-oefenexamenrit en zichtbaar in leerstand.
- Anoniem vorig resultaat na herladen; corrupte data genegeerd; geblokkeerde localStorage blijft bruikbaar; afbreken overschrijft geen eerder voltooid resultaat. Er wordt alleen het laatste complete theorieresultaat opgeslagen, geen leerlingnaam en geen volledige theoriehistorie.
- Theorie-CSV-inhoud uit de echte exportknop gecontroleerd: zeven kolommen, vijf antwoordregels voor een onderwerp, seed/vraag-ID/gekozen antwoord, geen naam/email. Dit inhoudsonderzoek vervangt de strikte bestandsdownloadtest niet.
- Beide theoriestanden en tien missies bereikbaar op productie-subpad; bestaande dynamische modules, spiegels en zijvensters laden daar eveneens.

## Twee nog mislukte Windows-downloadcontroles

1. tests/e2e/mission-features.spec.ts: bestaande M4-rapportdownload; de eerste JSON-download meldt failure() = "canceled". De volgende M4-CSV-bestandscontrole in dezelfde test wordt daardoor niet bereikt.
2. tests/e2e/theory.spec.ts: nieuwe echte theorie-CSV-bestandsdownload meldt eveneens "canceled". De controle van bestandspad, UTF-8-BOM en bestandstekst wordt daardoor niet bereikt. CSV-Blob-inhoud is wel afzonderlijk gecontroleerd.

Beide verwachten strikt failure() === null en blijven actief. Geen skip, platformuitzondering of vervanging door alleen een download-event. Het bestaande M4E-diagnoseonderzoek (Blob, HTTP en verschillende downloadmappen/Chromium-modi) blijft in het project; dat onderzoek bewees geen oplossing. Voor M5 is de CSV-link binnen het actieve modale dialoog geplaatst en de object-URL blijft 30 s bestaan, maar ook de definitieve run annuleert de download. De oorzaak is hier niet bewezen. De Windows-bestandsdownload en daarmee lokale volledige groene vrijgave blijven open. Handmatige controle op de doel-laptop ontbreekt.

## Prestaties en beperkingen

Korte regressiesteekproeven in dezelfde Windows/headless-omgeving: M2 circa 40,8 FPS één scherm, 42,4 breedbeeld en 20,0 drie vensters. Voor missie 7 waren de gemeten gemiddelden 32,21 / 31,77 / 16,60 FPS; missie 8 43,12 / 40,09 / 20,47. Readback in die M7/M8-metingen circa 2,76–3,25 ms per frame, spiegelrender circa 0,91–1,35 ms, kopiëren circa 0,43–0,46 ms. Zie qa-m5-regressie-m4d-performance.json voor volledige samples en vensterouderdommen.

De drievenstermodus blijft traag. Er is geen renderer-/GPU-readbackoptimalisatie toegepast en geen FPS-winst geclaimd. Deze korte software/headless-metingen zijn geen fysieke schoolhardware-, GPU-, meerbeeldscherm- of duuracceptatie. M1 blijft formeel open.

## Inhoud, bronnen en vrijgave

Vijftien eigen Nederlandse conceptvragen: vijf verkeersregels, vijf tekstuele gevaarherkenningscasussen, vijf verkeersinzicht. Geen officiële CBR-vragen, video-oefening, 50-vragentoets of verzonnen slaaggrens. Regelvragen verwijzen naar bestaande M3-regelbronnen met artikel, versie, URL, controledatum en reviewedByHuman:false. Op 6 november is de officiële RVV-versie 01-07-2026 opnieuw geraadpleegd; zie REGELBRONNEN.md. Technische broncontrole is geen menselijke juridische/WRM-/didactische goedkeuring. Er is geen nieuwe beoordeling van onbewezen spiegel-/dodehoekgedrag.

De automatische kwaliteit is **niet volledig groen op deze Windows-omgeving** door de twee downloads. Commit/push uitsluitend naar M5 is toegestaan om dezelfde strikte suite in GitHub Actions te controleren. Pas na daadwerkelijk groene CI mag een concept-PR naar milestone-4-rijmissies worden gemaakt; de uiteindelijke CI-link en platformuitslag worden bij die PR vermeld. Geen merge, geen Pages-workflow starten. De bestaande Pages-workflow is alleen workflow_dispatch; CI doet uitsluitend controles. Menselijke juridische, didactische en fysieke validatie blijven vereist, ook bij groene Linux-CI.
