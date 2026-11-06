import type {LightState} from '../core/state';
export interface SignalPlan {offset:number;red:number;green:number;yellow:number}
export interface SignalFrame {ego:LightState;cross:LightState;pedestrian:'rood'|'groen'}
// Authored simulation timings, never legal stopping-distance criteria.
export const DEFAULT_SIGNAL_PLAN:SignalPlan={offset:0,red:12,green:15,yellow:3};
export function signalFrame(clock:number,plan:SignalPlan):SignalFrame {
 const total=plan.red+plan.green+plan.yellow,p=((clock+plan.offset)%total+total)%total;
 return {ego:p<plan.red?'rood':p<plan.red+plan.green?'groen':'oranje',cross:p>=1&&p<plan.red-4?'groen':p>=plan.red-4&&p<plan.red-2?'oranje':'rood',pedestrian:p>=1&&p<plan.red-8?'groen':'rood'};
}
