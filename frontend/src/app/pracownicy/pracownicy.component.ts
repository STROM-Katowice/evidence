import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { PeopleComponent } from '../people/people.component';

@Component({
  selector: 'app-pracownicy',
  imports: [ PeopleComponent ],
  templateUrl: './pracownicy.component.html',
  styleUrl: './pracownicy.component.css'
})
export class PracownicyComponent {
    constructor(public dataService:DataService){}
}
