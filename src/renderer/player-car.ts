import * as THREE from 'three';

export function makePlayerCar(reverse:THREE.Material,brake:THREE.Material):THREE.Group {
 const car=new THREE.Group();
 const paint=new THREE.MeshPhongMaterial({color:'#21588b',specular:'#c8d7e3',shininess:85});
 const trim=new THREE.MeshLambertMaterial({color:'#202730'});
 const glass=new THREE.MeshPhongMaterial({color:'#294454',specular:'#d3edfc',shininess:110,side:THREE.DoubleSide});
 const metal=new THREE.MeshPhongMaterial({color:'#aebbc7',shininess:65});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  car.add(mesh);
  return mesh;
 };
 const outline=new THREE.Shape();
 outline.moveTo(-.68,-1.88);
 outline.quadraticCurveTo(-.85,-1.84,-.85,-1.56);
 outline.lineTo(-.89,1.52);
 outline.quadraticCurveTo(-.89,1.8,-.65,1.86);
 outline.lineTo(.65,1.86);
 outline.quadraticCurveTo(.89,1.8,.89,1.52);
 outline.lineTo(.85,-1.56);
 outline.quadraticCurveTo(.85,-1.84,.68,-1.88);
 outline.closePath();
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(outline,{depth:.56,bevelSize:.065,bevelThickness:.06,bevelSegments:3,steps:1}),paint);
 body.rotation.x=-Math.PI/2;
 body.position.y=.36;
 car.add(body);

 const panel=(points:number[][],material:THREE.Material)=>{
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
  geometry.setIndex([0,1,2,0,2,3]);
  geometry.computeVertexNormals();
  car.add(new THREE.Mesh(geometry,material));
 };
 paint.side=THREE.DoubleSide;
 panel([[-.59,1.48,-.53],[.59,1.48,-.53],[.59,1.48,.84],[-.59,1.48,.84]],paint);
 panel([[-.72,.96,1.63],[.72,.96,1.63],[.59,1.48,.84],[-.59,1.48,.84]],glass);
 panel([[.73,.96,-1.17],[-.73,.96,-1.17],[-.59,1.48,-.53],[.59,1.48,-.53]],glass);
 const tyre=new THREE.MeshLambertMaterial({color:'#16191d'});
 for(const side of [-1,1]){
  panel([[side*.73,.96,-1.17],[side*.72,.96,1.63],[side*.59,1.48,.84],[side*.59,1.48,-.53]],glass);
  for(const z of [-.37,.55]){
   const pillar=box(.035,.53,.075,side*.66,1.21,z,paint);
   pillar.rotation.z=side*.25;
   box(.025,.035,.13,side*.942,.88,z+.22,metal);
  }
  box(.23,.11,.19,side*.85,1.06,-.89,trim);
  for(const z of [-1.22,1.22]){
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.23,28),tyre);
   wheel.rotation.z=Math.PI/2;
   wheel.position.set(side*.91,.34,z);
   car.add(wheel);
   const rim=new THREE.Mesh(new THREE.CylinderGeometry(.235,.235,.025,20),metal);
   rim.rotation.z=Math.PI/2;
   rim.position.set(side*1.033,.34,z);
   car.add(rim);
  }
  box(.38,.16,.052,side*.6,.78,1.922,trim);
  box(.21,.087,.025,side*.656,.805,1.957,brake);
  box(.105,.07,.025,side*.497,.755,1.957,reverse);
 }
 box(1.48,.13,.085,0,.43,1.91,trim);
 box(.39,.10,.03,0,.62,1.937,new THREE.MeshBasicMaterial({color:'#edbd2b'}));
 box(.23,.035,.038,0,1.44,.881,brake);
 return car;
}
