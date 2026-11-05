import * as THREE from 'three';
import {signalFrame,type SignalPlan} from '../traffic/signals';
export function addSignalHeads(group:THREE.Group,plan:SignalPlan,gate:number,pedestrian:boolean):void {
 const head=(x:number,z:number,role:'ego'|'cross'|'pedestrian',rotation=0)=>{const assembly=new THREE.Group();assembly.position.set(x,0,z);assembly.rotation.y=rotation;group.add(assembly);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,4.6,6),new THREE.MeshLambertMaterial({color:'#44494c'}));pole.position.y=2.3;assembly.add(pole);
 const housing=new THREE.Mesh(new THREE.BoxGeometry(.65,1.7,.4),new THREE.MeshLambertMaterial({color:'#20282b'}));housing.position.y=4.45;assembly.add(housing);
 for(const [color,y] of [['rood',4.95],['oranje',4.45],['groen',3.95]] as const){if(role==='pedestrian'&&color==='oranje')continue;const lamp=new THREE.Mesh(new THREE.SphereGeometry(.2,10,10),new THREE.MeshBasicMaterial({color:'#33383b'}));lamp.position.set(0,y,.23);lamp.name='route-signal';lamp.userData={plan,role,color};assembly.add(lamp);}
 };head(4.35,gate-2.5,'ego');if(pedestrian){head(-4.6,10,'pedestrian',Math.PI/2);head(4.6,10,'pedestrian',-Math.PI/2);}else head(-4.7,4.5,'cross',-Math.PI/2);
}
export function updateSignalHeads(group:THREE.Object3D,clock:number):void {group.traverse(o=>{if(o.name==='route-signal'&&o instanceof THREE.Mesh){const d=o.userData,active=signalFrame(clock,d.plan as SignalPlan)[d.role as 'ego'|'cross'|'pedestrian'];(o.material as THREE.MeshBasicMaterial).color.set(active===d.color?(d.color==='rood'?'#fb2939':d.color==='oranje'?'#fcb02e':'#36e16b'):'#33383b');}});}
