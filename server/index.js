import ModbusRTU from "modbus-serial";
import express from "express";
import cors from 'cors';
import mysql from 'mysql';
import gis from 'async-g-i-s';
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
let slaves=await getDB();
let stamp=0;
let changed=1;
let sym=0;

    //const sites=await DB(`SELECT * FROM sites`);
    const sites=[
        {
            id: 0,
            name: "Firma",
            last: "Jan Walecki",
            we: "10:11",
            wy: "10:13"
        },
        {
            id: 1,
            name: "Zdzieszowice",
            last: "Janek Surmacz",
            we: "7:44",
            wy: "7:55"
        },
        {
            id: 2,
            name: "Koksownia Przyjaźń",
            last: "Mateusz Cyran",
            we: "13:44",
            wy: "0"
        }
    ]
try{
    await client.connectRTUBuffered("COM3", { baudRate: 9600 });
}catch(e){
    console.log("Magistala MODBUS nie podłączona prawidłowo!\nSerwer działa w trybie symulacji!");
    for(const slave of slaves) slave.status=404;
    sym=1;
}
//dtb.destroy();
x();

async function x(){
    if(sym==1) return;
    console.log("Liczba slavów w DB: "+slaves.length);
    while(1){
        await discoverNew();
        for(const slave of slaves) if(slave.status!=404) await ask(slave);
        await delay(5000);
        //cycle time measurment
    }
}

async function readInputs(id){
    return await new Promise(async resolve => {
    try{
        client.setID(id);
        const w=setTimeout(()=>{ resolve(7); }, 2000);
        let val=await client.readInputRegisters(8, 8);
        clearTimeout(w);
        resolve(val.data);
    }catch(e){
        console.log("ERROR!!!!");
        console.log(e);
        resolve(8);
    }
    });
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
    if(val==8) panic(slave);
    if(val==7){
        console.log("Timeout! Prawdopodobny brak jednego z urządzeń modbus. mID="+slave.mID);
        if(slave.status<105) slave.status++;
        else slave.status=404;
        return;
    }else{
        if(slave.status<404) slave.status--;
    }
    
    for(let i=0; i<8; i++){
        if(slave.val[i].status!=val[i]){
            if(val[i]==0 && slave.val[i].status>200){ 
                slave.val[i].stamp=Date.now();
                slave.val[i].owner=sites[slave.location].last;
            }
            slave.val[i].status=val[i]
            changed=1;
            console.log("ZMIANA! (kod 200) dla mID="+slave.mID+": "+val);
        }
    }
    return;
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
            let mID=slaves.length+1;
            if(sr.is) mID=sr.id;
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
                    status: 200,
                    x: newDevice[3],
                    y: newDevice[4],
                    model: newDevice[5],    //TYP: number, docelowo string   
                    location: 0, 
                    val: fillvals(8)     //docelowo x*y
                }
                if(!sr.is){
                    insertDB('slaves', slave);
                    slaves.push(slave);
                }
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
    for(const slave of slaves){
        if(slave.uID==uID){
            const k={
                is: true,
                id: slave.mID
            }
            slave.status=200;
            return k;
        }
    }
    return { is: false };
}

function insertDB(table, slave){
    DB(`INSERT INTO ${table} (mID, uID, width, height, x, y, model) VALUES (${slave.mID}, '${slave.uID}', ${slave.width}, ${slave.height}, ${slave.x}, ${slave.y}, '${slave.model}')`)
}

async function getDB(){
    const r=await DB(`SELECT * FROM slaves`);
    r.forEach(el => {
        el.val=fillvals(8);
        el.location=0;
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
            img: './assets/noimage.png',
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
        let k={};
        
        res.send({
            "Firma": slaves
        });
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

app.get('/qualifications', async (req, res) => {
    const qual=await DB(`SELECT * FROM qualifications`);
    res.send(qual);
});

app.get('/sites', async (req, res) => {
    res.send(sites);
});

app.get('/groups', async (req, res) => {
    const groups=await DB(`SELECT * FROM groupss`);
    res.send(groups);
});

app.post('/delete', async (req, res) => {
    console.log(req.body.id);
    const koledzy=await DB(`DELETE FROM employees WHERE id=${req.body.id}`);
    res.send({ mess: "FEGELEIN!" });
});

app.post('/newEmployee', async (req, res) => {
    const koledzy=await DB(`INSERT INTO employees (id, name, position, places, qualifications, notes, tel, img) VALUES (null, '', '', '', '', '', '', 'https://t3.ftcdn.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg')`);
    console.log(koledzy);
    res.send({ id: koledzy.insertId });
});

app.post('/employeeUpdate', async (req, res) => {
    const koledzy=await DB(`UPDATE employees SET ${req.body.field}='${req.body.val}' WHERE id=${req.body.id}`);
    res.send({ rg: "fegelein!" });
});

function selectImg(imgs){
    let possibles=[];
    for(const img of imgs){
        if(img.width<img.height*1.2 && img.width>img.height*0.8)
            possibles.push(img.url);
    }
    console.log(possibles.length);
    if(possibles.length>9) return possibles.splice(0,9);
    else if(possibles.length!=0) return possibles;
    else return ['https://en.wiktionary.org/wiki/amogus'];
}

app.post('/updateItem', async (req, res) => {
    let selected='', m='';  
    if(req.body.field=="name"){
        const imgs=await gis(req.body.val);
        selected=selectImg(imgs);
        console.log(selected);
        //m=`, img='${selected}'`;    meh
    }
    const itemki=await DB(`UPDATE items SET ${req.body.field}='${req.body.val}'${m} WHERE id=${req.body.id}`);
    console.log(itemki);
    res.send({ status: 100, img:selected });
});

app.get('/test', (req, res) => {
    res.send({ mess: "FEGELEIN!" });
    console.log("testrequest");
});

