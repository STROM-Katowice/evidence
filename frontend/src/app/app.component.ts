import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegalComponent } from './regal/regal.component';
import { DataService } from './data.service';
import { SearchComponent } from './search/search.component';
import { PeopleComponent } from './people/people.component';
import { EventsComponent } from './events/events.component';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-root',
  imports: [RegalComponent, SearchComponent, PeopleComponent, EventsComponent, SettingsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ANTYCYGAN';
  v=0;
  a=false;

  gtfo(){
    location.href='https://strom.katowice.pl';
  }
  getYear(){
    const d=new Date();
    return d.getFullYear();
  } 
  async addNew(){
    const r=await fetch('http://localhost:3000/newEmployee', {
      method: "POST",
      body: JSON.stringify({})
    });
    if(r.status==200){  //TODO: !!!
      const k=await r.json();
      this.dataService.employees.push({ id: k.id, img: './assets/amogus.png' });
    }else{
      console.log("ERROR! "+r.status);
    }
  }
  constructor(public dataService: DataService){}
}
