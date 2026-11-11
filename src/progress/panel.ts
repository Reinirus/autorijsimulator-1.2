import {readLocalData,summarize,teacherCSV,NO_IDENTITY,type DomainSummary} from './model';
import {exportExerciseBundle,parseExerciseBundle,importExerciseBundle,clearExerciseData} from './exercise-file';

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
  this.dialog.append(this.el('h3','Oefenbestand per leerling'));
  this.dialog.append(this.el('p','Bewaar een eigen JSON-oefenbestand op een veilige plek. De bestandsnaam bevat geen leerlingnaam. Op een gedeeld apparaat: download eerst, wis daarna de lokale resultaten voordat de volgende leerling begint.'));
  this.dialog.append(this.el('p','Een anoniem bestand is niet automatisch geheim. Deel het alleen via de door school goedgekeurde omgeving.'));
  this.button('Bewaar mijn oefenbestand (JSON)',()=>{
   const current=this.storage();if(!current){this.dialog.append(this.el('p','Opslag is niet beschikbaar.'));return;}
   const contents=JSON.stringify(exportExerciseBundle(current),null,2);
   const url=URL.createObjectURL(new Blob([contents],{type:'application/json'}));
   const a=this.el('a','');a.href=url;a.download='mijn-rijsim-oefenbestand.json';this.dialog.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  const importer=this.el('label','Bestaand oefenbestand openen (JSON). Dit kan alleen nadat de huidige lokale resultaten gewist zijn.');
  const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.id='exerciseImport';importer.append(file);this.dialog.append(importer);
  const result=this.el('p','');result.id='exerciseFileStatus';result.setAttribute('role','status');this.dialog.append(result);
  file.addEventListener('change',async()=>{
   const selected=file.files?.[0];if(!selected)return;
   if(selected.size>2_000_000){result.textContent='Bestand te groot (maximaal 2 MB).';return;}
   const storage=this.storage();if(!storage){result.textContent='Lokale opslag is niet beschikbaar.';return;}
   try{
    const parsed=parseExerciseBundle(await selected.text());
    if(!parsed){result.textContent='Ongeldig oefenbestand. Er is niets gewijzigd.';return;}
    if(!importExerciseBundle(storage,parsed)){result.textContent='Openen niet mogelijk. Wis eerst de vorige resultaten of controleer de opslaginstellingen.';return;}
    result.textContent='Oefenbestand geopend. Het overzicht wordt opnieuw geladen.';
    window.location.reload();
   }catch{result.textContent='Het oefenbestand kon niet worden gelezen.';}
  });
  this.button('Wis resultaten voor de volgende leerling',()=>{
   if(!window.confirm('Heb je het oefenbestand van de huidige leerling veilig bewaard? Wissen kan niet ongedaan worden gemaakt.'))return;
   const storage=this.storage();if(!storage||!clearExerciseData(storage)){result.textContent='Wissen is niet gelukt. Controleer de browseropslag.';return;}
   window.location.reload();
  });
  this.button('Ververs overzicht',()=>this.show());this.button('Sluiten',()=>this.dialog.close());
 }
 private storage():Storage|null{try{return window.localStorage;}catch{return null;}}
}
