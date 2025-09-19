import { createBluetooth } from 'node-ble';
const  { bluetooth } = createBluetooth()
const adapter = await bluetooth.defaultAdapter()

if (! await adapter.isDiscovering())
  await adapter.startDiscovery()

const b=setInterval(()=>{
  adapter.devices().then(x => isStrom(x));
  //clearInterval(b);
}, 5000);

/*const known=[
  "98:3D:AE:43:C7:D6" //ESP32 ORYGINAŁ
];*/
const originals=await fetch('strom.')
export let tags=[];

async function isStrom(btDevices){
  let tempTags=[];
  for(let device of btDevices){
    if(known.includes(device)){
      device=await adapter.getDevice(device);
      const signal=(100+(await device.getRSSI()))*2;
      const broadcast=await device.getName()+' ';
      const tag={
        address: await device.getAddress(),
        name: broadcast.slice(0, -4),
        signal: signal>100 ? 100+'%' : signal+'%',    //wacky
        battery: broadcast.slice(-4, -1)+'%'
      }
      tempTags.push(tag);
    }
  }
  tags=tempTags;
  console.clear();
  console.log("Aktualnie widziane tagi: ");
  console.log(tags);
}
