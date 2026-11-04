import {it,expect} from 'vitest';
import {copyMirrorPixels} from '../../src/displays/pixels';
it('spiegelkopie keert beide assen om en bewaart alle RGBA-kanalen',()=>{
 const source=new Uint8Array([255,0,0,1,0,255,0,2,0,0,255,3,200,100,50,4]),target=new Uint8ClampedArray(16);
 copyMirrorPixels(source,target,2,2);expect([...target]).toEqual([200,100,50,4,0,0,255,3,0,255,0,2,255,0,0,1]);expect(source[0]).toBe(255);
});
