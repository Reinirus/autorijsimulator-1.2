# Technische basis voor Milestone 4

## Oordeel

**Geschikt als technische ontwikkelbasis voor Milestone 4, onder de hieronder beschreven voorwaarden.** De overdracht bevat de volledige zes-situatiecode uit het gecontroleerde M3-pakket op de herstelde M2-structuur. Dit oordeel betreft ontwikkelbaarheid en automatische dekking; menselijke juridische/didactische acceptatie en hardware-/duurvrijgave blijven open. De demonstratiestatus en reviewedByHuman:false blijven gehandhaafd.

## Wat al bruikbaar is

- Eén Simulation met fixed timestep 1/60 s en één WorldState. Zijvensters renderen snapshots en draaien geen eigen fysica, NPC's of regels.
- Zes afzonderlijke, selecteerbare en herstartbare situaties, met expliciete startpositie, NPC-route, opdracht, meetpunten en eindpositie.
- Een pure decideTraffic-functie op expliciete feiten, los van geometrie en rendering; normen hebben bron, artikel, versie en reviewstatus.
- Feitelijke observaties met tijd, positie, snelheid, regel-ID en alternatief. Geen CBR-slaagscore of beoordeling van niet gemeten ooggedrag.
- Reproduceerbare NPC-bewegingen, stoppen voor kruislicht, wachten/oversteken, voorspelde noodremreactie en geometrische contactobservatie.
- Cockpit, richtingaanwijzers, echte linker-/rechter-/binnenspiegel, één scherm, breedbeeld en gesynchroniseerde zijvensters.
- Bestaande regressies plus volledige correcte oefenritten met de echte voertuigfysica. De actuele aantallen en werkelijk uitgevoerde resultaten staan in TESTVERSLAG.md; historische resultaten tellen niet automatisch als een nieuwe run.

## Concrete uitbreidingen vóór/langs de M4-missies

| Huidige grens | Consequentie voor M4 |
|---|---|
| selectScenario maakt een nieuwe wereld en zet klok op 0 | Bouw een missielaag met route-/doelfasen. Laat een volgende verkeerssituatie binnen een rit de canonieke klok en wereld behouden. Een keten van bestaande resets is geen gecombineerde rit. |
| scenarioFacts gebruikt vaste scène-ID's, één primaire actor en eenvoudige coördinaatgrenzen | Voor rotondes, meerdere kruispunten en snelweg is een semantisch weg-/rijstrook-/conflictmodel nodig. Neem gesloten-scenariofeiten niet ongewijzigd over als algemene verkeersherkenning. |
| Gebeurteniscodes worden per oefenpoging één keer geregistreerd | Voeg encounter-/gebeurtenis-ID's toe, zodat herhaalde fouten op een gecombineerde route afzonderlijk met oorzaak en tijd worden vastgelegd. |
| M3 heeft zes losse situaties, geen tien missiedefinities | Werk eerst missie 1 en 2 af met hetzelfde geteste missiemodel; label overige missies in ontwikkeling tot hun route, doelen, afronding en herstart aantoonbaar werken. |
| Wegrijden bestaat; compleet parkeren is geen M3-missie | Kies een expliciet parkeerdoel en manoeuvremodel. De huidige fysica rijdt alleen vooruit; achteruit rijden vraagt passende besturing en tests. |
| Geen leer-/oefenexamenmodus of missievoortgang | Voeg presentatie-/feedbackmodi toe rond dezelfde regelmodule, plus geversioneerde lokale opslag zonder verplichte naam en anonieme JSON/CSV-export. |
| Eenvoudige voertuigcontouren; bij contact wordt snelheid nul | Meer routes en verkeer vragen aanvullende botsings-/conflicttests. De huidige contactmelding bepaalt geen juridische schuld en is geen gekalibreerde impactfysica. |
| 20 Hz snapshotdoel, circa 100 ms beeldbuffer, browser-throttling mogelijk | Laat missie-/navigatiestatus dezelfde bron volgen. Test fasewissels en herhaald herladen; meet op de fysieke schoolopstelling. Geen genlock of eigenaarsovername geclaimd. |

## Resterende validatie

1. WRM-/verkeerskundige en juridische review van scenario-feiten, conflict-/detectiemarges, uitleg, uitzonderingen en het remmodel bij geel. Het officiële RVV is als bron gecontroleerd; de algoritmische toepassing is niet door een mens goedgekeurd.
2. Didactische en toegankelijkheidsacceptatie met de doelgroep praktijkonderwijs, inclusief begrijpelijkheid van opdrachten en feedback. Geen leerlingtest geclaimd.
3. Windows Chrome/Edge op 1/2/3 echte schermen, DPI/kijkhoek/horizonafstelling, werkelijke browsertoestemming voor schermplaatsing, stuur/pedalen indien gebruikt.
4. Twee duurtests van 30 minuten, FPS-/latentie-/spiegelstabiliteit op schoollaptops. Korte headless-metingen gelden daarvoor niet als vervanging.
5. Ongeteste onderdelen blijven ongetest benoemd: geen nieuwe npm-security-audit, volledig fysisch voertuigmodel, offline-acceptatie of algemene verkeers-AI.

## Publicatie en review

Deze overdracht hoort op milestone-3-gecontroleerd in Reinirus/autorijsimulator-1.2 en wordt via een pull request aan main aangeboden. Geen merge of Pages-workflow starten. M4 mag als ontwikkelwerk op een expliciet geverifieerde M3-branch voortbouwen; dit document geeft geen toestemming voor publicatie en verklaart de juridische/hardwaregates niet afgerond.
