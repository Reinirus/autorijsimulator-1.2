import type {WorldState} from '../core/state';
import {kmh} from '../core/state';
import {RULES} from './catalog';
export type Observation={time:number;type:'advies'|'demonstratie';message:string;ruleId:string|null};
export type Scenario={maxSpeedKmh:number;maxSpeedSource:'bord-A1-zone30';roadCenterRightLane:number;lightStopZ:number};
export const DEMO_SCENARIO:Scenario={maxSpeedKmh:30,maxSpeedSource:'bord-A1-zone30',roadCenterRightLane:1.55,lightStopZ:2.5};
export function evaluate(state:WorldState,scenario:Scenario=DEMO_SCENARIO):Observation[]{
 const out:Observation[]=[]; const v=state.vehicle;
 if(kmh(v.speed)>scenario.maxSpeedKmh+0.25)out.push({time:state.clock,type:'demonstratie',message:'Sneller dan de ingestelde 30 km/u-zone. Nog geen juridische overtredingsvaststelling.',ruleId:RULES.SPEED.id});
 if(v.x<0 && v.z> -8 && v.z<25)out.push({time:state.clock,type:'advies',message:'Houd in deze oefenstraat zoveel mogelijk rechts.',ruleId:RULES.RIGHT.id});
 return out;
}
