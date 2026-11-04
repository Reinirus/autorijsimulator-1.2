import {describe,it,expect} from 'vitest';
import {cycleLight,moveActors} from '../../src/traffic/engine';
import {initialState} from '../../src/core/state';
describe('Verkeerslicht en actorposities (demomodel)',()=>{
 it('rood/oranje/groen volgen een herhaalbare klok',()=>{
   expect(cycleLight(0)).toBe('rood');expect(cycleLight(8.99)).toBe('rood');
   expect(cycleLight(9)).toBe('groen');expect(cycleLight(17.99)).toBe('groen');
   expect(cycleLight(12)).toBe('groen');expect(cycleLight(18)).toBe('oranje');expect(cycleLight(20.99)).toBe('oranje');expect(cycleLight(21)).toBe('rood');
 });
 it('NPC beweging is onveranderlijk en reproduceerbaar',()=>{
   const a=initialState().actors;const x=moveActors(a,1/60);
   expect(a[0].z).toBe(-22);expect(x).toEqual(moveActors(a,1/60));
   expect(x[0].z).toBeGreaterThan(-22);
 });
});
