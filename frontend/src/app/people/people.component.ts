import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-people',
  imports: [ CommonModule ],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})
export class PeopleComponent {
  @Input() id:number=1;
  sqid:boolean=false;
  rfid:boolean=false;
  img:boolean=false;


  constructor(public dataService: DataService){
  }

  async eliminate(){
    const data={
      id: this.dataService.employees[this.id].id
    }
    const r=await fetch('http://localhost:3000/employee/delete', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if(r.status==200){
      this.dataService.employees.splice(this.id, 1);
      console.log("Success!");
      this.sqid=false;
    }else{
      console.log("ERROE! "+r.status);
    }
  }

  async balls(newVal:any, param:string){
    const data={
      id: this.dataService.employees[this.id].id,
      field: param,
      val: newVal.value
    }
    console.log(data);
    const r=await fetch('http://192.168.1.112:3000/employee/update', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if(r.status==200){
      this.dataService.employees[this.id][param]=newVal.value;
    }else{
      console.log("ERROE! "+r.status);
    }
  }

  delCard(){}
  addCard(){}
}
