import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-groups',
  imports: [],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent {
  
  constructor(public dataService: DataService){
  }
}
