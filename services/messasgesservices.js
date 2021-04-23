'use strict'
const DB = require('../config/Configdbsql.js');


const createMessagesGroup = async (bd, nameSet) => {
    const db = new DB(bd);
    const connection = db.getConnection();

    return new Promise(async (resolve, reject) => {
        connection.query('INSERT INTO messages_groups SET ?', {name: nameSet, status: 1}, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    })
}

const readMessagesGroup = async (bd, nameSet) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        connection.query('SELECT *, name FROM messages_groups WHERE name = ?', nameSet, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

const readUserSet = async (bd, id_group) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const queryString = "SELECT * FROM users_messages_groups WHERE message_group=?";
        const filter = [id_group];
        connection.query(queryString, filter, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

const createUserSet = async (bd, users) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO users_messages_groups (user, message_group) VALUES ?";
        // const values = ;
        connection.query(sql, [users], (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

const createMessage = async (bd, data) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const values = {
            message_body: data.body,
            user: data.user_id,
            belongs: null
        };
        connection.query('INSERT INTO messages_dos SET ?', values, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

const readMessageGroupParticipants = async (bd, nameGroup) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const queryString = "SELECT users_messages_groups.id, users_messages_groups.user FROM messages_groups LEFT JOIN users_messages_groups ON users_messages_groups.message_group = messages_groups.id WHERE name=?";
        const filter = [nameGroup];
        connection.query(queryString, filter, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

const createMessageToGroup = async (bd, dataMessage) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO messages_recipient (user, user_message_group, message) VALUES ?";
        connection.query(sql, [dataMessage], (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

const readMessagesOfGroup = async (bd, nameGroup) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const queryString = `SELECT users.name      user_name,
                                    users.puesto    user_puesto,
                                    umg.id,
                                    umg.user,
                                    mr.user,
                                    mr.user_message_group,
                                    mr.message,
                                    md.*
                             FROM messages_dos md
                                      INNER JOIN messages_recipient mr on md.id = mr.message
                                      INNER JOIN users_messages_groups umg on mr.user_message_group = umg.id
                                      INNER JOIN messages_groups mg on umg.message_group = mg.id
                                      INNER JOIN users on md.user = users.id
                             where mg.name = ?`;
        const filter = [nameGroup];
        connection.query(queryString, filter, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}
const readMessagesOfGroupOnlyId = async (bd, nameGroup) => {
    const db = new DB(bd);
    const connection = db.getConnection();
    return new Promise((resolve, reject) => {
        const queryString = `SELECT
                                 md.id
                             FROM messages_dos md
                                      INNER JOIN messages_recipient mr on md.id = mr.message
                                      INNER JOIN users_messages_groups umg on mr.user_message_group = umg.id
                                      INNER JOIN messages_groups mg on umg.message_group = mg.id
                                      INNER JOIN users on md.user = users.id
                             where mg.name = ?`;
        const filter = [nameGroup];
        connection.query(queryString, filter, (error, results, fields) => {
            connection.end();
            if (error) reject(error);
            resolve(JSON.stringify(results));
        });
    });
}

module.exports = {
    createMessagesGroup,
    readMessagesGroup,
    readUserSet,
    createUserSet,
    createMessage,
    readMessageGroupParticipants,
    createMessageToGroup,
    readMessagesOfGroup,
    readMessagesOfGroupOnlyId
}