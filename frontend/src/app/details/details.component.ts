import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {

  constructor(public dataService: DataService){
  }
}
