import type {InputState,VehicleState} from './state';
export const VEHICLE={acceleration:2.6,braking:6,drag:0.55,maxSpeed:18,steerRate:1.7,maxSteer:0.52,wheelBase:2.5} as const;
export function integrateVehicle(v:VehicleState,input:InputState,dt:number,gear:'D'|'R'='D'):VehicleState {
 if(!(dt>0 && dt<=0.1)) throw new Error('Ongeldige fysicastap');
 const target=(Number(input.right)-Number(input.left))*VEHICLE.maxSteer;
 const delta=Math.max(-VEHICLE.steerRate*dt,Math.min(VEHICLE.steerRate*dt,target-v.steering));
 const steering=v.steering+delta;
 const direction=gear==='R'?-1:1;
 const magnitude=Math.abs(v.speed);
 const braking=input.brake||v.speed*direction<0;
 const force=(input.throttle&&!braking?VEHICLE.acceleration:0)-(braking?VEHICLE.braking:0)-(magnitude>0?VEHICLE.drag:0);
 const speed=(v.speed*direction<0?Math.sign(v.speed):direction)*Math.max(0,Math.min(gear==='R'?3:VEHICLE.maxSpeed,magnitude+force*dt))||0;
 const mid=(v.speed+speed)/2;
 const heading=v.heading + (mid/VEHICLE.wheelBase)*Math.tan(steering)*dt;
 return {x:v.x+Math.sin(heading)*mid*dt,z:v.z-Math.cos(heading)*mid*dt,heading,speed,steering};
}
