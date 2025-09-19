import { Component, input } from '@angular/core';
import { DataService } from '../data.service';
import { empty } from 'rxjs';

@Component({
  selector: 'app-group',
  imports: [],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {
  constructor(public dataService: DataService){
    setTimeout(()=>{
    this.workgroup=this.dataService.groups[this.cat()][this.gr()];
    }, 1);  //bez tego nie działa, LOL
  }
  workgroup:any={};
  cat:any=input();
  gr:any=input();
  i=false;
  brig=true;
  j=0;

  async deleteGroup(){
    const body={
      id: this.dataService.groups[this.cat()][this.gr()].id
    }
    const r1=await fetch(this.dataService.remote+'group/delete', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      console.log("LEN: ")
      console.log(this.dataService.groups[this.cat()].length);
      if(this.dataService.groups[this.cat()].length==1) this.dataService.groups[this.cat()]=[null];
      else this.dataService.groups[this.cat()].splice(this.gr(), 1);
    }
  }

  async newName(field:any){
    const body={
      id: this.dataService.groups[this.cat()][this.gr()].id,
      name: field.value
    }
    const r1=await fetch(this.dataService.remote+'group/name', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      //this.dataService.groups[this.cat()].grps.splice(this.group(), 1);
      field.readOnly=true;
      this.j=0;
    }
  }

log(g:any){
  console.log("bals");
  console.log(g);
}



  async addMember(member:string){
    const body=JSON.stringify({
      id: this.workgroup.id,
      member: member
    });
    const r1=await fetch(this.dataService.remote+'group/newMember', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: body
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      this.dataService.groups[this.cat()][this.gr()].members.push(member);
    }
  }

  async delMember(deleted:string){  
    if(!this.i) return;
    if(!this.brig){
      if(this.workgroup.members[0][0]=='#') this.workgroup.members[0].splice(0,3)
      this.workgroup.members.splice(this.workgroup.members.indexOf(deleted), 1);
      this.workgroup.members.splice(0, 0, '#1 '+deleted);
      this.brig=false;
      return;
    }
    const x=this.dataService.groups[this.cat()];
    const body={
      id: x[this.gr()].id,
      member: deleted
    }
    const r1=await fetch(this.dataService.remote+'group/delMember', { 
      method: "POST",
      headers: this.dataService._HEADERS,
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      this.workgroup.members.splice(this.workgroup.members.indexOf(deleted), 1);
    }
  }
  async changeColor(color:string){
    const body=JSON.stringify({
      id: this.workgroup.id,
      color: color
    });
    const r1=await fetch(this.dataService.remote+'group/color', { 
      method: "POST",
      headers: this.dataService._HEADERS,
      body: body
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      this.dataService.groups[this.cat()][this.gr()].color=color;
    }
  }

  more(el:any){
    if(!this.i) el.style.display="block";
    else el.style.display="ruby";
    this.i=!this.i;
  }
}
