import { Component, Input } from '@angular/core';
import  { DataService } from '../data.service';
import { DetailsComponent } from '../details/details.component';
import { isEmpty } from 'rxjs';

@Component({
  selector: 'app-regal',
  imports: [DetailsComponent],
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
      this.f=id;
      this.dataService.edit=true;

  }

  updateImg(newUrl:any, v:number){
    console.log(newUrl);
    console.log(v);
  }

  convert(dat:  number ){
    const d=new Date(dat);
    let ds=d.getDate()+".";
    if(d.getMonth()+1<10) ds+="0";
    ds+=d.getMonth()+1+"."+d.getFullYear()+" "+d.getHours()+":";
    if(d.getMinutes()<10) ds+="0";
    ds+=d.getMinutes()+1
    return ds;
  }

  getItem(id:number, pos:number){
    return this.dataService.items.filter((x: any )=> x.slaveID==this.dataService.stock[id].uID && x.pos-1==pos)[0];
  }
}
