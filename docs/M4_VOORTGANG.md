# Milestone 4E — snelweg en zelfstandig rijden

**DEMO — NIET CBR-GECERTIFICEERD.** 6 november 2026. Uitgangspunt: cfb2eeb48d14ea052598c2292a92fc2d1a488582, branch milestone-4-rijmissies. De M4D-historie is bewaard in M4_VOORTGANG_M4D_HISTORIE.md. M1 blijft formeel open voor hardware- en duuracceptatie.

## Speelbare missies

Missies 1–10 zijn afzonderlijk selecteerbaar. Missies 1–8, D/R, werkelijk achteruit parkeren, cockpit, drie echte spiegels, drie schermmodi en anonieme opslag/export blijven behouden. De twee nieuwe missies zijn pas vrijgegeven nadat beide routes in beide moeilijkheidsstanden werkelijk waren afgerond met voertuigfysica en browser-keydown/keyup. Afronden is geen officieel slagen of bewering van juridisch foutloos rijden.

| Missie | Nieuwe uitwerking |
|---|---|
| 9 | Circa 712 m, 198 routepunten en vijf verkeersmomenten: toerit/invoegstrook, twee doorgaande rijstroken, wisselen naar links en terug naar rechts, remmend verkeer, uitvoegstrook, afrit en eindstop na G2. Gescheiden tegenrijbaan, middenberm, markeringen, G1/G2, A1, J16 en afritaanwijzing. |
| 10 | Circa 1.287 m, 373 routepunten en twaalf verkeersmomenten. Woonwijk met fietser, gelijkwaardig kruispunt, B6, verkeerslichten, echte ringvormige rotonde met eerste afslag, gebogen buitenweg met voorligger/tegenligger/fietser, snelweg met in- en uitvoegen en eindstop. De wegdelen sluiten fysiek aan. |

De snelweg is een **specifiek A1-60-werkvak met twee open doorgaande rijstroken**. Het A1-bord heeft geen tijdsonderbord; de oefencontext vermeldt 10:00. Dit is geen algemene snelweglimiet. Na G2 volgt A1 30 en het eindvak buiten de doorgaande snelwegrijbaan. Het bestaande voertuigmodel met maximaal 64,8 km/u is behouden; geen ongetest 100–130-km/u-model.

## Canonieke wereld, regels en verkeer

journey-course.ts beschrijft de verbonden rijlijn, wegdelen, NPC-trajecten en verkeersmomenten. journey-runtime.ts verwerkt die binnen dezelfde Simulation-stap als de voertuigfysica. Eén voertuig, wereldtoestand en fixed-timestep-klok blijven de hele rit bestaan. Een verkeersmoment reset niets. Zijvensters ontvangen snapshots en simuleren geen eigen verkeer. Ook een moduswisseling bij klok nul wist de interpolatiebuffer.

NPC’s behouden hun identiteit en traject tussen verkeersmomenten. Zij versnellen/remmen begrensd, volgen voorliggers en reageren op voorspelde conflicten met de leerling. De rotonde-NPC gebruikt bij zijn eigen B6 de bestaande ringconflictcontrole en M3-beslisser. De snelwegauto’s hebben verschillende snelheden en een reproduceerbaar remmoment. Het is een eindige scenariostroom; verkeersdichtheid later in missie 10 hangt mede van rij- en wachttijden af, geen onbeperkte verkeersgenerator of algemene rijstrookkeuze-AI.

Rustig/Druk gebruiken seeds 909/910 en 1010/1011. Druk voegt twee snelwegauto’s toe en beperkt in de buitenwegsectie van missie 10 het modelzicht tot 45 m. Dit zijn modelparameters, geen wettelijke normen. De M3-beslisser blijft behouden. Nieuwe ruimtelijke beoordelingen blijven **oefenfeedback/advies** zolang menselijke validatie ontbreekt. Twee seconden is advies; contact bewijst geen juridische schuld. Niet gemeten spiegel-, oog- of dodehoekgedrag wordt niet als fout beoordeeld. Geen CBR-punten of officiële slaagcriteria.

## Leerstand, examen en rapport

De leerstand biedt opdrachten, uitleg, pauze en herstart. De oefenexamenstand toont tijdens de rit navigatie en instrumenten, zonder live verkeersfeedback, rem-/voorrangshints, blauwe leerhulpen of inzichtvraag. Pauzeren onthult geen rapport. Na afronden of expliciet beëindigen verschijnt het volledige rapport; een beëindigd examen vereist herstart. Beide standen gebruiken dezelfde fysica en regels.

Iedere encounter heeft een unieke ID binnen de rit, begin/eindtijd en begrijpelijke opdracht. Gebeurtenissen bevatten eigen codes, tijd, positie, snelheid, bebord maximum, bron-ID’s en verbeteradvies. De ritstand wordt anoniem bewaard en gaat mee in JSON en CSV-observaties. Oude rapporten blijven leesbaar. Herstart wist alleen de actuele rit en behoudt modus/moeilijkheid; eerder bewaarde rapporten blijven lokaal bestaan.

## Werkelijke controle en beperkingen

Lint, typecheck, productiebuild en 173/173 unit-tests slagen. Volledige browserrun: 45/47 in 32,9 min. Alle vier nieuwe complete ritten slagen. Eén woonwijkrit verloor zijn browsercontext; de afzonderlijke herhaling slaagt samen met vijf afsluitende controles: 6/6. De andere fout is de bestaande Windows-downloadannulering. Exacte commando’s, laatste subpadresultaat en beperkingen staan in TESTVERSLAG.md.

De spiegelketen blijft inhoudelijk ongewijzigd. Headless Shell gebruikt SwiftShader-softwareweergave; drie vensters blijven ook zonder spiegels traag. Een statisch geometriebatching-experiment is geheel teruggedraaid: spiegelpixels bleven gelijk, maar FPS-winst was niet stabiel. **Geen prestatieverbetering geclaimd.** Ruwe qa-m4e-performance-*.json tonen ook waarden onder 15 FPS.

Open: Windows-downloadacceptatie, menselijke juridische/WRM-/didactische review, doelgroep/toegankelijkheid, Edge, schoollaptops/GPU’s, fysieke monitoren/DPI, stuur/pedalen en twee duurtests van 30 minuten. Eigen schematische weg-/bordgeometrie is geen CROW/BABW-certificering. Geen fysiek gekalibreerd banden-/zichtmodel, complete statische botsingswereld, algemene inhaalengine of volledige automatische toetsing van alle snelwegverboden van RVV 43.

PR #2 blijft concept tegen milestone-3-gecontroleerd. Alleen de M4-branch wordt bijgewerkt. Niet mergen en geen GitHub Pages-publicatie starten.
