import type {Actor,WorldState} from '../core/state';
import type {ScenarioDefinition} from '../scenarios/model';
import {nextRoutePoint,overlapBodies} from './geometry';
// These are simulator parameters, not legal numeric headway/stopping criteria.
export const crossLight=(time:number):'rood'|'oranje'|'groen'=>{const p=time%21;return p>=1&&p<6?'groen':p>=6&&p<8?'oranje':'rood';};
export const NPC_MODEL={acceleration:2,braking:5,predictionSeconds:1};
export function advanceScenarioActors(state:WorldState,def:ScenarioDefinition,dt:number):Actor[]{
 return state.actors.map(a=>{
  const v=state.vehicle,started=state.scenario!.startedActors;let desired=started?(a.desiredSpeed??def.actor.speed):0;let reason:'rijden'|'wachten'|'noodrem'='rijden';
  const finished=a.route&&Math.hypot(a.x-a.route.at(-1)!.x,a.z-a.route.at(-1)!.z)<.01;if(finished)desired=0;
  if(def.zebra&&a.x>=4.5){const stopped=v.speed<.15&&v.z<19&&v.z>12.4;const allowed=def.signal?state.scenario!.pedestrianLight==='groen':stopped;if(!allowed){desired=0;reason='wachten';}}
  if(state.scenario!.hazardTriggered!==undefined&&!state.scenario!.hazardTriggered){desired=0;reason='wachten';}
  if(def.signal&&a.x< -6){const light=state.scenario!.crossLight??crossLight(state.clock);const crossRed=light==='rood';const crossYellow=light==='oranje';const gap=-6.1-a.x;const canStop=a.speed*a.speed/(2*NPC_MODEL.braking)<=gap;
   if(crossRed||(crossYellow&&canStop)){desired=Math.min(desired,Math.sqrt(2*NPC_MODEL.braking*Math.max(0,gap)));if(gap<.08)desired=0;reason='wachten';}}
  const futureEgo={...v,x:v.x+Math.sin(v.heading)*v.speed*NPC_MODEL.predictionSeconds,z:v.z-Math.cos(v.heading)*v.speed*NPC_MODEL.predictionSeconds};
  const future=nextRoutePoint(a,a.speed*NPC_MODEL.predictionSeconds);
  if(overlapBodies(future,futureEgo)||overlapBodies(a,v)){desired=0;reason='noodrem';}
  const change=desired>a.speed?NPC_MODEL.acceleration*dt:-NPC_MODEL.braking*dt;const speed=Math.max(0,desired>a.speed?Math.min(desired,a.speed+change):Math.max(desired,a.speed+change));
  const moved=nextRoutePoint({...a,speed,mode:reason},(a.speed+speed)*dt/2);
  return moved;
 });
}
