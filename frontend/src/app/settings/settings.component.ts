import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  constructor(public dataService: DataService ){}
  s=0;
  console(x:any){
    console.log(x);
  }
}
