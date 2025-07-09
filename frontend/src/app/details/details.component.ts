import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {

  @Input() item:any;
  constructor(public dataService: DataService){}

  imgs:Array<String>=[];
  selImg:number=0;
  ngOnInit(){
    this.imgs[0]=this.item.img;
  }
  
  async changeName(name:string){
    const body=JSON.stringify({
      id:this.item.id,
      name:name
    });
    const r1=await fetch('http://localhost:3000/item/name', {  //<- very sketchy shit
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
  
  changeAbsence(a:string){}

  async selectImg(idx:number){
    this.selImg=idx;
    const img=this.imgs[idx];
    const body={
      id: this.item.id,
      newUrl: img
    }
    const r1=await fetch('http://localhost:3000/item/img', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      alert("Odmowa serwera.");
      return;
    }
    console.log("OK");
    this.item.img=img
  }

  convert(dat:  number ){   //ZDUPLIKOWANE! SPRÓBOWAĆ USUNĄĆ
    const d=new Date(dat);
    let ds=d.getDate()+".";
    if(d.getMonth()+1<10) ds+="0";
    ds+=d.getMonth()+1+"."+d.getFullYear()+" "+d.getHours()+":";
    if(d.getMinutes()+1<10) ds+="0";
    ds+=d.getMinutes()+1
    return ds;
  }
}


