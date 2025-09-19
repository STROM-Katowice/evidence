import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static stock: any;

  constructor(private router:  Router){
    this.authorize();
  }
  url="";
  token=localStorage.getItem("token");
  account: any={};
  remote='/api/';

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

  _HEADERS:any={
    'authorization': this.token==null ? "" : this.token,
    'Content-Type' : 'application/json'
  }
  _GET={
    "method": "GET",
    "headers": this._HEADERS
  }
  
  async authorize(){
    const res=await fetch(this.remote+'token', this._GET);
    if(res.status==500 || res.status==404){
      this.router.navigate(['/notfound']);
    }else if(res.status!=200){
      this.token="";
      console.log("Brak autoryzacji");
      this.router.navigate(['/login']);
      return;
    }else{
      this.router.navigate(['/']);
    }
    console.log(res.status);
    const data=await res.json();
    console.log(data);
    this.account=data.userData;
    this.account.perms=JSON.parse(this.account.perms);
    console.log(this.account);
    this.start();
  }

  async start(){
    this.update();
    this.groups=await this.pulldata("groups");
    this.items=await this.pulldata("items");
    for( let item of this.items ) item.perms=JSON.parse(item.perms);
    this.employees=await this.pulldata("pracownicy");
    /*for( let prs of this.employees ){
      prs.groups=JSON.parse(prs.groups);
      for(let gr of prs.groups) this.groups
    }*/
    this.sites=await this.pulldata("sites");
    for( let site of this.sites ) site.perms=JSON.parse(site.perms);
  }

  
  async login(login:string, pass:string){
    const sus={
      login: login,
      pass: pass
    };
    const r=await fetch(this.remote+'login', {
      method: "POST",
      headers: this._HEADERS,
      body: JSON.stringify(sus)
    });
    if(r.status==200){
      const k=await r.json();
      this.account=k.userData;
      localStorage.setItem("token", k.token);
      console.log(localStorage.getItem("token"));
      this.token=k.token;
      this._GET.headers.authorization=k.token;
      console.log("USERDATA:");
      console.log(k);
      this.router.navigate(['/']);
      this.start();
    }else{
      console.log("ERROR! (LOGOWANIE)"+r.status);
    }
  }


  async pulldata(type:string){
    console.log(type+": ");
    const res=await fetch(this.remote+type, this._GET);
    if(res.status==200){
      let ret=await res.json();
      if(typeof ret=="object" && 0) ret=[];  //TODO do poprawki
      console.log(ret);
      return ret;
    }else{
      console.log("Błąd HTTP "+res.status+"!!!!");
      return {};
    }
  }


  update(){
    const socket = new WebSocket('/socket');
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
      headers: this._HEADERS,
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

  route(url:string){
    this.router.navigate([url]);
  }

  getRoute(){
    return this.router.url;
  }
  
}
