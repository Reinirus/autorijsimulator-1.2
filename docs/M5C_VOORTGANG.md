# Milestone 5C — oefenoverzicht en docentenexport (ontwikkelcommit)

Gebaseerd op M5B-commit 0d5d3f697f75836ec8deffa5405fcbe52fcc460c. De tien rijmissies, theorievragen en bewegende gevaarherkenning worden niet gewijzigd.

## Inhoud
- Nieuw dialoogvenster 'Mijn oefenoverzicht' in de bestaande simulatie.
- Leest bestaande lokale, gevalideerde resultaten; schrijft geen nieuwe persoonsgegevens.
- Rijmissies: bewaarde pogingen, voltooide pogingen, verschillende voltooide missies en verkeersmeldingen. Meldingen zijn **geen** foutscore.
- Theorie: laatste volledige resultaat uitgesplitst naar de drie domeinen.
- Gevaarherkenning: laatste volledige resultaat uitgesplitst naar Kijken, Voorspellen en Beslissen.
- Praktisch oefenadvies per domein, anonieme CSV-export, toets op onbereikbare opslag.
- Geen leerlingnamen, centraal dashboard, accounts of cross-device voortgang. Op een gedeeld apparaat mogen uitkomsten niet aan een individu worden toegeschreven.

## Grenzen
De databronnen zijn historisch: voor theorie en gevaarherkenning wordt slechts het laatste complete resultaat opgeslagen; rijrapporten maximaal 100 pogingen. Een docent kan niet bepalen welk resultaat bij welke leerling hoort zonder een apart, door de school georganiseerd proces. Geen leerlingvolgsysteem, geen officiële score of CBR-examen.

## Nog te controleren
Deze commit is een eerste integratie, **niet vrijgegeven**. GitHub Actions moet lint/typecheck/unit/Chromium/Pages nog controleren. Ook de Windows-downloadproblemen, juridische beoordeling, toegankelijkheid, schoolhardware en duurtests blijven open. Geen merge of publicatie.

## Uitbreiding: oefenbestand per leerling (11 november 2026)

Nieuw: lokaal exporteerbaar JSON-oefenbestand met bestaande rijmissie-, theorie- en gevaarherkenningsresultaten; import weigert foutieve inhoud en weigert resultaten te mengen als het apparaat al een actieve set bevat. Het wissen van de drie specifieke oefensleutels vraagt bevestiging. Andere website-/browsergegevens worden niet gewist. Na import of wissen laadt de pagina opnieuw.

Geen leerlingnaam, code, account of automatische koppeling. De leerling/docent moet het bestand op een door school goedgekeurde plaats bewaren en vóór wisselen van leerling de huidige oefenresultaten exporteren en wissen. Dit is **geen beveiligde multi-user-oplossing** of leerlingvolgsysteem. Bij gedeeld gebruik vóór wissen kan een andere gebruiker de lokale resultaten bekijken. Het anonieme bestand kan in een kleine groep indirect herleidbaar zijn.

Extra unit-tests valideren JSON-inhoud, import, scheiding en wissen. Nog niet lokaal uitgevoerd; controleer GitHub Actions en een echte Windows-download vóór gebruik in de klas. Er is niets gemerged of gepubliceerd.
