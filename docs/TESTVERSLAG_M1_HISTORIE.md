# TESTVERSLAG — Milestone 1 / repositoryversie 1.1

Datum: 3 november 2026. **Eindoordeel: Milestone 1 nog niet volledig geslaagd / niet vrijgegeven.** De onderstaande technische controles slagen na herstel. De duurtest en acceptatie op doelhardware ontbreken. Milestone 2 is niet gestart. Er is niets gepusht, gedeployed of gepubliceerd.

## Geteste bestanden en omgeving

Werkkopie van de door de gebruiker aangeleverde lokale map `autorijsimulator_m1`, opgeslagen als `outputs/autorijsimulator-1.1`. De oorspronkelijke OneDrive-map is niet gewijzigd. Deze werkkopie is niet automatisch gelijkgesteld aan de huidige GitHub-branch en is daar niet naartoe geschreven.

README.md en het eerdere TESTVERSLAG.md zijn vooraf gelezen. PROJECTSPEC.md ontbreekt in de bronmap; het bestek in de eerder aangeleverde map autorijsimulator_codex is in deze chat gelezen als projectcontext, niet als nieuwe opdracht.

Windows, Node v24.22.1, npm 10.9.2 (tijdelijk lokaal toegevoegd omdat npm niet op PATH stond), Vitest 3.2.7, Vite 7.3.7, Playwright Chromium 156.0.8078.4 (build 1248), headless WebGL. Geen fysieke schoolmonitoren of stuur/pedalen getest.

## Uitgevoerde commando's en resultaten

In deze omgeving staat `npm` hieronder voor `node ../../work/package/bin/npm-cli.js`; voor de Playwright-webserver is een tijdelijke npm.cmd-wrapper op PATH gezet. Chromium staat via PLAYWRIGHT_BROWSERS_PATH in de tijdelijke map work/browsers. Op een gewone Node/npm-installatie kunnen de standaardcommando's gebruikt worden.

| Commando | Werkelijk resultaat |
|---|---|
| Download npm 10.9.2 met Invoke-WebRequest | Eerste poging zonder netwerkrechten: host onbekend. Na verleende netwerktoegang: gelukt. |
| `npm install --no-audit --no-fund` | Exit 0; 168 pakketten geïnstalleerd, package-lock.json gemaakt. npm meldt een deprecatiemelding voor eslint 9.39.5. Geen security-audit uitgevoerd. |
| `npm run lint` | Exit 0, zowel eerste controle als hercontrole na code- en testwijzigingen. |
| `npm run typecheck` | Exit 0, eerste controle en hercontrole. Dit script controleert src, unit-tests en vite.config.ts; geen volledige TypeScript-typecheck van e2e-bestanden. |
| `npm run test` | Eerst 18/18 geslaagd; na extra regressietest 19/19 in 6 bestanden, exit 0. |
| `npm run build` | Exit 0; TypeScript en Vite-productiebundel gebouwd. |
| `node node_modules/playwright/cli.js install chromium` | Exit 0; Chromium, headless shell en ondersteunende binaries gedownload. |
| `npm run test:e2e -- --workers=1` | Laatste volledige run: **5/5 geslaagd**, 32,6 seconden, exit 0. |
| `$env:BASE_PATH='/Autorijsimulator-1.1/'; npm run build` | Exit 0; productie-HTML verwijst naar assets onder /Autorijsimulator-1.1/. |
| Vite preview met dezelfde BASE_PATH op poort 4175 + Playwright-productiecontrole | Exit 0 voor controle: pagina, JS/CSS, WebGL, start en versnellen werken op http://127.0.0.1:4175/Autorijsimulator-1.1/. Geen HTTP >=400 of pageerror. Screenshot qa-pages-build.png. |
| GitHub Actions / Pages uitvoeren | Niet uitgevoerd. Geen publicatie. |

De productiecontrole gebruikte Chromium, opende de bovenstaande URL, klikte Start missie, hield ArrowUp 1 seconde vast, liet los, controleerde snelheid >0 en verzamelde HTTP- en paginafouten. Dit is een lokale buildtest, geen test van de daadwerkelijk gehoste GitHub-site of GitHub-instellingen.

## Eerdere mislukte controlepogingen tijdens deze sessie

- De eerste uitgebreide browserrun had 3 geslaagde tests en 1 fout: de nieuwe test zocht 'Sluiten' en vond ook 'Je ogen sluiten'. Selector aangescherpt met exact:true; geen productfout.
- De daaropvolgende run had 4/5 geslaagd. De lichttest werd onderbroken doordat tijdens de run een bronbestand werd gewijzigd en Vite de app herlaadde. De volledige suite is daarna zonder wijzigingen tijdens de run herhaald: 5/5 geslaagd.
- De eerste lokale Pages-preview had geen overeenkomende BASE_PATH ingesteld; Start missie kon niet gevonden worden. Preview opnieuw gestart met dezelfde BASE_PATH als de build; de productiecontrole slaagde. Gebruik bij lokale preview dus dezelfde BASE_PATH als bij de build.

