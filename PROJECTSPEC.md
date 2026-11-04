# Nederlandse Autorijsimulator — technisch en didactisch bestek
Versie 0.1 — 2 november 2026. Status: specificatie, GEEN werkende/geverifieerde simulator.

## Doel
Een Nederlandse rijvaardigheids- en verkeersinzichttrainer voor praktijkonderwijs (ca. 15–18 jaar) met een serieuze 3D-cockpit, echte verkeerssituaties, multi-monitor, spiegels, praktijkmissies en theorie-/inzichttraining. Publiceerbaar op GitHub Pages. Geen officieel CBR-product of vervanging van rijlessen.

## Ononderhandelbare kwaliteitseisen
1. Geen verzonnen verkeersregels of slaagcriteria. Elke geautomatiseerde norm verwijst naar rechtsbron, artikel, geldigheidsdatum en menselijke reviewstatus.
2. Legal rules, road geometry, NPC behavior, scoring, visualization en question bank losgekoppeld.
3. Geen puntenaftrek wegens 'niet in spiegel gekeken' als oog-/hoofdrichting niet betrouwbaar gemeten kan worden; geef hoogstens aandachtspunt of gebruik expliciete spiegelactie als beperkte proxy.
4. Leerstand met uitleg en pauze; examenstand zonder hints en met rapport; beide evalueren dezelfde regels.
5. Alle afbeeldingen/geluiden/3D-assets moeten legaal herbruikbaar zijn; geen ongeautoriseerde CBR-opgaven of CBR-logo's.
6. Transparant en veilig: alleen lokaal opslaan als standaard, geen leerlingnamen noodzakelijk, docentenexport anoniem JSON/CSV.
7. Niet beweren dat simulator wettelijk/examentechnisch gecertificeerd is.

## Architectuur
- Vite + TypeScript + Three.js (waar mogelijk lokaal geïnstalleerde assets); UI HTML/CSS, toegankelijk op Windows-laptops; offline optioneel met service worker.
- Packages/modules: `core` (deterministische fixed timestep vehicle dynamics), `world` (roads/semantic lane graph), `traffic` (state machines AI), `rules` (machine-readable rules + evaluator), `renderer` (3D and LOD), `displays` (views/sync), `questions` (authored question bank), `assessment`, `teacher`.
- De wereld beheert één canonieke toestand en één klok. Separate visual windows ontvangen timestamps/snapshots over BroadcastChannel of MessageChannel en interpoleren; géén onafhankelijke gesimuleerde auto's per scherm. Meet latentie en afwijking.
- Mirror cameras: 3 perspectief-camera's, links/rechts/binnen; render-to-texture op dashboard of dedicated panels. Physically correct left/right orientation, field of view adjustable, adequate resolution and LOD. Calibration screen with moving reference object.
- Display modes: A single screen (cockpit + mirrors); B triple widescreen single spanning browser canvas (fallback); C independent multi-window synchronized left/center/right via Window Management API with user consent, robust manual arrangement fallback; D optional instructor screen.
- On multi-screen: center primary scene, left/right distinct side views; mirrors embedded in cockpit (not mistaken for side windows). Configure bezel correction, viewing angles, FOV, matching horizon, display pixel ratios. Never open windows without user click. Warn about performance and unsupported browser.
- Inputs: keyboard first (arrow/WASD, space brake etc; configurable), Gamepad API optional; wheels/pedals mapping/calibration configurable, pedal dead zones, separate axes, manual shifting optional. DO NOT claim generic browser support for every USB steering wheel, force feedback, or steering rotation without testing exact model.
- Fixed timestep physics with speed in m/s internally, km/h display. Steering, acceleration/deceleration, tire grip, steering rate, braking; predictable collisions. Do not claim physical certification. Accessibility toggles: low graphics, large interface, subtitles, optional assisted driving.
- `rules` has time-bounded scenario-specific constraints and priority ordering; separate legal violations from best-practice scoring. Traffic light phase, sign visibility, road class, permitted lane movement, speed profile, crosswalk/crossing objects included in scenario config.
- NPC traffic must respect regulations except intentionally documented anomaly cases; scenario triggers must be reproducible from seed.

