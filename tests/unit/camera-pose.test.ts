import {it,expect} from 'vitest';
import {Vector3} from 'three';
import {makeMirrors,updateMirrorCameras} from '../../src/displays/mirrors';
it('achterwaartse spiegelrichting blijft juist na een kwartslag rechts',()=>{
 const cameras=makeMirrors();updateMirrorCameras(cameras,{x:0,z:0,heading:Math.PI/2});
 expect(cameras.binnen.getWorldDirection(new Vector3()).x).toBeCloseTo(-1);
 expect(cameras.links.position.z).toBeCloseTo(-.78);
 expect(cameras.rechts.position.z).toBeCloseTo(.78);
});
