import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { RegalComponent } from '../regal/regal.component';

@Component({
  selector: 'app-storage',
  imports: [ RegalComponent ],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.css'
})
export class StorageComponent {
  constructor(public dataService: DataService){  }
  a:boolean=false;
  site:any={};

  ngOnInit(){ this.load()  }
  load(){
    if(typeof this.dataService!="undefined" && typeof this.dataService.sites[0]!="undefined")
      this.changeSite("0");
    else 
      setTimeout(()=>this.load(), 1000);
  }

  changeSite(nid:string){
    this.site=this.dataService.sites[nid];
    this.site.img="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.iberion.media%2Fimages%2F1920%2FSciolka_z_szyszek_1_0e34932cb8.png&f=1&nofb=1&ipt=99c29dff00dfaf670a36d296fdbbea01c3a4e6aab6652c8d3bb569dd941b9155";
  }


  async changeName(name:string){
    const body=JSON.stringify({
      id:this.site.id,
      name:name
    });
    const r1=await fetch(this.dataService.remote+'site/name', {  //<- very sketchy shit
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: body
    });
    if(r1.status!=200){
      console.log("Odmowa serwera.");
      return;
    }
    const k=await r1.json();  
  }

  async addPerms(nap: string){
    const body=JSON.stringify({
      id:this.site.id,
      perms: nap
    });
    const r1=await fetch(this.dataService.remote+'site/addPerms', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: body
    });
    if(r1.status==200) this.site.perms.push(nap);
    
  }

  async delPerms(deleted:string){   //SPRAWDZIĆ, ŻE GRUPA NIE NAZYWA SIĘ JAK PRACOWNIK
    const body=JSON.stringify({
      id:this.site.id,
      perms: deleted
    });
    const r1=await fetch(this.dataService.remote+'site/delPerms', {  //<- very sketchy shit
      method: "POST",
      headers: this.dataService._HEADERS,
      body: body
    });
    if(r1.status==200) this.site.perms.splice(this.site.perms.indexOf(deleted), 1); 
    
  }

  async changeLocation(a:string){
    const body={
      id: this.site.id,
      location: a
    };
    const r1=await fetch(this.dataService.remote+'site/location', {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `${this.dataService.token}` 
      },
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      alert("Odmowa serwera.");
      return;
    }
    console.log("OK");
    this.site.location=a;
  }

  async delSite(){
    const body={
      id: this.site.id,
    };
    const r1=await fetch(this.dataService.remote+'site/delete', {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `${this.dataService.token}` 
      },
      body: JSON.stringify(body)
    });
    if(r1.status!=200){
      alert("Odmowa serwera.");
      return;
    }
    console.log("OK");
    this.dataService.route('/');
  }

  changeImg(url:string){

  }

  upload(img:any){
    const formData = new FormData();
    formData.append('file', img.files[0]);
    formData.append('id', this.site.id);
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `${this.dataService.token}` 
      },
      body: formData
    };
    fetch(this.dataService.remote+'site/upload', options);
  }

  reformat(loc:string){
    if(loc==undefined) return "";
    return loc.replace(' ', '');
  }

  getBrigades(){
    return this.dataService.groups.Brygady.filter((x:any) => x.location==this.site.name);
  }
}
