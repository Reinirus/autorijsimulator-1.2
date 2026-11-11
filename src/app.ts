import {MissionPanel} from './missions/panel';
import {SCENARIOS} from './scenarios/catalog';
import {ScenarioPanel} from './scenarios/panel';
import {DisplayController} from './displays/controller';
import './style.css';
import {DrivingView} from './renderer/scene';
import {Simulation} from './core/simulation';
import {Keyboard,KEY_MAP} from './core/keyboard';
import {kmh} from './core/state';
import {evaluate} from './rules/evaluator';
import {Assessment} from './assessment/session';
import {demoQuestion} from './questions/demo';
import {TheoryPanel} from './theory/panel';
import {HazardPanel} from './hazards/panel';
import {ProgressPanel} from './progress/panel';
const root=document.querySelector<HTMLDivElement>('#app');if(!root)throw new Error('Appcontainer ontbreekt');
root.innerHTML=`<header><div><h1>Nederlandse Autorijsimulator <small>Milestone 1–5 demo</small></h1><p>Oefen veilig in een Nederlandse woonwijk</p></div><strong class="warning">DEMO — NIET CBR-GECERTIFICEERD</strong></header>
<main><section class="sim"><div class="screen"><canvas id="drive" aria-label="3D-rijomgeving"></canvas><div class="calibration-guide"></div><div id="driveTask" class="drive-task" role="status" hidden></div><div class="mirrors"><div><span>LINKERSPIEGEL</span><canvas id="leftMirror" width="320" height="190"></canvas></div><div><span>BINNENSPIEGEL</span><canvas id="centerMirror" width="320" height="190"></canvas></div><div><span>RECHTSSPIEGEL</span><canvas id="rightMirror" width="320" height="190"></canvas></div></div><div class="overlay"><div class="speed"><strong id="speed">0</strong><span>km/u</span></div><div id="signal">Verkeerslicht: rood</div></div><div class="dashboard"><span>STUUR <b id="wheel">◯</b></span><span>GAS <b id="gas">uit</b></span><span>REM <b id="brake">uit</b></span><span>TIJD <b id="clock">0:00</b></span><span>STAND <b id="driveGear">D</b></span></div></div><div class="actions"><button id="start">Start missie</button><button id="stop" disabled>Stop missie</button><button id="reset">Opnieuw</button><button id="reverseGear" aria-pressed="false">Achteruit (R)</button><button id="exteriorView" aria-pressed="false">Buitenbeeld achter de auto</button><button id="question">Inzichtvraag</button></div><p class="hint">Besturing: ↑ / W gas · ↓ / S / spatie rem · ← → / A D sturen. Stop om D of R te kiezen. Geef daarna gas om in die richting te rijden.</p><div id="status" role="status">Start de missie om te rijden. Let op de 30-zone en houd rechts.</div></section>
<aside><h2 id="scenarioTitle">Missie 1 · Kennismaken</h2><ol id="scenarioObjectives"><li>Start de missie.</li><li>Geef rustig gas.</li><li>Houd zoveel mogelijk rechts.</li><li>Houd je aan de beborde 30 km/u-zone.</li><li>Observeer het verkeerslicht.</li></ol><p id="ruleScope">Rood licht en voorrang worden in deze milestone nog <strong>niet als bewezen verkeersovertreding beoordeeld</strong>.</p><h3>Oefenobservaties</h3><div id="events" aria-live="polite">Nog geen observaties.</div><p class="fine">Regelstatus: bron gecontroleerd, geen menselijke juridische validatie. Deze 3D-rijomgeving is geen rijopleiding of CBR-examen.</p></aside></main>
<dialog id="dialog"><h2>Oefenvraag · NIET JURIDISCH GEVALIDEERD</h2><p id="questionText"></p><div id="answers"></div><p id="feedback" role="status"></p><button id="close">Sluiten</button></dialog>`;
const $=<T extends HTMLElement>(s:string)=>{const e=document.querySelector<T>(s);if(!e)throw new Error('Ontbrekend UI-element '+s);return e;};
const simulator=new Simulation();const keyboard=new Keyboard();const assess=new Assessment();
let view:DrivingView|null=null;let animation=0;let previous=performance.now();let lastReportSecond=-1;
const mirrorElements={links:$<HTMLCanvasElement>('#leftMirror'),rechts:$<HTMLCanvasElement>('#rightMirror'),binnen:$<HTMLCanvasElement>('#centerMirror')};
const displays=new DisplayController(()=>simulator.state);
const hazardPanel=new HazardPanel(()=>{keyboard.clear();simulator.setInput(keyboard.snapshot());});
const theoryPanel=new TheoryPanel(()=>{keyboard.clear();simulator.setInput(keyboard.snapshot());});
const progressPanel=new ProgressPanel(()=>{keyboard.clear();simulator.setInput(keyboard.snapshot());});
const scenarioPanel=new ScenarioPanel(id=>{missionPanel?.deactivate();simulator.selectScenario(id);keyboard.clear();assess.reset();lastReportSecond=-1;$('#start').removeAttribute('disabled');$('#stop').setAttribute('disabled','');$('#events').textContent='Nog geen observaties.';$('#status').textContent='Situatie klaar. Start de missie.';if(id==='demo'){ $('#scenarioTitle').textContent='Missie 1 · Kennismaken';$('#scenarioObjectives').textContent='Start, geef rustig gas en houd rechts.';$('#scenarioInstruction').textContent='Bestaande M1/M2-demo.';$('#scenarioSources').textContent='M1/M2-demo: beperkte demonstratiebeoordeling.';$('#ruleScope').textContent='M1/M2: beperkte demonstratiebeoordeling.';}renderUI();},value=>{simulator.state.indicator=value;});
const missionPanel=new MissionPanel(simulator,keyboard,()=>{assess.reset();lastReportSecond=-1;$('#start').removeAttribute('disabled');$('#stop').setAttribute('disabled','');$('#events').textContent='Nog geen observaties.';$('#status').textContent='Start je nieuwe oefenmissie.';});
let exterior=false;
function renderUI(){const s=simulator.state; const reverse=s.gear==="R"; document.querySelector("#driveGear")!.textContent=reverse?"R":"D";document.querySelector("#reverseGear")!.setAttribute("aria-pressed",String(reverse));$('#theoryOpen').hidden=s.course?.mode==='examen'&&!s.mission?.completed&&!s.course?.ended;$('#hazardOpen').hidden=$('#theoryOpen').hidden;$('#progressOpen').hidden=$('#theoryOpen').hidden;scenarioPanel.render(s);missionPanel.render(s);$('#speed').textContent=Math.round(kmh(Math.abs(s.vehicle.speed))).toString();$('#signal').textContent=s.mission?.id===10&&s.mission.encounterId.includes('licht')?'Verkeerslicht: '+s.light:(s.mission&&!s.scenario)||s.scenario&&!SCENARIOS[s.scenario.id].signal?'Geen verkeerslicht':'Verkeerslicht: '+s.light;$('#gas').textContent=s.input.throttle?'aan':'uit';$('#brake').textContent=s.input.brake?'aan':'uit';$('#wheel').textContent=s.input.left?'↶':s.input.right?'↷':'◯';$('#clock').textContent=`${Math.floor(s.clock/60)}:${String(Math.floor(s.clock%60)).padStart(2,'0')}`;}
function frame(now:number){const elapsed=(now-previous)/1000;previous=now;const questionOpen=$<HTMLDialogElement>('#dialog').open||theoryPanel.openNow||hazardPanel.openNow||progressPanel.openNow;
 if(questionOpen)keyboard.clear();
 simulator.setInput(keyboard.snapshot());
 if(!questionOpen){simulator.tick(elapsed);missionPanel.advance(simulator.state);}
 if(simulator.state.course?.ended)$('#start').setAttribute('disabled','');
 if(simulator.state.mission?.completed){$('#status').textContent='Oefenroute afgerond. Bekijk de observaties, bewaar je rapport of kies Opnieuw.';keyboard.clear();$('#start').setAttribute('disabled','');$('#stop').setAttribute('disabled','');}renderUI();if(simulator.state.running&&!simulator.state.scenario&&!simulator.state.mission){const secs=Math.floor(simulator.state.clock);if(secs!==lastReportSecond){lastReportSecond=secs;assess.record(evaluate(simulator.state));}}
 const rendered=displays.renderState();displays.stamp(rendered);const renderStart=performance.now();
 try{view?.render(rendered,mirrorElements,{mode:displays.mode==='span'?'span':'single',calibration:displays.calibration,exterior});displays.metrics.record(performance.now(),performance.now()-renderStart);}catch(e){$('#status').textContent='De 3D-weergave heeft een fout. Bekijk de browserconsole.';console.error(e);view?.dispose();view=null;}
 hazardPanel.frame(elapsed);
 animation=requestAnimationFrame(frame);
}
document.querySelector('#reverseGear')!.addEventListener('click',()=>{
 keyboard.clear();
 simulator.setInput(keyboard.snapshot());
 const gear=simulator.state.gear==='R'?'D':'R';
 if(!simulator.setGear(gear)){
  document.querySelector('#status')!.textContent='Rem tot stilstand om van rijrichting te wisselen.';
  return;
 }
 document.querySelector('#status')!.textContent=gear==='R'?'R · Achteruit. Geef gas met W of ↑.':'D · Vooruit. Geef gas met W of ↑.';
 renderUI();
});
function ensureDrivingView():boolean{
 if(view)return true;
 try{
  view=new DrivingView(document.querySelector<HTMLCanvasElement>('#drive')!);
  return true;
 }catch(error){
  document.querySelector('#status')!.textContent='WebGL kon niet starten. Controleer grafische ondersteuning.';
  console.error(error);
  return false;
 }
}
document.querySelector('#exteriorView')!.addEventListener('click',()=>{
 if(!ensureDrivingView())return;
 exterior=!exterior;
 const button=document.querySelector('#exteriorView')!;
 button.setAttribute('aria-pressed',String(exterior));
 button.textContent=exterior?'Terug naar bestuurdersbeeld':'Buitenbeeld achter de auto';
});
function showEvents(){if(simulator.state.scenario){scenarioPanel.render(simulator.state);return;}const events=assess.report();$('#events').textContent=events.length?events.map(e=>`${e.time.toFixed(1)} s · ${e.message}`).join(' | '):'Geen automatische observaties.';}
$('#start').addEventListener('click',()=>{if(!ensureDrivingView())return;simulator.start();if(simulator.state.mission)document.querySelector('.screen')!.scrollIntoView({block:'center'});$('#start').setAttribute('disabled','');$('#stop').removeAttribute('disabled');$('#status').textContent='Missie gestart. Kijk vooruit en houd rechts.';});
$('#stop').addEventListener('click',()=>{simulator.stop();keyboard.clear();$('#start').removeAttribute('disabled');$('#stop').setAttribute('disabled','');showEvents();$('#status').textContent='Missie gestopt. Bekijk je oefenobservaties.';});
$('#reset').addEventListener('click',()=>{simulator.reset();missionPanel.reset();keyboard.clear();assess.reset();lastReportSecond=-1;$('#start').removeAttribute('disabled');$('#stop').setAttribute('disabled','');$('#events').textContent='Nog geen observaties.';$('#status').textContent='Opnieuw klaar. Start de missie.';renderUI();});
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLButtonElement&&['hazardOpen','theoryOpen','progressOpen','reverseGear','exteriorView'].includes(e.target.id)&&(e.key===' '||e.key==='Enter')){keyboard.clear();return;}if(theoryPanel.openNow||hazardPanel.openNow||progressPanel.openNow){keyboard.clear();return;}const target=e.target;if(target instanceof HTMLInputElement||target instanceof HTMLSelectElement||target instanceof HTMLTextAreaElement||(target instanceof HTMLElement&&target.isContentEditable)){keyboard.clear();return;}if(e.key.toLowerCase() in KEY_MAP){e.preventDefault();if(!$<HTMLDialogElement>('#dialog').open&&!theoryPanel.openNow)keyboard.key(e.key,true);}});
window.addEventListener('keyup',e=>{if(e.target instanceof HTMLButtonElement&&['hazardOpen','theoryOpen','progressOpen','reverseGear','exteriorView'].includes(e.target.id)&&(e.key===' '||e.key==='Enter')){keyboard.clear();return;}if(theoryPanel.openNow||hazardPanel.openNow||progressPanel.openNow){keyboard.clear();return;}if(e.key.toLowerCase() in KEY_MAP){e.preventDefault();keyboard.key(e.key,false);}});
window.addEventListener('blur',()=>keyboard.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)keyboard.clear();});
$('#question').addEventListener('click',()=>{keyboard.clear();simulator.setInput(keyboard.snapshot());const d=$<HTMLDialogElement>('#dialog');$('#questionText').textContent=demoQuestion.text;$('#feedback').textContent='';const answers=$('#answers');answers.replaceChildren();demoQuestion.answers.forEach((answer,i)=>{const b=document.createElement('button');b.textContent=answer;b.addEventListener('click',()=>{$('#feedback').textContent=(i===demoQuestion.correctIndex?'Goed voor deze demo. ':'Probeer opnieuw. ')+demoQuestion.explanation;});answers.append(b);});d.showModal();});
$('#close').addEventListener('click',()=>$<HTMLDialogElement>('#dialog').close());
// GPU renderer is initialized by an explicit start click. A non-WebGL device can still read instructions.
renderUI();animation=requestAnimationFrame(frame);void animation;
