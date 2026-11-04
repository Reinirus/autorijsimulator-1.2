import * as THREE from 'three';
export type Mirror='links'|'rechts'|'binnen';
// Vehicle forward is local -Z. Each mirror looks toward local +Z, yawed toward its side.
export const MIRROR_YAW:Record<Mirror,number>={links:Math.PI-0.35,rechts:Math.PI+0.35,binnen:Math.PI};
export function mirrorDirection(name:Mirror):THREE.Vector3 {return new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),MIRROR_YAW[name]);}
export function makeMirrors():Record<Mirror,THREE.PerspectiveCamera>{
 const result={} as Record<Mirror,THREE.PerspectiveCamera>;
 for(const name of ['links','rechts','binnen'] as Mirror[]){const c=new THREE.PerspectiveCamera(name==='binnen'?42:55,1.65,.15,130);c.rotation.order='YXZ';result[name]=c;}
 return result;
}
export function updateMirrorCameras(cameras:Record<Mirror,THREE.PerspectiveCamera>,car:{x:number;z:number;heading:number}):void{
 for(const name of ['links','rechts','binnen'] as Mirror[]){const c=cameras[name];const side=name==='links'?-0.78:name==='rechts'?0.78:0;
 c.position.set(car.x+Math.cos(car.heading)*side,1.45,car.z+Math.sin(car.heading)*side);
 c.rotation.set(0,-car.heading+MIRROR_YAW[name],0);
 c.updateMatrixWorld();}
}
