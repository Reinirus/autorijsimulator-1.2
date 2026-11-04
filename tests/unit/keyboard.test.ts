import {it,expect} from 'vitest';
import {Keyboard} from '../../src/core/keyboard';
it('meerdere toetsen en key-up werken zonder hangende gaspedaal',()=>{const k=new Keyboard();k.key('ArrowUp',true);k.key('a',true);expect(k.snapshot()).toMatchObject({throttle:true,left:true});k.key('ArrowUp',false);expect(k.snapshot().throttle).toBe(false);k.clear();expect(k.snapshot().left).toBe(false);});

it('twee alternatieve gasttoetsen houden gas ingedrukt tot beide los zijn',()=>{
 const k=new Keyboard();k.key('w',true);k.key('ArrowUp',true);k.key('w',false);
 expect(k.snapshot().throttle).toBe(true);k.key('ArrowUp',false);expect(k.snapshot().throttle).toBe(false);
});
