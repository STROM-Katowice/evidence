import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-stan',
  imports: [],
  templateUrl: './stan.component.html',
  styleUrl: './stan.component.css'
})
export class StanComponent {
  
  constructor(public dataService:DataService){}
  filter(){
    const items=this.dataService.items.filter( (x:any) => x.owner==this.dataService.account.name);
    return items;
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
}
