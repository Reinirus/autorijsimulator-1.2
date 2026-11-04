import {describe,it,expect} from 'vitest';
import {PerspectiveCamera,Vector3} from 'three';
import {initialState} from '../../src/core/state';
import {DEFAULT_CALIBRATION,calibrate,panels} from '../../src/displays/config';
import {configureCamera} from '../../src/displays/cameras';
import {SnapshotBuffer,interpolate,type Snapshot} from '../../src/displays/sync';
const packet=(seq:number,sentAt:number,clock:number,epoch='a'):Snapshot=>({type:'snapshot',seq,sentAt,epoch,state:{...initialState(),clock,vehicle:{...initialState().vehicle,x:clock}},calibration:{...DEFAULT_CALIBRATION}});
describe('Gedeelde schermtoestand',()=>{
 it('interpoleert voertuig en klok zonder snapshots te muteren',()=>{const a=packet(1,1000,1),b=packet(2,1100,2);const buffer=new SnapshotBuffer();buffer.accept(a);buffer.accept(b);expect(buffer.sample(1150)!.vehicle.x).toBeCloseTo(1.5);expect(buffer.sample(1150)!.clock).toBeCloseTo(1.5);expect(a.state.vehicle.x).toBe(1);});
 it('extrapoleert niet bij verbindingsverlies en markeert oud beeld',()=>{const b=new SnapshotBuffer();expect(b.sample(0)).toBeNull();expect(b.stale(0)).toBe(true);b.accept(packet(1,1000,1));expect(b.sample(9999)!.clock).toBe(1);expect(b.stale(2501)).toBe(true);});
 it('weigert dubbele en achterhaalde pakketten',()=>{const b=new SnapshotBuffer();b.accept(packet(2,1100,2));expect(b.accept(packet(1,1050,1))).toBe(false);expect(b.accept(packet(2,1200,2))).toBe(false);expect(b.latest!.seq).toBe(2);});
 it('herstelt met nieuwe bronepoch en weigert vertraagde oude bron',()=>{const b=new SnapshotBuffer();b.accept(packet(10,1000,10));expect(b.accept(packet(1,2000,0,'b'))).toBe(true);expect(b.sample(2001)!.clock).toBe(0);expect(b.accept(packet(11,1500,11))).toBe(false);});
 it('reset interpoleert niet terug over de oude missie',()=>{const b=new SnapshotBuffer();b.accept(packet(1,1000,40));b.accept(packet(2,1100,0));expect(b.sample(1150)!.clock).toBe(0);});
 it('interpoleert heading via de kortste boog',()=>{const a=initialState(),b=initialState();a.vehicle.heading=Math.PI-.1;b.vehicle.heading=-Math.PI+.1;expect(Math.abs(interpolate(a,b,.5).vehicle.heading)).toBeCloseTo(Math.PI);});
 it('zijviews veranderen de canonieke toestand niet',()=>{const a=packet(1,1000,1),copy=structuredClone(a);const b=new SnapshotBuffer();b.accept(a);for(let i=0;i<200;i++)b.sample(1000+i);expect(a).toEqual(copy);});
});
describe('Kalibratie en verschillende camera’s',()=>{
 it('verdeelt breed beeld zonder ontbrekende pixels',()=>{const p=panels(1001,DEFAULT_CALIBRATION);expect(p.reduce((n,x)=>n+x.width,0)).toBe(1001);expect(p[2].x+p[2].width).toBe(1001);expect(panels(1000,{...DEFAULT_CALIBRATION,layout:'center'})[1].width).toBe(500);});
 it('begrensde waarden en veilige defaults bij ongeldige invoer',()=>{const c=calibrate({fov:999,horizon:-90,pixelRatio:NaN});expect(c.fov).toBe(110);expect(c.horizon).toBe(-20);expect(c.pixelRatio).toBe(1);});
 it('links/midden/rechts hebben dezelfde oogpositie en verschillende richtingen',()=>{const v=initialState().vehicle;const cameras=(['links','midden','rechts'] as const).map(side=>{const c=new PerspectiveCamera();configureCamera(c,v,side,DEFAULT_CALIBRATION,1);return c;});expect(cameras[0].position).toEqual(cameras[1].position);expect(cameras[1].position).toEqual(cameras[2].position);expect(cameras[0].getWorldDirection(new Vector3()).x).toBeLessThan(-.5);expect(cameras[1].getWorldDirection(new Vector3()).z).toBeLessThan(-.99);expect(cameras[2].getWorldDirection(new Vector3()).x).toBeGreaterThan(.5);});
 it('kijkrichting volgt de voertuigbocht; fov en horizon worden toegepast',()=>{const c=new PerspectiveCamera(),v={...initialState().vehicle,heading:Math.PI/2};configureCamera(c,v,'midden',{...DEFAULT_CALIBRATION,horizon:10,fov:60},2);expect(c.getWorldDirection(new Vector3()).x).toBeGreaterThan(.9);expect(c.fov).toBe(60);expect(c.aspect).toBe(2);expect(c.rotation.x).toBeCloseTo(-.03+Math.PI/18);});
});
