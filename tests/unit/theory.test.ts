import {describe,it,expect} from 'vitest';
import {QUESTION_BANK} from '../../src/theory/bank';
import {TheorySession,readResult,saveResult,shuffled,toCSV} from '../../src/theory/engine';
describe('M5 oefenmodule',()=>{
 it('heeft unieke vragen met drie opties en verklaringen',()=>{expect(QUESTION_BANK.length).toBe(15);expect(new Set(QUESTION_BANK.map(q=>q.id)).size).toBe(15);for(const q of QUESTION_BANK){expect(q.options).toHaveLength(3);expect(q.correct).toBeGreaterThanOrEqual(0);expect(q.correct).toBeLessThan(3);expect(q.explanation.length).toBeGreaterThan(15);expect(q.status).toBe('NIET MENSELIJK GEVALIDEERD');}});
 it('maakt vaste reproduceerbare volgorde voor een seed',()=>{expect(shuffled([1,2,3,4,5],42)).toEqual(shuffled([1,2,3,4,5],42));});
 it('filtert per onderwerp',()=>{const s=new TheorySession('oefenen','Gevaarherkenning',42);expect(s.questions).toHaveLength(5);expect(s.questions.every(q=>q.domain==='Gevaarherkenning')).toBe(true);});
 it('beoordeelt alleen de keuze en kan geen dubbele antwoorden verwerken',()=>{const s=new TheorySession('oefentoets','Verkeersinzicht',42);expect(s.answer(-1)).toBeNull();for(const q of s.questions)expect(s.answer(q.correct)?.correct).toBe(true);expect(s.done).toBe(true);expect(s.answer(0)).toBeNull();expect(s.result().correct).toBe(5);});
 it('weigert voortijdige resultaten',()=>{expect(()=>new TheorySession('oefenen').result()).toThrow();});
 it('bewaart anoniem en leest valide resultaat',()=>{const s=new TheorySession('oefenen','Verkeersregels',42);for(const q of s.questions)s.answer(q.correct);let value='';const storage={setItem:(_key:string,v:string)=>{value=v;},getItem:()=>value};expect(saveResult(s.result('2026-11-06T00:00:00Z'),storage)).toBe(true);const r=readResult(storage);expect(r?.correct).toBe(5);expect(JSON.stringify(r)).not.toContain('leerlingnaam');expect(toCSV(r!)).toContain('vraag,antwoordindex,goed');});
 it('weigert ongeldige opslag en handelt opslagverbod af',()=>{expect(readResult({getItem:()=>'not json'})).toBeNull();expect(readResult({getItem:()=>'{"version":1,"mode":"oefenen","domain":"x","total":2,"correct":5,"answers":[],"date":"x"}'})).toBeNull();expect(saveResult({version:1,mode:'oefenen',domain:'Verkeersinzicht',total:0,correct:0,answers:[],date:'x'},{setItem:()=>{throw Error('blocked');}})).toBe(false);});
});
