const {
    getMessagesGroup,
    postMessagesGroup,
    postUserSet,
    getUserSet,
    postNewMessage,
    getMessageGroupParticipants,
    postNewMessageToParticipants
} = require('../controllers/messagescontroller');

function mapBulk(array, data) {
    return array.map(o => [o, data]);
}


async function getCurrentDate(){
    let date = new Date()
    let month = Number(date.getMonth() + 1) < 10 ? '0' + Number(date.getMonth() + 1) : Number(date.getMonth() + 1);
    let day = Number(date.getDate()) < 10 ? "0" + Number(date.getDate()) : date.getDate();
    let hour = Number(date.getHours()) < 10 ? "0" + date.getHours() : date.getHours();
    let minutes = Number(date.getMinutes()) < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let seconds = Number(date.getSeconds()) < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return  date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
}

async function joinOrCreateChatRoom(data) {
    try {
        const response = await getMessagesGroup(data.bd_school, data.room_id);
        if (JSON.parse(response)[0] === undefined) {
            const result = await postMessagesGroup(data.bd_school, data.room_id);
            let id = JSON.parse(result).insertId;
            await postUserSet(data.bd_school, mapBulk(data.users_id, id));
            return {room_id: id};
        } else {
            const relation_exists = await getUserSet(data.bd_school, JSON.parse(response)[0].id);
            if (JSON.parse(relation_exists).length === 0) {
                await postUserSet(data.bd_school, mapBulk(data.users_id, JSON.parse(response)[0].id));
            }
            return {room_id: JSON.parse(response)[0].id};
        }
    } catch (e) {

        throw e;
    }
}

async function sendMessageToGroupMessage(bd, data) {
    try {
        const responseMessage = await postNewMessage(bd, data);
        let id = JSON.parse(responseMessage).insertId;
        const responseParticipants = await getMessageGroupParticipants(bd, data.room_id);
        let participantsId = responseParticipants.map(o => [o.user, o.id, id]);
        const responsePost = await postNewMessageToParticipants(bd, participantsId);
        return responsePost;
    } catch (e) {
        throw e;
    }
}

async function arrayMessagesJson(messages, id_messages, data) {
    try {
        let newArray = [];
        for (let j = 0; j < messages.length; j++) {
            for (let i = 0; i < id_messages.length; i++) {
                if (id_messages[i] === messages[j].message) {
                    function findMessage(select) {
                        return Number(select.id_message) === Number(messages[j].message);
                    }

                    if (!newArray.find(findMessage)) {
                        let date = new Date(messages[i].created_at)
                        let month = Number(date.getMonth() + 1) < 10 ? '0' + Number(date.getMonth() + 1) : Number(date.getMonth() + 1);
                        let day = Number(date.getDate()) < 10 ? "0" + Number(date.getDate()) : date.getDate();
                        let hour = Number(date.getHours()) < 10 ? "0" + date.getHours() : date.getHours();
                        let minutes = Number(date.getMinutes()) < 10 ? "0" + date.getMinutes() : date.getMinutes();
                        let seconds = Number(date.getSeconds()) < 10 ? "0" + date.getSeconds() : date.getSeconds();
                        let dateMessage = date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
                        newArray.push({
                            body: messages[j].message_body,
                            name: messages[j].user_name,
                            user_id: messages[j].user,
                            id_message: messages[j].message,
                            bd_school: data.bd_school,
                            room_id: data.room_id,
                            date: dateMessage
                        });
                        messages.splice(j, 1);
                    }
                }
            }
        }
        return newArray;
    } catch (e) {
        console.log(e)
        throw e;
    }
}

module.exports = {
    joinOrCreateChatRoom,
    sendMessageToGroupMessage,
    arrayMessagesJson,
    getCurrentDate
}