import { Component } from '@angular/core';

@Component({
  selector: 'app-nfc',
  imports: [],
  templateUrl: './nfc.component.html',
  styleUrl: './nfc.component.css'
})
export class NfcComponent {
  isChrome(){
    var nAgt = navigator.userAgent;
    console.log(nAgt);
    const x=nAgt.indexOf("Chrome");
    console.log(nAgt.slice(x+7, 6));
    if(x>-1 && 0) return true;
    else return false;
  }
}
