import ModbusRTU from "modbus-serial";
import express from "express";
import cors from 'cors';
import mysql from 'mysql';
import auth from './auth.json' with {type: 'json'};

const dtb = mysql.createPool(auth.database);

async function DB(query){
    const resp=await new Promise((resolve, reject) => {
        dtb.query(query, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });       
    });
    return resp;     
}

const client = new ModbusRTU();
const app = express();
let slaves=[];
let stamp=0;
let changed=1;
let sym=0;
try{
    await client.connectRTUBuffered("COM8", { baudRate: 9600 });
}catch(e){
    console.log("Magistala MODBUS nie podłączona prawidłowo!\nSerwer działa w trybie symulacji!");
    sym=1;
}
slaves=await getDB();
//dtb.destroy();
x();

async function x(){
    if(sym!=1){
    while(1){
        await discoverNew();
        slaves.forEach(async slave => { await ask(slave); });
        await delay(3000);
        //cycle time measurment
    }
    }
}

async function readInputs(id){
    try{
        client.setID(id);
        let val =  await client.readInputRegisters(8, 8);
        return val.data;
    }catch(e){
        console.log("ERROR!!!!");
        console.log(e);
    }
    return;
}

async function delay(time){
    await new Promise(resolve => setTimeout(resolve, time));
}

/*
REJESTRY:
0 - uID
1 - szer. w mm
2 - wys. w mm
3 - szer w polkach
4 - wys. w polkach
5 - model
6 - modbusADDR - nadawane przez serwer // błędy jeśli udało się nadać adres modbus 
7 - uID-S - addres walidacyjny nadawany przez serwer // 1 jeśli  pomyślnie nadano adres // rezerwa
8:31 - rejestry wejściowe
*/


function panic(){
    console.log("UEXPECTED ERROR!!! SHUTDOWN!");
    process.exit(0);
}

function updateDB(table, crit, val){
    console.log("UPDATE DB WITH VALUES: "+val);
}

async function ask(slave){
    const val=await readInputs(slave.mID);
    if(val=="ERROR") panic(slave);
    for(let i=0; i<8; i++){
        if(slave.val[i].status!=val[i]){
            if(val[i]==0 && slave.val[i].status!=100){ 
                slave.val[i].stamp=Date.now();
                slave.val[i].owner="Janek";
            }
            slave.val[i].status=val[i]
            changed=1;
        }
    }
    if(!changed) console.log("code 304 :)");
    else console.log("code 200 ->");
    //updateDB('slaves', slave.id, val);

}

async function checkout(){
    for(let i=1; i<126; i++){
        client.setID(i);
        await client.readInputRegisters(0, 6);
    }
}

async function discoverNew(){
    try {
        client.setID(127);
        let r=null;
        client.readInputRegisters(0, 6).then(k => r=k);
        await delay(1000);
        if(r!=null){
            const newDevice=r.data;
            const sr=isRegisterd(newDevice[0]);
            if(sr.is) mID=sr.id;
            else mID=slaves.length+1;
            console.log("New slave detected. Unique id="+newDevice[0]+"\nAttempting to assign modbus id="+mID);
            await client.writeRegisters(6, [mID , newDevice[0]]);
            await delay(500);
            client.setID(mID);
            const confirmation=await client.readInputRegisters(6, 1);
            if(confirmation.data[0]==1){
                console.log("CONFIRMED CORRECT ADDR")
                const slave={
                    mID: mID,
                    uID: newDevice[0],
                    height: newDevice[2],
                    width: newDevice[1],
                    x: newDevice[3],
                    y: newDevice[4],
                    model: newDevice[5],    //TYP: number, docelowo string    
                    val: fillvals(8)     //docelowo x*y
                }
                slaves.push(slave);
                insertDB('slaves', slave);
                discoverNew();
            }else{  //PANIC
                console.log("Błąd podczas uzgadniania adresu modbus urządzenia "+newDevice[0]);
            }
        }
    }catch(e){
        console.log("DISCOVER:");
        console.log(e);
    }

}

function isRegisterd(uID){
    slaves.forEach(el => {
        if(el.uID==uID){
            const k={
                is: true,
                id: el.mID
            }
            return k;
        }
    });
    return { is: false };
}

function insertDB(table, slave){
    DB(`INSERT INTO ${table} (mID, uID, width, height, x, y, model) VALUES (${slave.mID}, '${slave.uID}', ${slave.width}, ${slave.height}, ${slave.x}, ${slave.y}, '${slave.model}')`)
}

async function getDB(){
    const r=await DB(`SELECT * FROM slaves`);
    r.forEach(el => {
        el.val=fillvals(8);
        el.status=100;
    });
    return r;
}

function fillvals(){
    let vals=[];
    const delta=1;    //docelowo baza
    for(let i=0; i<8; i++){
        vals[i]={
            id: i+delta,
            status: 100,
            img: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.wikia.nocookie.net%2Famogus%2Fimages%2Fc%2Fcb%2FSusremaster.png%2Frevision%2Flatest%3Fcb%3D20210806124552&f=1&nofb=1&ipt=5f6710b222ea645b17ee7ecaa4faa535b96f44e6e28a2f012a212ac133fce8b5&ipo=images',
            name: '-',
            owner: '-----',
            stamp: Date.now()
        }
    }
    return vals;
}

// API SERVER

const port = process.env.PORT || 3000; // Use the port provided by the host or default to 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.use(cors());
app.use(express.json())

app.get('/busData', (req, res) => {
    if(changed==1 || req.query.stamp!=Math.floor(stamp/1000)){
        console.log(req.query.stamp);
        console.log(Math.floor(stamp/1000));
        res.send(slaves);
        stamp=Date.now();
        changed=0;
    }else{
        res.status(304).end();
    }
});

app.get('/pracownicy', async (req, res) => {
    const koledzy=await DB(`SELECT * FROM employees`);
    res.send(koledzy);
});

app.post('/delete', async (req, res) => {
    console.log(req.body.id);
    const koledzy=await DB(`DELETE FROM employees WHERE id=${req.body.id}`);
    res.send({ mess: "FEGELEIN!" });
});

app.post('/newEmployee', async (req, res) => {
    const koledzy=await DB(`INSERT INTO employees (id, name, position, places, qualifications, notes, tel, img) VALUES (null, '', '', '', '', '', '', './assets/amogus.png')`);
    console.log(koledzy);
    res.send({ id: koledzy.insertId });
});

app.post('/employeeUpdate', async (req, res) => {
    const koledzy=await DB(`UPDATE employees SET ${req.body.field}='${req.body.val}' WHERE id=${req.body.id}`);
    res.send({ rg: "fegelein!" });
});

app.get('/test', (req, res) => {
    res.send({ mess: "FEGELEIN!" });
    console.log("testrequest");
});

