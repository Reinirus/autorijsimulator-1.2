import {COURSES,type Difficulty} from './advanced-course';
import {advancedInitial,advanceAdvanced} from './advanced-runtime';
import {initialState,type WorldState} from '../core/state';
import {scenarioState,advanceScenario} from '../scenarios/runtime';
import type {ScenarioId,TrafficEvidence} from '../scenarios/model';
import {definitionFor,toLocal,toWorld,createEncounter,hazardRevealZ} from './encounters';
import {signalFrame,type SignalPlan} from '../traffic/signals';
export type RoutePoint={x:number;z:number;radius:number;instruction:string;stop?:boolean;reverse?:boolean;heading?:number};
export type Encounter={id:string;scenario:ScenarioId;z:number;x?:number;heading?:number;actorKind?:'auto'|'fietser';signals?:SignalPlan;signalPedestrian?:boolean;signalWithYield?:boolean;hazardSeed?:number};
export type EncounterRecord={id:string;scenario:ScenarioId|'rotonde'|'buitenweg';actorKind:string;startedAt:number;finishedAt:number|null;instruction:string};
export type MissionRoute={id:number;points:RoutePoint[];encounters:Encounter[]};
export type RouteRuntime={id:number;index:number;completed:boolean;distance:number;maxKmh:number;steered:boolean;braked:boolean;reversed:number;dwell:number;events:TrafficEvidence[];encounters:EncounterRecord[];encounterIndex:number;encounterStart:number;encounterId:string;lastEventCount:number;overspeed:boolean;finishClock:number|null};
const p=(x:number,z:number,instruction:string,stop=false,heading?:number,reverse=false):RoutePoint=>({x,z,radius:stop?1:2,instruction,stop,heading,reverse});
export const PARKING_BAY={minX:21,maxX:26,minZ:3.65,maxZ:6.75};
export function parkedInside(v:WorldState['vehicle']):boolean {const dx=1.58*Math.abs(Math.sin(v.heading))+.8*Math.abs(Math.cos(v.heading)),dz=1.58*Math.abs(Math.cos(v.heading))+.8*Math.abs(Math.sin(v.heading));return v.x-dx>=PARKING_BAY.minX&&v.x+dx<=PARKING_BAY.maxX&&v.z-dz>=PARKING_BAY.minZ&&v.z+dz<=PARKING_BAY.maxZ;}
export const ROUTES:Record<number,MissionRoute>={
 1:{id:1,encounters:[],points:[{...p(2.4,14,'Stuur rustig naar de eerste blauwe poort.'),radius:.6},{...p(.8,6,'Stuur terug naar de tweede poort.'),radius:.6},p(1.55,-5,'Rem en stop volledig in het groene eindvak.',true)]},
 2:{id:2,encounters:[{id:'m2-wegrijden',scenario:'wegrijden',z:0}],points:[p(1.6,9,'Voeg rustig in en rijd naar het kruispunt.'),p(1.6,5,'Geef rechts richting aan. Sla rechtsaf.'),p(4,1.7,'Volg de bocht naar rechts.'),p(12,1.55,'Rijd rechts op de weg.'),p(20,3.6,'Geef rechts richting aan en rijd het parkeervak in.'),p(27,5.2,'Stop in het gele voorvak; kies daarna R.',true),p(23.5,5.2,'Rijd langzaam achteruit het groene parkeervak in en stop.',true,Math.PI/2,true)]},
 3:streetRoute(3,[{id:'m3-rechts-fiets-01',scenario:'rechts',z:0,actorKind:'fietser'},{id:'m3-zebra-02',scenario:'zebra',z:-70},{id:'m3-rechts-auto-03',scenario:'rechts',z:-140,actorKind:'auto'}]),
 4:streetRoute(4,[{id:'m4-b6-auto-01',scenario:'haaientanden',z:0,actorKind:'auto'},{id:'m4-rechts-fiets-02',scenario:'rechts',z:-70,actorKind:'fietser'},{id:'m4-b6-fiets-03',scenario:'haaientanden',z:-140,actorKind:'fietser'},{id:'m4-rechts-auto-04',scenario:'rechts',z:-210,actorKind:'auto'}]),
 5:streetRoute(5,[{id:'m5-licht-auto-01',scenario:'lichten',z:0,signals:{offset:0,red:12,green:15,yellow:3}},{id:'m5-licht-voetganger-02',scenario:'lichten',z:-70,signals:{offset:0,red:12,green:15,yellow:3},signalPedestrian:true},{id:'m5-licht-b6-03',scenario:'lichten',z:-140,signals:{offset:-8,red:12,green:15,yellow:3},signalWithYield:true}]),
 6:{id:6,encounters:[{id:'m6-fiets-rechts-01',scenario:'rechts',z:0,actorKind:'fietser'},{id:'m6-rechtsaf-fiets-02',scenario:'fietser',z:-70},{id:'m6-zebra-03',scenario:'zebra',x:70,z:-70,heading:Math.PI/2},{id:'m6-onverwacht-04',scenario:'zebra',x:140,z:-70,heading:Math.PI/2,hazardSeed:603}],points:[p(1.55,17,'Laat de fietser van rechts voor.'),p(1.55,-15,'Rijd verder naar de volgende kruising.'),p(1.55,-53,'Nader langzaam. Er rijdt een fietser naast of achter je.'),p(1.55,-63,'Geef rechts richting aan en laat de rechtdoorgaande fietser passeren.'),p(4,-68.3,'Stuur rustig rechtsaf.'),p(12,-68.45,'Volg de nieuwe weg rechtdoor.'),p(53,-68.45,'Nader de zebra en laat de voetganger oversteken.'),p(85,-68.45,'Rijd pas verder als de oversteek vrij is.'),p(113,-68.45,'Beperkt zicht bij de bestelbus: nader langzaam en wees klaar om te remmen.'),p(155,-68.45,'Controleer of het conflict voorbij is en rijd rustig door.'),p(172,-68.45,'Rem en stop in het eindvak.',true,Math.PI/2)]}
};
for(const id of [7,8] as const)ROUTES[id]={id,encounters:[],points:COURSES[id].path};
export function encounterCount(id:number):number{return id===7||id===8?COURSES[id].zones.length:ROUTES[id].encounters.length;}
export function encounterInstruction(e:Encounter):string {return definitionFor(e).instruction;}
function streetRoute(id:number,encounters:Encounter[]):MissionRoute{return {id,encounters,points:[...encounters.flatMap((e,i)=>[p(1.55,e.z+17,`Nader verkeersmoment ${i+1}. ${encounterInstruction(e)}`,false,0),p(1.55,e.z-15,'Rijd rechtdoor zodra je veilig kunt passeren.',false,0)]),p(1.55,encounters.at(-1)!.z-32,'Rem en stop volledig in het gemarkeerde eindvak.',true,0)]};}
export function routeState(id:number,difficulty:Difficulty='rustig'):WorldState {
 if(!ROUTES[id])throw new Error('Deze missie is nog in ontwikkeling');
 const advanced:Partial<WorldState>=id===7||id===8?advancedInitial(id,difficulty):{};
 const base=id===2?scenarioState('wegrijden'):initialState();
 return {...base,...advanced,actors:id===2?base.actors:advanced.actors??[],light:'groen',gear:'D',mission:{id,index:0,completed:false,distance:0,maxKmh:0,steered:false,braked:false,reversed:0,dwell:0,events:[],encounters:[],encounterIndex:0,encounterStart:0,encounterId:id===2?'m2-wegrijden':'',lastEventCount:0,overspeed:false,finishClock:null}};
}
export function advanceRoute(before:WorldState,next:WorldState,dt:number):WorldState {
 const old=before.mission!,m:RouteRuntime={...old,events:[...old.events],encounters:old.encounters.map(e=>({...e}))};next={...next,mission:m};const route=ROUTES[m.id];
 if(m.completed)return {...next,running:false,vehicle:{...next.vehicle,speed:0}};
 if(m.id===7||m.id===8)next=advanceAdvanced(before,next,dt);
 else {const encounter=route.encounters[m.encounterIndex];
 if(encounter?.signals)next.light=signalFrame(next.clock,encounter.signals).ego;
 if(encounter&&!next.scenario&&toLocal(next,encounter).vehicle.z<(encounter.scenario==='fietser'?14:40)){const fresh=createEncounter(encounter);next={...next,scenario:fresh.scenario,actors:toWorld(fresh,encounter).actors};m.encounterId=encounter.id;m.encounterStart=before.clock;m.lastEventCount=0;}
 if(encounter&&next.scenario&&!m.encounters.some(e=>e.id===encounter.id)){const def=definitionFor(encounter);m.encounters.push({id:encounter.id,scenario:encounter.scenario,actorKind:next.actors[0]?.kind??def.actor.kind,startedAt:before.clock,finishedAt:null,instruction:encounterInstruction(encounter)});m.events.push({time:before.clock,scenarioId:def.id,encounterId:encounter.id,code:encounter.id+':BEGIN',category:'waarneming',ruleIds:def.rules,message:'Verkeersmoment gestart: '+def.title,facts:[`wereld z=${next.vehicle.z.toFixed(2)} m`,`verkeer ${next.actors[0]?.kind??''}`],alternative:encounterInstruction(encounter)});}
 if(next.scenario&&encounter){const localBefore=toLocal({...before,scenario:before.scenario??next.scenario},encounter),localNext=toLocal(next,encounter);localBefore.clock=Math.max(0,before.clock-m.encounterStart);localNext.clock=next.clock-m.encounterStart;
  if(encounter.hazardSeed!==undefined){localNext.scenario={...localNext.scenario!,hazardTriggered:localBefore.scenario!.hazardTriggered||localNext.vehicle.z<=hazardRevealZ(encounter.hazardSeed)};}
  const evaluated=advanceScenario(localBefore,localNext,dt,{definition:definitionFor(encounter),signals:encounter.signals?signalFrame(next.clock,encounter.signals):undefined});const world=toWorld(evaluated,encounter);next={...world,clock:next.clock,mission:m};
  for(const e of evaluated.scenario!.events.slice(m.lastEventCount))m.events.push({...e,encounterId:m.encounterId,code:m.encounterId+':'+e.code,time:e.time+m.encounterStart,facts:[...e.facts,`wereld x=${world.vehicle.x.toFixed(2)} m, z=${world.vehicle.z.toFixed(2)} m`,`encounter ${m.encounterId}`]});m.lastEventCount=evaluated.scenario!.events.length;
  if(evaluated.scenario!.phase==='afgerond'){m.encounters.find(e=>e.id===m.encounterId)!.finishedAt=next.clock;m.encounterIndex++;m.encounterId='';next={...next,scenario:undefined,actors:[]};}
 }
 }
 const v=next.vehicle,speed=Math.abs(v.speed);m.distance+=Math.hypot(v.x-before.vehicle.x,v.z-before.vehicle.z);m.maxKmh=Math.max(m.maxKmh,speed*3.6);m.steered||=Math.abs(v.heading)>.035;m.braked||=next.input.brake&&Math.abs(before.vehicle.speed)>.5;if(v.speed<0)m.reversed+=speed*dt;
 const over=speed*3.6>(m.id===8?60:30)+1e-6;if(m.id<7&&over&&!m.overspeed)m.events.push({time:next.clock,scenarioId:'wegrijden',code:'SPEED:'+next.clock.toFixed(3),category:'advies',ruleIds:[],message:'Snelheid boven het oefendoel van 30 km/u.',facts:[`snelheid ${(speed*3.6).toFixed(1)} km/u`],alternative:'Verminder snelheid. Dit is oefenfeedback; geen nieuwe juridische norm.'});m.overspeed=over;
 const goal=route.points[m.index];const aligned=goal.heading===undefined||Math.abs(Math.atan2(Math.sin(v.heading-goal.heading),Math.cos(v.heading-goal.heading)))<.35;
 const at=Math.hypot(v.x-goal.x,v.z-goal.z)<goal.radius&&aligned&&(!goal.reverse||(m.reversed>=2&&parkedInside(v)));
 m.dwell=at&&speed<.12?m.dwell+dt:0;
 if(at&&(!goal.stop||m.dwell>=.6)&&(!goal.stop||m.braked)&&(!goal.stop||m.id!==1||(m.steered&&m.maxKmh>=1.8))&&(m.index<route.points.length-1||m.encounterIndex===encounterCount(m.id))){
  if(m.id===2&&(m.index===1||m.index===4)&&next.indicator!=='rechts')m.events.push({time:next.clock,scenarioId:'wegrijden',code:`m2-turn-${m.index}`,category:'advies',ruleIds:['TURN_SIGNAL'],message:'Oefenfeedback: bij dit afslag-/parkeermeetpunt stond rechts richting niet aan.',facts:[`routepunt ${m.index+1}`,`richting ${next.indicator??'uit'}`],alternative:'Geef vóór een rechtse richtingsverandering tijdig rechts richting aan. De nieuwe routedetectie vraagt nog menselijke review.'});
  m.index++;m.dwell=0;if(m.index===route.points.length){m.completed=true;m.finishClock=next.clock;next={...next,running:false,vehicle:{...v,speed:0},input:{throttle:false,brake:false,left:false,right:false}};}
 }
 return next;
}
