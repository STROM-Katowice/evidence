import { Component } from '@angular/core';

@Component({
  selector: 'app-notfound',
  imports: [],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
    ngOnLoad(){
      setInterval( ()=>{
        fetch('/api/test').then(x => x.status==200 ? location.href="/" : 1);
      },10000);
    }
}
