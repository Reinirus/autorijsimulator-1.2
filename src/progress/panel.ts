import {readLocalData,summarize,teacherCSV,NO_IDENTITY,type DomainSummary} from './model';

export class ProgressPanel{
 private dialog:HTMLDialogElement;
 constructor(private readonly beforeOpen:()=>void){
  const button=document.createElement('button');button.type='button';button.id='progressOpen';button.textContent='Mijn oefenoverzicht';document.querySelector('.actions')?.append(button);
  this.dialog=document.createElement('dialog');this.dialog.id='progressDialog';this.dialog.setAttribute('aria-label','Mijn oefenoverzicht en docentenrapport');
  document.body.append(this.dialog);
  button.addEventListener('click',()=>{if(this.dialog.open)return;this.beforeOpen();this.show();this.dialog.showModal();});
 }
 get openNow(){return this.dialog.open;}
 private el<K extends keyof HTMLElementTagNameMap>(tag:K,value:string){const e=document.createElement(tag);e.textContent=value;return e;}
 private button(label:string,fn:()=>void){const b=this.el('button',label);b.type='button';b.addEventListener('click',fn);this.dialog.append(b);return b;}
 private group(title:string,values:DomainSummary[]){this.dialog.append(this.el('h3',title));const list=document.createElement('ul');for(const item of values){const li=this.el('li',item.name+': '+(item.total?item.good+' van '+item.total+' passend':'nog geen resultaat')+'. '+item.advice);list.append(li);}this.dialog.append(list);}
 private show(){
  this.dialog.replaceChildren();const data=readLocalData(this.storage());const s=summarize(data);
  this.dialog.append(this.el('h2','Mijn oefenoverzicht'),this.el('p','DEMO — NIET CBR-GECERTIFICEERD'),this.el('p',NO_IDENTITY));
  this.dialog.append(this.el('h3','Rijmissies'),this.el('p',s.completedMissions+' afgeronde oefenpogingen van '+s.missionAttempts+' opgeslagen pogingen. '+s.uniqueMissions+' van 10 verschillende missies minimaal eenmaal voltooid.'),this.el('p',s.missionEvents+' verkeersmeldingen in opgeslagen ritten (geen foutscore).'));
  this.group('Theorie',s.theory);this.group('Gevaarherkenning',s.hazard);
  this.dialog.append(this.el('h3','Docentenoverzicht'),this.el('p','Het CSV-overzicht bevat alleen samenvattende, anonieme oefenresultaten van dit apparaat. Het is niet geschikt om leerlingen onderling te vergelijken.'));
  this.button('Exporteer anoniem docentoverzicht (CSV)',()=>{
   const blob=new Blob([teacherCSV(data)],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);
   const a=this.el('a','');a.href=url;a.download='rijsim-docentoverzicht-anoniem.csv';this.dialog.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  this.button('Ververs overzicht',()=>this.show());this.button('Sluiten',()=>this.dialog.close());
 }
 private storage():Storage|null{try{return window.localStorage;}catch{return null;}}
}
