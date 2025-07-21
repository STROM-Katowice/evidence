import express from "express";
import cors from 'cors';
import mysql from 'mysql';
import gis from 'async-g-i-s';
import pass from './pass.json' with {type: 'json'};
import WebSocket, { WebSocketServer } from 'ws';
import { slaves, changed } from './modbushandling.js'

let location=1;     //location id: 1-firma; do zdynamizowania

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

// API SERVER

const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the host or default to 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ port: 8080 });

//obsługa kont, autoryzacji i zabezpieczeń przed atakami SQLinjection, RCE
let tokens=["balls"]
const whitelist=["/", "/test", "/qualifications", "/login", "/rejestr"]
app.use(async (req, res)=>{
    const token = req.headers.authorization;
    if(tokens.includes(token) || whitelist.includes(req.url)) return req.next();
    else res.status(403).json({});
});


function purify(s){
    for(const a of s) if(a=="'") a="%27";
    return s;
}


//socket - urządzenia na magistrali LIVE

wss.on('connection', function connection(ws) {
    let first=true;
  const int=setInterval(()=>{
    if(changed==1 || first){
        first=false;
        ws.send(JSON.stringify(slaves));
        changed=0;
    }
  },500);
  ws.on('message', function incoming(message) {
    // Handle incoming message
  });

  ws.on('close', function() {
    clearInterval(int);
  });
});

//obsługa lokalizacji (obiektów)

app.get('/sites', async (req, res) => {
    const sites=await DB(`SELECT * FROM sites`);
    res.send(sites);
});

//obsługa typów (kategorii) grup
const groups={};
app.post('/groupcategory/new', async (req, res) => {
    //const groups=await DB(`CREATE TABLE `);
    res.send(groups);
});
app.post('/groupcategory/delete', async (req, res) => {
    //const groups=await DB(`INSERT INTO groupss ()`);
    res.send(groups);
});
app.post('/groupcategory/name', async (req, res) => {
    //const groups=await DB(`INSERT INTO groupss ()`);
    res.send(groups);
});

//obsługa grup

app.get('/groups', async (req, res) => {
    //const groups=await DB(`SELECT * FROM groupss`);
    res.send(groups);
});

app.post('/new', async (req, res) => {
    let query;
    switch(req.body.thing){
        case "groups":
            query=`INSERT INTO groups (id, section, name, color, priority, members) VALUES (null, '${req.body.type}', '', '#000000', 0, '[]')`;
            break;
        default:
            res.send({ error: "Wrong tablename" });
            break;
    }
    const newrecord=await DB(query);
    console.log(newrecord);
    res.send({ id: newrecord.insertId });
});


//obsługa pracowników

app.get('/pracownicy', async (req, res) => {
    const koledzy=await DB(`SELECT * FROM employees`);
    res.send(koledzy);
});

app.post('/employee/update', async (req, res) => {
    if(req.body.id==1){
        res.send({ error: "NIEDOZWOLONE!" });
        return;
    }
    const koledzy=await DB(`UPDATE employees SET ${req.body.field}='${req.body.val}' WHERE id=${req.body.id}`);
    res.send({ rg: "fegelein!" });
});

app.post('/employee/new', async (req, res) => {
    const koledzy=await DB(`INSERT INTO employees (id, name, position, places, qualifications, notes, tel, img) VALUES (null, '', '', '', '', '', '', 'https://t3.ftcdn.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg')`);
    console.log(koledzy);
    res.send({ id: koledzy.insertId });
});

app.post('/employee/delete', async (req, res) => {
    if(req.body.id==1){
        res.send({ error: "NIEDOZWOLONE!" });
        return;
    }
    const koledzy=await DB(`DELETE FROM employees WHERE id=${req.body.id}`);
    res.send({ mess: "FEGELEIN!" });
});

//obsługa przedmiotów

app.get('/items', async (req, res) => {
    const items=await DB(`SELECT * FROM items WHERE slaveID IN (SELECT uID FROM slaves WHERE lID=${location})`);
    res.send(items);
});

app.post('/item/img', async (req, res) => {
    req.body.newUrl
    console.log(req.body.newUrl);
    const resp=await DB(`UPDATE items SET img='${purify(req.body.newUrl)}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
});
app.post('/item/name', async (req, res) => {
    const resp=await DB(`UPDATE items SET name='${req.body.name}' WHERE id=${req.body.id}`);
    console.log(resp);
    const imgs=await gis(req.body.name);
    res.send({ img: selectImg(imgs) });
});
app.post('/item/pos', async (req, res) => {
    const resp=await DB(`UPDATE items SET slaveID=${req.body.slave}, pos=${req.body.pos}, WHERE id=${id}`);
    console.log(resp);
    res.send({  });
});
app.post('/item/perms', async (req, res) => {
    const resp=await DB(`UPDATE items SET perms='${req.body.perms}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
});
app.post('/item/absence', async (req, res) => {
    const resp=await DB(`UPDATE items SET absence='${req.body.absence}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
});
app.post('/item/status', async (req, res) => {
    //const resp=await DB(`UPDATE items SET absence='${req.body.absence}' WHERE id=${req.body.id}`);
    //console.log(resp);
    //ASSUME OK;
    res.send({  });
});

//inne:

//kwalifikacje (SEP, UDT itp)
app.get('/qualifications', async (req, res) => {
    const qual=await DB(`SELECT * FROM qualifications`);
    res.send(qual);
});

//testowanie połączenia
app.get('/test', async (req, res) => {
    res.send({ 
        result: "Test successfull!!!"
    });
});

//śmieszna funkcja zwracająca obrazki z googla o tematyce podanej w argumencie
function selectImg(imgs){
    let possibles=[];
    for(const img of imgs){
        const stringified=JSON.stringify(this.item.perms);
        console.log(stringified);
        if(img.width<img.height*1.2 && img.width>img.height*0.8)
            possibles.push(img.url);
    }
    console.log(possibles.length);
    if(possibles.length>8) return possibles.splice(0,8);
    else if(possibles.length!=0) return possibles;
    else return ['https://en.wiktionary.org/wiki/amogus'];
}