import type {MissionRoute} from '../../src/missions/route';
import type {Actor,VehicleState} from '../../src/core/state';
export type PilotTraffic={scenarioId?:string;actors:Actor[];light?:string;hazardTriggered?:boolean};
// Test driver only: read telemetry, press actual controls, never assign a pose or clock.
export function pilotInput(route:MissionRoute,index:number,encounterIndex:number,v:VehicleState,traffic:PilotTraffic){
 const g=route.points[index],e=route.encounters[encounterIndex];let desired=route.id===6?3:4;
 if(e&&traffic.scenarioId){const h=e.heading??0,c=Math.cos(h),s=Math.sin(h),local=(p:{x:number;z:number})=>{const x=p.x-(e.x??0),z=p.z-e.z;return {x:c*x+s*z,z:-s*x+c*z};},ego=local(v),a=traffic.actors[0],last=a?.route?.at(-1),clear=a&&last&&Math.hypot(a.x-last.x,a.z-last.z)<.05;
  if(e.signals){const gate=e.signalPedestrian?14:6,occupied=e.signalPedestrian&&!clear; if(ego.z>gate&&((traffic.light!=='groen')||occupied))desired=Math.min(desired,Math.sqrt(Math.max(0,ego.z-gate-3.3)*2));}
  else if(!clear)desired=Math.min(desired,Math.sqrt(Math.max(0,ego.z-16)*2));
 }
 const distance=Math.hypot(g.x-v.x,g.z-v.z),prev=route.points[index-1]??{x:1.55,z:23},dx=g.x-prev.x,dz=g.z-prev.z,len=Math.hypot(dx,dz),along=Math.max(0,Math.min(len,((v.x-prev.x)*dx+(v.z-prev.z)*dz)/len+4)),aim={x:prev.x+dx*along/len,z:prev.z+dz*along/len},aimDistance=Math.hypot(aim.x-v.x,aim.z-v.z),alpha=Math.atan2(Math.sin(Math.atan2(aim.x-v.x,-(aim.z-v.z))-v.heading),Math.cos(Math.atan2(aim.x-v.x,-(aim.z-v.z))-v.heading)),steer=Math.atan2(5*Math.sin(alpha),Math.max(1,aimDistance));
 if(route.id===6&&index>=3&&index<=5)desired=Math.min(desired,2);
 if(g.stop)desired=Math.min(desired,Math.sqrt(Math.max(0,distance-.4)*1.5));
 return {throttle:Math.abs(v.speed)<desired-.08,brake:Math.abs(v.speed)>desired+.08,left:steer<v.steering-.02,right:steer>v.steering+.02};
}
