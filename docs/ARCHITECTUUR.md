# Architectuur — Milestone 1–4B

## Eén eigenaar, passieve schermen

src/main.ts selecteert bij opstarten de rol. Zonder display-parameter wordt app.ts geladen: alleen daar worden Simulation, Keyboard en Assessment gemaakt en wordt tick aangeroepen. Met display=links/rechts plus een sessie-ID wordt uitsluitend displays/satellite.ts geladen. Dit pad importeert geen Simulation en voert geen fysica, NPC-beweging of scoring uit.

De M1-modules core, traffic, rules, assessment, world en questions blijven behouden. De fixed timestep blijft 1/60 s; snelheid intern m/s. De eigenaar koppelt in de eigen animationFrame-loop bediening, fysica en UI. Bij browserthrottling wordt geen onbeperkte achterstand ingehaald; dit is geen realtime-systeem.

## Protocol en interpolatie

DisplayController opent een BroadcastChannel met een willekeurig kanaal-ID per eigenaarstab (sessionStorage). Een snapshot bevat één complete, gekloonde WorldState inclusief klok/voertuig/NPC's/verkeerslicht/input/running, plus kalibratie, bron-epoch, oplopend volgnummer en Date.now-timestamp. Snapshots worden elke 50 ms aangeboden; browsers kunnen dat interval vertragen.

SnapshotBuffer bewaart maximaal 12 snapshots. Het middenvenster in drievenstermodus en de zijvensters bemonsteren allemaal Date.now − 100 ms. Posities, snelheid, stuurhoek en acteurs worden lineair geïnterpoleerd; rotaties volgen de kortste hoekboog. Discrete toestanden komen uit het voorgaande snapshot. Geen extrapolatie of lokale onafhankelijke simulatie. Bij ontbrekende nieuwe pakketten bevriest de laatst bekende toestand.

Volgnummers weren dubbele/achterhaalde pakketten. Een nieuwe epoch of teruglopende simulatietijd (missiereset) wist de oude interpolatiereeks. Een herstart van de eigenaar herstelt geen rit: nieuwe Simulation op klok 0, nieuw epoch, zelfde sessiekanaal. Zijvensters nemen de nieuwe bron over.

Zijvensters melden elke 250 ms hun laatst weergegeven klok, pakketnummer, pakketouderdom en lokale FPS terug. De eigenaar toont de meldingen. Dit zijn momentopnamen, geen fysieke end-to-end schermlatentie. Er is geen garantie op gelijktijdige fysieke refresh; verschillende vensters hebben eigen requestAnimationFrame-planning.

## Verbinding en levenscyclus

Een zijvenster verstuurt periodiek hello; het actuele snapshot volgt op het eerstvolgende kanaalbericht. Zonder pakketten gedurende 1500 ms, of na expliciet offline bij beforeunload, wordt het beeld verborgen met een verbindingsmelding. Nieuwe geldige snapshots herstellen automatisch. Bij sluiten van een door de huidige eigenaar geopend zijvenster volgt terugval naar één scherm. Andere uitval wordt met een waarschuwing gemeld; de gebruiker kan altijd terugschakelen. Na een eigenaar-reload ontbreken oude Window-handles, maar kanaalberichten herstellen de bestaande zijvensters; terugschakelen sluit ze via een shutdown-bericht.

Window.open gebeurt uitsluitend in een klikhandler. Bij een geblokkeerd venster wordt het andere gesloten en blijft één scherm actief. BroadcastChannel ontbreekt: één scherm en breed beeld blijven bruikbaar. Zijvensters geven geen besturing door: bediening blijft in het middenvenster. Blur en visibilitychange wissen invoer zoals in M1.

## Rendering en kalibratie

DrivingView gebruikt dezelfde scène en actorposities voor elk beeld. configureCamera geeft links/midden/rechts dezelfde oogpositie en verschillende yaw-offsets; yaw volgt de bestaande fysieke conventie −heading. Onafhankelijke linker/rechterhoek, verticale FOV en globale pitch/horizon zijn instelbaar. Breed beeld gebruikt drie scissor/viewport-renderingen in één canvas, gelijke delen of 25/50/25. Drievenstermodus gebruikt één richting per venster. Aspectratio volgt de actuele viewport en pixelschaal is begrensd.

De drie M1-spiegelcamera's blijven echt naar afzonderlijke WebGLRenderTargets renderen; alleen het middenvenster leest die uit naar de spiegelcanvassen. Zijaanzichten zijn nadrukkelijk geen spiegels. De vaste spiegelresolutie is 320×190. De pixelbuffers en ImageData worden hergebruikt; displays/pixels.ts kopieert hele RGBA-pixels via Uint32Array met dezelfde omkering. GPU-readback blijft relatief duur. dispose ruimt renderdoelen, geometrie, materialen en textures op.

