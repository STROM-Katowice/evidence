import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { SearchComponent } from './search/search.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [SearchComponent, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ANTYCYGAN';
  a=false;

  constructor(public dataService: DataService){}

  getYear(){
    const d=new Date();
    return d.getFullYear();
  } 
  logout(){
    localStorage.setItem("token", "0");
    location.href="http://localhost:4200";
  }
}
