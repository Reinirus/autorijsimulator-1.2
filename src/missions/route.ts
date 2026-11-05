import {initialState,type WorldState} from '../core/state';
import {scenarioState,advanceScenario} from '../scenarios/runtime';
import type {ScenarioId,TrafficEvidence} from '../scenarios/model';
export type RoutePoint={x:number;z:number;radius:number;instruction:string;stop?:boolean;reverse?:boolean;heading?:number};
export type Encounter={id:string;scenario:ScenarioId;z:number};
export type MissionRoute={id:number;points:RoutePoint[];encounters:Encounter[]};
export type RouteRuntime={id:number;index:number;completed:boolean;distance:number;maxKmh:number;steered:boolean;braked:boolean;reversed:number;dwell:number;events:TrafficEvidence[];encounterIndex:number;encounterStart:number;encounterId:string;lastEventCount:number;overspeed:boolean;finishClock:number|null};
const p=(x:number,z:number,instruction:string,stop=false,heading?:number,reverse=false):RoutePoint=>({x,z,radius:stop?1:2,instruction,stop,heading,reverse});
export const PARKING_BAY={minX:21,maxX:26,minZ:3.65,maxZ:6.75};
export function parkedInside(v:WorldState['vehicle']):boolean {const dx=1.58*Math.abs(Math.sin(v.heading))+.8*Math.abs(Math.cos(v.heading)),dz=1.58*Math.abs(Math.cos(v.heading))+.8*Math.abs(Math.sin(v.heading));return v.x-dx>=PARKING_BAY.minX&&v.x+dx<=PARKING_BAY.maxX&&v.z-dz>=PARKING_BAY.minZ&&v.z+dz<=PARKING_BAY.maxZ;}
export const ROUTES:Record<number,MissionRoute>={
 1:{id:1,encounters:[],points:[{...p(2.4,14,'Stuur rustig naar de eerste blauwe poort.'),radius:.6},{...p(.8,6,'Stuur terug naar de tweede poort.'),radius:.6},p(1.55,-5,'Rem en stop volledig in het groene eindvak.',true)]},
 2:{id:2,encounters:[{id:'m2-wegrijden',scenario:'wegrijden',z:0}],points:[p(1.6,9,'Voeg rustig in en rijd naar het kruispunt.'),p(1.6,5,'Geef rechts richting aan. Sla rechtsaf.'),p(4,1.7,'Volg de bocht naar rechts.'),p(12,1.55,'Rijd rechts op de weg.'),p(20,3.6,'Geef rechts richting aan en rijd het parkeervak in.'),p(27,5.2,'Stop in het gele voorvak; kies daarna R.',true),p(23.5,5.2,'Rijd langzaam achteruit het groene parkeervak in en stop.',true,Math.PI/2,true)]}
};
export function routeState(id:number):WorldState {
 if(!ROUTES[id])throw new Error('Deze missie is nog in ontwikkeling');
 const base=id===2?scenarioState('wegrijden'):initialState();
 return {...base,actors:id===2?base.actors:[],light:'groen',gear:'D',mission:{id,index:0,completed:false,distance:0,maxKmh:0,steered:false,braked:false,reversed:0,dwell:0,events:[],encounterIndex:0,encounterStart:0,encounterId:id===2?'m2-wegrijden':'',lastEventCount:0,overspeed:false,finishClock:null}};
}
function translate(s:WorldState,z:number):WorldState{return {...s,vehicle:{...s.vehicle,z:s.vehicle.z-z},actors:s.actors.map(a=>({...a,z:a.z-z,route:a.route?.map(p=>({...p,z:p.z-z}))}))};}
export function advanceRoute(before:WorldState,next:WorldState,dt:number):WorldState {
 const old=before.mission!,m:RouteRuntime={...old,events:[...old.events]};next={...next,mission:m};const route=ROUTES[m.id];
 if(m.completed)return {...next,running:false,vehicle:{...next.vehicle,speed:0}};
 const encounter=route.encounters[m.encounterIndex];
 if(encounter&&!next.scenario&&next.vehicle.z<encounter.z+40){const fresh=scenarioState(encounter.scenario);next={...next,scenario:fresh.scenario,actors:translate(fresh,-encounter.z).actors};m.encounterId=encounter.id;m.encounterStart=before.clock;m.lastEventCount=0;}
 if(next.scenario&&encounter){const localBefore=translate({...before,scenario:before.scenario??next.scenario},encounter.z),localNext=translate(next,encounter.z);localBefore.clock=Math.max(0,before.clock-m.encounterStart);localNext.clock=next.clock-m.encounterStart;const evaluated=advanceScenario(localBefore,localNext,dt);const world=translate(evaluated,-encounter.z);next={...world,clock:next.clock,mission:m};
  for(const e of evaluated.scenario!.events.slice(m.lastEventCount))m.events.push({...e,code:m.encounterId+':'+e.code,time:e.time+m.encounterStart});m.lastEventCount=evaluated.scenario!.events.length;
  if(evaluated.scenario!.phase==='afgerond'){m.encounterIndex++;m.encounterId='';next={...next,scenario:undefined,actors:[]};}
 }
 const v=next.vehicle,speed=Math.abs(v.speed);m.distance+=Math.hypot(v.x-before.vehicle.x,v.z-before.vehicle.z);m.maxKmh=Math.max(m.maxKmh,speed*3.6);m.steered||=Math.abs(v.heading)>.035;m.braked||=next.input.brake&&Math.abs(before.vehicle.speed)>.5;if(v.speed<0)m.reversed+=speed*dt;
 const over=speed*3.6>30+1e-6;if(over&&!m.overspeed)m.events.push({time:next.clock,scenarioId:'wegrijden',code:'SPEED:'+next.clock.toFixed(3),category:'advies',ruleIds:[],message:'Snelheid boven het oefendoel van 30 km/u.',facts:[`snelheid ${(speed*3.6).toFixed(1)} km/u`],alternative:'Verminder snelheid. Dit is oefenfeedback; geen nieuwe juridische norm.'});m.overspeed=over;
 const goal=route.points[m.index];const aligned=goal.heading===undefined||Math.abs(Math.atan2(Math.sin(v.heading-goal.heading),Math.cos(v.heading-goal.heading)))<.35;
 const at=Math.hypot(v.x-goal.x,v.z-goal.z)<goal.radius&&aligned&&(!goal.reverse||(m.reversed>=2&&parkedInside(v)));
 m.dwell=at&&speed<.12?m.dwell+dt:0;
 if(at&&(!goal.stop||m.dwell>=.6)&&(!goal.stop||m.braked)&&(!goal.stop||m.id!==1||(m.steered&&m.maxKmh>=1.8))){
  if(m.id===2&&(m.index===1||m.index===4)&&next.indicator!=='rechts')m.events.push({time:next.clock,scenarioId:'wegrijden',code:`m2-turn-${m.index}`,category:'advies',ruleIds:['TURN_SIGNAL'],message:'Oefenfeedback: bij dit afslag-/parkeermeetpunt stond rechts richting niet aan.',facts:[`routepunt ${m.index+1}`,`richting ${next.indicator??'uit'}`],alternative:'Geef vóór een rechtse richtingsverandering tijdig rechts richting aan. De nieuwe routedetectie vraagt nog menselijke review.'});
  m.index++;m.dwell=0;if(m.index===route.points.length){m.completed=true;m.finishClock=next.clock;next={...next,running:false,vehicle:{...v,speed:0},input:{throttle:false,brake:false,left:false,right:false}};}
 }
 return next;
}