Randruimte en kalibratiekruis zijn eenvoudige hulpmiddelen; geen gemeten optisch frustum-/bezelmodel van echte monitoren. De UI biedt een expliciete knop voor optionele getScreenDetails-toestemming en plaatsing op de eerste drie horizontaal gesorteerde schermen. Geen API, geweigerde toestemming of minder dan drie schermen: handmatig slepen. Geen automatische vensters bij pagina-opstarten.

## Metingen en browserbronnen

FrameMetrics toont per venster een rollende circa 1 s FPS en gemiddelde CPU-tijd in de renderaanroep. Dit meet geen GPU-completion, inputlatentie of displaylatentie. Pakketouderdom gebruikt dezelfde systeemklok in de vensters. tests/e2e/displays.spec.ts bevat korte steekproeven per modus en berekent één klokspreiding tussen de drie weergegeven toestanden.

- BroadcastChannel, zelfde origin/browsercontext: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
- Schermdetectie, beperkte ondersteuning en browsertoestemming: https://developer.mozilla.org/en-US/docs/Web/API/Window/getScreenDetails

## Formele status

M1 blijft open voor hardware- en duuracceptatie. M2 is op expliciet gebruikersverzoek ontwikkeld terwijl M1 openstaat. De tests leveren technische softwaredekking, geen acceptatie op drie fysieke schermen, geen juridisch oordeel en geen publicatietoestemming.


## Milestone 3: verkeersregels en zes situaties

- rules/traffic.ts is een pure, afzonderlijke beslismodule op expliciete TrafficFacts: signaal, borden, beweging, kruisend verkeer, wegdek, tram en voetganger/fietser. Geen rendering, fysica of puntentelling in deze module. rules/catalog.ts bevat bron-ID, artikel, versie, controledatum en open menselijke review. De legacy M1-demo-API blijft apart bestaan.
- scenarios/catalog.ts beschrijft zes deterministische scèneconfiguraties; model.ts bevat serialiseerbare definities en bewijsstructuren. Geen willekeurig NPC-gedrag. Plaatsingen en beoordelingspunten staan in docs/SCENARIOS.md.
- core/Simulation.selectScenario initialiseert de ene canonieke toestand. Een actieve M3-stap voert dezelfde voertuigfysica uit, vervolgens verkeersinteractie en de scenariobeoordeling. Stop pauzeert, reset behoudt de gekozen situatie. De bestaande demo blijft het oorspronkelijke M1-pad gebruiken.
- traffic/scenarios.ts regelt begrensd optrekken/remmen, stoppen voor het eigen kruislicht, wachten/oversteken en noodremmen bij voorspeld fysiek conflict. traffic/geometry.ts voert routevoortgang en georiënteerde rechthoek-overlap uit. De gebruikte tijden, afmetingen en marges zijn modelparameters, geen wettelijke normen.
- scenarios/runtime.ts bepaalt de fysieke feiten, roept de regelmodule aan en registreert bewijs bij overgangen: stopstreep, conflictgebied, begin afslaan en verlaten van parkeervak. Geel is alleen modeladvies. Fysiek contact en NPC-remmen leveren geen juridisch schuldlabel op. Gebeurteniscodes worden per poging ontdubbeld; er is geen CBR-slaagscore.
- scenarios/panel.ts toont opdrachten, richtingaanwijzers, bron, feiten en handelingsalternatief. Het beoordeelt zelf geen verkeer. Open uitlegdetails blijven open bij nieuwe gebeurtenissen.
- world/scenarios.ts bouwt B6, haaientanden, stopstrepen, zebra, parkeervak en kruisverkeerslicht. DrivingView toont modellen per actor-ID/type en hetzelfde canonieke scenario-ID in elk venster. De drie echte spiegels blijven rendercamera's. Gemeenschappelijke klok en toestand bevatten ook scenariofase, gebeurtenissen, richtingaanwijzer en kruislichtfase.
- SnapshotBuffer wist de interpolatiereeks bij scenario-ID-wisseling, ook als beide scenario's klok 0 hebben. Daardoor wordt een auto uit de vorige situatie niet geïnterpoleerd naar een voetganger uit de volgende. Zijvensters blijven uitsluitend renderen en berekenen geen eigen regels, score, NPC's of fysica.

De fysieke weg- en verkeersclassificatie is afgebakend op deze scènes. Geen algemene visuele herkenning van verkeersborden, adaptieve stads-AI, oog-/hoofdtracking of volledig banden-/botsingsmodel. Broncontrole is uitgevoerd tegen de officiële RVV-versie 01-07-2026 die op 04-11-2026 als geldend is geleverd. Menselijke verkeerskundige, juridische en didactische validatie blijft open.

