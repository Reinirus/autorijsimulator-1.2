import type {InputState} from './state';
import {DEFAULT_INPUT} from './state';
export const KEY_MAP:Record<string,keyof InputState>={arrowup:'throttle',w:'throttle',arrowdown:'brake',s:'brake',' ':'brake',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
export class Keyboard{
 private pressed=new Set<string>();
 key(key:string,down:boolean):void {const k=key.toLowerCase();if(!(k in KEY_MAP))return;if(down)this.pressed.add(k);else this.pressed.delete(k);}
 clear():void{this.pressed.clear();}
 snapshot():InputState {const i={...DEFAULT_INPUT};for(const k of this.pressed){i[KEY_MAP[k]]=true;}return i;}
}
