import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-sites',
  imports: [],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.css'
})
export class SitesComponent {

  constructor(public dataService:DataService){}

  s: number=1;
}
