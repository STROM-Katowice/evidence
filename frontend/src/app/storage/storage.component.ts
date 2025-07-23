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
  constructor(public dataService: DataService){}

  site:any={};
  ngOnInit(){
    setTimeout(()=>{
      //this.changeSite("0");
    }, 2000);  //nie usuwać set timeout
  }
  changeSite(nid:string){
    this.site=this.dataService.sites[nid];
    this.site.img="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.iberion.media%2Fimages%2F1920%2FSciolka_z_szyszek_1_0e34932cb8.png&f=1&nofb=1&ipt=99c29dff00dfaf670a36d296fdbbea01c3a4e6aab6652c8d3bb569dd941b9155";
  }

  getBrigades(){
    return [];
    return this.dataService.groups[2].groups.filter((x:any) => x.location==this.site.name);
  }
}
