# Milestone 4C — verkeerslichten en kwetsbare weggebruikers

**DEMO — NIET CBR-GECERTIFICEERD.** Ontwikkeld vanaf de gecontroleerde M4B-commit `8dd484a581eee533ea2940062d53e44aeec3766c`, uitsluitend op `milestone-4-rijmissies`. M1 blijft formeel open voor fysieke hardware- en duuracceptatie.

## Speelbare routes

Missies 1–4 blijven beschikbaar, inclusief D/R en parkeren in missie 2. Missie 5 voegt een circa 195 meter lange route toe met drie afzonderlijke verkeerslichtsituaties: kruisende auto; geregelde voetgangersoversteek; verkeerslicht boven B6/haaientanden met een andere fase-offset. Missie 6 rijdt circa 260 meter over een noordelijke en oostelijke weg: fietser van rechts; rechts afslaan met een fietser naast/achter de auto; zebra; voetganger achter een bestelbus. De laatste situatie is een reproduceerbare veiligheidsoefening met seed 603. Missies 7–10 blijven uitgeschakeld. De historische voorstellen voor 5/6 in development.ts zijn geen actieve routes; de uitgewerkte implementaties staan in ROUTES.

Elke rit heeft een startpunt, bereikbare routepunten, korte opdrachten, navigatie, eindvak met werkelijk remmen/stilstaan, rapport en herstart. Alleen de testbestuurder gebruikt een rijhulpfunctie: het product bestuurt het voertuig niet automatisch. Complete browserritten gebruiken de echte toetsenbordhandlers en 1/60-s-voertuigfysica, zonder teleportatie of klokversnelling.

## Canonieke toestand en verkeersregels

Alle voertuig- en NPC-bewegingen, signalen en beoordelingen gebruiken dezelfde Simulation. De route-adapter vertaalt voortaan ook gedraaide verkeersmomenten; tijdens een afslag of nieuw verkeersmoment wordt geen wereldklok, voertuigpose of afgelegde afstand teruggezet. Zijvensters ontvangen uitsluitend snapshots. De lichten op alle drie locaties zijn ook buiten het actieve verkeersmoment zichtbaar en volgen een faseplan op de globale klok. Hun fase wordt niet bij nadering opnieuw gestart. Ontruimingstijden voorkomen gelijktijdig conflicterend groen. Een begonnen voetgangersoversteek mag worden afgemaakt; de auto krijgt afzonderlijke veiligheidsfeedback als de oversteek bij groen nog bezet is.

De pure M3-regelmodule en broncatalogus zijn behouden. De scenario- en NPC-adapters zijn uitgebreid voor expliciete signaalplannen, voetgangerslichten en de gezaaide conflictsituatie. Er is geen nieuwe juridische verkeersregel verzonnen. De RVV-broncontrole en grenzen staan in REGELBRONNEN.md. Alle menselijke reviewvlaggen blijven false.

Bij geel wordt de actuele pose, snelheid en stuurinput met hetzelfde voertuigremmodel doorgerekend. De oude vaste 0,7-s-reactietoeslag is vervallen. Het resultaat beschrijft modelremweg en afstand tot de bestemde stopstreep; het is geen wettelijke afstand of remgrens. Niet betrouwbaar te beoordelen stuur-/achteropkomende situaties blijven onzeker. Ook een geel-modelafwijking is uitsluitend oefenadvies. Dit model bewijst niet dat een echte leerling onder alle omstandigheden veilig kon stoppen.

Per verkeersmoment: vaste encounter-ID, globale begin/eindtijd, actorsoort en uitleg. Per gebeurtenis: unieke code binnen de rit, globale tijd, encounter-ID, feiten, regelverwijzingen en verbeteradvies. JSON en CSV bewaren nu ook eventId; oude rapporten blijven leesbaar. Een nieuwe rit heeft een eigen rapportdatum; IDs zijn bewust reproduceerbaar bij herstart. Rembediening in het onverwachte conflict is een beperkte bedieningsobservatie, geen bewijs van herkennen, kijken, spiegel- of dodehoekcontrole. De situatie zonder zebra levert geen automatische zebra-overtreding op.

## Cockpit, beelden en prestaties

Cockpit, drie echte spiegelcamera’s en de drie schermmodi blijven behouden. De spiegelketen blijft renderen naar 320×190, synchroon GPU-readback, x-flip/rij-omkering en canvasoverdracht. Alleen tijdmetingen per stap zijn toegevoegd; geen frequentieverlaging, resolutieverlaging of asynchrone pixelverwerking. Daardoor is geen onbewezen optimalisatie met risico op verouderd of verkeerd spiegelbeeld geïntroduceerd. De gemeten CPU-wachttijd bij readback is geen afzonderlijke GPU-timerquery. Meetresultaten en korte FPS-steekproeven staan in qa-m4c-performance.json en TESTVERSLAG.md.

## Resterende grenzen

Eén primaire NPC per actief verkeersmoment, geen algemene stadsverkeersstroom. De onverwachte voetganger wordt reproduceerbaar ruimtelijk geactiveerd; niet door een echte zicht-/oogtracker. Bestelbus en huizen zijn zichtgeometrie, geen volledig statisch botsingssysteem. NPC-noodremming en geometrisch contact zijn veiligheidsobservaties, geen automatische juridische schuldvaststelling. Het voertuig heeft een eenvoudig rem-/stuurmodel, geen gevalideerde banden, wegdek, menselijke reactietijd of volledige ongevalsanalyse. De signaalplannen zijn oefentimings, geen gecertificeerde VRI-installatie.

Open: menselijke juridische, WRM-/verkeerskundige en didactische review; doelgroep-/toegankelijkheidsacceptatie; Windows-schoolhardware; fysieke drie-monitoropstelling/DPI; Edge; stuur/pedalen; twee duurtests van 30 minuten. Leer-/oefenexamenstand, rotondes en snelwegen worden niet als voltooid gepresenteerd. De bekende Windows-bestandsdownloadbeperking wordt apart vermeld; Linux-CI kan deze lokale acceptatie niet vervangen.

PR #2 blijft een concept ter beoordeling tegen milestone-3-gecontroleerd. Geen merge en geen GitHub Pages-deployment.

## Werkelijk uitgevoerde softwarecontrole

Laatste broncode: npm ci, lint, typecheck en productiebuild geslaagd; 136/136 unit-tests en 7/7 subpadtests geslaagd. Volledige lokale Chromium-suite: 34/35, met alleen de bestaande geannuleerde Windows-bestandsdownload. Na de laatste gerichte correcties zijn alle tien M3-browsercontroles, beide complete M4C-ritten en de scherm-/prestatiecontrole herhaald: 13/13 geslaagd. De volledige GitHub-regressie voor broncommit 03b5fa8 is eveneens geslaagd: 136/136 unit-tests, 35/35 Chromium-e2e en 7/7 subpadtests, inclusief de strikte echte JSON/CSV-downloadtest op Linux. Pushcontrole 42043255611 en PR-controle 42043266133 zijn beide success. Dit vervangt geen Windows-downloadacceptatie. De volgende commit wijzigt uitsluitend documentatie; uitvoerbare code en tests zijn gelijk. Zie TESTVERSLAG.md voor exacte commando’s, tijden, ontwikkelfouten en beperkingen.
