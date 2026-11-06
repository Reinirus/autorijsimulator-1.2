# Milestone 5A — Theorie en gevaarherkenning (ontwikkelversie)

## Implementatie

- Eigen theorieknop naast de bestaande rijmissies; bestaande M1–M4-functies intact.
- 15 eigen Nederlandstalige oefenvragen: vijf verkeersregels, vijf gevaarherkenning en vijf verkeersinzicht.
- Oefenstand geeft na elke keuze uitleg; oefentoetsstand toont feedback pas na afloop.
- Onderwerpkeuze, reproduceerbaar geschudde vraagvolgorde, anonimiteit, lokale resultaatopslag met veilige terugval bij geblokkeerde opslag, CSV-export.
- Pauze van de rij-invoer zolang het theoriedialoog zichtbaar is.
- Nadrukkelijk **geen officiële CBR-vragen, geen juridisch of didactisch menselijk gevalideerde vraagbank, geen wettelijk slaagcijfer**.

## Openstaand

- De 15 vragen zijn *concept-oefenmateriaal*. Laat de juridische inhoud en de formuleringen beoordelen door een WRM-docent/inhoudsdeskundige voordat ze als normatief lesmateriaal worden aangeboden.
- Gevaarherkenning bestaat hier uit tekstcasussen, nog niet uit bewegende situaties of video.
- Geen automatische koppeling van theorievragen aan gebeurtenissen in de rit of docentendashboard.
- Geen 50-vragentoets; zo'n omvang heeft pas zin na toetsmatrijs, redactionele kwaliteitscontrole en voldoende gevalideerde vragen.
- M4-branch en M1-hardware-/duurtests blijven afzonderlijk open. Demo-status blijft.

## Controle en integratie — 6 november 2026

164 aangeleverde losse bestanden gemapt; oorspronkelijke ZIP niet beschikbaar. Werkende tien M4E-ritten behouden en opnieuw volledig in Chromium gereden, inclusief Rustig/Druk voor 7–10. Hersteld: niet ontdekte unit-testbestandsnaam, geblokkeerde opslaggetter, validatie van opgeslagen resultaten, verouderde antwoordacties, pauze van wereldklok en native spatiebediening. Regelvragen hebben bronmetadata en alle antwoorden een uitlegbaar eindrapport.

Resultaten: npm ci/lint/typecheck/build geslaagd; 186/186 unit-tests; Chromium 53/55; productie-subpad 13/13. Strikte M4-JSON- en M5-CSV-bestandsdownloads geven op Windows canceled. Tests blijven strikt actief; de export is daardoor niet volledig vrijgegeven. GitHub CI moet groen zijn voordat een concept-PR naar milestone-4-rijmissies wordt gemaakt. Details en logs: M5_TESTVERSLAG.md. Geen merge of publicatie.
