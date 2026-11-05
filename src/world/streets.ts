import * as THREE from 'three';
import type {MissionRoute} from '../missions/route';
import {buildScenarioRoad} from './scenarios';
import {definitionFor,worldPoint} from '../missions/encounters';
import {addSignalHeads} from './signals';
import {streetSegments} from '../missions/roads';
// Own procedural assets; all positions use the canonical world coordinates.
export function buildStreet(route:MissionRoute):THREE.Group {
 if(route.id===6)return buildBentStreet(route);
 const group=new THREE.Group(),start=45,end=route.id===6?-110:route.points.at(-1)!.z-25,length=start-end;
 const box=(x:number,z:number,w:number,d:number,color:string,y=.06)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,.035,d),new THREE.MeshLambertMaterial({color}));mesh.position.set(x,y,z);group.add(mesh);};
 box(0,(start+end)/2,100,length+100,'#80a46e',-.04);for(const r of streetSegments(route))box((r.minX+r.maxX)/2,(r.minZ+r.maxZ)/2,r.maxX-r.minX,r.maxZ-r.minZ,'#48515a');
 // Sidewalks have real gaps at intersections; no grass seam across the road.
 const junctions=route.encounters.filter(e=>!definitionFor(e).zebra&&e.hazardSeed===undefined);let top=start;for(const encounter of junctions){const z=encounter.z;for(const x of [-4.5,4.5])box(x,(top+z+3.6)/2,1.6,top-z-3.6,'#abb0ac');for(const side of [-1,1])for(const edge of [-4.5,4.5])box(side*16,z+edge,20,1.6,'#abb0ac');top=z-3.6;}
 for(const encounter of route.encounters){const def=definitionFor(encounter),fixtures=buildScenarioRoad(encounter.scenario,def,!!encounter.signals);if(encounter.signals){fixtures.traverse(o=>{if(o.name.startsWith('cross-lamp-'))o.visible=false;});addSignalHeads(fixtures,encounter.signals,def.gateZ,!!encounter.signalPedestrian);}fixtures.position.set(encounter.x??0,0,encounter.z);fixtures.rotation.y=-(encounter.heading??0);fixtures.name='encounter-road-'+encounter.id;group.add(fixtures);}
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

function buildBentStreet(route:MissionRoute):THREE.Group {
 const group=new THREE.Group();
 const box=(x:number,z:number,w:number,d:number,color:string,y=.06,height=.03)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,height,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);group.add(m);return m;};
 box(70,-35,280,200,'#80a46e',-.04);for(const r of streetSegments(route))box((r.minX+r.maxX)/2,(r.minZ+r.maxZ)/2,r.maxX-r.minX,r.maxZ-r.minZ,'#48515a');
 // Pavements stop at both crossings; the east leg and north leg share asphalt.
 for(const x of [-4.5,4.5])for(const [a,b] of [[45,3.6],[-3.6,-66.4],[-73.6,-110]])box(x,(a+b)/2,1.6,a-b,'#abb0ac');
 for(const z of [-74.5,-65.5])for(const [a,b] of [[-26,-3.6],[3.6,197]])box((a+b)/2,z,b-a,1.6,'#abb0ac');
 for(let z=42;z>-110;z-=6)if(Math.abs(z)>5&&Math.abs(z+70)>5)box(0,z,.1,2.5,'#ece8da',.09);
 for(let x=-23;x<197;x+=6)if(Math.abs(x)>5&&Math.abs(x-60)>3)box(x,-70,2.5,.1,'#ece8da',.09);
 for(const e of route.encounters){const fixtures=buildScenarioRoad(e.scenario,definitionFor(e));fixtures.position.set(e.x??0,0,e.z);fixtures.rotation.y=-(e.heading??0);fixtures.name='encounter-road-'+e.id;group.add(fixtures);
  if(e.hazardSeed!==undefined){const at=worldPoint(e,{x:4.8,z:14}),van=box(at.x,at.z,5,2,'#e9e7d9',1.35,2.6);van.name='hazard-van';const bay=worldPoint(e,{x:5,z:14});box(bay.x,bay.z,7,3,'#48515a',.07);}
 }
 const houses:{x:number;z:number;h:number}[]=[];for(let z=32;z>-105;z-=12)if(Math.abs(z)>10&&Math.abs(z+70)>10)for(const x of [-10,10])houses.push({x,z,h:0});for(let x=22;x<193;x+=12)for(const z of [-81,-59])houses.push({x,z,h:Math.PI/2});
 for(const site of houses){const house=box(site.x,site.z,5,6,'#d3b68c',1.8,3.6);house.rotation.y=site.h;const roof=new THREE.Mesh(new THREE.ConeGeometry(4.3,1.8,4),new THREE.MeshLambertMaterial({color:'#9b4938'}));roof.position.set(site.x,4.5,site.z);roof.rotation.y=Math.PI/4+site.h;group.add(roof);}
 // A1: local painted texture, facing the approach on each leg.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#d22232';ctx.lineWidth=11;ctx.beginPath();ctx.arc(64,64,49,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#161616';ctx.font='bold 53px Arial';ctx.textAlign='center';ctx.fillText('30',64,83);
 for(const [x,z,h] of [[4.5,30,0],[22,-65.5,Math.PI/2]]){const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.15),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide}));sign.position.set(x,2.6,z);sign.rotation.y=-h;group.add(sign);box(x,z,.08,.08,'#9ca3a6',1.3,2.6);}
 return group;
}
