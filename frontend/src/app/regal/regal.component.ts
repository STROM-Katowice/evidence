import { Component, Input } from '@angular/core';
import  { DataService } from '../data.service';
import { isEmpty } from 'rxjs';

@Component({
  selector: 'app-regal',
  templateUrl: './regal.component.html',
  styleUrl: './regal.component.css'
})
export class RegalComponent {
  @Input() id:number=0;
  @Input() sitename:string="Firma";

  constructor(public dataService: DataService){
  }
  
  f:number=-1;
  
  edit(id:number){
    if(this.dataService.edit) return;
    this.dataService.edit=true;
    this.dataService.toEdit=id-1;
  }

  updateImg(newUrl:any, v:number){
    console.log(newUrl);
    console.log(v);
  }

  convert(dat:  number ){
    const d=new Date(dat*1000);
    let ds=d.getDate()+".";
    if(d.getMonth()<9) ds+="0";
    ds+=d.getMonth()+1+"."+d.getFullYear()+" "+d.getHours()+":";
    if(d.getMinutes()<9) ds+="0";
    ds+=d.getMinutes()+1
    return ds;
  }

  getItem(id:number, pos:number){
    return this.dataService.items.filter((x: any )=> x.slaveID==this.dataService.stock[id].uID && x.pos-1==pos)[0];
  }
}