## Rules / content inventory for legal verification
RVV 1990 (version 2026-07-01): Art 3 place on road; 5 cycling; 15 priority intersection; 17/18 special road users/turning traffic; 19 visibility stopping distance; 20–22 speeds; 23–26 stopping/parking; 31 traffic lights; 49 pedestrians; 54 special maneuvers; 55 indicators; 56 buses; 61a phone. Check exact wording/currentness and other relevant articles before implementation. Also WVW 1994 article 5 (danger/hindrance), relevant BABW, vehicle requirements, signs appendix RVV.
Additional teaching: lane discipline; 30/50/60/80/100 and dynamic limits as specified by signs/road; 06–19 speed motorway majority 100 but specific stretches differ; wet stopping distances; anticipation and vulnerable users; level crossings, buses and emergency vehicles; tunnels and road works; shared spaces; environmental zones; parking; headlights; seat belts; alcohol/drugs; 2toDrive; beginner status; driving assistance (ABS/ESC/ADAS), rules amended 2026-04-01.
Mark each lesson: statute, driving best practice, or educational example. Do not confuse advice (e.g. 2-second following distance) with a universal statutory numeric threshold.

## Exam and assessment
- Theory practice aligned with post-2025 B format: 50 scored questions, at least 44 correct, 30 minutes, 2 unscored pilot questions optionally simulated. Separate accommodation mode (45 min if configured), don't claim CBR approved.
- Original questions: multiple choice, multiple correct, yes/no, numeric, image click, ordering, short animations; hazards framed as OBSERVE -> PREDICT -> DECIDE.
- Create at least 250 independently reviewed, uniquely formulated learning items before 'complete' release; version each and source legal rule. No items published as validated without human/legal check. For early MVP use 20 validated teacher-reviewed questions and a test-mode sample only.
- Each scenario includes: educational objective, object placement, timing, correct decisions, wrong options, explanation, reference IDs, difficulty tags, expected telemetry and deterministic tests.
- Practical mission progression (10): cockpit/car controls; driving off and parked vehicles; urban 30-km/h residential; equal junction/priority; signals and crosswalks; cyclists/pedestrians and blind spots; roundabout; provincial roads; motorway joining/exiting; simulated exam mixed conditions. Add weather/night as variations, not a mandate to teach unsafe behavior.
- Assessment output: speeding duration, missed give-way events, near misses, collisions, signaling before lateral motion, lane position, unsafe gap, observation coaching when measurable, missed hazards, intervention needed; never automatic pass/fail based on invented CBR rubric.
- Show report with evidence: scene timestamp, observed facts, rule or advice, alternative action. Accessible, positive but direct Dutch text.

## Risk and validation
Legal and teaching review by Dutch WRM-certified instructor / traffic theory specialist; display 'last reviewed' and normative source version. Unit tests for conflicts: priority signs vs equal junction, 30 zone, special maneuvers, overtaking, pedestrians, turning cyclists, school bus, traffic lights, 100 daytime vs local motorway limit, falling back safely if unrecognized.
Automated tests: fixed timestep, mirrors actual rear scene and left-right correct, no double simulation across displays, frame throttling/resume, refresh resilience, score correctness, question randomization, GitHub Pages paths, offline availability, keyboard key-up release, gamepad disconnect.
Manual acceptance: Windows Chrome/Edge on 1/2/3 monitors; keyboard and one named wheel/pedals; screen calibration; 15+ FPS floor on target hardware (target 30–60); no mirror freeze; two 30-minute sessions without crashing; no device/browser assumptions. Use observable performance metrics rather than unsupported performance promises.

## Development milestones / gates
0: Hardware inventory, browser and GPU benchmarks, legal audit structure.
1: Vertical slice: one road, cockpit, mirrors, one intersection and speed/distance, one canonical game loop.
2: Multi-screen modes 1, 2, 3 with explicit calibration + synchronized objects and benchmarking.
3: Legal traffic engine and verified 6 archetypal junction scenarios, unit tests.
4: Full 10 missions and traffic participants.
5: Theory and hazard bank, teacher review and accessible modes.
6: Production optimization, assessment evidence, privacy and legal review, offline and GitHub Pages release.
Never skip validation gate to add visual polish.

## Source list (verification at implementation)
- RVV 1990 consolidated per 2026-07-01: https://wetten.overheid.nl/BWBR0004825/2026-07-01/0
- Rijksoverheid motorway speed: https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/verkeersveiligheid/wat-is-de-maximumsnelheid-voor-auto-s-op-de-snelweg
- Rijksoverheid 2toDrive ages: https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/rijbewijs/wanneer-mag-ik-rijles-nemen-en-rijexamen-doen-voor-mijn-autorijbewijs
- CBR/theory format cross-check: https://www.theorie.nl/examenvoorbereiding/auto-theorie-examen-b/hoeveel-vragen-theorie-examen-auto
- Legal amendment ADAS effective 2026-04-01: https://zoek.officielebekendmakingen.nl/stcrt-2025-40398.html
- Window Management API: https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API
- Window API usage: https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API/Using
- Rijksoverheid plans and actual enactments: https://www.rijksoverheid.nl/themas/verkeer-en-vervoer/verkeersveiligheid/maatregelen-verkeersveiligheid
