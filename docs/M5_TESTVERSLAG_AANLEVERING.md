# Milestone 5A — feitelijke controles

Datum: 6 november 2026. Ontwikkeld vanuit M4E-archief en GitHub-commit 396e454.

- Nieuwe standalone theory-modules (`bank.ts`, `engine.ts`, `panel.ts`) door globale TypeScript-compiler gecontroleerd: geen TypeScript-fouten op die drie modules.
- Pure oefenengine naar CommonJS gecompileerd en in Node gecontroleerd: 15 vragen; 5/5 goede antwoorden in domein Gevaarherkenning; CSV heeft kopregel plus vijf antwoorden.
- `npm ci`: niet geslaagd; npm-register niet bereikbaar en offline-cache mist `yocto-queue`. Daarom zijn volledige projecttypecheck, lint, Vitest, bundelbuild, Playwright en Pages-tests **niet uitgevoerd**. Nieuwe Vitest-tests zijn toegevoegd maar niet uitgevoerd.
- De bestaande tien missies en M4-bestanden zijn ongewijzigd overgenomen, behalve het koppelpunt in `src/app.ts`, nieuwe CSS en de nieuw toegevoegde M5-bestanden. Geen hardware-/didactische of juridische acceptatie.
- Nieuwe oefenvragen zijn concepten, niet door WRM-verkeersdeskundige gecontroleerd. Geen officiële CBR-toets of gevaarherkenningsvideo.
- M5A mag niet naar main worden gemerged of naar GitHub Pages worden gepubliceerd voordat alle geautomatiseerde en menselijke vrijgavecontroles slagen.
