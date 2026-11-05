# Milestone 4D — rotondes en buitenwegen

**DEMO — NIET CBR-GECERTIFICEERD.** Uitgangspunt: gecontroleerde M4C-commit 7cb4179f5700cc1714c26e5ab14c9f4c1ca77283. Werk uitsluitend op milestone-4-rijmissies. M1 blijft formeel open voor hardware- en duuracceptatie. Eerdere voortgang staat in M4_VOORTGANG_M4C_HISTORIE.md.

## Speelbare missies

Missies 1–6 blijven behouden. Missie 7 en 8 zijn toegevoegd nadat hun volledige routes met echte voertuigfysica en browser-keydown/keyup waren doorlopen. De uiteindelijke versie is daarna opnieuw in de volledige regressie gecontroleerd. Missies 9 en 10 blijven uitgeschakeld; de oude routevoorstellen in development.ts zijn geen speelbare implementaties.

| Missie | Uitgewerkte route |
|---|---|
| 7 — rotondes | Circa 241 meter, twee afzonderlijke ringvormige wegen met een middeneiland van 10,3 m straal, rijbaan 10,3–17,7 m en vier aangesloten armen. De leerling rijdt de eerste afslag op rotonde 1 en de derde op rotonde 2; werkelijk tegen de klok in langs het eiland. Zes unieke verkeersmomenten, B6/haaientanden, D1, herhaalde A1-borden voor nieuwe wegvakken, zebrapaden en afzonderlijke fietsoversteken. NPC’s naderen, verlenen voorrang, rijden de ring op en verlaten die. |
| 8 — buitenweg | Circa 330 meter doorlopende, gebogen Nederlandse oefenweg. Expliciet A1 60 km/u; geen universele limiet voor alle buitenwegen. Rand- en middenmarkeringen, langzamere auto, tegenligger en fietser. In de bocht wordt de ingestelde zichtafstand korter en moet de leerling anticiperen op het langzamere verkeer. Vier unieke verkeersmomenten. |

Beide missies hebben een startpunt, routeaanwijzingen, bereikbare routepunten, eindvak met werkelijk remmen/stilstaan, rapport, opslag en herstart. D/R, cockpit, drie echte spiegelcamera’s en alle drie schermmodi zijn behouden. Blauwe leerhulpen zijn op de nieuwe routes beperkt tot een selectie routepunten; de werkelijke asfaltgeometrie is leidend. Alle nieuwe geometrie en borden zijn eigen procedureel werk.

## Moeilijkheid en reproduceerbaarheid

De selector biedt Rustig en Extra verkeer / beperkt zicht. Een wijziging herstart de gekozen rit en wordt expliciet zo aangekondigd. Missie 7 gebruikt seeds 707/708; de tweede variant voegt een extra auto toe die via een echte toerit nadert en gebruikt andere activering/snelheden. Missie 8 gebruikt 808/809 en respectievelijk 45/28 meter modelzicht in het begrensde mistvak, tegenover 140 meter daarbuiten. Dit zijn oefenparameters, geen wettelijke zicht-/reactietijden. De wereld blijft binnen de rit één klok gebruiken; een verkeersmoment veroorzaakt geen reset.

## Canonieke architectuur

advanced-course.ts beschrijft rijlijnen, ringwegen, toeritten/afritten, verkeersmomenten, NPC-trajecten en zichtvak. advanced-runtime.ts verwerkt de feiten in dezelfde Simulation-stap als de voertuigfysica. Het houdt geen tweede voertuig of klok bij. De zes bestaande missies blijven het bestaande pad gebruiken.

NPC’s bestaan in dezelfde wereld en kunnen hun traject na een verkeersmoment vervolgen. Zij wachten bij B6 voor conflicterend ringverkeer en bij geactiveerde kwetsbare oversteken, houden ruimte tot voorliggers en reageren op voorspelde conflicten met de leerling. De extra auto staat niet als een geparkeerd obstakel op de ring, maar nadert via een aangesloten rijbaan. Unit-tests controleren ook onderling NPC-contact gedurende de complete testritten.

De satellietvensters ontvangen alleen snapshots. Een wijziging van moeilijkheid/seed wist de interpolatiebuffer ook wanneer beide toestanden klok nul hebben, zodat oude en nieuwe NPC-lijsten niet worden gemengd. Geen satelliet berekent eigen NPC’s, verkeersregels of voertuigfysica.

