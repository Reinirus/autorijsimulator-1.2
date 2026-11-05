import type {MissionRoute} from './route';
export type RoadRectangle={minX:number;maxX:number;minZ:number;maxZ:number};
export function streetSegments(route:MissionRoute):RoadRectangle[]{return [{minX:-3.6,maxX:3.6,minZ:route.points.at(-1)!.z-25,maxZ:45},...route.encounters.filter(e=>e.scenario!=='zebra').map(e=>({minX:-26,maxX:26,minZ:e.z-3.6,maxZ:e.z+3.6}))];}
export function onStreet(route:MissionRoute,x:number,z:number):boolean{return streetSegments(route).some(r=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ);}
