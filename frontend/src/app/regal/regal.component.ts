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
  @Input() id = 1;
  
  constructor(public dataService: DataService){}
  
  f=false;
  ngOnInit(){
  }

  updateImg(newUrl:any, v:number){
    console.log(newUrl);
    console.log(v);
  }

  convert(dat:  number ){
    return new Date(dat).toLocaleDateString("pl-PL")+"\n"+new Date(dat).toLocaleTimeString("pl-PL");
  }
}
