import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { SearchComponent } from './search/search.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [SearchComponent, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ANTYCYGAN';
  v=0;
  s=0;
  a=false;

  constructor(public dataService: DataService){}

  goto(url:string){
    location.href=url;
  }
  getYear(){
    const d=new Date();
    return d.getFullYear();
  } 
  
}
