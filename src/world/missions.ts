import * as THREE from 'three';
import {ROUTES} from '../missions/route';
import {buildStreet} from './streets';
export function buildMissionRoad(id:number):THREE.Group {
 const group=new THREE.Group();const box=(x:number,z:number,w:number,d:number,color:string,y=.1)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.025,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);group.add(m);};
 if(id===3||id===4)group.add(buildStreet(ROUTES[id]));
 if(id===2){box(5.2,20,3.2,8,'#464e56',.07);box(25,5.2,12,3.2,'#464e56',.07);for(const z of [3.65,6.75])box(25,z,12,.08,'white');for(const x of [21,26,30])box(x,5.2,.08,3.2,'white');}
 ROUTES[id].points.forEach((p,i)=>{const color=p.reverse?'#7fe2a0':p.stop?'#f4cf55':'#63c8ff';for(const x of [-1,1])box(p.x+x,p.z,.1,1.2,color,.13);if(p.stop){box(p.x,p.z-1.9,2.5,.12,color,.13);box(p.x,p.z+1.9,2.5,.12,color,.13);}else{const cone=new THREE.Mesh(new THREE.ConeGeometry(.18,.6,8),new THREE.MeshLambertMaterial({color}));cone.position.set(p.x+1,.3,p.z);cone.name='route-'+i;group.add(cone);}});
 return group;
}
