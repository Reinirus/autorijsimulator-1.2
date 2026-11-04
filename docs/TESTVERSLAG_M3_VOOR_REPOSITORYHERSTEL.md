# TESTVERSLAG — Milestone 3 Nederlandse Autorijsimulator

Datum: **4 november 2026**. Gebaseerd op de bestaande M2-code in autorijsimulator-1.1; nieuwe zelfstandige projectmap **autorijsimulator-milestone3**. M2 en de oorspronkelijke OneDrive-bron zijn behouden. Vooraf gelezen: PROJECTSPEC.md, README.md, ARCHITECTUUR.md en het M2-testverslag. De historische verslagen zijn bewaard als TESTVERSLAG_M1_HISTORIE.md en TESTVERSLAG_M2_HISTORIE.md.

**Oordeel: de lokale technische controles van het M3-project slagen. De gebruikte RVV-brontekst is gecontroleerd. Formele onderwijs-/juridische vrijgave blijft open voor menselijke review, hardwareacceptatie en duurtests.** M1 blijft formeel open. Er is niets gecommit, gepusht, gedeployed of gepubliceerd; geen GitHub-workflow aangeroepen.

## Gebouwd

Zes selecteerbare Nederlandse verkeerssituaties met plaatsing, leerdoel, opdracht, NPC-route, trigger, juridische bron en beoordeling. Situaties: gelijkwaardig kruispunt, B6/haaientanden, verkeerslicht, rechtsaf naast fietser, zebra en wegrijden uit parkeervak. De bestaande M1/M2-demo blijft de standaardoptie.

De nieuwe pure verkeersregelmodule is gescheiden van geometrie, NPC-besturing, fysica en presentatie. NPC's versnellen, remmen, wachten, reageren op eigen verkeerslicht/gestopte speler en voorspelde fysieke conflicten. Contact wordt geometrisch gemeld en de spelerssnelheid wordt op nul gezet. Geen uitgewerkte impactfysica of stadsbrede AI.

De beoordeling bevat simulatietijd, scène-ID, gebeurteniscode, feitelijke positie/snelheid/aanwezigheid van licht, modelconflict, NPC-modus, RVV-verwijzing en alternatief. Richtingaanwijzers zijn toegevoegd. Geen verzonnen CBR-slaagscore, boetebedragen of gemeten oog-/spiegelgedrag. Open uitlegdetails blijven open bij nieuwe observaties; afronding blijft behouden nadat de eindpositie is bereikt.

Cockpit, keyboard, drie echte spiegelcamera's, één scherm, breedbeeld en drie gesynchroniseerde vensters blijven aanwezig. Eén eigenaar voert fysica en regels uit; scenario-ID, gebeurtenissen, richtingaanwijzer, NPC's en kruislicht reizen mee in dezelfde canonieke toestand. Een scenariowissel wist oude interpolatiesnapshots, ook bij klok 0.

## Juridische broncontrole

De officiële RVV-pagina is op 04-11-2026 rechtstreeks opgehaald: https://wetten.overheid.nl/BWBR0004825/2026-07-01/0. De ontvangen pagina vermeldt 'Geldend van 01-07-2026 t/m heden' en raadpleegdatum 04-11-2026. SHA256 volledige HTML: **bfc247f1d6eb1eaa9e4149979f2d91894b1a52a497467e6713475e147a60e424**. Relevante brontekst en bijlage A1/B6 staan in RVV_BRONUITTREKSELS.txt; de bron-/normmatrix staat in REGELBRONNEN.md.

Gecontroleerd voor deze toepassing: art. 3, 15, 17, 18, 19 (context rem-/zichtafstand), 49, 54, 55, 62, 63, 64, 68, 79, 80 en bijlage 1 A1/B1/B6. Geel licht heeft een wettelijke uitzondering; de code benoemt de beoordeling op een eigen remmodel alleen als advies. Voorrangsborden, verharde/onverharde weg, tram, afslaand verkeer, voorrang bij groen, leeg kruispunt en rood voetgangerslicht zijn in expliciete regeltests opgenomen. Uitgezonderde/speciale situaties buiten de zes scènes worden niet als volledig ondersteunde simulator geclaimd.

