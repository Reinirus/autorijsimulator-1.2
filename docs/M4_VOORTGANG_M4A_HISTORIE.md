# Milestone 4 — voortgang, 5 november 2026

**Ontwikkelversie. Twee speelbare oefenmissies; acht nog in ontwikkeling. DEMO — NIET CBR-GECERTIFICEERD.** Dit is geen afgeronde tienmissierelease. M1 blijft formeel open voor hardware- en duuracceptatie.

## Uitgangspunt en aanlevering

Branch milestone-4-rijmissies is gebaseerd op de gecontroleerde M3-commit e4737be6fff3e185d33fb7da8a48b4994d7b17ce. De gebruiker leverde losse bestanden aan in plaats van een ZIP. Botsende bestandsnamen zijn op inhoud en imports herleid; docs/M4_AANLEVERING.json registreert bronnaam, bestemming en vergelijking. De aangeleverde package.json, lockfile en projectconfiguratie zijn inhoudelijk gelijk aan de gecontroleerde basis. Alle acht regel-, scenario- en verkeersbestanden van M3 zijn inhoudelijk ongewijzigd. De oorspronkelijke mapstructuur is behouden.

## Speelbaar en gecontroleerd

| Missie | Werkelijk gedrag |
|---|---|
| 1 — voertuigbeheersing | Sturen door twee poorten, versnellen, werkelijk remmen, stoppen in het eindvak, eindevaluatie en herstart. Volledige rit met echte fysica en volledige Chromium-toetsenbordrit. |
| 2 — wegrijden, afslaan en parkeren | M3-wegrijden met reagerende achteropkomende auto; route zonder klokreset, rechts afslaan, voorvak, stoppen, automaat R, minimaal twee meter achteruit en volledig binnen het parkeervak stoppen. Volledige fysica- en Chromium-rit. |

De parkeeracceptatie gebruikt de volledige gedraaide voertuigcontour, lage snelheid en een korte stilstandduur; dit zijn didactische modelkeuzes, geen wettelijke parkeertoleranties. D/R wisselen kan alleen bij stilstand. R is begrensd op 3 m/s. Remmen brengt ook een achteruitrijdende auto naar nul en veroorzaakt geen richtingsomkering. Achteruitcorrecties zijn mogelijk; dit is geen gecertificeerd voertuigmodel.

## Ontwikkelde basis voor de overige acht

De canonieke WorldState bevat route-index, afstand, snelheid, gebeurtenissen, encounter-ID en afronding. Alleen Simulation.step werkt die bij, met 1/60 s. Zijvensters ontvangen de volledige toestand. Een encounter-adapter gebruikt de ongewijzigde M3-regels in lokale coördinaten, met doorlopende wereldklok en unieke gebeurteniscodes. De gerichte adaptertest injecteert grensposities: dit is geen volledige ritvalidatie van acht missies.

src/missions/development.ts bevat acht uitgeschakelde routevoorstellen en een eerste validator voor rijstrookgeometrie en aansluitingen. Voorstellen worden bewust niet geregistreerd als speelbare ROUTES. Dit is een begin, geen volledig semantisch wegennet of verkeers-AI.

| Missie | Aanwezig voorstel | Nog nodig vóór ontgrendeling |
|---|---|---|
| 3 — woonwijk | Opeenvolgende rechts-/zebramomenten | Doorlopende weg, borden en NPC-plaatsing plus volledige rit en review. |
| 4 — kruispunten | Herhaalde rechts-/haaientanden-encounters met eigen ID | Volledige kruispuntgeometrie, detectiebereik en complete browserrit. |
| 5 — verkeerslichten | Licht, zebra en tweede licht zonder klokreset | Verplaatste lampen/stopstrepen, fasepresentatie en volledige rit. |
| 6 — kwetsbare weggebruikers | Fietser en rechtsafroute | Gecombineerde voetgangerssituatie, observatie-uitleg en complete rit. Geen bewezen spiegel-/dodehoekfout zonder betrouwbare waarneming. |
| 7 — rotondes | Waypointvoorstel | Correcte ring, aansluitingen, rijstroken, borden, NPC-voorrang en juridische toepassing. |
| 8 — buitenwegen | Bochtenvoorstel | Weggeometrie, voorganger/afstandmodel, passend snelheidsregime en tests. |
| 9 — snelweg | Toerit-/invoeg-/afritvoorstel | Rijstrookgrafiek, verkeersstromen/gaten, borden en veilige invoegbeoordeling. |
| 10 — zelfstandig | Gecombineerde herhaalde encounterreeks | Geïntegreerde wereld, navigatie, eindevaluatie en volledige rit zonder hints. |

## Rapportage en schermen

Anonieme lokale rapporten bewaren voltooide opdrachten, tijd, afstand, maximumsnelheid en verkeersmeldingen met tijd, feiten en verbeteradvies. JSON/CSV-formattering en export-start zijn getest, evenals herladen en uitgeschakelde localStorage. De strikte lokale bestandsdownloadtest faalt met canceled; CSV-download en het wis-eindpunt van die test zijn daardoor nog niet bereikt. Zie TESTVERSLAG.md en de remote CI-uitkomst. Corrupte/partiële rapporten worden geweigerd. Oefendoel bereikt betekent geen juridisch geslaagde rit. M3-overtredingen blijven apart; nieuwe route-aanwijzer- en snelheidsfeedback is oefenadvies. Geen nieuwe officiële slaagcriteria.

Cockpit, alle drie echte spiegels, één scherm, breedbeeld en drie vensters blijven beschikbaar. Missie-ID, routefase, voertuig, versnelling en klok volgen dezelfde eigenaar. Herladen, terugval en bestaande verlies-/herstelcontroles zijn onderdeel van de regressies. Werkelijke korte FPS-metingen staan in TESTVERSLAG.md en qa-m4-performance.json; fysieke monitorlatentie is niet gemeten.

## Open vrijgavepunten

Missies 3–10 blijven uitgeschakeld. Er is nog geen afgeronde leer-/oefenexamenstand, algemeen verkeersnetwerk, vrije botsingswereld of gekalibreerde voertuigfysica. Achteruitrijden en parkeren in M2 zijn oefenmodellen; overige verkeer bij parkeren en een volledige parkeeropleiding ontbreken. Externe fysieke objectbotsingen buiten de gemodelleerde NPC's zijn geen gevalideerde wereldbegrenzing.

Menselijke verkeerskundige/juridische/didactische review, doelgroep-/toegankelijkheidsacceptatie, echte 1/2/3 monitoren met DPI, stuur/pedalen, Edge en twee ritten van 30 minuten blijven open. Geen nieuwe npm-security-audit. Geen merge en geen Pages-publicatie. Automatische controles en PR-resultaten worden feitelijk vastgelegd in het testverslag en de PR.

## GitHub-hercontrole

Broncommit 56544b1 is geslaagd op Ubuntu / Node 22: 108 unit-tests, 29 Chromium-tests en 3 subpadtests. Ook de echte JSON/CSV-bestanden, herladen en wissen zijn daar gecontroleerd. Run: https://github.com/Reinirus/autorijsimulator-1.2/actions/runs/42005897583 . De lokale Windows-downloadmislukking blijft een afzonderlijk open punt. Dit maakt missies 3–10 niet voltooid.
