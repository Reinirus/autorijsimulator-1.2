# Milestone 5B — interactieve gevaarherkenning

Controle: 10 november 2026. Branch milestone-5b-gevaarherkenning, exact gestart vanaf b4588eb38fecc271e914488f6299ea3f460afe1f. **DEMO — NIET CBR-GECERTIFICEERD.**

## Gerealiseerd en behouden

Afzonderlijke module **Gevaarherkenning in beweging**, naast de vijftien M5A-vragen en alle tien bestaande rijmissies. Tien oorspronkelijke 3D-voorbeelden met werkelijk bewegende actoren:

| ID | Situatie | Visueel onderwerp |
|---|---|---|
| GHV-01 | Zebrapad | Voetganger loopt de oversteek op |
| GHV-02 | Kruising | Auto nadert van rechts |
| GHV-03 | Fietser bij de zijweg | Fietser rechts naast de auto; voornemen rechtsaf |
| GHV-04 | Verkeer voor ons | Langzamer wordende voorligger met oplichtende remlichten |
| GHV-05 | Geparkeerde auto's | Auto belemmert zicht; mogelijke voetganger |
| GHV-06 | Bal bij de straat | Bewegende bal met volgende voetganger/kind |
| GHV-07 | Werk naast de weg | Kegels en bewegende werker, vrije rijstrook |
| GHV-08 | Fietser op afstand | Bewegende fietser op afzonderlijk fietspad |
| GHV-09 | Langzame fietser vooruit | Fietser op de rijbaan |
| GHV-10 | Halte | Bus en bewegende voetganger |

De bestaande eigen Three.js-weg en auto-/fiets-/voetgangermodellen worden hergebruikt. Geen externe afbeeldingen, video, CBR-assets of nieuwe npm-afhankelijkheden. De graphics zijn schematische oefenmodellen, niet fotorealistisch.

Iedere film duurt maximaal 6,2 s en kan opnieuw worden afgespeeld. Eerst minimaal drie seconden kijken; daarna steeds **Kijk → Voorspel → Beslis**. De drie acties zijn Doorgaan, Gas loslaten en Remmen. De drie seconden zijn een UI-keuze, geen wettelijke reactietijd of examencriterium. Er is geen automatische beoordeling van oog-, spiegel- of dodehoekgedrag.

Leerstand geeft uitleg na de drie keuzes, pauze en herhaling. Oefentoets toont geen juist-antwoorduitleg tot het eindrapport. Iedere situatie krijgt achteraf de gekozen observatie, voorspelling en actie, afzonderlijke passende/onpassende oefenfeedback, film-ID, filmkeuzetijd en een concreet advies. Geen officiële slaaggrens. Er wordt alleen een compleet laatste anoniem resultaat opgeslagen met stand, seed, datum, situatie-ID's, keuzes en filmtijd. Extra naamvelden worden verwijderd. Afbreken maakt geen nieuw voltooid resultaat. Na herladen toont het startscherm een samenvatting van het vorige resultaat; het uitgebreide rapport is in deze versie direct na de ronde beschikbaar, niet opnieuw vanuit die samenvatting te openen.

## Architectuur en behoud

src/hazards/catalog.ts bevat inhoud en deterministische actortrajecten; session.ts beheert stappen, filmklok en gevalideerde anonieme opslag; view.ts rendert met hergebruikte eigen geometrie; panel.ts bevat de toegankelijke dialoog.

De bestaande rAF-lus stuurt de film. Alle actoren in één film volgen dezelfde begrensde klok en seed. De rijmissie blijft met haar bestaande canonieke voertuigtoestand gepauzeerd; openen/herhalen van een film reset die wereld niet. Zijvensters blijven de gepauzeerde rijwereld ontvangen en hervatten daarna. De les zelf staat in het middenvenster. Er is geen tweede bestuurbare voertuigsimulatie. WebGL wordt pas bij starten van de les gemaakt; sluiten ruimt geometrie, textures en renderer op. Ontbrekende WebGL geeft een foutmelding zonder stilstaand surrogaat of voltooid resultaat.

