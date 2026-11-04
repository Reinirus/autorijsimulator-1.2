import type {Actor,VehicleState} from '../core/state';
const dimensions=(a:Actor|VehicleState)=>'kind' in a?(a.kind==='auto'?[.8,1.58]:a.kind==='fietser'?[.3,.85]:[.3,.3]):[.8,1.58];
export function overlapBodies(a:Actor|VehicleState,b:Actor|VehicleState):boolean {
 const [aw,al]=dimensions(a),[bw,bl]=dimensions(b);
 const axes=(h:number)=>[{x:Math.cos(h),z:Math.sin(h)},{x:Math.sin(h),z:-Math.cos(h)}];
 const aa=axes(a.heading),bb=axes(b.heading),dx=b.x-a.x,dz=b.z-a.z;
 return [...aa,...bb].every(n=>{const r=(ax:typeof aa,w:number,l:number)=>w*Math.abs(n.x*ax[0].x+n.z*ax[0].z)+l*Math.abs(n.x*ax[1].x+n.z*ax[1].z);return Math.abs(dx*n.x+dz*n.z)<r(aa,aw,al)+r(bb,bw,bl);});
}
export function nextRoutePoint(a:Actor,distance:number):Actor {
 if(!a.route||a.route.length<2)return {...a};let progress=(a.progress??0)+distance;let index=0;
 while(index<a.route.length-1){const from=a.route[index],to=a.route[index+1],length=Math.hypot(to.x-from.x,to.z-from.z);if(progress<=length){const t=length?progress/length:1;return {...a,progress:(a.progress??0)+distance,x:from.x+(to.x-from.x)*t,z:from.z+(to.z-from.z)*t,heading:Math.atan2(to.x-from.x,-(to.z-from.z))};}progress-=length;index++;}
 const end=a.route.at(-1)!;return {...a,x:end.x,z:end.z,progress:(a.progress??0)+distance,speed:0,mode:'wachten'};
}
