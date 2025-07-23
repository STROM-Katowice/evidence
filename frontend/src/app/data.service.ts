import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static stock: any;

  constructor(){
    this.start();
  }
  private router = inject(Router);

  token=localStorage.getItem("token");
  remote='http://localhost:3000/';
  account: any={
    id: 100,
    name: "Deweloper",
    img: 'https://static.vecteezy.com/system/resources/previews/022/285/875/original/letter-e-pink-alphabet-glossy-png.png'
  };
  settings={
    multiobject: false,
    ilustrator: true
  };
  stamp: number=0;
  stock: any=[];
  items: any=[];
  sites: any=[];
  groups: any=[];

  edit: boolean=false;
  toEdit:number=1;

  employees: any=[ {} ];

  _HEADERS={
    'Authorization': `${this.token}`,
    'Content-Type' : 'application/json'
  }
  _GET={
    "method": "GET",
    "headers": this._HEADERS
  }
  
  async start(){
    const res=await fetch(this.remote+'test', this._GET);
    if(res.status!=200){
      this.token="";
      console.log("Brak autoryzacji");
      this.router.navigate(['/login']);
      return;
    }
    this.update();
    this.groups=await this.pulldata("groups");
    this.items=await this.pulldata("items");
    for( let item of this.items ) item.perms=JSON.parse(item.perms);
    this.employees=await this.pulldata("pracownicy");
    this.sites=await this.pulldata("sites");
  }

  async pulldata(type:string){
    console.log(type+": ");
    const res=await fetch(this.remote+type, this._GET);
    if(res.status==200){
      const ret=await res.json();
      console.log(ret);
      return ret;
    }else{
      console.log("Błąd HTTP "+res.status+"!!!!");
      return {};
    }
  }


  update(){
    const socket = new WebSocket('ws://192.168.1.112:8080');
    const x=this;
    socket.onmessage = function(event){
      const data=JSON.parse(event.data);
      if(!x.edit) x.stock=data;
      console.log("STOCK:");
      console.log(x.stock);
    };
  }

  async updateDB(values:string, thing:string, subthing:string){
    const r=await fetch(this.remote+'update', {
      method: "POST",
      body: JSON.stringify({
        thing: thing,
        value: values
      })
    });
    if(r.status==200){
      const k=await r.json();
      console.log(k);
    }else{
      console.log("ERROR! "+r.status);
    }
  }

  async getEmployees(){
    const res=await fetch(this.remote+'pracownicy')
    if(res.status==200){
      this.employees=await res.json();
      console.log(this.employees);
    }else{
      console.log("Kod "+res.status+"!!!!");
    }
  }

  async addNew(thing: string, type:string){
    const r=await fetch(this.remote+'new', {
      method: "POST",
      body: JSON.stringify({
        thing: thing,
        type: type
      })
    });
    if(r.status==200){
      return true;
    }else{
      console.log("ERROR! "+r.status);
      return false;
    }
  }

  async addNewEmployee(){
    const r=await fetch(this.remote+'employee/new', {
      method: "POST",
      body: JSON.stringify({})
    });
    if(r.status==200){
      this.employees.push({
        id: (await r.json()).id,
        name: '',
        position: '',
        places: '',
        qualifications: '',
        notes: '',
        tel: '',
        img: 'https://t3.ftcdn.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg'
      });
      return true;
    }else{
      console.log("ERROR! "+r.status);
      return false;
    }
  }

  getBlockStock(id: number){
    return this.stock[id-1].val;
  }
  
}
