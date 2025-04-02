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
  stamp: number=0;
  stock: any = [
    {
      id: 19343435,
      status: 1,
      img: 'assets/cat.png',
      name: 'Kicia',
      owner: 'Janek',
      stamp: 320483209, 
      position: 2144

    }
    ,{
      id: 3,
      status: 1,
      img: 'assets/cat.png',
      name: 'Kicia',
      owner: 'Janek',
      stamp: 320483209
    },{
      id: 4,
      status: 1,
      img: 'assets/cat.png',
      name: 'Kicia',
      owner: 'Janek',
      stamp: 320483209
    },{
      id: 5,
      status: 0,
      img: 'assets/cat.png',
      name: 'Kicia',
      owner: 'Janek',
      stamp: 320483209
    },{
      id: 6,
      status: 1,
      img: 'assets/cat.png',
      name: 'wino',
      owner: 'Stasiu',
      stamp: 320483209
    },{
      id: 7,
      status: 0,
      img: 'assets/cat.png',
      name: 'Kicia',
      owner: 'Janek',
      stamp: 320483209
    },{
      id: 8,
      status: 1,
      img: 'assets/cat.png',
      name: 'Bomba',
      owner: 'Abdul',
      stamp: 320483209
    },{
      id: 9,
      status: 1,
      img: 'assets/cat.png',
      name: 'Wiertarka',
      owner: 'Anatol',
      stamp: 320483209
    }
  ];

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
    setInterval(() => { this.update() }, 10000);
  }

  async update(){
    const res=await fetch('http://localhost:3000/busData?stamp='+this.stamp)
    if(res.status!=304){
      const items=await res.json();
      console.log(items);
      this.stock=items;
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

  getBlockStock(id: number){
    return this.stock[id-1].val;
  }
  
}
