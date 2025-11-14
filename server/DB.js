import mysql from 'mysql';
import pass from './pass.json' with {type: 'json'};

const dtb = mysql.createPool(pass.database);
export async function DB(query){
    query=SQLinjection(query);
    if(query=="!") return { error: "SQL INJECTION DETECTED" };
    const resp=await new Promise((resolve, reject) => {
        dtb.query(query, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });       
    });
    return resp;     
}
for(let i=0; i<3; i++){
    for(let j=1; j<=8; j++){
        DB(`INSERT INTO items (id, slaveID, pos, name, img, perms, stamp, owner, absence, tag) VALUES (null, ${306+i}, ${j}, '---', './assets/noimage.png', '["Jan Surmacz"]', 0, '', 7, null)`)
    }
}

function SQLinjection(query){
    //TODO
    return query;
}
