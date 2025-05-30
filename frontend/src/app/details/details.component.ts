import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {

  @Input() item:any={};
  constructor(public dataService: DataService){
  }

  imgs=[];
  selImg:number=0;
  
  ch(field:any, name:string){
    console.log(field.value);
    const body=JSON.stringify({
      id:this.item.id,
      field:name,
      val:field.value
    });
    fetch('http://localhost:3000/updateItem', {  //<- very sketchy shit
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: body
    }).then(k => k.json())
    .then(k => { 
      if(k.status==100){
        this.item[name]=field.value;
        this.imgs=k.img;
        this.item.img=k.img[0];
      }
    })
    
  }
}
