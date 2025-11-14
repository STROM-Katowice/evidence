import express from "express";
import cors from 'cors';
import gis from 'async-g-i-s';
import WebSocket, { WebSocketServer } from 'ws';
import { slaves, changed, unchange } from './modbus.js';
import multer from 'multer';    //PODEJRZANIE DUŻE
import { createHash } from 'crypto';
import { DB } from './DB.js';
import * as tools from './export.js';

const upload = multer({
    dest: "./../frontend/public/temp"
});
let location=1;     //location id: 1-firma; do zdynamizowania

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
let tokens=[];
loadTokens();

app.use(async (req, res)=>{
    const whitelist=["/test", "/token", "/login"];
    const token = req.headers.authorization;
    console.log(tokens);
    if(tokens.includes(token) || whitelist.includes(req.url))
     req.next();
    else
     res.status(403).json({});
});

app.get('/token', async (req, res) => {
    const token = req.headers.authorization;
    if(tokens.includes(token)){
        const t=await DB(`SELECT id, position, perms, name, img, settings, status FROM employees WHERE token='${token}'`);
        res.send({ userData: t[0] });
        return;
    }
    res.status(403).json({});
});

app.post('/login', async (req, res) => {
    const hash = createHash('sha256');
    hash.update(req.body.pass);
    const hashedPassword = hash.digest('hex');
    const dat=await DB(`SELECT id, position, perms, token, name, img, settings, status FROM employees WHERE name='${req.body.login}' AND hash='${hashedPassword}'`);
    if(dat.length==1){
        const newToken=getToken();
        await DB(`UPDATE employees SET token='${newToken}' WHERE name='${req.body.login}'`)
        //if OK
        tokens.splice(tokens.indexOf(dat[0].token), 1)
        tokens.push(newToken);
        res.send( { userData: dat[0], token: newToken } );
        return;
    }
    res.status(403).json({});
});

app.get('/test', async (req, res) => {
    res.status({
        status: "ok"
    });
});

function purify(s){
    for(const a of s) if(a=="'") a="%27";
    return s;
}

function getToken(){
    let token="";
    const a=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    for(let i=0; i<32; i++){
        token+=a[Math.floor(Math.random()*16)];
        if(i==7 || i==11 || i==15 || i==19) token+='-';
    }
    return token;
}

async function loadTokens(){
    const w=await DB(`SELECT token FROM employees`);
    for(const v of w) if(v.token!='') tokens.push(v.token);
}


//socket - urządzenia na magistrali LIVE

