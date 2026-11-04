import type {InputState,VehicleState} from './state';
export const VEHICLE={acceleration:2.6,braking:6,drag:0.55,maxSpeed:18,steerRate:1.7,maxSteer:0.52,wheelBase:2.5} as const;
export function integrateVehicle(v:VehicleState,input:InputState,dt:number):VehicleState {
 if(!(dt>0 && dt<=0.1)) throw new Error('Ongeldige fysicastap');
 const target=(Number(input.right)-Number(input.left))*VEHICLE.maxSteer;
 const delta=Math.max(-VEHICLE.steerRate*dt,Math.min(VEHICLE.steerRate*dt,target-v.steering));
 const steering=v.steering+delta;
 const force=(input.throttle?VEHICLE.acceleration:0)-(input.brake?VEHICLE.braking:0)-(v.speed>0?VEHICLE.drag:0);
 const speed=Math.max(0,Math.min(VEHICLE.maxSpeed,v.speed+force*dt));
 const mid=(v.speed+speed)/2;
 const heading=v.heading + (mid/VEHICLE.wheelBase)*Math.tan(steering)*dt;
 return {x:v.x+Math.sin(heading)*mid*dt,z:v.z-Math.cos(heading)*mid*dt,heading,speed,steering};
}