## Herstelde aantoonbare fouten

1. Zijspiegels keken naar de tegenoverliggende achterzijde. Linker- en rechter-yaw gecorrigeerd en de bestaande test aangepast aan de juiste wereldrichting (links is negatieve X bij heading 0).
2. Hoofdcamera en spiegelcamera's draaiden tegengesteld aan de fysische rijrichting tijdens sturen. Camerayaw gebruikt nu -heading, de cockpitpositie draait mee, en NPC-modelrotatie volgt dezelfde conventie.
3. Verkeerslicht wisselde rood → oranje → groen. Het demomodel gebruikt nu rood (0–9 s) → groen (9–18 s) → oranje (18–21 s) → rood. Dit zijn demotijden, geen juridisch gevalideerd verkeersregelprogramma.
4. De lampen zaten aan de achterkant van de behuizing en waren vanuit de startpositie onzichtbaar. De lampen staan nu aan de kant van de naderende speler.
5. Beide workflows gebruiken nu npm ci met het meegeleverde lockbestand. Het gegenereerde tsconfig.tsbuildinfo is uit het leveringspakket verwijderd en wordt genegeerd.

## Werkelijke browserdekking

- Start, stop, missie en inzichtvraag.
- Gas met W en ArrowUp, zichtbare snelheidstoename, rem met spatie tot 0, links/rechts sturen, loslaten van gas/stuur/rem, input wissen na gesimuleerd window-blur, pauze van de klok tijdens inzichtvraag.
- Drie afzonderlijke gevulde spiegelcanvassen; veranderd achterbeeld bij rijden.
- Gecontroleerde WebGL-test met rode, groene en blauwe 3D-objecten achter het voertuig: juiste zijspiegel, horizontale spiegelvolgorde en opnieuw juiste oriëntatie na 90 graden draaien. Dit gebruikt de echte DrivingView-rendercamera's en pixels, geen namaakbeelden.
- Volledige lichtcyclus in de draaiende UI: rood → groen → oranje → rood.
- Screenshot qa-cockpit.png is daadwerkelijk bekeken: woonwijk, drie verschillende spiegelbeelden, rode lamp, snelheid en dashboard zichtbaar. De cockpit is een eenvoudige camera met HTML-dashboard; geen uitgewerkt 3D-auto-interieur.
- Productiebuild met repositorysubpad in Chromium geopend en gecontroleerd. Screenshot qa-pages-build.png.

## GitHub Pages-configuratie

Statisch gecontroleerd: pages.yml start uitsluitend via workflow_dispatch; geen publicatie bij push. BASE_PATH is /${{ github.event.repository.name }}/, dus voor deze repository /Autorijsimulator-1.1/. Build, lint, typecheck, unit-tests en Playwright staan voor de deploystappen. Artifactmap is dist. CI controleert bij push/pull_request. Geen workflow aangeroepen, geen GitHub Pages-instellingen gewijzigd. De in de eerdere GitHub-inspectie bekeken repository-root bevatte geen .github-map; deze lokale workflows zijn niet naar GitHub overgezet of daar gevalideerd.

## Resterende beperkingen en vrijgavevoorwaarden

- De voorgeschreven langdurige acceptatie (twee sessies van 30 minuten in het bestek), FPS-minimum en werking op de daadwerkelijke schoolhardware zijn niet getest. Geen gemeten FPS-claim.
- Geen optische spiegelkalibratie of toetsing op 1/2/3 fysieke monitoren; alleen headless Chromium. Geen Edge, USB-stuur of pedalen getest.
- NPC-auto en fietser bewegen volgens vaste routes, reageren niet op verkeerslichten/speler/elkaar. Geen botsingsmodel of veilige verkeersinteractie. Dit is een bekende functionele beperking van de demo.
- Geen menselijke verkeerskundige/juridische review; roodlicht en voorrang worden niet als live wettelijke overtredingen beoordeeld. De 30-zone is een demonstratie. Geen certificering.
- Geen volledige toegankelijkheidsreview, native auto-interieur of praktijkexamenbeoordeling.
- GPU-readback van drie spiegels per frame blijft een prestatierisico. De korte browsertests bewijzen geen langdurige stabiliteit of prestaties op leerlinglaptops.

**Conclusie:** lint, typecheck, 19 unit-tests, build en 5 Chromium-tests zijn werkelijk geslaagd. De volledige Milestone 1-acceptatie is nog niet afgerond vanwege de genoemde duur-/hardwarecontroles en functionele beperkingen. Geen publicatie en geen start van Milestone 2.
