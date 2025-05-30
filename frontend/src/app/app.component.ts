import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegalComponent } from './regal/regal.component';
import { DataService } from './data.service';
import { SearchComponent } from './search/search.component';
import { PeopleComponent } from './people/people.component';
import { EventsComponent } from './events/events.component';
import { SettingsComponent } from './settings/settings.component';
import { SitesComponent } from './sites/sites.component';

@Component({
  selector: 'app-root',
  imports: [RegalComponent, SitesComponent, SearchComponent, PeopleComponent, EventsComponent, SettingsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ANTYCYGAN';
  v=0;
  a=false;
  workhorse:any=[];
  site:any={};
  ngOnInit(){
    setTimeout(()=>{
      this.changeSite("0");
    }, 1500);  //nie usuwać set timeout
  }
  changeSite(nid:string){
    this.site=this.dataService.dataArrays.sites[nid];
    if(typeof this.dataService.stock[this.site.name]=="undefined")
      this.workhorse=[];
    else
      this.workhorse=this.dataService.stock[this.site.name];
    console.log(this.workhorse);
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
