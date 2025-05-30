import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(){
    this.start();
  }

  account: any={
    id: 100,
    name: "Deweloper",
    img: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.sWgbnrrkMBnmDlzYVZ77rgHaEk%26pid%3DApi&f=1&ipt=b6057ac77a8fdc448c3dfe5cab075b6e7187a9692057957712742ebfce4f7681&ipo=images'
  };
  dataArrays: any={qualifications:[], sites:[], groups:[]};
  groups=[{
    id:0,
    priority:0,
    name: 'mnhbhuj',
    color: '#654765'
  }];
  settings={
    multiobject: false,
    ilustrator: true
  };
  stamp: number=0;
  stock: any = [
    
  ];
  edit: boolean=false;
  toEdit:any={};

  regaly: any=[
    {
      id: 234545,
      height: 2000,
      width: 1000,
      x: 1,
      y: 8,
      model: "xxx69",
    }
  ]
  employees: any=[ {} ];

  start(){
    this.update();
    this.getEmployees();
    this.pulldata();
    setInterval(() => { this.update() }, 10000);
  }

  async pulldata(){
    for(let el in this.dataArrays){
      const res=await fetch('http://localhost:3000/'+el);
      if(res.status==200){
        this.dataArrays[el]=await res.json();;
      }else{
        console.log("Błąd HTTP "+res.status+"!!!!");
      }
    }
    console.log(this.dataArrays.sites);
  }

  async update(){
    const res=await fetch('http://localhost:3000/busData?stamp='+this.stamp)
    if(res.status!=304){
      const items=await res.json();
      if(this.edit) this.toEdit.stock=items;
      else this.stock=items;
      console.log("STOCK:");
      console.log(items);
      this.stamp=Math.floor(Date.now()/1000);
    }else{
      console.log("Kod 304 :)");
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

  async addNew(thing: string){
    const r=await fetch('http://localhost:3000/new'+thing, {
      method: "POST",
      body: JSON.stringify({})
    });
    if(r.status==200){  //TODO: !!!
      const k=await r.json();
      this.employees.push({ id: k.id, img: './assets/amogus.png' });
    }else{
      console.log("ERROR! "+r.status);
    }
  }

  getBlockStock(id: number){
    return this.stock[id-1].val;
  }
  
}
