import { SerialPort } from 'serialport';
import { DB } from './DB.js';
import { doesInclude } from './export.js';
const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoOpen: false,
});
const conv="ABCDEF";
const location=1;
port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message)
  }

  // Because there's no callback to write, write errors will be emitted on the port:
  port.write('main screen turn on')
})

  // Switches the port into "flowing mode"
  port.on('data', async function (data) {
    let id="", i=2;
    console.log(data);
    const d=data.toString('hex');
    while(i<data.length*2-4){
        const r=d[i]+d[i+1];
        if(r!="20"){
            if(r-30<10) id=id+(r-30);
            else id=id+conv[r-41];
        }else id=id+":";
        i+=2;
    }
    if(id=="00:00:00:00") return;
    console.log('Data:', id);
    const res=await DB(`SELECT id, name FROM employees WHERE idCard='${id}'`);
    if(res.length==1){
        const res2=await DB(`SELECT perms FROM sites WHERE id=${location}`);
        const perms=JSON.parse(res2[0].perms);
        if(perms.include(res[0].name) || doesInclude()){ //ZMIENIĆ NA ID!!!
            opendoor();
            const date=new Date().toLocaleString();            
            console.log(date);
            const res3=await DB(`UPDATE sites SET last='${res[0].id}', we='${date}' FROM sites WHERE id=${location}`);
        }else{
            alarm();
        }
    }else incorrect();
  });

  function incorrect(){
    console.log("Brak takiej karty w systemie");
  }
  