De fysica, D/R, parkeren, M3-regels, NPC-rijlogica, routes, cockpit, drie spiegelcamera's, drie schermmodi, bestaande rapportage, opslag en CSV/JSON-export zijn inhoudelijk ongewijzigd. Alleen src/app.ts en aanvullende CSS koppelen de nieuwe module in. Alle bestaande testbestanden blijven behouden. De algemene toetsenafhandeling laat nu native spatie/Enter op de twee lesknoppen door; de bestaande spatie-remtest blijft actief en is opnieuw uitgevoerd.

## Werkelijke commando's en resultaten

Windows; Node 24.22.1, npm 10.9.2, Playwright 1.64.1 en headless Chromium 156.0.8078.4. npm werd gestart via node ../../work/package/bin/npm-cli.js, omdat npm niet in PATH staat. Eén browserworker; lokale Vite-server op 4573 en productie-preview op 4576.

| Uitgevoerd | Werkelijke uitslag |
|---|---|
| npm ci --offline --cache C:/Users/Q038575/Documents/Codex/2026-11-03/je-x20/work/npm-cache --no-audit --no-fund | Geslaagd, 168 packages in 35 s. Package-lock ongewijzigd. Geen online npm-audit uitgevoerd. |
| npm run lint | Geslaagd op definitieve broncode. |
| npm run typecheck | Geslaagd op definitieve broncode. |
| npm test -- --reporter=default --reporter=json --outputFile=../../work/m5b-unit.json | 197/197 geslaagd in 20 bestanden; laatste volledige run 10,69 s. 186 behouden tests plus 11 M5B-tests. |
| BASE_PATH=/autorijsimulator-1.2/ npm run build | Geslaagd, 57 modules, laatste build 1,87 s. App 73,27 kB (gzip 23,94), gedeelde chunk 590,29 kB (gzip 157,95). Bestaande waarschuwing boven 500 kB blijft. |
| npm run test:e2e | 2 failed; 59 passed (35.6m). Alle 61 tests uitgevoerd, geen skip. |
| PAGES_BASE=/autorijsimulator-1.2/ npm run test:pages | 14 passed (49.0s); echte productiebuild op dit repository-subpad. Geen deployment. |

Omgevingsvariabelen zijn in PowerShell/runner ingesteld. De runners roepen de echte npm-scripts aan. Logs en JSON: qa-m5b-chromium.log, qa-m5b-pages.log, qa-m5b-unit.json en de afzonderlijke lint/typecheck/build/unit-logs.

## Wat daadwerkelijk is gecontroleerd

- Tien situaties in beide standen volledig doorlopen in Chromium. Iedere ronde bevat alle tien unieke ID's. Drie antwoordstappen per situatie, één bewust onjuist kijkantwoord, uitleg in leerstand en volledige terugblik aan het einde van de oefentoets.
- Werkelijke canvasbeelden veranderen tijdens afspelen; actorposities veranderen volgens de filmklok. Screenshots van alle tien films bij de antwoordfase zijn bekeken. Dit is geen vervanging door alleen plaatjes. De voorrangskruiser is gecorrigeerd op de bestaande wereldassen en heeft een richting-versus-beweging-unit-test.
- Eigenlijke kijkvraag bij afgeschermde voetganger beschrijft het zichtbelemmerende voertuig, niet een onzichtbare voetganger als bewezen waarneming. Nieuwe inhoud blijft conceptmateriaal.
- Pauze, opnieuw afspelen, blokkering van antwoorden vóór kijken, afwijzen van verouderde antwoordacties, deterministische seed en begrensde klok.
- Drie vensters krijgen tijdens de film dezelfde stilstaande rijwereld en hervatten daarna. Geen vasthangend gas na sluiten. Alle bestaande scherm-/spiegel-/hersteltests opnieuw uitgevoerd.
- Klein scherm 375×667: geen horizontale dialoogoverflow, knoppen minstens 48 px hoog, native spatie/Enter voor openen en antwoorden, Escape sluit en focus keert terug naar de startknop. De dialoog kan verticaal scrollen. Screenshots: qa-m5b-klein-scherm.png, qa-m5b-leren.png, qa-m5b-oefentoets.png en qa-m5b-GHV-01 t/m 10.png.
- Opslagvalidatie, corrupte/partiële/dubbele resultaten, whitelist zonder naamvelden, geblokkeerde opslaggetter en blijven oefenen zonder opslag. Ontbrekende WebGL toont een gecontroleerde melding.
- Alle bestaande M1–M5A-regressies, inclusief de volledige fysieke toetsenbordritten van de tien rijmissies, Rustig/Druk voor 7–10, vijftien theorievragen, oefenstanden, anonieme rapporten en exports. Exacte individuele resultaten staan in de volledige browserlog; een mislukte test wordt niet als geslaagd beschouwd.

