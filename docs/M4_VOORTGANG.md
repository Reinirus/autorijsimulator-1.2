# Milestone 4B — voortgang, 5 november 2026

**Missies 1–4 zijn speelbare oefenritten. Missies 5–10 blijven uitgeschakeld en in ontwikkeling. DEMO — NIET CBR-GECERTIFICEERD.** M1 blijft formeel open voor hardware- en duuracceptatie.

## Speelbare missies

| Missie | Opbouw en getoetst gedrag |
|---|---|
| 1 — voertuigbeheersing | Sturen door twee poorten, versnellen, remmen, stoppen en herstart. Bestaande fysica en route behouden. |
| 2 — wegrijden, afslaan en parkeren | M3-achteropkomende auto, invoegen, rechts afslaan, D/R, korte achteruitmanoeuvre en volledige voertuigcontour in het parkeervak. Behouden. |
| 3 — woonwijk | Circa 195 meter doorlopende rijbaan: fietser van rechts, zebra met voetganger, daarna auto van rechts. Drie verkeersmomenten en een eindvak. |
| 4 — kruispunten | Circa 265 meter doorlopende rijbaan: B6 met auto van links, gelijkwaardig met fietser van rechts, B6 met fietser van links, gelijkwaardig met auto van rechts. Vier verkeersmomenten en een eindvak. |

De nieuwe routes hebben aansluitende kruisende wegen, trottoirs met openingen bij de kruisingen, huizen, A1-borden 30, zebra en B6/haaientanden. De zebra ligt in een doorlopend wegvak en maakt geen extra kruising. Het is een met A1 aangegeven 30-km/u-oefenweg, geen nieuw juridisch model voor een volledige 30-zone. Huizen gebruiken instancing; alle geometrie is eigen procedureel werk.

## Canonieke wereld en beoordeling

Alle fysica, verkeer en beoordeling lopen in de ene Simulation met vaste stap 1/60 s. De voertuigpose en klok worden niet teruggezet tussen verkeersmomenten. De adapter zet de wereld tijdelijk om naar de lokale coördinaten van de bestaande M3-situatie en brengt de uitkomst terug naar wereldcoördinaten. De acht bestaande regel-/scenario-/verkeersimplementaties zijn inhoudelijk ongewijzigd; alleen het TrafficEvidence-type heeft een optioneel encounterId gekregen.

De fietser op een kruisende weg gebruikt dezelfde bestuurder-/voorrangsfeiten van het bestaande M3-kruispunt; er is geen nieuwe verkeersregel toegevoegd. Bron, artikel, versie en menselijke reviewstatus blijven in het M3-register staan. Menselijke beoordeling van de nieuwe ruimtelijke toepassing blijft open. Nieuwe opdrachten of een bereikte eindpositie zijn geen CBR-slaagcriterium. Een niet waargenomen spiegelcontrole wordt niet als bewezen fout beoordeeld.

Elk verkeersmoment heeft een vaste ID, begin- en eindtijd, actorsoort en uitleg. Meldingen krijgen ook een expliciete encounterId, globale simulatietijd en wereldpositie. M3-detectiefeiten bevatten daarnaast de lokale kruispuntcoördinaten. IDs zijn uniek binnen de rit en reproduceerbaar bij herstart; een nieuw opgeslagen ritrapport heeft een eigen datum/tijd. Herhaalde voorrangsfouten blijven afzonderlijk geregistreerd, ook als hetzelfde regeltype opnieuw voorkomt.

De zijbalk en het volledige rapport gebruiken voor M4B dezelfde globale tijden. De volledige Chromium-ritten controleren dat de klok niet terugloopt, het voertuig niet naar een volgende situatie springt, alle verkeersmomenten worden afgewerkt en de rapporten hun IDs/tijden bewaren. Herstart wist alle ritgegevens en begint weer bij nul. Anonieme opslag en JSON/CSV-formattering ondersteunen nu ook missie 3/4 en bewaren de encountergegevens; oude M4A-rapporten blijven leesbaar.

## Behoud van beeldschermen

Eén scherm, breedbeeld en drie gesynchroniseerde vensters blijven beschikbaar. Alle drie echte spiegelcamera's blijven behouden. Nieuwe lange wegen worden vanuit dezelfde wereld door iedere camera getekend. Getest: nieuwe missie-ID/NPC/encounter-ID op de zijvensters, herladen, terugval en de bestaande bron-/pakketverliesregressies. Korte FPS-metingen staan in qa-m4b-performance.json; geen garantie voor fysieke schoollaptops of genlock.

## Nog uitgeschakeld

5 verkeerslichten; 6 gecombineerde kwetsbare weggebruikers; 7 rotondes; 8 buitenwegen/afstand; 9 snelweg; 10 zelfstandig gecombineerde rit. Zij hebben nog slechts routevoorstellen in development.ts en zijn niet als speelbaar geregistreerd. Ze worden niet als voltooid gepresenteerd.

## Grenzen en overdracht

Per actief verkeersmoment is er één primaire NPC, met de bestaande M3-rem-/conflictlogica. Dit is geen algemene verkeersstroom, volledige stadskaart of gevalideerde botsingswereld voor gebouwen en weggrenzen. Nieuwe rijroutes zijn bewust recht doorgaand; afslaan en parkeren blijven missie 2. Leer-/oefenexamenstand, volledige rotonde-/snelweglogica en algemene rijstrookbeoordeling zijn nog geen afgeronde M4-functies.

De bekende lokale Windows-sandbox annuleert de strikte bestandsdownloadtest. De test blijft actief; eerdere M4A-Linux-CI slaagde, maar een nieuwe M4B-CI wordt afzonderlijk gecontroleerd. Zie TESTVERSLAG.md voor de huidige echte resultaten, zonder een nog niet uitgevoerde remote run groen te noemen.

Open blijven: menselijke juridische/WRM-/didactische review, doelgroep-/toegankelijkheidsacceptatie, echte monitoren/DPI, Edge, stuur/pedalen, twee duurtests van 30 minuten en hardware-FPS/latentie. PR #2 is gericht op milestone-3-gecontroleerd omdat main nog M2 bevat. Niet mergen en geen Pages-workflow starten.
