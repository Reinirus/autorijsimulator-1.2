import type {WorldState} from '../core/state';
import {RULES} from '../rules/catalog';
import {SCENARIOS,isScenarioId} from './catalog';
import type {ScenarioId} from './model';
export class ScenarioPanel {
 private lastKey='';
 constructor(onSelect:(id:ScenarioId|'demo')=>void,onIndicator:(value:'uit'|'links'|'rechts')=>void){
  const panel=document.createElement('section');panel.className='scenario-panel';panel.innerHTML=`<h2>Verkeerssituaties · Milestone 3</h2><label>Oefensituatie <select id="scenarioSelect"><option value="demo">M1/M2 · Kennismaken (bestaande demo)</option>${Object.values(SCENARIOS).map(d=>`<option value="${d.id}">${d.title}</option>`).join('')}</select></label><p>Een andere situatie kiezen zet de rit stil en begint op 0. Je start binnen een met A1 aangegeven 30-km/u-wegvak.</p><p id="scenarioInstruction">Kies een verkeerssituatie of gebruik de bestaande demo.</p><div id="indicatorControls" hidden><span>Richtingaanwijzer: <output id="indicatorState">uit</output></span> <button id="indicatorLeft">Richting links</button><button id="indicatorOff">Richting uit</button><button id="indicatorRight">Richting rechts</button></div><p id="scenarioDecision" role="status"></p><p id="npcStatus"></p><p id="scenarioSources" class="fine">M1/M2-demo: beperkte demonstratiebeoordeling.</p><p class="fine">RVV-brontekst gecontroleerd op 4 november 2026. Menselijke juridische en didactische review staat open. Dit is een modelbeoordeling, geen officieel examenresultaat.</p>`;
  document.querySelector('.sim')!.prepend(panel);
  panel.querySelector('#scenarioSelect')!.addEventListener('change',e=>{const id=(e.target as HTMLSelectElement).value;if(id==='demo'||isScenarioId(id)){this.lastKey='';onSelect(id);}});
  for(const [id,value] of [['indicatorLeft','links'],['indicatorOff','uit'],['indicatorRight','rechts']] as const)panel.querySelector('#'+id)!.addEventListener('click',()=>onIndicator(value));
 }
 render(s:WorldState){
  const runtime=s.scenario;document.querySelector<HTMLElement>('#indicatorControls')!.hidden=!runtime&&!s.mission;
  document.querySelector('#indicatorState')!.textContent=s.indicator??'uit';
  if(!runtime){document.querySelector('#scenarioDecision')!.textContent='';document.querySelector('#npcStatus')!.textContent='';return;}
  const def=SCENARIOS[runtime.id];document.querySelector('#scenarioInstruction')!.textContent=def.instruction;
  document.querySelector('#scenarioTitle')!.textContent=def.title;
  document.querySelector('#scenarioObjectives')!.textContent=def.objective;
  document.querySelector('#ruleScope')!.textContent='Beoordeling op expliciete scenariogegevens; geen officieel slaag-/zakcriterium.';
  document.querySelector('#scenarioDecision')!.textContent=`${runtime.phase} · ${runtime.decision.action}: ${runtime.decision.reason}`;
  document.querySelector('#npcStatus')!.textContent=s.actors.map(a=>`${a.kind}: ${a.mode??'rijden'} · ${(a.speed*3.6).toFixed(1)} km/u`).join(' | ');
  document.querySelector('#scenarioSources')!.textContent=def.rules.map(id=>RULES[id].article).join(' · ');
  const key=runtime.id+':'+runtime.events.length;if(key===this.lastKey)return;this.lastKey=key;
  const events=document.querySelector('#events')!;const opened=new Set(Array.from(events.querySelectorAll<HTMLDetailsElement>('details[open]')).map(e=>e.dataset.code));events.replaceChildren();
  if(!runtime.events.length){events.textContent='Nog geen scenario-observaties.';return;}
  for(const e of runtime.events){const item=document.createElement('details');item.className='traffic-event';item.dataset.code=e.code;item.open=opened.has(e.code);const summary=document.createElement('summary');summary.textContent=`${e.time.toFixed(2)} s · ${e.category} · ${e.message}`;item.append(summary);
   for(const text of [...e.facts,'Alternatief: '+e.alternative]){const p=document.createElement('p');p.textContent=text;item.append(p);}
   for(const id of e.ruleIds){const rule=RULES[id];if(!rule)continue;const link=document.createElement('a');link.textContent=rule.article;link.href=rule.source;link.target='_blank';link.rel='noopener';item.append(link,document.createElement('br'));}events.append(item);}
 }
}
