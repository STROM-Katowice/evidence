import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {

  constructor(public dataService: DataService){}
  
  item:any={};
  imgs:Array<String>=[];
  selImg:number=0;
  ngOnInit(){
    this.item=this.dataService.items[this.dataService.toEdit];
    this.imgs[0]=this.item.img;
  }
  
  async changeName(name:string){
    const body=JSON.stringify({
      id:this.item.id,
      name:name
    });
    const r1=await fetch('http://192.168.1.112:3000/item/name', {  //<- very sketchy shit
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: body
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }
    const k=await r1.json();

    this.item.name=name;
    const t=[this.item.img];    //meh TODO:
    this.imgs=t.concat(k.img);   
  }
  
  async changeAbsence(a:string){
    const body={
      id: this.item.id,
      absence: a
    };
    const r1=await fetch('http://192.168.1.112:3000/item/absence', {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `${this.dataService.token}` 
      },
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      alert("Odmowa serwera.");
      return;
    }
    console.log("OK");
    this.item.absence=a;
  }

  async selectImg(idx:number){
    this.selImg=idx;
    const img=this.imgs[idx];
    const body={
      id: this.item.id,
      newUrl: img
    }
    const r1=await fetch('http://192.168.1.112:3000/item/img', {
      method: "POST",
      headers: this.dataService._HEADERS,
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      alert("Odmowa serwera.");
      return;
    }
    console.log("OK");
    this.item.img=img
  }

  async addPerms(nap: string){
    this.item.perms.push(nap);
    this.changePerms();
  }

  async delPerms(deleted:string){   //SPRAWDZIĆ, ŻE GRUPA NIE NAZYWA SIĘ JAK PRACOWNIK
    this.item.perms.splice(this.item.perms.indexOf(deleted), 1);
    this.changePerms();
  }

  async changePerms(){
    const stringified=JSON.stringify(this.item.perms);
    console.log(stringified);
    const body=JSON.stringify({
      id:this.item.id,
      perms: stringified
    });
    const r1=await fetch('http://192.168.1.112:3000/item/perms', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: body
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }
  }

  convert(dat:  number ){   //ZDUPLIKOWANE! SPRÓBOWAĆ USUNĄĆ
    const d=new Date(dat*1000);
    let ds=d.getDate()+".";
    if(d.getMonth()+1<10) ds+="0";
    ds+=d.getMonth()+1+"."+d.getFullYear()+" "+d.getHours()+":";
    if(d.getMinutes()+1<10) ds+="0";
    ds+=d.getMinutes()+1
    return ds;
  }
  regalNumer(){
    const slave=this.dataService.stock.filter((x:any) => x.uID==this.item.slaveID)[0];
    return /*BRAK ODPOWIEDNIEJ WARTOŚCI slave.pos*/ "Undef";
  }
  async status(num:number){
    const body=JSON.stringify({
      id:this.item.id,
      status: num
    });
    const r1=await fetch('http://192.168.1.112:3000/item/status', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: body
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }
    this.item.status=num;
  }
}


