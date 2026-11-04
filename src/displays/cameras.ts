import {PerspectiveCamera} from 'three';
import type {VehicleState} from '../core/state';
import {yawOffset,type Side,type Calibration} from './config';
export function configureCamera(camera:PerspectiveCamera,v:VehicleState,side:Side,c:Calibration,aspect:number){
 camera.position.set(v.x+.35*Math.sin(v.heading),1.55,v.z-.35*Math.cos(v.heading));
 camera.rotation.order='YXZ';camera.rotation.set(-.03+c.horizon*Math.PI/180,-v.heading+yawOffset(side,c),0);
 camera.fov=c.fov;camera.aspect=aspect;camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
