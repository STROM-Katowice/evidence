import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static stock: any;

  constructor(){
    this.start();
  }

  token=localStorage.getItem("token");
  account: any={
    id: 100,
    name: "Deweloper",
    img: 'https://static.vecteezy.com/system/resources/previews/022/285/875/original/letter-e-pink-alphabet-glossy-png.png'
  };
  groups=[
    {
      name: "brygady",
      groups: [      
        {
          id:0,
          name: 'Kola-Meszna',
          color: '#654765',
          members: ["Kola", "Damian"]
        },
        {
          id:1,
          name: 'Janek-Firma',
          color: '#FF3433',
          members: ["Janek", "Mateusz"]
        }
      ]
    },
    {
      name: "administracja",
      groups: [      
        {
          id:0,
          name: 'Kierownicy',
          color: '#009844',
          members: ["Jan Walecki", "Mateusz W."]
        },
        {
          id:1,
          name: 'Sekretariat',
          color: '#17EE11',
          members: ["Ola", "Pani Ewa"]
        }
      ]
    },
    {
      name: "SEP",
      groups: [      
        {
          id:0,
          name: '1kV',
          color: '#6FF1F5',
          members: ["Kola", "Paweł"]
        },
        {
          id:1,
          name: '30kV',
          color: '#0000F3',
          members: ["Janek", "Mateusz C."]
        }
      ]
    }];
  settings={
    multiobject: false,
    ilustrator: true
  };
  stamp: number=0;
  stock: any=[];
  items: any=[];
  sites: any=[];

  edit: boolean=false;
  toEdit:any={};

  employees: any=[ {} ];

  _HEADERS={
    authorization: this.token
  }
  _GET={
    method: "GET",
    Headers: this._HEADERS
  }
  
  async start(){
    const token=localStorage.getItem("token");
    const res=await fetch('http://localhost:3000/login', this._GET)
    if(res.status!=200){
      this.token="";
    }
    this.update();
    this.groups=await this.pulldata("groups");
    this.items=await this.pulldata("items");
    this.employees=await this.pulldata("pracownicy");
    this.sites=await this.pulldata("sites");
  }

  async pulldata(type:string){
    console.log(type+": ");
    const res=await fetch('http://localhost:3000/'+type, this._GET);
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
    const socket = new WebSocket('ws://localhost:8080');
    const x=this;
    socket.onmessage = function(event){
      const data=JSON.parse(event.data);
      if(!x.edit) x.stock=data;
      console.log("STOCK:");
      console.log(x.stock);
    };
  }

  async updateDB(values:string, thing:string, subthing:string){
    const r=await fetch('http://localhost:3000/update', {
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
    const res=await fetch('http://localhost:3000/pracownicy')
    if(res.status==200){
      this.employees=await res.json();
      console.log(this.employees);
    }else{
      console.log("Kod "+res.status+"!!!!");
    }
  }

  async addNew(thing: string, type:string){
    const r=await fetch('http://localhost:3000/new', {
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

  getBlockStock(id: number){
    return this.stock[id-1].val;
  }
  
}
