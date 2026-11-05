import {it,expect} from 'vitest';
import {Simulation} from '../../src/core/simulation';
import {ROUTES,parkedInside} from '../../src/missions/route';
import {integrateVehicle} from '../../src/core/physics';
import {initialState} from '../../src/core/state';
function drive(sim:Simulation,max=180){sim.start();for(let i=0;i<max*60&&!sim.state.mission!.completed;i++){
 const s=sim.state,m=s.mission!,g=ROUTES[m.id].points[m.index],v=s.vehicle;
 if(m.id===2&&s.clock<8){s.indicator='links';sim.setInput({throttle:false,brake:true,left:false,right:false});sim.step();continue;}
 const reverse=Boolean(g.reverse);if(reverse&&s.gear!=='R'){sim.setGear('R');}
 s.indicator=m.id===2?(m.index<1?'links':'rechts'):'uit';
 const distance=Math.hypot(g.x-v.x,g.z-v.z);const alpha=Math.atan2(Math.sin(Math.atan2(g.x-v.x,-(g.z-v.z))-v.heading-(reverse?Math.PI:0)),Math.cos(Math.atan2(g.x-v.x,-(g.z-v.z))-v.heading-(reverse?Math.PI:0)));
 const steer=(reverse?-1:1)*Math.atan2(5*Math.sin(alpha),Math.max(1,distance));
 const desired=g.stop?Math.min(2,Math.sqrt(Math.max(0,distance-.4)*1.5)):2;
 sim.setInput({throttle:Math.abs(v.speed)<desired-.08,brake:Math.abs(v.speed)>desired+.08,left:steer<v.steering-.02,right:steer>v.steering+.02});sim.step();
 }return sim.state;}
it.each([1,2])('missie %i is met echte fysica van start tot einde te rijden',id=>{const sim=new Simulation();sim.selectMission(id);const s=drive(sim);expect({index:s.mission!.index,vehicle:s.vehicle,events:s.mission!.events.filter(e=>e.category==='regel')}).toMatchObject({index:ROUTES[id].points.length});expect(s.mission!.completed).toBe(true);expect(s.running).toBe(false);expect(s.vehicle.speed).toBe(0);if(id===2)expect(s.mission!.reversed).toBeGreaterThan(2);});
it('achteruit heeft omgekeerde translatie en stuurwerking; remmen keert niet om',()=>{let v=initialState().vehicle;for(let i=0;i<120;i++)v=integrateVehicle(v,{throttle:true,brake:false,left:false,right:true},1/60,'R');expect(v.speed).toBeLessThan(0);expect(v.z).toBeGreaterThan(23);expect(v.heading).toBeLessThan(0);for(let i=0;i<120;i++)v=integrateVehicle(v,{throttle:false,brake:true,left:false,right:false},1/60,'R');expect(v.speed).toBe(0);});
it('D/R kiezen kan uitsluitend bij stilstand; herstart herstelt de hele missie',()=>{const sim=new Simulation();sim.selectMission(2);sim.start();sim.state.vehicle.speed=2;expect(sim.setGear('R')).toBe(false);sim.reset();expect(sim.state.gear).toBe('D');expect(sim.state.clock).toBe(0);expect(sim.state.mission!.index).toBe(0);});
it('parkeren vereist de volledige voertuigcontour binnen het vak',()=>{const v={...initialState().vehicle,x:23.5,z:5.2,heading:Math.PI/2};expect(parkedInside(v)).toBe(true);expect(parkedInside({...v,z:6.2})).toBe(false);expect(parkedInside({...v,heading:0})).toBe(false);});
