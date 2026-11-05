import {integrateVehicle} from './physics';
import type {WorldState} from './state';
export interface StopAssessment {canStop:boolean|null;distance:number;speed:number;stoppingDistance:number;stopTime:number;reason:string}
export function assessStopping(state:WorldState,gateZ:number):StopAssessment {
 const first=state.vehicle,front=(v:typeof first)=>v.z-1.58*Math.cos(v.heading),distance=front(first)-gateZ;
 let v={...first},time=0;
 if(v.speed<0||Math.abs(v.heading)>.35)return {canStop:null,distance,speed:v.speed,stoppingDistance:0,stopTime:0,reason:'Richting of achteruitbeweging valt buiten de betrouwbare stopbeoordeling.'};
 while(v.speed>0&&time<10){v=integrateVehicle(v,{...state.input,throttle:false,brake:true},1/60,state.gear);time+=1/60;}
 const stoppingDistance=Math.max(0,front(first)-front(v));
 const rearRisk=state.actors.some(a=>a.kind==='auto'&&Math.abs(a.x-first.x)<1.6&&a.z>first.z&&a.z+Math.cos(a.heading)*-a.speed*time<first.z);
 if(rearRisk||Math.abs(v.x-first.x)>1.6)return {canStop:null,distance,speed:first.speed,stoppingDistance,stopTime:time,reason:'Het model kan veilig stoppen met achteropkomend verkeer of deze stuurbeweging niet betrouwbaar vaststellen.'};
 return {canStop:distance>=stoppingDistance,distance,speed:first.speed,stoppingDistance,stopTime:time,reason:'Berekend met de actuele pose, snelheid, stuurinput en hetzelfde voertuig-/remmodel als de rit; geen wettelijke meter- of secondengrens.'};
}
