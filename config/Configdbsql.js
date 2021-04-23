'use strict';
const mysql = require('mysql');

class Database {
    constructor(bd){
        this.credentials = {
            host: sanitizeString(process.env.mysqlhost) || 'localhost',
            user: process.env.mysqluser || 'root',
            password: process.env.mysqlpassword || '',
            database: bd
            // host: 'rds-ce.c1hnfbjzhh1u.us-east-1.rds.amazonaws.com',
            // user: 'root',
            // password: 'iX5eIznC2Hr2wjqySDmqa9QGSGCIOhK',
            // database: bd
        }
    }

    getConnection(){
        return mysql.createConnection(this.credentials);
    }
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
}

module.exports = Database;