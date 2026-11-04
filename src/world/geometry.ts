import * as THREE from 'three';
export function buildWorld(scene:THREE.Scene):void{
 scene.background=new THREE.Color('#9fd0f0');scene.fog=new THREE.Fog('#9fd0f0',70,150);
 const material=(hex:string)=>new THREE.MeshLambertMaterial({color:hex});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),material('#779b64'));ground.rotation.x=-Math.PI/2;ground.position.y=-.03;scene.add(ground);
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:string){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 box(0,.02,-15,8,.05,120,'#464e56');box(0,.02,0,70,.05,8,'#464e56');
 for(let z=-70;z<45;z+=6){box(0,.055,z,.10,.01,2.5,'#e6ded1');}
 for(let x=-30;x<30;x+=6){box(x,.055,0,2.5,.01,.10,'#e6ded1');}
 for(let z=-65;z<50;z+=13){for(const x of [-11,11]){if(Math.abs(z)<8)continue;box(x,2,z,6,4,6,['#cc977a','#e7ba84','#b1b8a4'][Math.abs(z)%3]);const roof=box(x,4.4,z,7,0.9,7,'#ad5044');roof.rotation.z=x<0?-.16:.16;box(x,1.7,z+(x<0?0:0),.15,1.8,1.8,'#3a6583');}}
 // A1 / zone 30 teaching sign, deliberately not a generic statutory street speed.
 const signCanvas=document.createElement('canvas');signCanvas.width=256;signCanvas.height=256;const ctx=signCanvas.getContext('2d');if(ctx){ctx.fillStyle='#fff';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#d81f31';ctx.lineWidth=24;ctx.beginPath();ctx.arc(128,128,92,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#111';ctx.font='bold 100px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('30',128,135);}
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),side:THREE.DoubleSide}));sign.name='speed-sign';sign.position.set(4.6,2.9,18);scene.add(sign);box(4.6,1.2,18,.09,2.4,.09,'#9ca2a8').name='speed-sign';
 for(const x of [-10,10])for(let z=-68;z<55;z+=19){const trunk=box(x,1,z,.45,2,.45,'#725037');const crown=new THREE.Mesh(new THREE.ConeGeometry(2,5,7),material('#2f7446'));crown.position.set(trunk.position.x,5,z);scene.add(crown);}
 const lightPost=box(3.9,2.6,3.5,.12,5.2,.12,'#45494c');lightPost.name='traffic-fixture';
 box(3.9,5.25,3.5,.7,1.7,.4,'#22282b').name='traffic-fixture';
}
export function makeCar(color:string):THREE.Group {const group=new THREE.Group();const m=new THREE.MeshLambertMaterial({color});const body=new THREE.Mesh(new THREE.BoxGeometry(1.6,.65,3.15),m);body.position.y=.7;group.add(body);const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.35,.55,1.5),new THREE.MeshLambertMaterial({color:'#8db7cc'}));cabin.position.set(0,1.17,.12);group.add(cabin);for(const x of [-.75,.75])for(const z of [-1.05,1.05]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.22,12),new THREE.MeshLambertMaterial({color:'#23272d'}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.42,z);group.add(wheel);}return group;}
export function makeBike():THREE.Group{const g=new THREE.Group();const m=new THREE.MeshLambertMaterial({color:'#1c3748'});for(const z of [-.65,.65]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.38,.055,8,16),m);wheel.position.set(0,.45,z);wheel.rotation.y=Math.PI/2;g.add(wheel);}const rider=new THREE.Mesh(new THREE.CapsuleGeometry(.24,.7,4,8),new THREE.MeshLambertMaterial({color:'#f1c65e'}));rider.position.y=1.6;g.add(rider);return g;}

export function makePedestrian():THREE.Group {const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.75,4,8),new THREE.MeshLambertMaterial({color:'#d8709a'}));body.position.y=.9;const head=new THREE.Mesh(new THREE.SphereGeometry(.18,12,12),new THREE.MeshLambertMaterial({color:'#e5b693'}));head.position.y=1.6;g.add(body,head);return g;}
