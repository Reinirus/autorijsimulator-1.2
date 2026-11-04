# Architectuur — Milestone 1 + 2

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