Dit is een technische tekst- en toepassingscontrole door de ontwikkelagent, **geen menselijke juridische/didactische goedkeuring**. reviewedByHuman blijft false. Conflictvensters, afmetingen, stop-/detectiepunten en reactietijden zijn simulatorparameters, geen wettelijke universele grenzen. Iedere modelregelmelding moet binnen die afbakening worden gelezen.

## Testomgeving en werkelijk uitgevoerde commando's

Windows; Node v24.22.1; npm 10.9.2; Vitest 3.2.7; Vite 7.3.7; Playwright Chromium 156.0.8078.4 (build 1248), headless WebGL. Bestaande dependencyversies en package-lock.json uit M2 hergebruikt, fysiek naar de nieuwe projectmap gekopieerd. Geen nieuwe dependency en geen nieuwe npm-installatie nodig voor M3. Geen schoolhardware/stuur/pedalen aangesloten.

In deze omgeving is npm uitgevoerd als `node ../../work/package/bin/npm-cli.js`. Chromium is via PLAYWRIGHT_BROWSERS_PATH naar work/browsers verwezen. Dat is een hulpmiddel van deze sessie; het pakket gebruikt normale npm-scripts. De ontwikkelserver draaide apart in de M3-map op poort 4273, zodat de test geen oudere M2-server kon hergebruiken. De productiepreview op poort 4276 is eveneens uit de M3-map gestart.

| Werkelijk uitgevoerd | Eindresultaat |
|---|---|
| `npm run lint` | Exit 0. Broncode en tests gecontroleerd. |
| `npm run typecheck` | Exit 0. src, tests/unit en vite.config.ts volgens tsconfig; browserbestanden worden door Playwright getransformeerd, niet volledig door dit typecheck-script gecontroleerd. |
| `npm test` | Exit 0. **93/93 tests in 9 bestanden**, laatste run **2,27 s**. Alle 31 bestaande tests plus 62 nieuwe M3-tests. |
| `npm run build` | Exit 0. Productiebouw met tsc -b en Vite. |
| `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4273` | Lokale M3-testserver gestart. |
| `npm run test:e2e -- --workers=1` | Exit 0. **23/23 geslaagd**: 13 bestaande en 10 nieuwe browsertests. Laatste volledige run: **1,7 minuut**, zoals door Playwright gerapporteerd. |
| `$env:BASE_PATH='/Autorijsimulator-1.1/'; npm run build` | Exit 0. Repository-subpad en dynamische eigenaar-/zijvenstermodules gebouwd; 33 modules. |
| `$env:BASE_PATH='/Autorijsimulator-1.1/'; node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4276` | Lokale preview van de gebouwde M3-versie gestart. |
| `npm run test:pages -- --workers=1` | Exit 0. **2/2 geslaagd**, laatste volledige productierun **9,7 s**. M1/M2-cockpit en zijvensters; daarna alle zes M3-situaties en scenariowisseling in zijvensters onder /Autorijsimulator-1.1/. De definitieve build is opnieuw gecontroleerd; beide tests slagen. |
| GitHub publiceren / CI uitvoeren | Niet uitgevoerd. |

Alle testresultaten hierboven komen uit werkelijk uitgevoerde commando's. De suite is tijdens ontwikkeling uitgebreid en na bronwijzigingen herhaald; er zijn geen geschreven-maar-niet-uitgevoerde M3-testgevallen als geslaagd geteld.

## Dekking en concrete resultaten

### 93 Vitest-controles

