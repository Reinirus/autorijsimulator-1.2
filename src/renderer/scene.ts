import {buildScenarioRoad,disposeGroup} from '../world/scenarios';
import {SCENARIOS} from '../scenarios/catalog';
import {copyMirrorPixels} from '../displays/pixels';
import * as THREE from 'three';
import {buildWorld,makeCar,makeBike,makePedestrian} from '../world/geometry';
import {makeMirrors,updateMirrorCameras} from '../displays/mirrors';
import {DEFAULT_CALIBRATION,panels,type Calibration,type Side} from '../displays/config';
import {configureCamera} from '../displays/cameras';
import type {WorldState} from '../core/state';
export class DrivingView{
 readonly renderer:THREE.WebGLRenderer;private scene:THREE.Scene;private camera:THREE.PerspectiveCamera;
 private sideCameras={links:new THREE.PerspectiveCamera(72,1,.08,180),rechts:new THREE.PerspectiveCamera(72,1,.08,180)};
 private mirrorBuffers:Partial<Record<'links'|'rechts'|'binnen',{pixels:Uint8Array;image:ImageData}>>={};
 private mirrors=makeMirrors();private targets:Record<'links'|'rechts'|'binnen',THREE.WebGLRenderTarget>;
 private actorPool=new Map<string,THREE.Group>();private scenarioRoad:THREE.Group|null=null;private scenarioId='';private red!:THREE.Mesh;private yellow!:THREE.Mesh;private green!:THREE.Mesh;
 constructor(canvas:HTMLCanvasElement){
 this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 this.scene=new THREE.Scene();buildWorld(this.scene);
 this.scene.add(new THREE.HemisphereLight('#f4f7ff','#52663e',2.0));const sun=new THREE.DirectionalLight('#fff6e8',2.5);sun.position.set(8,18,20);this.scene.add(sun);
 this.camera=new THREE.PerspectiveCamera(72,1,.08,180);
 this.targets={links:new THREE.WebGLRenderTarget(320,190),rechts:new THREE.WebGLRenderTarget(320,190),binnen:new THREE.WebGLRenderTarget(320,190)};
 for(const [n,c] of [['rood','#fb2939'],['oranje','#fcb02e'],['groen','#36e16b']] as const){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.21,12,12),new THREE.MeshBasicMaterial({color:c}));mesh.position.set(3.9,n==='rood'?5.74:n==='oranje'?5.25:4.75,3.8);this.scene.add(mesh);if(n==='rood')this.red=mesh;else if(n==='oranje')this.yellow=mesh;else this.green=mesh;}

 }
 render(s:WorldState,mirrorElements:Record<'links'|'rechts'|'binnen',HTMLCanvasElement>|null,options:{mode?:'single'|'span';side?:Side;calibration?:Calibration}={}):void {
 const {vehicle:v}=s;const config=options.calibration??DEFAULT_CALIBRATION;
 this.renderer.setPixelRatio(Math.min(devicePixelRatio,config.pixelRatio));
 this.camera.position.set(v.x+.35*Math.sin(v.heading),1.55,v.z-.35*Math.cos(v.heading));this.camera.rotation.order='YXZ';this.camera.rotation.set(-.03,-v.heading,0);
 updateMirrorCameras(this.mirrors,v);
 const id=s.scenario?.id??'';if(id!==this.scenarioId){if(this.scenarioRoad)disposeGroup(this.scenarioRoad);this.scenarioRoad=id?buildScenarioRoad(s.scenario!.id):null;if(this.scenarioRoad)this.scene.add(this.scenarioRoad);this.scenarioId=id;}
 const showLight=!s.scenario||SCENARIOS[s.scenario.id].signal;this.scene.traverse(o=>{if(o.name==='traffic-fixture')o.visible=showLight;if(o.name==='speed-sign')o.position.z=s.scenario?30:18;if(o.name.startsWith('cross-lamp-')&&o instanceof THREE.Mesh){const name=o.name.slice(11);(o.material as THREE.MeshBasicMaterial).color.set(name===s.scenario?.crossLight?(name==='rood'?'#fb2939':name==='oranje'?'#fcb02e':'#36e16b'):'#33383b');}});this.red.visible=showLight;this.yellow.visible=showLight;this.green.visible=showLight;
 for(const mesh of this.actorPool.values())mesh.visible=false;
 s.actors.forEach((a,i)=>{const key=a.kind+':'+(a.id??i);let mesh=this.actorPool.get(key);if(!mesh){mesh=a.kind==='auto'?makeCar('#cf6143'):a.kind==='fietser'?makeBike():makePedestrian();this.actorPool.set(key,mesh);this.scene.add(mesh);}mesh.visible=true;mesh.position.set(a.x,0,a.z);mesh.rotation.y=-a.heading;});
 for(const [name,mesh] of [['rood',this.red],['oranje',this.yellow],['groen',this.green]] as const){(mesh.material as THREE.MeshBasicMaterial).color.set(name===s.light?(name==='rood'?'#fb2939':name==='oranje'?'#fcb02e':'#36e16b'):'#33383b');}
 if(mirrorElements)for(const name of ['links','rechts','binnen'] as const){const target=this.targets[name];this.renderer.setRenderTarget(target);this.renderer.render(this.scene,this.mirrors[name]);
 // MVP GPU readback. X-flip approximates a real mirror; it is not optically calibrated.
 const ctx=mirrorElements[name].getContext('2d');if(ctx){const w=target.width,h=target.height;const buffer=this.mirrorBuffers[name]??={pixels:new Uint8Array(w*h*4),image:ctx.createImageData(w,h)};this.renderer.readRenderTargetPixels(target,0,0,w,h,buffer.pixels);copyMirrorPixels(buffer.pixels,buffer.image.data,w,h);ctx.putImageData(buffer.image,0,0);}
 }
 this.renderer.setRenderTarget(null);const width=this.renderer.domElement.clientWidth,height=this.renderer.domElement.clientHeight;
 if(width&&height){const ratio=Math.min(devicePixelRatio,config.pixelRatio);const w=Math.floor(width*ratio),h=Math.floor(height*ratio);if(this.renderer.domElement.width!==w||this.renderer.domElement.height!==h)this.renderer.setSize(width,height,false);
 this.renderer.setScissorTest(false);this.renderer.setViewport(0,0,width,height);this.renderer.clear();
 const views=options.mode==='span'?panels(width,config):[{side:options.side??'midden',x:0,width}];
 for(const panel of views){const camera=panel.side==='midden'?this.camera:this.sideCameras[panel.side];const gap=options.mode==='span'?Math.min(config.bezel,panel.width/4):0;const pw=Math.max(1,panel.width-gap);
 configureCamera(camera,v,panel.side,config,pw/height);this.renderer.setViewport(panel.x+gap/2,0,pw,height);this.renderer.setScissor(panel.x+gap/2,0,pw,height);this.renderer.setScissorTest(true);this.renderer.render(this.scene,camera);}
 this.renderer.setScissorTest(false);this.renderer.setViewport(0,0,width,height);
 }
 }
 dispose(){this.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];for(const m of materials){if('map' in m)(m.map as THREE.Texture|null)?.dispose();m.dispose();}}});for(const t of Object.values(this.targets))t.dispose();this.renderer.dispose();}
}
