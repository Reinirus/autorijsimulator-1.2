import {describe,it,expect} from 'vitest';
import {integrateVehicle} from '../../src/core/physics';
import {initialState,kmh} from '../../src/core/state';
import {FIXED_DT,Simulation} from '../../src/core/simulation';
const zero=initialState().vehicle;const input={throttle:false,brake:false,left:false,right:false};
describe('Deterministische besturing',()=>{
 it('staat stil zonder gas',()=>{expect(integrateVehicle(zero,input,FIXED_DT).speed).toBe(0);});
 it('versnelt met gas, remt met rem',()=>{const driving=integrateVehicle(zero,{...input,throttle:true},FIXED_DT);expect(driving.speed).toBeGreaterThan(0);expect(integrateVehicle(driving,{...input,brake:true},FIXED_DT).speed).toBeLessThan(driving.speed);});
 it('begrensde stuurhoek en herstel na loslaten',()=>{let v=zero;for(let i=0;i<90;i++)v=integrateVehicle(v,{...input,left:true},FIXED_DT);expect(v.steering).toBeGreaterThanOrEqual(-.52);for(let i=0;i<40;i++)v=integrateVehicle(v,input,FIXED_DT);expect(Math.abs(v.steering)).toBeLessThan(.001);});
 it('reproduceert exact dezelfde simulatie',()=>{const a=new Simulation(),b=new Simulation();a.start();b.start();a.setInput({throttle:true,right:true});b.setInput({throttle:true,right:true});for(let i=0;i<120;i++){a.step();b.step();}expect(a.state).toEqual(b.state);});
 it('max snelheid en correcte omzetting km/h',()=>{let v=zero;for(let i=0;i<3000;i++)v=integrateVehicle(v,{...input,throttle:true},FIXED_DT);expect(v.speed).toBeLessThanOrEqual(18);expect(kmh(10)).toBe(36);});
 it('stop wist input en stopt klok',()=>{const s=new Simulation();s.start();s.setInput({throttle:true});s.step();s.stop();const t=s.state.clock;s.step();expect(s.state.clock).toBe(t);expect(s.state.input.throttle).toBe(false);});
});
