import type {MissionRoute} from './route';
export type RoadRectangle={minX:number;maxX:number;minZ:number;maxZ:number};
export function streetSegments(route:MissionRoute):RoadRectangle[]{if(route.id===6)return [{minX:-3.6,maxX:3.6,minZ:-110,maxZ:45},{minX:-26,maxX:197,minZ:-73.6,maxZ:-66.4},{minX:-26,maxX:26,minZ:-3.6,maxZ:3.6},{minX:122,maxX:130,minZ:-66.4,maxZ:-63.2}];return [{minX:-3.6,maxX:3.6,minZ:route.points.at(-1)!.z-25,maxZ:45},...route.encounters.filter(e=>e.scenario!=='zebra').map(e=>({minX:-26,maxX:26,minZ:e.z-3.6,maxZ:e.z+3.6}))];}
export function onStreet(route:MissionRoute,x:number,z:number):boolean{return streetSegments(route).some(r=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ);}
