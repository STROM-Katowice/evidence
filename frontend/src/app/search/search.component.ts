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
    const url=this.dataService.getRoute();
    console.log("SEARCHQUOTE: "+quote+"; ROUTE: "+url);
    if(url=="/" || url=="/storage"){
      if(this.dataService.items.length==0) return;
      this.results=this.dataService.items.filter((x:any) => x.name.includes(quote) || x.owner.includes(quote) /* || x.date.includes(quote) - zrobić kiedyś*/ );
      this.i=0;
      const id=this.results[this.i].id;
      eval(`document.getElementById("item"+${id}).style.borderColor="red";`);
      location.href=`#item${id}`;
    }else if(url=="/pracownicy"){

     // if(this.dataService.items.length!=0) this.results=this.dataService.items.filter((x:any) => x.name.includes(quote) || x.owner.includes(quote) /* || x.date.includes(quote) - zrobić kiedyś*/ );
    }else if(url=="/grupy"){

    }else if(url=="/ustawienia"){

    }else{
      alert("BŁĄD: url niekompatybilny z wywołaną funkcją");
    }

    //bajpas
  }
}
