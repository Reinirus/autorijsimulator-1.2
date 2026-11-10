import * as THREE from 'three';
import {buildWorld,makeCar,makeBike,makePedestrian} from '../world/geometry';
import {disposeGroup} from '../world/scenarios';
import {sampleMotion,type Hazard} from './catalog';

/** Dedicated visual lesson; never mutates the paused driving simulation. */
export class HazardView{
 private renderer:THREE.WebGLRenderer;private scene=new THREE.Scene();private camera=new THREE.PerspectiveCamera(63,1,.1,160);
 private world=new THREE.Group();private actors=new Map<string,THREE.Group>();private fixtures=new THREE.Group();private lamps:THREE.Mesh[]=[];
 private hazard!:Hazard;
 constructor(private canvas:HTMLCanvasElement){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
  buildWorld(this.scene);for(const item of [...this.scene.children])this.world.add(item);this.scene.add(this.world,this.fixtures);
  this.world.traverse(o=>{if(o.name==='traffic-fixture')o.visible=false;});
  this.scene.add(new THREE.HemisphereLight('#ffffff','#52663e',2.4));const sun=new THREE.DirectionalLight('#fff6e8',2);sun.position.set(5,18,20);this.scene.add(sun);
 }
 private box(x:number,y:number,z:number,w:number,h:number,d:number,color:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);this.fixtures.add(m);return m;}
 load(h:Hazard){
  this.hazard=h;disposeGroup(this.fixtures);this.fixtures=new THREE.Group();this.scene.add(this.fixtures);this.actors.clear();this.lamps=[];
  if(h.zebra)for(let x=-3.5;x<4;x++)this.box(x,.11,10,.5,.025,2,'#ffffff');
  if(h.id==='GHV-08')this.box(6,.06,-8,1.8,.05,70,'#a55748');
  if(h.parked){const car=makeCar('#416f9d');car.position.set(4.2,0,10);this.fixtures.add(car);}
  if(h.works)for(let z=-3;z<13;z+=2){const cone=new THREE.Mesh(new THREE.ConeGeometry(.25,.8,8),new THREE.MeshLambertMaterial({color:'#ff8c25'}));cone.position.set(4.8,.45,z);this.fixtures.add(cone);}
  if(h.ball){const ball=new THREE.Mesh(new THREE.SphereGeometry(.25,14,10),new THREE.MeshLambertMaterial({color:'#ffec45'}));ball.name='ball';this.fixtures.add(ball);}
  for(const m of h.motions){const actor=m.kind==='auto'?makeCar(m.color??'#cf6143'):m.kind==='fietser'?makeBike():makePedestrian();if(m.bus)actor.scale.set(1.4,1.7,2);this.actors.set(m.id,actor);this.fixtures.add(actor);if(h.braking&&m.id==='lead')for(const x of [-.55,.55]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.3,.18,.05),new THREE.MeshBasicMaterial({color:'#5f1515'}));lamp.position.set(x,.8,1.6);actor.add(lamp);this.lamps.push(lamp);}}
 }
 render(time:number,seed:number){
  const h=this.hazard;if(!h)return;
  for(const m of h.motions){const a=sampleMotion(m,time,seed),mesh=this.actors.get(m.id)!;mesh.position.set(a.x,0,a.z);mesh.rotation.y=-a.heading;}
  for(const lamp of this.lamps)(lamp.material as THREE.MeshBasicMaterial).color.set(time>1?'#ff2525':'#5f1515');
  const ball=this.fixtures.getObjectByName('ball');if(ball)ball.position.set(-5+Math.min(7,time*1.5),.3,11);
  this.camera.position.set(1.55,1.65,28-Math.min(time,6)*1.5);this.camera.lookAt(1.55,1.2,-4);
  const width=Math.max(1,this.canvas.clientWidth),height=Math.max(1,this.canvas.clientHeight);if(this.canvas.width!==Math.round(width*this.renderer.getPixelRatio())||this.canvas.height!==Math.round(height*this.renderer.getPixelRatio()))this.renderer.setSize(width,height,false);
  this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);
  this.canvas.dataset.clock=time.toFixed(3);this.canvas.dataset.actors=JSON.stringify(h.motions.map(m=>{const a=sampleMotion(m,time,seed);return [m.id,a.x,a.z];}));
 }
 dispose(){disposeGroup(this.world);disposeGroup(this.fixtures);this.renderer.dispose();this.renderer.forceContextLoss();}
}
