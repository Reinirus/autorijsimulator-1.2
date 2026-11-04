import {describe,it,expect} from 'vitest';
import {mirrorDirection,makeMirrors,updateMirrorCameras} from '../../src/displays/mirrors';
describe('Virtuele spiegeloriëntatie',()=>{
 it('binnenspiegel kijkt achterwaarts',()=>{const d=mirrorDirection('binnen');expect(d.z).toBeGreaterThan(.99);expect(Math.abs(d.x)).toBeLessThan(.001);});
 it('linker- en rechterspiegel verschillen in horizontale richting',()=>{const l=mirrorDirection('links'),r=mirrorDirection('rechts');expect(l.x).toBeLessThan(0);expect(r.x).toBeGreaterThan(0);expect(l.z).toBeGreaterThan(0);expect(r.z).toBeGreaterThan(0);});
 it('spiegels volgen één voertuigpose en hebben verschillende posities',()=>{const cameras=makeMirrors();updateMirrorCameras(cameras,{x:3,z:7,heading:0});expect(cameras.links.position.x).toBeLessThan(3);expect(cameras.rechts.position.x).toBeGreaterThan(3);expect(cameras.binnen.position.x).toBe(3);});
});
