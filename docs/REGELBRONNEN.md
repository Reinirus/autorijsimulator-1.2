# RVV-broncontrole — Milestone 3

Technische broncontrole: **4 november 2026**. Bron: [RVV 1990, BWBR0004825, geconsolideerde versie 01-07-2026](https://wetten.overheid.nl/BWBR0004825/2026-07-01/0). De op 4 november rechtstreeks opgehaalde officiële pagina vermeldt: geldend van 01-07-2026 t/m heden. De webzoektool gaf 429; de rechtstreekse download van de officiële pagina is wel gelukt. Zie RVV_BRONUITTREKSELS.txt voor de gebruikte artikelen, bijlagevermeldingen en SHA256 van de volledige opgehaalde HTML. Er zijn geen CBR-opgaven of externe verkeersbeelden overgenomen.

**Bron gecontroleerd betekent geen menselijke juridische validatie van het algoritme.** Alle RULES hebben reviewedByHuman:false. Een WRM-/verkeerskundig en juridisch deskundige moet scenario's, waarnemingsgrenzen en uitleg beoordelen voordat dit als gevalideerde verkeersopleiding wordt aangeboden.

| Regel-ID | Rechtsbasis | Toepassing en geteste afbakening |
|---|---|---|
| RIGHT | Art. 3 lid 1 | Zoveel mogelijk rechts. De behouden M1-observatie blijft advies, geen harde universele rijstrookgrens. |
| PRIORITY | Art. 15 leden 1–2 | Bestuurder van rechts; uitzonderingen onverhard/verhard en tram. Scenario 1 betreft twee verharde wegen, personenauto's en geen voorrangstekens. Uitzonderingen zijn in de pure regeltests opgenomen. |
| YIELD_SIGN | Art. 62, 63, 80; bijlage 1 B6 | B6/haaientanden: kruisende bestuurders voorrang verlenen, ook van links. Geen algemene stopverplichting bij een leeg kruispunt. B7 is niet hetzelfde en wordt niet als B6 behandeld. |
| RED | Art. 68 lid 1, art. 79 | Rood stoppen vóór de bestemde stopstreep. Geel stoppen tenzij redelijkerwijs niet mogelijk; het rekenmodel voor die mogelijkheid is geen wettelijke numerieke norm. Geelbeoordeling levert daarom alleen modeladvies op. |
| SIGNAL_PRIORITY | Art. 64 | Lichten gaan boven voorrangstekens. Groen schakelt verplichtingen bij afslaan of bijzondere manoeuvres niet algemeen uit. Getest met B6 en fietser. |
| TURN | Art. 18 lid 1 en lid 3 | Personenauto slaat rechtsaf; rechtdoorgaande fietser op dezelfde weg naast/dicht achter voor laten gaan. Tramuitzondering geldt niet voor deze personenauto. Andere afslaansituaties zijn niet als complete engine gedekt. |
| TURN_SIGNAL | Art. 17 lid 2 | Richting aangeven bij willen afslaan; in deze rechtsafopdracht is dat rechts. Geen verzonnen minimumaantal seconden. |
| PEDESTRIAN | Art. 49 leden 2–4 | Voetganger op of kennelijk op het punt van oversteken bij zebra. Scenario 5 heeft geen voetgangerslicht, colonne of uitvaartstoet. De uitzondering rood voetgangerslicht is apart getest; militaire-/uitvaartstoeten en geel knipperlicht zijn niet uitgewerkt in een speelbare scène. |
| MANOEUVRE | Art. 54 | Wegrijden: het overige verkeer voor laten gaan, niet alleen bestuurders van rechts. Scenario 6 heeft een naderende auto achter de speler. |
| INDICATOR | Art. 55 | Richtingaanwijzer bij wegrijden en belangrijke zijdelingse verplaatsingen; in de getekende parkeersituatie is de verplaatsing naar links. |
| SPEED | Art. 62, 63; bijlage 1 A1 | Expliciet A1 met 30 km/u, geen universele 30-zoneclaim. De M3-toetsing is beperkt tot de bekende naderingsrijbaan, abs(x)<4 en z>4; de waarde wordt niet na afslaan naar een onbekend wegvak doorgetrokken. De M1-demo blijft een afzonderlijke demonstratie. |

## Geen juridische getallen verzinnen

De volgende waarden zijn **simulator-/waarnemingsparameters**, geen RVV-grenswaarden: modelafmetingen, lijncoördinaten, 0,7 s reactieruimte bij geel, 6 m/s² spelersremmen, 5 m/s² NPC-remmen, een seconde voorspelling voor botsingsvermijding, aankomstvensters en ruimtelijke marges voor padconflicten. Het RVV bevat voor deze situaties geen universele seconden-/metergrens die deze code juridisch sluitend zou maken. Een modelafwijking is alleen een uitlegbare observatie binnen de beschreven scène.

Geometrisch contact en NPC-noodremmen krijgen advies/waarneming, geen automatisch juridisch schuldlabel. Niet gemeten spiegel-/ooggedrag wordt niet beoordeeld. Er is geen verzonnen CBR-slaagscore of boetebedrag.

## Volgorde en onzekerheid

De pure decideTraffic-functie verwerkt onbekende situaties zonder juridische conclusie. Rood en geel worden vóór de andere verplichtingen bekeken. Bijzondere manoeuvre, afslaan en zebra blijven relevant bij groen waar de feiten dat vereisen. Zonder actieve lichten regelen expliciete voorrangstekens de toepasselijke kruispuntvoorrang; daarna pas de rechtsregel met uitzonderingen. De aanroep vanuit een scenario levert bekende, expliciete feiten. Dit is geen algemene verkeersjurist die willekeurige wegbeelden classificeert.

Legacy rightOfWay en evaluate zijn alleen behouden voor de M1-demonstratie en regressies. De M3-situaties gebruiken decideTraffic en eigen overgangs-/bewijsevaluatie. Tests controleren de codeconclusies voor de opgegeven feiten; zij vervangen geen menselijke beoordeling van de feitelijke scène of wetsinterpretatie.

## Aanvullende broncontrole Milestone 4C — 5 november 2026

De officiële geconsolideerde RVV-pagina (versie 01-07-2026) is opnieuw rechtstreeks opgehaald met Invoke-WebRequest: HTTP 200. De web-openfunctie gaf 429; die is niet als geslaagde bronraadpleging geteld. De lokaal opgeslagen HTML heeft SHA256 `889F2189B4A032D97B47D74F8373AC3014A5F128871587B672752CEBFAA5B2C8`. Bron: https://wetten.overheid.nl/BWBR0004825/2026-07-01/0 . Artikelen 68 lid 1 en 79 zijn opnieuw gelezen voor geel en de bestemde stopstreep. M3-verwijzingen voor rechts (15), afslaan/fietsers (17/18), zebra (49), voorrangstekens en lichten (62–64/80) blijven behouden; zie ook de oorspronkelijke bronuittreksels.

M4C vervangt de oude vaste reactietoeslag van 0,7 seconde door een numerieke remsimulatie met exact dezelfde integrateVehicle-functie, actuele snelheid, pose en stuurinput. Het model legt de afstand tot de lijn, berekende remweg, stoptijd en onzekerheid vast. Het voertuigmodel bevat wel fysieke modelparameters zoals remkracht en weerstand; deze zijn geen wettelijke grenswaarden. Een scherpe stuurbeweging of voorspeld achteropkomend risico kan leiden tot een onzekere conclusie. De berekening neemt onmiddellijke rembediening aan en modelleert geen echte menselijke reactietijd, wegdekwrijving of juridische redelijkheid volledig. Daarom blijft iedere geel-modelafwijking advies/oefenfeedback, nooit een automatisch bewezen RVV-overtreding.

De geregelde zebra heeft afzonderlijke voetgangerslichten en een eigen stopstreep voor de auto. Een voetganger begint bij eigen groen en mag de oversteek afmaken; een nog bezette oversteek bij autogroen levert veiligheidsadvies op. De onverwachte voetganger in missie 6 heeft juist geen zebra en geen automatische zebra-/voorrangsschuldbeoordeling. Waargenomen rembediening bewijst geen oog-, spiegel- of dodehoekgedrag. Alle menselijke reviewstatussen blijven open/false. De nieuwe ruimtelijke toepassing moet door een menselijke verkeerskundige en juridisch deskundige worden beoordeeld.
