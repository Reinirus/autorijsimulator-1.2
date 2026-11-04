import type {Observation} from '../rules/evaluator';
export class Assessment {
 private log:Observation[]=[];
 record(events:Observation[]):void {for(const e of events){const previous=this.log.at(-1);if(!previous||e.ruleId!==previous.ruleId||e.time-previous.time>2)this.log.push(e);}}
 reset():void{this.log=[];}
 report():Observation[]{return [...this.log];}
}
