import { Component } from '@angular/core';
import { DataService } from '../data.service';
//import bcrypt from 'bcrypt'

@Component({
  selector: 'app-pracownicy',
  templateUrl: './pracownicy.component.html',
  styleUrl: './pracownicy.component.css'
})
export class PracownicyComponent {
  sqid:number=0;
  cid:number=0;
  img:boolean=false;
  passTemp:string="Strom74";
  chosen=false;
  s=0;

  constructor(public dataService: DataService){
  }

  async eliminate(id:number){
    const data={
      id: this.dataService.employees[id].id
    }
    const r=await fetch(this.dataService.remote+'employee/delete', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if(r.status==200){
      this.dataService.employees.splice(id, 1);
      console.log("Success!");
      this.sqid=0;
    }else{
      console.log("ERROE! "+r.status);
    }
  }

  async update(newVal:any, param:string){
    const data={
      id: this.dataService.employees[this.cid].id,
      field: param,
      val: newVal
    }
    console.log(data);
    const r=await fetch(this.dataService.remote+'employee/update', {
      method: "POST",
      headers: this.dataService._HEADERS  ,
      body: JSON.stringify(data)
    });
    if(r.status==200){
      this.dataService.employees[this.cid][param]=newVal;
    }else{
      console.log("ERROE! "+r.status);
    }
  }

  generatePassword(){
    
    return this.passTemp;
  }
  createAccount(){

  }
  check(RRT:any){
    if(RRT!="") this.chosen=true;
    else this.chosen=false;
  }

  async invite(pass:any, id:number){
    if(pass.length<6){ console.log("za krótko"); return; }
    if(pass.length>32){ console.log("za długie"); return; }
    pass=await this.hash(pass);
    this.update(pass, 'hash');
  }
  async hash(pass:string){
    return 0/*await new Promise(async resolve => bcrypt.hash(pass, 10, (err, hash:string) => {
      console.log(err);
      console.log(hash);
      resolve(hash);
    }))*/;
  }

  squidder(act:number, id:number){ this.sqid=act; this.cid=id }
  copy(copyText:any){
    navigator.clipboard.writeText(copyText.value);
  }
}