## Fouten, herhalingen en Windows-export

De eerste browserstart zonder netwerktoegang bleef hangen. Na verleende toegang zijn de tests opnieuw gestart met de beschikbare testserver. Een hergebruikte server gaf een poort-in-gebruik-waarschuwing vanuit de extra launcher; de suite gebruikte de bestaande actuele M5B-server. Dit is geen geslaagde eerste start.

De eerste gerichte M5B-run had 4/5 geslaagd: spatie op de startknop werd door de rijbesturing onderschept. Dit is gericht hersteld. Een volgende gecombineerde run had 8/9 geslaagd: de animatietest controleerde de voetganger al tijdens zijn geprogrammeerde startvertraging. De test wacht nu expliciet op daadwerkelijke actorbeweging en blijft echte pixels controleren. Volledige runs zijn vóór afronding bewust gestopt voor de richtingcorrectie en de inhoudelijke zichtbaarheidscontrole; die afgebroken runs tellen niet als volledige vrijgave. Bovenstaande tabel beschrijft de definitieve complete run.

De bestaande strikte Windows-tests voor M4-rapportdownload en M5A-theorie-CSV zijn niet gewijzigd, overgeslagen of vervangen door alleen een download-event. Raadpleeg de complete log voor hun feitelijke uitslag. Een geannuleerde bestandsdownload is geen geslaagde export, ook als Blob-inhoud wel klopt. De bekende eerdere Windows-melding was failure() = canceled; de oorzaak is niet bewezen opgelost. M5B voegt geen eigen CSV-export toe; bestaande CSV/JSON-functies blijven aanwezig.

## Grenzen en vrijgave

Definitieve Windows-exportuitslag: beide strikte tests mislukken met **failure() = "canceled"**. Bij de M4-test stopt de eerste JSON-download de test; de daaropvolgende M4-CSV-bestandscontrole wordt daardoor niet bereikt. Ook de M5A-CSV-bestandscontrole bereikt het bestandspad/BOM-onderzoek niet. De afzonderlijke M5A-CSV-inhoudstest slaagt. Daarom is de lokale kwaliteitscontrole **niet volledig groen** en is daadwerkelijke Windows-export niet vrijgegeven.

Actuele M2-prestatiemomentopname: 41,3 FPS één scherm, 40,0 breedbeeld, 19,0 in het middenvenster bij drie vensters. Dit zijn korte headless-metingen, geen gecontroleerd bewijs van verschil met M5A of acceptatie op schoolhardware.

Alle situaties en adviezen zijn **juridische en didactische conceptinhoud, niet menselijk gevalideerd**. Er zijn geen nieuwe wettelijke getalsnormen of CBR-criteria ingevoerd, geen nieuwe wettelijke tekstcontrole geclaimd en geen bewijs van werkelijk kijkgedrag. M3-regelmodule en bestaande bronmetadata blijven behouden. WRM-/juridische en didactische review, herkenbaarheid voor de doelgroep, schermlezer-/motorische toegankelijkheid, fysieke Windows-laptops/meerbeeldschermen en duurtests blijven open. De korte films zijn begrensde leervoorbeelden; geen complete verkeerswereld of video-examen.

De bestaande prestatiesteekproeven zijn opnieuw uitgevoerd; qa-m5b-regressie-*-performance.json bevat de actuele samples. Drievensterweergave blijft een beperking. Renderer en spiegel-GPU-readback zijn ongewijzigd; geen gecontroleerde voor/na-optimalisatie of FPS-winst geclaimd. M1-hardware- en duuracceptatie blijft formeel open.

Commit uitsluitend op milestone-5b-gevaarherkenning. De CI-uitslag van die exacte commit wordt pas na voltooiing als groen vermeld in de concept-PR naar milestone-5-theorie-inzicht. Geen merge en geen Pages-publicatie; de Pages-workflow blijft uitsluitend handmatig startbaar en is niet gestart.
