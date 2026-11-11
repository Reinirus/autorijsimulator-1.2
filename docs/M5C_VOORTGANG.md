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
