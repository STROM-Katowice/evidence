import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  constructor(public dataService: DataService){}

  results:any=[];
  i:number=0;
  search(quote:string){
    console.log("SEARCHQUOTE: "+quote);
    this.results=this.dataService.items.filter((x:any) => x.name.includes(quote) || x.owner.includes(quote) /* || x.date.includes(quote) - zrobić kiedyś*/ );
    this.i=0;
    const id=this.results[this.i].id;
    location.href=`#item${id}`;

    //bajpas
    eval(`document.getElementById("item"+${id}).style.borderColor="red";`);
  }
}
