import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { GroupComponent } from "../group/group.component";

@Component({
  selector: 'app-groups',
  imports: [GroupComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent {
  
  constructor(public dataService: DataService){
  }
  groups(){
    let x=[];
    for(let key in this.dataService.groups) x.push(key);
    return x;
  }

  async addCategory(){
    const r=await fetch(this.dataService.remote+'groupscategory/new',{
      method: "POST",
      headers: this.dataService._HEADERS,
      body: "{}"
    });
    if(r.status==200){
      const s=await r.json();
      const k="";
      this.dataService.groups["Nowa Kategoria"+k]=[];
    }else{
      console.log("ERROR! "+r.status);
    }
  }
  async addGroup(cat:string){
    const r1=await fetch(this.dataService.remote+'group/new', { 
      method: "POST",
      headers: this.dataService._HEADERS,
      body: "{}"
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      const r2=await r1.json();
      if(this.dataService.groups.length<1) this.dataService.groups[cat]=[];
      this.dataService.groups[cat].push({
        id: r2.id,
        name: "nowa grupa",
        category: cat,
        members: [],
        color: r2.color,
        priority: 0,
        lider: ""
      });
    }
  }

  async catname(old:string, neww:string){
    const body={
      old: old,
      new: neww
    }
    const r=await fetch(this.dataService.remote+'groupscategory/name',{
      method: "POST",
      headers: this.dataService._HEADERS,
      body: JSON.stringify(body)
    });
    if(r.status!=200){
      console.log("Odmowa serwera.");
      return;
    }else{
      
      this.dataService.groups[neww]=this.dataService.groups[old];
      delete this.dataService.groups[old];
    }
  }

  
  
}
