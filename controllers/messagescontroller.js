'use-strict';
const {
    createMessagesGroup,
    readMessagesGroup,
    createUserSet,
    readUserSet,
    createMessage,
    readMessageGroupParticipants,
    createMessageToGroup,
    readMessagesOfGroup,
    readMessagesOfGroupOnlyId
} = require('../services/messasgesservices');

async function postMessagesGroup(bd, name){
   try {
       const result = await createMessagesGroup(bd, name);
       return result;
   }catch (e) {
       throw e;
   }
}

async function getMessagesGroup(bd, name){
    try {
        const result = await readMessagesGroup(bd, name);
        return result;
    }catch (e) {
        throw e;
    }
}


async function getUserSet(bd, id_user){
    try {
        const result = await readUserSet(bd, id_user);
        return result;
    }catch (e) {
        throw e;
    }
}

async function postUserSet(bd, users){
    try {
        const result = await createUserSet(bd, users);
        return result;
    }catch (e) {
        throw e;
    }
}

async function postNewMessage(bd, data){
    try {
        const result = await createMessage(bd, data)
        return result;
    }catch (e) {
        throw e;
    }
}

async function getMessageGroupParticipants(bd,nameGroup){
    try {
        const result = await readMessageGroupParticipants(bd, nameGroup);
        return JSON.parse(result);
    }catch (e) {
        throw e;
    }
}

async function postNewMessageToParticipants(bd, dataMessage){
    try {
        const result = await createMessageToGroup(bd, dataMessage)
        return result;
    }catch (e) {
        throw e;
    }
}

async function getMessagesOfGroup(bd, nameGpo){
    try {
        const result = await readMessagesOfGroup(bd, nameGpo);
        const messages = JSON.parse(result);
        // console.log('allMessagesOfGroup-> ',messages.filter((item, i)=>item.message === item.message));
        return messages;
    }catch (e) {
        throw e;
    }
}

async function getMessagesOfGroupOnlyId(bd, nameGpo){
    try {
        function unique(array) {
            return array.filter(function (el, index, arr) {
                return index === arr.indexOf(el);
            });
        }
        const result = await readMessagesOfGroupOnlyId(bd, nameGpo);
        const id_messages = JSON.parse(result);
        return unique(id_messages.map(o => o['id']));
    }catch (e) {
        throw e;
    }
}

module.exports = {
    postMessagesGroup,
    getMessagesGroup,
    postUserSet,
    getUserSet,
    postNewMessage,
    getMessageGroupParticipants,
    postNewMessageToParticipants,
    getMessagesOfGroup,
    getMessagesOfGroupOnlyId
}