## Milestone 4B: doorlopende verkeersmomenten

RouteRuntime bevat nu een encounterregister met begin/einde en expliciete IDs. De route-adapter verandert alleen de coördinaten voor de aanroep van de bestaande M3-simulatie en zet gebeurtenissen terug naar de globale klok/wereld; voertuig en klok blijven behouden. roads.ts levert de asfaltvlakken die zowel de lange wegopbouw als de continuïteitscontrole gebruiken. streets.ts bouwt daarbij eigen huizen, trottoirs en borden; de oude demo-wereld wordt voor missie 3/4 verborgen en bij terugkeer weer getoond. Dispose maakt ook textures en instanced buffers vrij. Zijvensters ontvangen dezelfde volledige WorldState, zonder eigen Simulation. De publicatie-/reviewstatus staat in M4_VOORTGANG.md.

## Milestone 4C: gedraaide routes en globale signaalplannen

encounters.ts construeert expliciete varianten van de M3-scènes en verzorgt een rigide wereld/lokaal-transformatie voor voertuig, NPC, koprichting en NPC-routepunten. Geen klok of voertuigreset tussen verkeersmomenten. traffic/signals.ts berekent drie locatieplannen uit de globale simulatietijd; world/signals.ts gebruikt dezelfde functie voor alle zichtbare lichtkoppen, ook buiten het actieve moment. NPC- en regeladapters krijgen de canonieke signaalfase aangeleverd, inclusief een afzonderlijk voetgangerslicht. De pure rules/traffic.ts blijft inhoudelijk ongewijzigd.

core/stopping.ts draait een kopie van de actuele voertuigpose met dezelfde integrateVehicle-remfysica uit tot stilstand. Afstand tot de bestemde stopstreep en remweg zijn transparante modelmetingen. Geel levert uitsluitend modeladvies op; onbekende stuur-/achteropkomende omstandigheden blijven onzeker. De oude 0,7-s-reactietoeslag is vervallen. De vaste seed en ruimtelijke trigger van het onverwachte conflict worden in de canonieke scenariotoestand bewaard, niet door zijvensters berekend.

Eventcodes worden binnen een verkeersmoment ontdubbeld; fase- en geelobservaties krijgen een tijdcomponent zodat een volgende cyclus opnieuw kan worden vastgelegd. De route voegt de encounter-ID toe en zet iedere gebeurtenistijd terug naar globale rittijd. Exports bewaren eventId, encounterregister, feiten en advies en blijven achterwaarts compatibel met oude M4-rapporten. Snapshotgedrag en de drie spiegelcamera’s zijn behouden. DrivingView meet uitsluitend de bestaande render/readback/kopie/overdrachtstappen; het pixelalgoritme en de timingfrequentie zijn niet geoptimaliseerd of verlaagd.

## Milestone 4D: ringwegen en buitenweg

advanced-course.ts bevat onafhankelijk van rendering de routepunten, echte ringcentra, rijbaanbreedtes, toeritten/afritten, NPC-trajecten, B6-/oversteek-/uitrijmeetpunten en de twee vaste moeilijkheidsconfiguraties. Bereikbare routepunten en eindstop blijven door de bestaande routevoortgang bepaald. De lange buitenweg gebruikt echte gebogen trajecten, een parallelle tegengestelde rijroute en een expliciete A1-limiet. world/advanced.ts bouwt daarbij ringvormig asfalt met een echt middeneiland en aangesloten wegen, borden en markeringen uit dezelfde data. Mist gebruikt de canonieke zichtwaarde; terug naar bestaande missies herstelt de oorspronkelijke mist en achtergrondkleur.

advanced-runtime.ts wordt uitsluitend vanuit de ene Simulation aangeroepen na de bestaande voertuigfysica. NPC’s volgen hun eigen doorlopende, begrensde trajecten en kunnen na het huidige verkeersmoment blijven bestaan. B6-/zebrafeiten gaan naar de bestaande pure M3-beslisser. rules/rural.ts scheidt beborde snelheid van afstands-/zichtadvies. Gebeurtenissen en encounters gebruiken globale klok en IDs, geen lokale routeklokreset. Input, spiegelcamera’s, pixeltransformatie en de oorspronkelijke M1–M6-paden blijven behouden.

WorldState draagt de serialiseerbare course-toestand: variant/seed, fysieke routepositie, modelzicht, limiet, NPC-activering, beoordeelde meetpunten en begeleidende feiten. Zijvensters renderen de ontvangen toestand zonder extra Simulation. SnapshotBuffer wist de reeks ook bij een seedwissel, inclusief twee varianten met klok nul; daardoor worden NPC-lijsten van verschillende configuraties niet geïnterpoleerd. Rapportage/export bewaart variant/seed en ondersteunt oude opgeslagen resultaten.
