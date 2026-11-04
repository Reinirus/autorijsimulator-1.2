import type {WorldState} from '../core/state';
import type {Calibration} from './config';
export interface Snapshot {type:'snapshot';epoch:string;seq:number;sentAt:number;state:WorldState;calibration:Calibration}
export const SYNC_DELAY=100;
export const STALE_AFTER=1500;
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const angle=(a:number,b:number,t:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export function interpolate(a:WorldState,b:WorldState,t:number):WorldState {
 const pose=(x:WorldState['vehicle'],y:WorldState['vehicle'])=>({...y,x:lerp(x.x,y.x,t),z:lerp(x.z,y.z,t),heading:angle(x.heading,y.heading,t),speed:lerp(x.speed,y.speed,t),steering:lerp(x.steering,y.steering,t)});
 return {...a,clock:lerp(a.clock,b.clock,t),vehicle:pose(a.vehicle,b.vehicle),actors:a.actors.map((x,i)=>{const y=b.actors[i]??x;return {...x,x:lerp(x.x,y.x,t),z:lerp(x.z,y.z,t),heading:angle(x.heading,y.heading,t)};})};
}
export class SnapshotBuffer {
 private packets:Snapshot[]=[];latest:Snapshot|null=null;
 accept(p:Snapshot):boolean {
  if(p.type!=='snapshot'||!Number.isFinite(p.sentAt)||!Number.isFinite(p.seq)||!p.state||!p.calibration)return false;
  const last=this.latest;
  if(last&&(p.sentAt<last.sentAt||(p.epoch===last.epoch&&p.seq<=last.seq)))return false;
  if(last&&(p.epoch!==last.epoch||p.state.clock<last.state.clock))this.packets=[];
  this.latest=p;this.packets.push(p);if(this.packets.length>12)this.packets.shift();return true;
 }
 age(now:number){return this.latest?Math.max(0,now-this.latest.sentAt):Infinity;}
 stale(now:number){return this.age(now)>STALE_AFTER;}
 sample(now:number):WorldState|null {
  if(!this.latest)return null;
  const at=now-SYNC_DELAY;
  let a=this.packets[0];for(const b of this.packets){if(b.sentAt>=at){const t=b.sentAt===a.sentAt?0:Math.max(0,Math.min(1,(at-a.sentAt)/(b.sentAt-a.sentAt)));return interpolate(a.state,b.state,t);}a=b;}
  return this.latest.state; // Freeze at newest snapshot; never run side-window physics or extrapolate.
 }
}
