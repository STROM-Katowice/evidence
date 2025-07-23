import ModbusRTU from "modbus-serial";
import mysql from 'mysql';
import pass from './pass.json' with {type: 'json'};

const client = new ModbusRTU();

let location=1;     //location id: 1-firma
export let slaves=[];
export let changed=1;
let sym=0;

const dtb = mysql.createPool(pass.database);
async function DB(query){
    const resp=await new Promise((resolve, reject) => {
        dtb.query(query, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });       
    });
    return resp;     
}
    
try{
    await client.connectRTUBuffered("/tty/USB0", { baudRate: 9600 });
}catch(e){
    console.log("Magistala MODBUS nie podłączona prawidłowo!\nSerwer działa w trybie symulacji!");
    for(const slave of slaves) slave.status=404;
    sym=1;
}

//start
x();
async function x(){
    slaves==await getSlaves(location);
    if(sym>0) return;
    console.log("Liczba slavów w DB: "+slaves.length);
    let time=0;
    while(1){
        time=Date.now();
        await discoverNew();
        for(const slave of slaves){
            if(slave.status!=405 || time%50==0){ 
                await ask(slave);
                await delay(250);
            }
        }
        const t=Date.now()-time;
        const x=3000-t;
        if(x>0) await delay(x);
        else console.log("Długi czas pętli! t="+t+"ms")
    }
}

async function readInputs(id){
    return await new Promise(async resolve => {
    try{
        client.setID(id);
        const w=setTimeout(()=>{ resolve(7); }, 1200);
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

async function ask(slave){
    const val=await readInputs(slave.mID);
    if(val==8) panic(slave);
    if(val==7){
        console.log("Timeout! mID="+slave.mID);
        slave.disfunctions++;
        if(slave.disfunctions>3) {
            slave.status=404;
            //changed=1;
        }
        if(slave.disfunctions>12) slave.status=405;
        return;
    }else{
        slave.status=100;       //TODO: wymyślić coś lepszegoz
        //changed=1;
    }
    
    for(let i=0; i<8; i++){
        if(slave.val[i]!=val[i]){
            if(val[i]==0 ){                                     //BAJPAS, ZMIENIĆ
                DB(`UPDATE items SET stamp=${Date.now()/1000}, owner="JAN SURMACZ" WHERE slaveID=${slave.uID} AND pos=${i+1}`);
            }
            slave.val[i]=val[i];
            changed=1;
        }
    }
    //updateDB('slaves', slave.id, val);
    return;
}

async function workaround() {
    return await new Promise(async resolve => {
        try{
            const w=setTimeout(()=>{ resolve(null); }, 450);
            let val=await client.readInputRegisters(0, 6);
            clearTimeout(w);
            resolve(val.data);
        }catch(e){
            console.log("ERROR!!!!");
            console.log(e);
            resolve(null);
        }
        });
}

async function discoverNew(){
    try {
        client.setID(127);
        const newDevice=await workaround()
        if(newDevice==null) return;
            const sr=isRegisterd(newDevice[0]);
            let mID=slaves[slaves.length-1].mID+1;
            if(sr.is) mID=sr.id;
            console.log("New slave detected. Unique id="+newDevice[0]+"\nAttempting to assign modbus id="+mID);
            await client.writeRegisters(6, [mID , newDevice[0]]);
            await delay(250);
            client.setID(mID);
            const confirmation=await client.readInputRegisters(6, 1);
            if(confirmation.data[0]==1){
                console.log("CONFIRMED CORRECT ADDR")
                const slave={
                    mID: mID,
                    uID: newDevice[0],
                    status: 200,
                    disfunctions: 0,
                    model: newDevice[5],    //TYP: number, docelowo string   
                    location: 1,        //SUS
                    val: [0,0,0,0,0,0,0,0]     //docelowo x*y, uID zamiast mID
                }
                if(!sr.is){
                    insertDB('slaves', slave);
                    slaves.push(slave);
                }
                discoverNew();
            }else{  //PANIC
                console.log("Błąd podczas uzgadniania adresu modbus urządzenia "+newDevice[0]);
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
    DB(`INSERT INTO ${table} (mID, uID, lID, pos, model) VALUES (${slave.mID}, ${slave.uID}, ${1}, ${0}, '${slave.model}')`);
    for(let i=0; i<8; i++){ 
        DB(`INSERT INTO items (id, slaveID, pos, name, img, perms, stamp, owner, absence, tag) VALUES (null, ${slave.uID}, ${i+1}, '---', './assets/noimage.png', '["Jan Surmacz"]', 0, '', 7, null)`);
    }
}

async function getSlaves(location){
    const r=await DB(`SELECT * FROM slaves WHERE lID=${location}`);
    for(const el of r){
        el.status=100;
        el.disfunctions=0;
        el.val=[0,0,0,0,0,0,0,0];
    };
    return r;
}

export function unchange(){ change=0 }