wss.on('connection', function connection(ws) {
    let first=true;
  const int=setInterval(()=>{
    if(changed==1 || first){
        first=false;
        ws.send(JSON.stringify(slaves));
        unchange();
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
app.post("/site/upload", upload.single("file"), (req, res) => {
      const tempPath = req.file.path;
      const uuid=getToken();
      const targetPath = path.join(__dirname, "./../frontend/public/assets/"+uuid+".png");
  
      if (path.extname(req.file.originalname).toLowerCase() === ".png") {
        fs.rename(tempPath, targetPath, err => {
          if (err) return handleError(err, res);
            DB(`UPDATE sites SET img='./assets/${uuid}.png' WHERE id=${req.body.id}`);
          res
            .status(200)
            .contentType("text/plain")
            .end("File uploaded!");
        });
      } else {
        fs.unlink(tempPath, err => {
          if (err) return handleError(err, res);
  
          res
            .status(403)
            .contentType("text/plain")
            .end("Only .png files are allowed!");
        });
      }
});

app.post('/site/name', async (req, res) => {
    const resp=await DB(`UPDATE sites SET name='${req.body.name}' WHERE id=${req.body.id}`);
    console.log(resp);
    const imgs=await gis(req.body.name);
    res.send({ img: selectImg(imgs) });
});
app.post('/site/addPerms', async (req, res) => {
    const sites=await DB(`SELECT perms FROM sites WHERE id=${req.body.id}`);
    let perms=JSON.parse(sites[0].perms)
    perms.push(req.body.perms);
    const resp=await DB(`UPDATE sites SET perms='${JSON.stringify(perms)}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
});
app.post('/site/delPerms', async (req, res) => {
    let sites=JSON.parse((await DB(`SELECT perms FROM sites WHERE id=${req.body.id}`))[0].perms);
    sites.splice(sites.indexOf(req.body.perms), 1); 
    const resp=await DB(`UPDATE sites SET perms='${JSON.stringify(sites)}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
});

//obsługa typów (kategorii) grup
function funcolor(){
    const c=["#55B7D4", "#D41616", "#2ACE2A", "#FFF017", "#111153", "#FF6308", "#256618"];
    return c[Math.floor(Math.random()*c.length)];
}
const groups={};
app.post('/groupscategory/new', async (req, res) => {
    const color=funcolor();
    const groups=await DB(`INSERT INTO grups (id, name, category, members, color, priority, lider, location) VALUES (null, '', 'Nowa kategoria', '[]', '${color}', 0, '', '')`);
    res.send({
        id:groups.insertId,
        color: color
    });
});
app.post('/groupscategory/name', async (req, res) => {
    console.log("NEW: "+req.body.new+" OLD: "+req.body.old);
    const groups=await DB(`UPDATE grups SET category='${req.body.new}' WHERE category='${req.body.old}'`);
    res.send(groups);
});

//obsługa grup

app.get('/groups', async (req, res) => {
    let resp={};
    const groups=await DB(`SELECT * FROM grups`);
    for(let group of groups){
        group.members=JSON.parse(group.members);
        if(typeof resp[group.category]!="object")
            resp[group.category]=[];
        resp[group.category].push(group);
    }
    console.log(resp);
    res.send(resp);
});

app.post('/group/new', async (req, res) => {
    const color=funcolor();
    const groups=await DB(`INSERT INTO grups (id, name, category, members, color, priority, lider, location) VALUES (null, 'nowa grupa', '${req.body.category}', '[]', '${color}', 0, '', '')`);
    res.send({
        id:groups.insertId,
        color: color
    }); 
});

app.post('/group/delete', async (req, res) => {
    const r=await DB(`DELETE FROM grups WHERE id=${req.body.id}`);
    res.send({});
});
app.post('/group/color', async (req, res) => {
    const r=await DB(`UPDATE grups SET color='${req.body.color}' WHERE id=${req.body.id}`);
    res.send({});
});
app.post('/group/lider', async (req, res) => {
    const r=await DB(`UPDATE grups SET lider='${req.body.lider}' WHERE id=${req.body.id}`);
    res.send({});
});
app.post('/group/name', async (req, res) => {
    const s=await DB(`SELECT id FROM grups WHERE name='${req.body.name}'`);
    if(s.length>0) res.status(501).send({
        error: "Taka grupa już istnieje!"
    })
    const r=await DB(`UPDATE grups SET name='${req.body.name}' WHERE id=${req.body.id}`);
    res.send({});
});

app.post('/group/newMember', async (req, res) => {
    const r=await DB(`SELECT members FROM grups WHERE id=${req.body.id}`);
    let members=JSON.parse(r[0].members);
    members.push(req.body.member);
    await DB(`UPDATE grups SET members='${JSON.stringify(members)}' WHERE id=${req.body.id}`);
    res.send({});
});

app.post('/group/delMember', async (req, res) => {
    const r=await DB(`SELECT members FROM grups WHERE id=${req.body.id}`);
    let groups=JSON.parse(r[0].members)
    groups=groups.splice(groups.indexOf(req.body.member), 1)
    await DB(`UPDATE grups SET members='${JSON.stringify(groups)}' WHERE id=${req.body.id}`);
    res.send({});
});


app.post('/site/addPerms', async (req, res) => {
    const sites=await DB(`SELECT perms FROM sites WHERE id=${req.body.id}`);
    let perms=JSON.parse(sites[0].perms)
    perms.push(req.body.perms);
    const resp=await DB(`UPDATE sites SET perms='${JSON.stringify(perms)}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
});
app.post('/site/delPerms', async (req, res) => {
    let sites=JSON.parse((await DB(`SELECT perms FROM sites WHERE id=${req.body.id}`))[0].perms);
    sites.splice(sites.indexOf(req.body.perms), 1); 
    const resp=await DB(`UPDATE sites SET perms='${JSON.stringify(sites)}' WHERE id=${req.body.id}`);
    console.log(resp);
    res.send({  });
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
    const koledzy=await DB(`INSERT INTO employees (id, name, hash, token, perms, status, position, places, qualifications, notes, tel, img, settings) VALUES (null, '', '', '', '[]', 'OFFLINE', '', '', '', '', '', 'https://t3.ftcdnNewEm.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg', '')`);
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

app.post('/employee/giveAccount', async (req, res) => {
    const hash = createHash('sha256');
    hash.update(req.body.pass);
    const hashedPassword = hash.digest('hex');
    const koledzy=await DB(`UPDATE employees SET hash='${hashedPassword}' WHERE id=${req.body.id}`);
    res.send({ rg: "fegelein!" });
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

//śmieszna funkcja zwracająca obrazki z googla o tematyce podanej w argumencie
function selectImg(imgs){
    let possibles=[];
    for(const img of imgs){
        //const stringified=JSON.stringify(this.item.perms);
        //console.log(stringified);
        if(img.width<img.height*1.2 && img.width>img.height*0.8)
            possibles.push(img.url);
    }
    console.log(possibles.length);
    if(possibles.length>8) return possibles.splice(0,8);
    else if(possibles.length!=0) return possibles;
    else return ['https://en.wiktionary.org/wiki/amogus'];
}