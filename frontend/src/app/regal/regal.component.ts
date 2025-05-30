import { Component, Input } from '@angular/core';
import  { DataService } from '../data.service';
import { DetailsComponent } from '../details/details.component';

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
  
  f=false;
  ngOnInit(){
  }
  edit(){
    if(this.f){
      this.f=false;
      this.dataService.edit=false;
      this.dataService.stock=this.dataService.toEdit.stock;
    }else{
      this.f=true;
      this.dataService.edit=true;
    }
  }

  updateImg(newUrl:any, v:number){
    console.log(newUrl);
    console.log(v);
  }

  convert(dat:  number ){
    const d=new Date(dat);
    let ds=d.getDate()+".";
    if(d.getMonth()+1<10) ds+="0";
    ds+=d.getMonth()+1+" "+d.getHours()+":";
    if(d.getMinutes()<10) ds+="0";
    ds+=d.getMinutes()+1
    return ds;
  }
}
