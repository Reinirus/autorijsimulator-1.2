import * as THREE from 'three';
import type {ScenarioId} from '../scenarios/model';
import {SCENARIOS} from '../scenarios/catalog';
export function buildScenarioRoad(id:ScenarioId):THREE.Group {
 const def=SCENARIOS[id],group=new THREE.Group();
 const box=(x:number,z:number,w:number,d:number,color:string)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.025,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,.08,z);group.add(m);return m;};
 if(def.sign==='B6'){
  for(let x=.55;x<3.6;x+=.9){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([x-.32,.1,4.9,x+.32,.1,4.9,x,.1,5.55],3));g.computeVertexNormals();group.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'white',side:THREE.DoubleSide})));}
  const shape=new THREE.Shape();shape.moveTo(-.75,.6);shape.lineTo(.75,.6);shape.lineTo(0,-.7);shape.closePath();
  for(const [scale,color,z] of [[1,'#d51f31',6.3],[.72,'white',6.32]] as const){const sign=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));sign.scale.setScalar(scale);sign.position.set(4.6,2.6,z);group.add(sign);}
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.6),new THREE.MeshLambertMaterial({color:'#90999e'}));pole.position.set(4.6,1.3,6.25);group.add(pole);
 }
 if(def.signal){box(2,def.gateZ,3.7,.2,'white');box(-4.5,2,.2,3.7,'white');
 const post=new THREE.Mesh(new THREE.BoxGeometry(.12,5.2,.12),new THREE.MeshLambertMaterial({color:'#45494c'}));post.position.set(-4.7,2.6,4.5);group.add(post);
 const housing=new THREE.Mesh(new THREE.BoxGeometry(.4,1.7,.7),new THREE.MeshLambertMaterial({color:'#22282b'}));housing.position.set(-4.7,5.25,4.5);group.add(housing);
 for(const [name,y] of [['rood',5.74],['oranje',5.25],['groen',4.75]] as const){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.21,12,12),new THREE.MeshBasicMaterial({color:'#33383b'}));lamp.name='cross-lamp-'+name;lamp.position.set(-4.94,y,4.5);group.add(lamp);}
 }
 if(def.zebra)for(let x=-3.5;x<4;x+=1)box(x,10,.5,2,'white');
 if(id==='wegrijden'){box(5.2,20,3.2,8,'#464e56').position.y=.04;box(6.75,20,.08,8,'white');box(5.2,24,3.2,.08,'white');box(5.2,16,3.2,.08,'white');}
 return group;
}
export function disposeGroup(group:THREE.Group){group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});group.removeFromParent();}
