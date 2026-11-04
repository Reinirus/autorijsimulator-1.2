import {describe,it,expect} from 'vitest';
import {RULES,rightOfWay} from '../../src/rules/catalog';
import {initialState} from '../../src/core/state';
import {DEMO_SCENARIO,evaluate} from '../../src/rules/evaluator';
describe('RVV beperkte basis',()=>{
 it('vermeldt rechts houden met officiële bron en reviewstatus',()=>{expect(RULES.RIGHT.article).toContain('artikel 3');expect(RULES.RIGHT.reviewedByHuman).toBe(false);expect(RULES.RIGHT.source).toContain('wetten.overheid.nl');});
 it('gelijkwaardig verkeer van rechts: voor laten gaan',()=>{expect(rightOfWay({type:'gelijkwaardig',fromRight:true,signRequiresYield:false,light:'groen'})).toMatchObject({yieldRequired:true,automatable:true});});
 it('gelijkwaardig verkeer van links: geen automatisch voorrangsplicht',()=>{expect(rightOfWay({type:'gelijkwaardig',fromRight:false,signRequiresYield:false,light:'groen'}).yieldRequired).toBe(false);});
 it('voorrangsborden en licht zijn NIET ten onrechte juridisch automatisch beoordeeld',()=>{expect(rightOfWay({type:'voorrangsbord',fromRight:true,signRequiresYield:false,light:'groen'}).automatable).toBe(false);expect(rightOfWay({type:'verkeerslicht',fromRight:true,signRequiresYield:false,light:'rood'}).automatable).toBe(false);});
 it('30-zone is expliciet scenario, geen landelijk universeel maximum',()=>{expect(DEMO_SCENARIO.maxSpeedSource).toBe('bord-A1-zone30');const state=initialState();state.vehicle.speed=31/3.6;expect(evaluate(state).some(e=>e.ruleId==='SPEED')).toBe(true);});
});