## Verkeersbeoordeling

De pure M3-regelmodule blijft behouden en verwerkt B6-/oversteekfeiten. D1 bepaalt de rijrichting; het is niet op zichzelf een voorrangsregel. Op deze expliciete oefenrotondes staan B6 en haaientanden bij de ingerichte voorrangspunten. Ook de afzonderlijke fietsoversteek bij het verlaten heeft expliciete voorrangstekens; er wordt geen algemene prioriteit voor alle fietsers bij iedere rotonde verondersteld. De zebra valt onder de afzonderlijke voetgangersregel.

Bij het werkelijk uitrijden wordt rechts richting getoetst aan artikel 17 lid 2; geen verplichte linkerrichting bij het naderen wordt verzonnen. Onbekende/off-route passages geven advies in plaats van een bewezen juridische conclusie. De broncatalogus bewaart artikel, versie, controledatum en open menselijke reviewstatus. Nieuwe ruimtelijke toepassing en getalsmatige conflictvensters vereisen menselijke review.

ruralFindings scheidt de getoonde A1-limiet van veiligheidsadviezen. Een te korte twee-secondenafstand is uitsluitend advies en heeft geen zelfstandige juridische regel-ID. Het zichtadvies is een berekening met de actuele modelsnelheid en remfysica onder de ingestelde zichtconditie; het bewijst niet dat een echte bestuurder artikel 19 heeft overtreden. Geen fictieve CBR-slaagscore, betrouwbare oogtracking of onbewezen spiegel-/dodehoekfout.

Per verkeersmoment en gebeurtenis worden unieke IDs binnen de rit, globale tijd, feiten, seed/moeilijkheid, bronverwijzingen en verbeteradvies vastgelegd. JSON en CSV ondersteunen nu missies 7/8 en bevatten de variant en seed; oude rapporten blijven leesbaar. Een herstart wist de actuele rit en houdt de gekozen moeilijkheid vast; eerder bewaarde anonieme rapporten blijven lokaal beschikbaar.

## Werkelijke controle en resterende grenzen

Zie TESTVERSLAG.md voor de werkelijk uitgevoerde commando’s, volledige ritten, regressies, fouten en beperkingen. Ruwe FPS-/spiegelmetingen staan in qa-m4d-performance.json; route- en eindbeelden in qa-m4d-*.png. De spiegelketen is inhoudelijk ongewijzigd: drie 320×190-targets, synchronische GPU-readback, pixeltransformatie en canvasoverdracht. De bestaande tijdmetingen zijn opnieuw gebruikt. Er is geen onbewezen asynchrone, verlaagde resolutie- of frequentiewijziging ingevoerd.

Dit is een begrensd, deterministisch oefenverkeersmodel. Geen algemene stads-/plattelands-AI, volledig statisch botsingssysteem, fysiek gekalibreerd banden-/wegdekmodel, echte zicht-/oogmeting, rotonde met meerdere rijstroken of complete inhaalbeoordeling. De NPC’s zijn benoemde scenarioactoren, geen onbegrensde verkeersstroom. Afstand-/zichtmodellen en nieuwe bordplaatsingen vragen juridische/WRM-/didactische review.

Open blijven: lokale Windows-bestandsdownloadacceptatie, doelgroep-/toegankelijkheidsacceptatie, Edge, echte schoollaptops en GPU’s, fysieke monitoren/DPI, stuur/pedalen en twee duurtests van 30 minuten. Leer-/oefenexamenstand wordt niet als afgerond gepresenteerd. Geen certificering of volledige M1-acceptatie. PR #2 blijft concept tegen milestone-3-gecontroleerd; niet mergen en geen GitHub Pages-publicatie.

Laatste lokale resultaten: npm ci/lint/typecheck/build geslaagd; 160/160 unit-tests; volledige Chromium-run 39/40 (19,2 min), alleen de bekende Windows-downloadannulering. Alle nieuwe ritten en de zes bestaande missies slagen. Na de laatste UI-/bordverduidelijking zijn schermmetingen, overgangscontrole en smoketest herhaald: 3/3 (47,3 s). Productiesubpad: 9/9 (23,2 s). De afzonderlijke Linux-CI-resultaten staan bij PR #2.
