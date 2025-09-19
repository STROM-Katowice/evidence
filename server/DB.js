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

function SQLinjection(query){
    //TODO
    return query;
}