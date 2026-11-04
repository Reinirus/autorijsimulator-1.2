import {initialState,type WorldState,type InputState,DEFAULT_INPUT} from './state';
import {integrateVehicle} from './physics';
import {advanceTraffic} from '../traffic/engine';
export const FIXED_DT=1/60;
export class Simulation{
 state:WorldState=initialState();private accumulator=0;
 start():void {this.state.running=true;}
 stop():void {this.state.running=false;this.state.input={...DEFAULT_INPUT};this.accumulator=0;}
 reset():void {this.state=initialState();this.accumulator=0;}
 setInput(input:Partial<InputState>):void {this.state.input={...this.state.input,...input};}
 step(dt=FIXED_DT):void {if(!this.state.running)return;this.state.clock+=dt;this.state.vehicle=integrateVehicle(this.state.vehicle,this.state.input,dt);Object.assign(this.state,advanceTraffic(this.state,dt));}
 tick(elapsed:number):void {if(!this.state.running)return;this.accumulator+=Math.min(Math.max(elapsed,0),.15);let count=0;while(this.accumulator>=FIXED_DT&&count<10){this.step();this.accumulator-=FIXED_DT;count++;}}
}
