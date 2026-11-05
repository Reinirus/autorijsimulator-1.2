import * as THREE from 'three';
import type {MissionRoute} from '../missions/route';
import {buildScenarioRoad} from './scenarios';
import {streetSegments} from '../missions/roads';
// Own procedural assets; all positions use the canonical world coordinates.
export function buildStreet(route:MissionRoute):THREE.Group {
 const group=new THREE.Group(),start=45,end=route.points.at(-1)!.z-25,length=start-end;
 const box=(x:number,z:number,w:number,d:number,color:string,y=.06)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,.035,d),new THREE.MeshLambertMaterial({color}));mesh.position.set(x,y,z);group.add(mesh);};
 box(0,(start+end)/2,100,length+100,'#80a46e',-.04);for(const r of streetSegments(route))box((r.minX+r.maxX)/2,(r.minZ+r.maxZ)/2,r.maxX-r.minX,r.maxZ-r.minZ,'#48515a');
 // Sidewalks have real gaps at intersections; no grass seam across the road.
 const junctions=route.encounters.filter(e=>e.scenario!=='zebra');let top=start;for(const encounter of junctions){const z=encounter.z;for(const x of [-4.5,4.5])box(x,(top+z+3.6)/2,1.6,top-z-3.6,'#abb0ac');for(const side of [-1,1])for(const edge of [-4.5,4.5])box(side*16,z+edge,20,1.6,'#abb0ac');top=z-3.6;}
 for(const encounter of route.encounters){const fixtures=buildScenarioRoad(encounter.scenario);fixtures.position.z=encounter.z;fixtures.name='encounter-road-'+encounter.id;group.add(fixtures);}
 for(const x of [-4.5,4.5])box(x,(top+end)/2,1.6,top-end,'#abb0ac');
 for(let z=start-2;z>end;z-=6){if(!route.encounters.some(e=>Math.abs(z-e.z-(e.scenario==='zebra'?10:0))<(e.scenario==='zebra'?3:5)))box(0,z,.1,2.5,'#ece8da',.09);}
 for(const encounter of junctions)for(let x=-24;x<25;x+=6)if(Math.abs(x)>5)box(x,encounter.z,2.5,.1,'#ece8da',.09);
 // Instanced houses and roofs keep long residential routes inexpensive to draw.
 const sites:{x:number;z:number}[]=[];for(let z=32;z>end;z-=12)if(!route.encounters.some(e=>Math.abs(z-e.z)<9))for(const x of [-10,10])sites.push({x,z});
 const walls=new THREE.InstancedMesh(new THREE.BoxGeometry(5,3.6,6),new THREE.MeshLambertMaterial({color:'white'}),sites.length);
 const roofs=new THREE.InstancedMesh(new THREE.ConeGeometry(4.3,1.8,4),new THREE.MeshLambertMaterial({color:'#9b4938'}),sites.length);
 const windows=new THREE.InstancedMesh(new THREE.BoxGeometry(.08,1.2,2.8),new THREE.MeshLambertMaterial({color:'#356780'}),sites.length);
 const matrix=new THREE.Matrix4();sites.forEach((s,i)=>{walls.setMatrixAt(i,matrix.makeTranslation(s.x,1.8,s.z));walls.setColorAt(i,new THREE.Color(['#bb8066','#d3b68c','#b6b7a2'][i%3]));matrix.makeRotationY(Math.PI/4);matrix.setPosition(s.x,4.5,s.z);roofs.setMatrixAt(i,matrix);windows.setMatrixAt(i,matrix.makeTranslation(s.x-Math.sign(s.x)*2.53,2,s.z));});group.add(walls,roofs,windows);
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#d22232';ctx.lineWidth=11;ctx.beginPath();ctx.arc(64,64,49,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#161616';ctx.font='bold 53px Arial';ctx.textAlign='center';ctx.fillText('30',64,83);const signMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide});
 for(const z of [30,...route.encounters.slice(0,-1).map(e=>e.z-10)]){const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.15),signMaterial);sign.position.set(4.5,2.6,z);group.add(sign);box(4.5,z,.08,.08,'#a2a8a8',1.3);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,2.6,6),new THREE.MeshLambertMaterial({color:'#9ca3a6'}));pole.position.set(4.5,1.3,z);group.add(pole);}
 return group;
}