- Bestaande 31 regressies op fysica, vaste stappen, snelheid, toetsen loslaten, spiegels, lichtfasen, basale regels en multischermbuffering blijven slagen.
- 22 expliciete juridische feitencombinaties: rechts/links, onverhard/verhard, tram, B6 zonder verkeer, B1, rood/groen/geel, geel onbekend, afslaande fietser, groen met afslaan, zebra, rood voetgangerslicht, bijzondere manoeuvre en onbekende situatie.
- Bronmetadata voor alle zes situaties, waarnemingsbewijs en alternatief, rode en groene passage, geel als modeladvies, rechts afslaan, wegrijden, richtingaanwijzers, geen dubbele gebeurtenis, fysieke contacten zonder juridische schuldclaim, reset/stop en scenariowissel zonder mengen van acteurs.
- NPC stopt voor rood en hervat bij groen; voetganger wacht en steekt over na gestopte auto; fietser remt voor voorspeld contact. Rijstroken veroorzaken geen valse rechthoek-overlap. Zes deterministische lange stapreeksen blijven identiek en eindig, zonder negatieve NPC-snelheid.
- Hoofd- en kruislicht zijn op 1260 tijdpunten van een volledige cyclus gecontroleerd: nooit tegelijk vrijgegeven; ontruimingsfasen staan expliciet in de cyclus.
- Correcte indicatorcontrole bij begin afslaan, geen herhaalde fout na een voltooide afslag, geparkeerde auto volledig buiten de rijbaan, geen fictief verkeerslicht in bewijs en geen doortrekken van A1-beoordeling naar onbekend wegvak na afslaan.
- **Zes volledige correcte oefenritten met de echte voertuigfysica:** naderen/stoppen/wachten/doorrijden voor rechts, B6, licht en zebra; een echte fysieke rechtsafbocht na passeren fietser; wachten/richting aangeven/invoegen uit parkeervak. Alleen bediening en indicator zijn aangestuurd; deze zes tests verplaatsen het voertuig niet naar een eindpositie. Alle zes bereiken 'afgerond', zonder regelafwijking of contactmelding. De afronding blijft daarna behouden.

### 23 Chromium-browsertests

De 13 behouden tests controleren cockpit, drie daadwerkelijke spiegels en gekleurde referentieobjecten, stuur/gas/rem/key-up/blur, vraagpauze, volledige lichtcyclus, één scherm, breedbeeld, drie vensters, kalibratie, herladen, bronverlies, pakketverlies, geblokkeerde pop-ups, ontbrekende scherm-API en prestaties.

De 10 nieuwe tests openen en rijden in elk van de zes scènes, controleren instructie, NPC-status, zichtbaar beeld in alle drie spiegelcanvassen, snelheid, juiste aanwezigheid van een licht en stopbediening. Aanvullend:

1. Werkelijke roodlichtpassage in de draaiende browser levert feiten, RVV-link en alternatief.
2. Wachten op groen en passeren levert geen rode-lichtafwijking.
3. Zonder richting wegrijden levert een melding; na reset met correct richtingteken ontbreekt die melding.
4. M3-fietser en daarna M3-zebra worden naar echte zijvensters gesynchroniseerd; terug naar breedbeeld blijft werken.

Alle zes scènescreenshots zijn daadwerkelijk bekeken, evenals het beoordelingsbeeld en de productieversie. B6/haaientanden, zebra, stopstreep, hoofd-/kruislicht, parkeervak, fietser in rechterspiegel en achteropkomende auto zijn zichtbaar. Procedurele eenvoudige geometrie; geen fotorealistische assets of echte cockpitinterieurkalibratie geclaimd.

## Korte prestatiesteekproeven

Ruwe bestanden: qa-m2-performance.json voor de behouden demo in drie modi, qa-m3-performance.json voor een draaiende M3-fietsersituatie met drie vensters. Het zijn momentopnamen na 3,5 s wachten, met rollende circa 1 s FPS; geen lange benchmark en geen minimumgarantie.

| Steekproef | Midden FPS / render | Links FPS / render | Rechts FPS / render |
|---|---|---|---|
| M1/M2 één scherm | 42,6 / 5,9 ms | — | — |
| M1/M2 breedbeeld | 43,5 / 5,7 ms | — | — |
| M1/M2 drie vensters | 20,5 / 5,4 ms | 20,6 / 0,8 ms | 20,6 / 0,8 ms |
| M3 fietser, drie vensters | 20,6 / 6,0 ms | 20,7 / 0,9 ms | 20,6 / 0,9 ms |

