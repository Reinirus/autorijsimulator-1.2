import type {CourseState} from '../missions/advanced-course';
import type {ScenarioRuntime} from '../scenarios/model';
import type {RouteRuntime} from '../missions/route';
export type InputState={throttle:boolean;brake:boolean;left:boolean;right:boolean};
export type VehicleState={x:number;z:number;heading:number;speed:number;steering:number};
export type Actor={kind:'auto'|'fietser'|'voetganger';id?:string;route?:{x:number;z:number}[];progress?:number;desiredSpeed?:number;mode?:'rijden'|'wachten'|'noodrem';x:number;z:number;heading:number;speed:number};
export type LightState='rood'|'oranje'|'groen';
export type WorldState={mission?:RouteRuntime;course?:CourseState;gear?:'D'|'R';scenario?:ScenarioRuntime;indicator?:'uit'|'links'|'rechts';clock:number;vehicle:VehicleState;actors:Actor[];light:LightState;input:InputState;running:boolean};
export const DEFAULT_INPUT:InputState={throttle:false,brake:false,left:false,right:false};
export function initialState():WorldState {return {clock:0,vehicle:{x:1.55,z:23,heading:0,speed:0,steering:0},actors:[{kind:'auto',x:-1.6,z:-22,heading:Math.PI,speed:3},{kind:'fietser',x:4.7,z:-12,heading:0,speed:1.8}],light:'rood',input:{...DEFAULT_INPUT},running:false};}
export const kmh=(speedMS:number)=>speedMS*3.6;
