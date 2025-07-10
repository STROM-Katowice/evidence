import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegalComponent } from './regal/regal.component';
import { DataService } from './data.service';
import { SearchComponent } from './search/search.component';
import { PeopleComponent } from './people/people.component';
import { EventsComponent } from './events/events.component';
import { SettingsComponent } from './settings/settings.component';
import { SitesComponent } from './sites/sites.component';
import { GroupsComponent } from './groups/groups.component';
import { QualsComponent } from './quals/quals.component';
import { DetailsComponent } from './details/details.component';

@Component({
  selector: 'app-root',
  imports: [RegalComponent, SitesComponent, SearchComponent, PeopleComponent, EventsComponent, SettingsComponent, GroupsComponent, DetailsComponent, QualsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ANTYCYGAN';
  v=0;
  a=false;
  site:any={};
  ngOnInit(){
    setTimeout(()=>{
      this.changeSite("0");
    }, 2000);  //nie usuwać set timeout
  }
  changeSite(nid:string){
    this.site=this.dataService.sites[nid];
    this.site.img="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.iberion.media%2Fimages%2F1920%2FSciolka_z_szyszek_1_0e34932cb8.png&f=1&nofb=1&ipt=99c29dff00dfaf670a36d296fdbbea01c3a4e6aab6652c8d3bb569dd941b9155";
  }

  gtfo(){
    location.href='http://strom.katowice.pl';
  }
  getYear(){
    const d=new Date();
    return d.getFullYear();
  } 
  
  constructor(public dataService: DataService){}
}
