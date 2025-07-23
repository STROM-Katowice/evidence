import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
//import bcrypt from 'bcrypt'

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
  passTemp:string="Strom74"


  constructor(public dataService: DataService){
  }

  async eliminate(){
    const data={
      id: this.dataService.employees[this.id].id
    }
    const r=await fetch(this.dataService.remote+'employee/delete', {
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
    const r=await fetch(this.dataService.remote+'/employee/update', {
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

  async invite(pass:any){
    if(pass.length<6){ console.log("za krótko"); return; }
    if(pass.length>32){ console.log("za długie"); return; }
    //pass=await this.hash(pass);
    this.balls(pass, 'hash');
  }
  /*async hash(pass:string){
    return await new Promise(async resolve => bcrypt.hash(pass, 10, (err, hash:string) => {
      console.log(err);
      console.log(hash);
      resolve(hash);
    }));
  }*/

  delCard(){}
  addCard(){}
}