Klokspreiding M3 in deze steekproef: **0,04476871153464401 s** (circa **44,8 ms**). De statusregels van de zijvensters: “20.7 FPS · render 0.9 ms · pakketouderdom 48 ms · klok 4.59 s” en “20.6 FPS · render 0.9 ms · pakketouderdom 97 ms · klok 4.58 s”.
 Gelezen klokspreiding is één steekproef van de weergegeven toestanden, geen maximum over de rit en geen fysieke monitor-/inputlatentie. Ruwe statusregels en de klokmeting zijn vlak na elkaar gelezen en hoeven niet exact hetzelfde frame te beschrijven. Render-ms is CPU-aanroeptijd, geen GPU-completion.

## Herstelde en aangescherpte punten tijdens M3

- Het bron-/waarnemingspad van M3 staat apart van de legacy-demofuncties.
- Niet-actieve lichten worden in de scène verborgen en als afwezig beschreven.
- B6- en zebramarkering en parkeervak zijn zichtbaar; huizen blokkeren de kruisende rijbaan niet meer.
- Afslaan wordt aan het begin beoordeeld voor richting aangeven; later uitschakelen na afslaan maakt geen nieuwe oude fout.
- De auto begint parallel en volledig in het parkeervak; het verlaten wordt met de voertuigcontour bepaald.
- Geen oude-naar-nieuwe acteurinterpolatie bij scenariowissel; open uitlegdetails behouden; afgerond blijft afgerond.
- Gemodelleerde geel-stopruimte wordt alleen advies; contact en noodremmen worden niet als vastgestelde juridische schuld aangemerkt.

## Beperkingen en formele acceptatie

Menselijke verkeerskundige, juridische en didactische scèneacceptatie ontbreken. De officiële normtekst is gelezen en de code is getest, maar geometrische conflictvoorspelling bewijst geen universele juridische overtreding. De engine ondersteunt zes beschreven situaties en expliciete uitzonderingsfeiten, niet alle mogelijke verkeerssituaties. Geel, modelafmetingen, anticipatie en contactreacties blijven vereenvoudigd. Overgangen worden op de vaste 1/60-s-simulatiestappen waargenomen; het is geen exacte fysieke/juridische tijdmeting. Geen automatisch oordeel over blikrichting, geen CBR-score of certificering.

Geen duurtests van twee keer 30 minuten, geen fysieke 1/2/3-schermacceptatie op schoolhardware, geen Edge-/DPI-/USB-stuuracceptatie. M1 blijft formeel open en M2/M3 zijn nog niet op die hardware vrijgegeven. De browser kan achtergrondvensters vertragen; dezelfde bron blijft leidend maar er is geen genlock of continuïteitsgarantie na een definitieve broncrash. Een eigenaar-reload begint in de standaarddemo; kies de M3-situatie opnieuw.

De productiebouw meldt een gedeelde chunk van circa **515 kB** (circa 132 kB gzip), boven de Vite-waarschuwingsgrens van 500 kB. Dit is een waarschuwing, geen buildfout; preload-/downloadprestaties op leerlingnetwerken zijn niet gemeten. Geen security-audit, toegankelijkheidsreview of browsermatrix buiten het genoemde Chromium uitgevoerd.

Publicatie blijft handmatig via workflow_dispatch. De CI-/Pages-configuratie is lokaal nagekeken en de productie-subpadtests zijn uitgevoerd; geen daadwerkelijke GitHub-run of hostinginstellingen gecontroleerd. De leveringsmap bevat broncode, lockbestand, tests, broncontrole, scenariospecificaties en dit verslag. node_modules/buildoutput zijn niet nodig in de ZIP; installeer met npm ci en bouw met npm run build.

**Eindoordeel: M3-project technisch gecontroleerd met geslaagde automatische controles; formele juridische/didactische/hardwarevrijgave blijft open. Niets gepubliceerd.**
