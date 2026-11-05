# Milestone 4 — ontwikkelversie, 4 november 2026

## Geïmplementeerd

- Tien losse, overzichtelijk selecteerbare missieposities. Alleen missie 1 en 2 zijn ontgrendeld; de overige acht zijn expliciet *in ontwikkeling* en niet speelbaar.
- Missie 1: oefenen met vooruitrijden, remmen en tot stilstand komen. De simulatie observeert voertuigpositie/snelheid en echte reminput. De 8 meter is een **didactisch oefendoel**, geen wettelijke of CBR-norm.
- Missie 2: hergebruikt de bestaande M3-oefening voor wegrijden uit een parkeervak. De volgorde richtingaanwijzer vóór bewegen plus de bereikte M3-eindpositie vormt het oefendoel. De M3-verkeersobservaties blijven zichtbaar en moeten afzonderlijk besproken worden.
- Voortgang binnen de rit; lokaal bewaren zonder naam; JSON- en CSV-export; knop om lokale rapporten te wissen. Inzichtvragen, spiegels en multi-screen code blijven behouden.
- Bestaande M3-situaties zijn bereikbaar via de bestaande selector; een M3-selectie schakelt een M4-missie uit.

## Expliciete beperkingen

- **Geen complete parkeeropleiding**: huidige voertuigfysica ondersteunt alleen vooruitrijden. Achteruitrijden en volledig parkeren vragen een afzonderlijk, getoetst fysica-/manoeuvremodel.
- Missie 2 markeert een *oefendoel* als bereikt, geen juridisch geslaagde verkeerssituatie. De observaties uit M3 kunnen onder andere waarschuwingen bevatten. Geen CBR-slaagscore.
- Geen doorlopende routes met verschillende verkeerssituaties, geen semantische rijstrookgrafiek, geen algemeen botsings-/conflictmodel en geen voltooid oefenexamen. Missies 3–10 staan daarom uitgeschakeld.
- Lokaal bewaren gebruikt localStorage en kan niet beschikbaar zijn in privé-/beheerde browsers. CSV/JSON-export blijft alleen bruikbaar als de browser downloads toestaat.
- Geen test op drie echte schoolmonitoren, stuur/pedalen, twee 30-minutenritten of verkeerskundige menselijke review.

## Werkelijk uitgevoerde controles in deze werkruimte

- `npm ci --offline --no-audit --no-fund`: **geblokkeerd** (`ENOTCACHED`, ontbrekende yocto-queue tarball).
- `npm ci --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000`: **mislukt** (`Exit handler never called!`; ontbrekende betrouwbare netwerktoegang).
- `tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --lib ES2022,DOM --skipLibCheck --typeRoots /tmp/no_types src/missions/model.ts src/missions/panel.ts`: **exit 0** voor afzonderlijke M4-moduletypes en imports (niet de volledige projecttypecheck).
- `tsc --module commonjs ... src/missions/model.ts` en Node assert-script: **9/9 geïsoleerde kerncontroles geslaagd** (beschikbare missies, voortgang, rem/stop, corrupte opslag, export). Geen Vitest-claim.
- Nieuwe Vitest- en Playwright-regressies zijn **geschreven, niet uitgevoerd**.
- De volledige `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, `npm run test:pages` zijn **niet aantoonbaar geslaagd** in deze omgeving. Laat Codex alle suites draaien met een werkende installatie.

## Vrijgavegrens

Dit is een *M4 ontwikkelbranch-kandidaat* en geen afgeronde milestone. De oorspronkelijke M3-branch en PR #1 blijven de gevalideerde basis. Publiceer en merge niets voordat de volledige regressiecontrole slaagt. Laat de nieuwe code in Codex op een afzonderlijke branch zetten.
