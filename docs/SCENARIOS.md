# Zes verkeerssituaties — Milestone 3

Alle plaatsingen zijn reproduceerbaar, zonder willekeur. Coördinaten in meters: x naar rechts, de speler rijdt bij heading 0 naar afnemende z. De rijbaan is x=-4..4, het kruispunt rond z=0. Positie en klok horen bij één canonieke WorldState. Zie src/scenarios/catalog.ts voor de volledige configuratie. Elke scène begint stilstaand, met de NPC-route expliciet vastgelegd.

| ID / niveau | Start speler | Andere verkeersdeelnemer | Opdracht en correcte reactie | Meetpunt / rechtsbasis |
|---|---|---|---|---|
| rechts / basis | (1,55;23), richting noord | Auto (15;-1,55) naar (-22;-1,55), doel 5 m/s | Rechtdoor, kruisend verkeer van rechts ongehinderd laten passeren; veilig tijdig snelheid minderen | Voorzijde passeert z=4,5; art. 15. Voorspeld conflict en zo nodig daadwerkelijk NPC-remmen worden vastgelegd. |
| haaientanden / basis | (1,55;23), noord | Auto (-15;1,55) naar (22;1,55), doel 5 m/s | B6 en haaientanden; ook de auto van links voor laten gaan. Bij afwezig verkeer geen stop eisen | Voorzijde z=4,5; art. 62/63/80 + B6. |
| lichten / basis | (1,55;23), noord | Auto (-16;1,55) naar (24;1,55), doel 4,5 m/s | Rood: vóór witte stopstreep stoppen. Geel: stoppen tenzij redelijkerwijs onmogelijk. Bij groen vrij zijn blijven controleren | Voorzijde z=6; art. 68/79. Geel alleen modeladvies. Hoofdlichtcyclus rood 0–9, groen 9–18, geel 18–21 s; kruislicht groen 1–6, geel 6–8, anders rood. Onderlinge ontruiming expliciet. |
| fietser / gevorderd | (1,55;14), noord | Fietser (3,2;16) rechtdoor naar (3,2;-24), doel 4 m/s | Rechtsaf op kruispunt, rechts richting aangeven, fietser op dezelfde weg naast/dicht achter voor laten gaan | Afslaan wordt fysiek vastgesteld; fietsconflict wanneer speler x=2,35 passeert bij abs(z)<7. Art. 17/18. |
| zebra / basis | (1,55;23), noord | Voetganger (4,6;10) naar (-5;10), doel 1,4 m/s | Voetganger met zichtbare oversteekintentie laten oversteken; tijdig stoppen vóór zebra | Voorzijde z=12 bij zebra rond z=10; art. 49. De voetganger wacht aan de rand op een stilstaande auto tussen z=12,4 en 19 en loopt daarna over. Passage achter een al gepasseerde voetganger wordt niet als dezelfde conflictsituatie beoordeeld. |
| wegrijden / gevorderd | (5,2;20), parallel in parkeervak | Auto (1,55;31) naar (1,55;-25), doel 5 m/s | Overig verkeer achter je voor laten gaan, links richting aangeven, rustig naar rechterrijstrook sturen en rechtzetten | Voertuigcontour komt vanaf parkeervak over x=4; art. 54/55. De geparkeerde auto begint volledig buiten de rijbaan. |

## NPC-gedrag

NPC's versnellen en remmen begrensd langs een route. Kruisende auto's beginnen wanneer de speler nadert (z<19), zodat de timing reageert op de speler in plaats van alleen op verstreken tijd. De fietser en auto achter de geparkeerde speler starten direct. Het kruisende verkeer in de lichtenscène heeft een eigen, canoniek opgeslagen signaalfase. Het remt vóór zijn stopstreep en rijdt na groen verder. Een al ingezette kruising wordt vrijgemaakt.

De voetganger heeft een kenbare intentie; de scène meldt dat ook in de instructie. Een routevoorspelling remt NPC's bij fysiek gevaar. Dit is een beperkte veiligheidsreactie, geen garantie dat een leerlingauto die doorrijdt nooit botst. Een overlapcontrole met georiënteerde voertuigcontouren meldt contact en zet de spelerssnelheid op nul. Dat is geen uitgewerkte botsingsdynamica.

## Bewijs en afhandeling

Gebeurtenissen bevatten simulatietijd, situatie-ID, code, categorie, regel-ID's, voertuigpositie, snelheid, aanwezigheid/kleur van licht, voorspeld conflict en NPC-modus. Er staat een alternatief bij, met klikbare RVV-bron. Codes worden per oefenpoging één keer opgeslagen. Beginwaarneming, later ingrijpen en contact zijn afzonderlijke feiten. Uitlegdetails blijven open als nieuwe gebeurtenissen verschijnen.

Eindposities: rechtdoor voorbij z=-8, zebra voorbij z=5, rechtsaf x>10 bij abs(z)<5, wegrijden op de rechterrijstrook tussen x=0,5 en 2,8 voorbij z=12 met vrijwel rechte heading. Bereiken geeft alleen 'oefensituatie afgerond'. Er is geen officieel slaag-/zakresultaat. Een verkeerde route wordt niet automatisch als een willekeurige juridische overtreding benoemd.

## Afbakening voor review

Weggeometrie is procedureel en vereenvoudigd. Iedere NPC volgt één scenario-route; er is geen stadsbrede verkeersplanning, inhaal-AI, voorrangsvoertuig of trambesturing. Relevantie-/conflictgrenzen zijn modelaannames die een verkeersdeskundige moet beoordelen. Bij geel gebruikt de simulator een remmodel, geen wettelijke rekensom. De broncontrole en automatische tests zijn uitgevoerd; de menselijke verkeerskundige/juridische scèneacceptatie staat open.
