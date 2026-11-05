import {initialState,type WorldState,type Actor} from '../core/state';
import {assessStopping} from '../core/stopping';
import type {SignalFrame} from '../traffic/signals';
import {cycleLight} from '../traffic/engine';
import {advanceScenarioActors,crossLight} from '../traffic/scenarios';
import {overlapBodies} from '../traffic/geometry';
import {BASE_FACTS,decideTraffic,type TrafficFacts} from '../rules/traffic';
import {SCENARIOS} from './catalog';
import type {ScenarioId,ScenarioDefinition,TrafficEvidence} from './model';
export const EGO_FRONT=1.58;
export function scenarioState(id:ScenarioId):WorldState {
 const def=SCENARIOS[id],base=initialState(),route=def.actor.route;
 const actor:Actor={id:def.actor.id,kind:def.actor.kind,x:route[0].x,z:route[0].z,heading:Math.atan2(route[1].x-route[0].x,-(route[1].z-route[0].z)),speed:0,desiredSpeed:def.actor.speed,route:structuredClone(route),progress:0,mode:'wachten'};
 return {...base,vehicle:{...base.vehicle,...def.spawn},actors:[actor],indicator:'uit',scenario:{id,crossLight:def.signal?crossLight(0):undefined,phase:'naderen',events:[],decision:{action:'onzeker',ruleIds:[],reason:'Start de situatie.'},startedActors:false,crossed:false,contacts:[]}};
}
export const frontZ=(s:WorldState)=>s.vehicle.z-EGO_FRONT*Math.cos(s.vehicle.heading);
export function scenarioFacts(state:WorldState,def:ScenarioDefinition):TrafficFacts {
 const v=state.vehicle,a=state.actors[0];let conflicting=false;
 if(a){
  if(def.movement==='wegrijden')conflicting=a.z>v.z-4&&a.z<v.z+18&&a.x<3.5;
  else if(def.movement==='rechtsaf')conflicting=a.z>v.z-4&&a.z<v.z+12&&Math.abs(a.x-v.x)<5;
  else if(def.zebra)conflicting=a.x>v.x-1.2&&a.x<5;
  else {const speed=Math.max(a.speed,a.desiredSpeed??0,.1),egoSpeed=Math.max(v.speed,2);const direction=Math.sign(Math.sin(a.heading));const remaining=(v.x-a.x)*direction;const otherTime=Math.max(0,remaining)/speed,egoTime=Math.max(0,v.z-a.z)/egoSpeed;
   const overlapWindow=2.5/speed+2.5/egoSpeed+.35;conflicting=remaining> -2.5&&otherTime<6&&Math.abs(otherTime-egoTime)<overlapWindow;
   if(a.mode==='noodrem'&&Math.hypot(a.x-v.x,a.z-v.z)<10)conflicting=true;
  }
 }
 const known=def.movement==='rechtdoor'?Math.abs(v.heading)<.4&&Math.abs(v.x)<3.8:true;
 return {...BASE_FACTS,known,signalActive:def.signal,light:state.light,yellowCanStop:state.scenario?.yellowAt?.canStop??null,movement:def.movement,conflicting,otherFromRight:def.id==='rechts',sign:def.sign,pedestrianIntent:def.zebra&&conflicting,pedestrianLight:state.scenario?.pedestrianLight??'geen',sameRoadCyclist:def.id==='fietser'};
}
export function advanceScenario(previous:WorldState,next:WorldState,dt:number,environment:{definition?:ScenarioDefinition;signals?:SignalFrame}={}):WorldState {
 const old=previous.scenario!;const def=environment.definition??SCENARIOS[old.id];const runtime={...old,hazardTriggered:next.scenario?.hazardTriggered??old.hazardTriggered,events:[...old.events],contacts:[...old.contacts]};if(environment.definition)runtime.description={title:def.title,instruction:def.instruction,objective:def.objective,rules:def.rules};next={...next,scenario:runtime,light:environment.signals?.ego??cycleLight(next.clock)};
 runtime.startedActors=old.startedActors||runtime.hazardTriggered===true||next.vehicle.z<19||def.id==='wegrijden'||def.id==='fietser'||def.id==='lichten';
 runtime.crossLight=def.signal?(environment.signals?.cross??crossLight(next.clock)):undefined;runtime.pedestrianLight=environment.signals?.pedestrian;
 next.actors=advanceScenarioActors(next,def,dt);
 if(def.signal&&next.light==='oranje'&&(previous.light!=='oranje'||!old.yellowAt)){
  runtime.yellowAt=assessStopping(next,def.gateZ);
 }
 const facts=scenarioFacts(next,def),decision=decideTraffic(facts);runtime.decision=decision;
 const emit=(event:Omit<TrafficEvidence,'time'|'scenarioId'>)=>{if(!runtime.events.some(e=>e.code===event.code))runtime.events.push({...event,time:next.clock,scenarioId:def.id});};
 if(environment.signals&&next.light!==previous.light)emit({code:'LIGHT_'+next.light+'_'+next.clock.toFixed(3),category:'waarneming',ruleIds:['RED'],message:'Verkeerslichtfase: '+next.light+'.',facts:[`lokale stopstreep z=${def.gateZ.toFixed(2)} m`],alternative:next.light==='groen'?'Rijd alleen door als de weg vrij is.':next.light==='rood'?'Stop vóór de bestemde stopstreep.':'Stop, tenzij dat redelijkerwijs niet meer mogelijk is; beoordeel de actuele situatie.'});
 if(runtime.yellowAt&&def.signal&&next.light==='oranje'&&(previous.light!=='oranje'||!old.yellowAt))emit({code:'YELLOW_MODEL_'+next.clock.toFixed(3),category:'waarneming',ruleIds:['RED'],message:'Stopmogelijkheid bij geel onderzocht met het actuele voertuigmodel.',facts:[`snelheid ${runtime.yellowAt.speed.toFixed(2)} m/s`,`afstand stopstreep ${runtime.yellowAt.distance.toFixed(2)} m`,`berekende remweg ${runtime.yellowAt.stoppingDistance?.toFixed(2)??'onbekend'} m`,`berekende stoptijd ${runtime.yellowAt.stopTime?.toFixed(2)??'onbekend'} s`,`modelconclusie ${runtime.yellowAt.canStop===null?'onzeker':runtime.yellowAt.canStop?'stoppen mogelijk':'stoppen vóór de lijn niet mogelijk'}`],alternative:runtime.yellowAt.reason??'Stop bij geel, tenzij dat redelijkerwijs niet meer mogelijk is. Dit is geen wettelijke getalsgrens.'});
 if(runtime.hazardTriggered&&!old.hazardTriggered)emit({code:'HAZARD_NOTICE',category:'waarneming',ruleIds:[],message:'Veiligheidssituatie geactiveerd: voetganger achter de bestelbus.',facts:[`voertuig z=${next.vehicle.z.toFixed(2)} m`,`snelheid ${(next.vehicle.speed*3.6).toFixed(1)} km/u`],alternative:'Verminder snelheid en houd ruimte om op een onverwachte beweging te reageren. Dit is een veiligheidsoefening.'});
 if(runtime.hazardTriggered&&next.input.brake)emit({code:'HAZARD_BRAKE',category:'waarneming',ruleIds:[],message:'Na het ontstaan van het conflict is rembediening geregistreerd.',facts:[`snelheid ${(next.vehicle.speed*3.6).toFixed(1)} km/u`],alternative:'Kijk vooruit en houd de oversteek vrij; deze remactie bewijst geen spiegel- of dodehoekcontrole.'});
 const evidence=()=>[`voertuig x=${next.vehicle.x.toFixed(2)} m, z=${next.vehicle.z.toFixed(2)} m`,`snelheid ${(next.vehicle.speed*3.6).toFixed(1)} km/u`,def.signal?`licht ${next.light}`:'geen verkeerslicht in deze situatie',`verwacht padconflict ${facts.conflicting?'ja':'nee'}`,`NPC ${next.actors[0]?.mode??'onbekend'}`];
 const entersGate=frontZ(previous)>def.gateZ&&frontZ(next)<=def.gateZ&&Math.abs(next.vehicle.x)<3.8;
 const leftEdge=(state:WorldState)=>state.vehicle.x-.8*Math.abs(Math.cos(state.vehicle.heading))-EGO_FRONT*Math.abs(Math.sin(state.vehicle.heading));
 const leavesBay=def.id==='wegrijden'&&leftEdge(previous)>=4&&leftEdge(next)<4;
 const crossesBike=def.id==='fietser'&&previous.vehicle.x<=2.35&&next.vehicle.x>2.35&&Math.abs(next.vehicle.z)<7;
 const relevant=def.id==='wegrijden'?leavesBay:def.id==='fietser'?crossesBike:entersGate;
 if(relevant){runtime.crossed=true;
  if(def.signal&&def.zebra&&next.light==='groen'&&next.actors.some(a=>Math.abs(a.x)<4))emit({code:'BLOCKED_GREEN',category:'advies',ruleIds:[],message:'De oversteek was nog bezet bij groen.',facts:evidence(),alternative:'Groen maakt een bezette oversteek niet veilig. Wacht tot de weg vrij is; dit is veiligheidsfeedback, geen automatische schuldvaststelling.'});
  if(decision.action==='stop'||decision.action==='voorrang'){
   const yellow=def.signal&&next.light==='oranje';emit({code:'GIVE_WAY',category:yellow?'advies':'regel',ruleIds:decision.ruleIds,message:yellow?'Volgens het remmodel was stoppen bij geel mogelijk.':'Je passeerde het beoordelingspunt terwijl stoppen of voor laten gaan nodig was in dit scenario.',facts:evidence(),alternative:decision.reason+' Verminder eerder snelheid en wacht buiten het conflictgebied.'});
  }else if(decision.action==='onzeker')emit({code:'UNSUPPORTED',category:'advies',ruleIds:[],message:'Geen betrouwbare automatische regelbeoordeling van deze passage.',facts:evidence(),alternative:'Blijf op de aangegeven route en bespreek deze passage met de docent.'});
  else emit({code:'CLEAR_PASSAGE',category:'waarneming',ruleIds:def.rules,message:runtime.hazardTriggered!==undefined?'Veiligheidspassage geregistreerd; geen juridische beoordeling.':'Bij het meetpunt was geen stop- of voorrangsafwijking vastgesteld.',facts:evidence(),alternative:'Blijf ook na de passage het verkeer volgen.'});
 }
 if(next.actors.some(a=>a.mode==='noodrem')&&previous.actors.some(a=>a.mode!=='noodrem'))emit({code:'NPC_BRAKE',category:'advies',ruleIds:[],message:'De andere verkeersdeelnemer remde voor een voorspeld fysiek conflict.',facts:evidence(),alternative:'Controleer het volledige verkeersbeeld en voorkom dat anderen moeten uitwijken of remmen. Dit is geen automatische schuldvaststelling.'});
 if((def.id==='rechts'||def.id==='haaientanden')&&old.crossed&&decision.action==='voorrang'&&next.actors.some(a=>a.mode==='noodrem')&&Math.abs(next.vehicle.z)<5)emit({code:'GIVE_WAY',category:'regel',ruleIds:decision.ruleIds,message:'Tijdens de passage moest het voorrangsgerechtigde verkeer afremmen bij een padconflict.',facts:evidence(),alternative:decision.reason+' Wacht vóór het conflictgebied.'});
 const turning=def.id==='fietser'&&previous.vehicle.heading<=.2&&next.vehicle.heading>.2&&Math.abs(next.vehicle.z)<12;
 const departing=def.id==='wegrijden'&&!old.crossed&&previous.vehicle.speed<=.1&&next.vehicle.speed>.1;
 if((turning&&next.indicator!=='rechts')||(departing&&next.indicator!=='links'))emit({code:'INDICATOR',category:'regel',ruleIds:[turning?'TURN_SIGNAL':'INDICATOR'],message:'De verwachte richtingaanwijzer stond niet aan bij deze beweging.',facts:[...evidence(),`richtingaanwijzer ${next.indicator??'uit'}`],alternative:turning?'Geef vóór rechts afslaan rechts richting aan.':'Geef vóór wegrijden naar links richting aan en laat het overige verkeer voor.'});
 if(Math.abs(next.vehicle.x)<4&&next.vehicle.z>4&&next.vehicle.speed*3.6>30+1e-6)emit({code:'SPEED',category:'regel',ruleIds:['SPEED'],message:'De snelheid was hoger dan de door bord A1 aangegeven 30 km/u.',facts:evidence(),alternative:'Verminder snelheid tot maximaal 30 km/u; pas verder aan de situatie aan.'});
 for(const actor of next.actors){if(overlapBodies(next.vehicle,actor)){
  const id=actor.id??actor.kind;if(!runtime.contacts.includes(id)){runtime.contacts.push(id);emit({code:'CONTACT_'+id,category:'advies',ruleIds:[],message:'De gemodelleerde voertuigcontouren raakten elkaar.',facts:evidence(),alternative:'Stop en bespreek het conflict. Deze geometrische melding is geen vaststelling van juridische schuld.'});}next.vehicle={...next.vehicle,speed:0};
 }}
 const goal=def.id==='fietser'?next.vehicle.x>10&&Math.abs(next.vehicle.z)<5:def.id==='wegrijden'?next.vehicle.x>.5&&next.vehicle.x<2.8&&next.vehicle.z<12&&Math.abs(next.vehicle.heading)<.4:next.vehicle.z<(def.zebra?5:-8)&&Math.abs(next.vehicle.x)<3.8;
 if(goal||old.phase==='afgerond'){runtime.phase='afgerond';emit({code:'COMPLETE',category:'waarneming',ruleIds:[],message:'De eindpositie van deze oefensituatie is bereikt.',facts:evidence(),alternative:'Bekijk de observaties; dit is geen officieel slaag-/zakresultaat.'});}
 else runtime.phase=runtime.crossed?'oversteken':(decision.action==='stop'||decision.action==='voorrang')&&next.vehicle.speed<.2?'wachten':'naderen';
 return next;
}
