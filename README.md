# Nederlandse Autorijsimulator — Milestone 1 + 2 demo

**DEMO · NIET CBR-GECERTIFICEERD. Geen vervanging voor rijles.** Milestone 1 blijft formeel open voor hardware- en duurtests. De gebruiker heeft de ontwikkeling van Milestone 2 uitdrukkelijk toegestaan terwijl die acceptatie openstaat.

## Starten

Node.js 22+ en een WebGL-browser:

```sh
npm ci
npm run dev
```

Open de lokale Vite-URL. Start de missie. W/↑ gas, S/↓/spatie rem, A/← en D/→ sturen. Laat toetsen los om gas/stuurinput te beëindigen; de auto rolt uit. Bij focusverlies wordt de bediening gewist. Bestuur vanuit het middenvenster.

## Schermmodi

Onder de cockpit staat **Beeldschermen · Milestone 2**:

- **Eén scherm:** de bestaande M1-cockpit met drie echte spiegels en missiebediening.
- **Breed beeld:** één browsercanvas met drie verschillende perspectieven links/midden/rechts. Spreid het browservenster zelf over de fysieke monitoren. Een brede monitor kan dezelfde weergave gebruiken.
- **Drie vensters:** klik **Open / herstel zijvensters**. De bestaande pagina blijft het middenvenster, met bediening en spiegels. Twee aparte vensters tonen zijaanzichten. Dit zijn geen extra spiegels. Sta zo nodig pop-ups voor deze website toe. Vensters openen uitsluitend na deze klik.

Sleep zijvensters handmatig naar links en rechts. **Verdeel over gedetecteerde schermen** vraagt pas na een klik browsertoestemming voor schermdetectie, als deze API beschikbaar is. Bij ontbrekende toestemming/API of minder dan drie schermen blijft handmatig plaatsen mogelijk. Automatische plaatsing is niet op fysieke monitoren gevalideerd.

**Terug naar één scherm** sluit de zijvensters. Bij het sluiten van een bekend zijvenster valt de eigenaar automatisch terug naar één scherm. Een vastgelopen of onbereikbaar zijvenster geeft daarnaast een waarschuwing in het middenvenster.

## Kalibratie

Open **Schermkalibratie**. Stel de linker/rechter kijkhoek, het verticale gezichtsveld, horizon/kanteling, de schermindeling (gelijke delen of 25/50/25), de randruimte en de maximale pixelschaal in. Het kalibratiekruis is een uitlijnhulp. De randruimte is geen fysiek gevalideerde bezelcorrectie; perspectieven kunnen overlappen of een naad tonen totdat kijkhoeken en gezichtsveld op de opstelling zijn afgestemd. Kalibratie geldt ook voor de zijvensters. Lagere pixelschaal kan de GPU-belasting verminderen; spiegels hebben vaste 320×190-renderdoelen.

Instellingen en het kanaal-ID worden alleen per browsertab in sessionStorage bewaard. Geen leerlingnamen of opgeslagen ritresultaten. **Herstel kalibratie** zet de standaardwaarden terug.

## Verbinding en herstel

Alleen het middenvenster simuleert. Dezelfde klok, voertuigpose, acteurs en verkeerslichtstatus gaan naar de zijvensters. De drie vensters tonen een circa 100 ms gebufferd beeld. Bij ontbrekende pakketten langer dan 1,5 seconde wordt het zijbeeld verborgen met een verbindingsmelding. Nieuwe pakketten herstellen het beeld vanzelf. Herladen van een zijvenster sluit weer aan. Herladen van het middenvenster start de missie opnieuw op 0; de bestaande zijvensters volgen die nieuwe bron. Er is geen herstel van de oude rit na een bronherstart.

Open geen tweede zelfstandige eigenaar voor dezelfde rit. Communicatie werkt binnen dezelfde browser/origin; geen ondersteuning voor verschillende computers of browsers. Achtergrondtabbladen kunnen door de browser worden vertraagd. Dit is geen hardwarematige framesynchronisatie.

## Testen

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=1
```

Voor de afzonderlijke productie-subpadtest in PowerShell:

```powershell
$env:BASE_PATH='/Autorijsimulator-1.1/'
npm run build
npm run test:pages -- --workers=1
```

Bij een andere repositorynaam: stel BASE_PATH bij bouwen en PAGES_BASE bij de test op hetzelfde subpad in. De Pages-test start zelf een lokale previewserver. De e2e-suite bevat een korte prestatiesteekproef en schrijft docs/qa-m2-performance.json. Deze cijfers zijn geen garantie voor leerlinghardware.

## GitHub Pages en status

De Pages-workflow blijft uitsluitend handmatig via workflow_dispatch. Push naar main activeert kwaliteitscontrole, geen publicatie. Beide workflows gebruiken npm ci, bouwen met het repositorysubpad en voeren de browser- en productie-subpadtest uit. De workflows zijn lokaal nagekeken, niet op GitHub uitgevoerd. In deze levering is niets gecommit, gepusht of gepubliceerd.

Lees docs/TESTVERSLAG.md voor de exacte resultaten, docs/ARCHITECTUUR.md voor de opbouw en PROJECTSPEC.md voor het oorspronkelijke bestek. Historische M1-resultaten staan in docs/TESTVERSLAG_M1_HISTORIE.md. Ongewijzigde beperkingen: eenvoudige NPC-routes zonder conflictvermijding/botsingen, geen juridisch gevalideerde beoordeling, geen stuur/pedalenacceptatie of duurtest. Eigen code MIT; procedurele geometrie, geen gekopieerde CBR-content.
