const app = require('express')()
const http = require('http').createServer(app)
const bodyParser = require('body-parser')
const io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});
const {
    joinOrCreateChatRoom,
    sendMessageToGroupMessage,
    arrayMessagesJson,
    getCurrentDate
} = require('./api/chatRoomsApi')
const {getMessagesOfGroup, getMessagesOfGroupOnlyId} = require('./controllers/messagescontroller')
const MongoClient = require('mongodb').MongoClient;

const PORT = 9080
const NEW_MESSAGE_EVENT = "newChatMessage"
const JOIN_CHATROOM = "join_chat";
const LEAVE_CHATROOM = 'leave_chat';

const mongoUser = process.env.mongouser
const mongoPassword = process.env.mongopassword
const cluster = process.env.mongohost;
// const mongoUser = 'ksm-admin'
// const mongoPassword = 'iX5eIznC2Hr2wjqySDmqa9QGSGCIOhK'
// const cluster = 'cluster0.bswgp.mongodb.net';

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}))
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
    next()

})
const url = `mongodb+srv://${mongoUser}:${mongoPassword}@${cluster}/ksm?retryWrites=true&w=majority`;
const dbScoketUsersConnect = 'users_connect';
const client = new MongoClient(url, {useUnifiedTopology: true});

async function run() {
    try {
        await client.connect();
        await client.db("ksm").command({ping: 1});
        console.log("Connected successfully to server");
    } catch (e) {
        console.error('error-> ', e)
    }
}

run().catch(console.dir);

async function saveNewSocketClient(newListing) {
    try {
        const result = await client.db('ksm').collection(dbScoketUsersConnect).insertOne(newListing);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    } catch (e) {
        console.error('error-> ', e)
    }
}

async function updateSocketClient(nameOfListing, updatedListing) {
    try {
        const result = await client.db("ksm").collection(dbScoketUsersConnect)
            .updateMany({user_id: nameOfListing, status: '1'}, {$set: updatedListing});
    } catch (error) {
        console.error('error-> ', e)
    }
}

async function getListClientsOfRoom(nameOfListing) {
    try {
        var query = {room_id: nameOfListing, status: '1'};
        const response = client.db("ksm").collection(dbScoketUsersConnect)
            .find(query);
        const arreglo = await response.toArray();
        return arreglo;
    } catch (e) {
        console.error('error-> ', e)
        throw e;
    }
}

async function removeAllDocumments() {
    try {
        const result = await client.db("ksm").collection(dbScoketUsersConnect).deleteMany({});
    } catch (e) {
        console.error('error-> ', e)
    }
}

const webrtc = require("wrtc");

let senderStream = {};

function createPeer(){
    try{
        const peer = new webrtc.RTCPeerConnection({
            iceServers: [
                {urls:'stun:stun01.sipphone.com'},
                {urls:'stun:stun.ekiga.net'},
                {urls:'stun:stun.fwdnet.net'},
                {urls:'stun:stun.ideasip.com'},
                {urls:'stun:stun.iptel.org'},
                {urls:'stun:stun.rixtelecom.se'},
                {urls:'stun:stun.schlund.de'},
                {urls:'stun:stun.l.google.com:19302'},
                {urls:'stun:stun1.l.google.com:19302'},
                {urls:'stun:stun2.l.google.com:19302'},
                {urls:'stun:stun3.l.google.com:19302'},
                {urls:'stun:stun4.l.google.com:19302'},
                {urls:'stun:stunserver.org'},
                {urls:'stun:stun.softjoys.com'},
                {urls:'stun:stun.voiparound.com'},
                {urls:'stun:stun.voipbuster.com'},
                {urls:'stun:stun.voipstunt.com'},
                {urls:'stun:stun.voxgratia.org'},
                {urls:'stun:stun.xten.com'},
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    urls: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    urls: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    urls: "stun:stun2.1.google.com:19302"
                },
            ]
        });
        return peer;
    }catch (error) {
        console.log('error creation peer-> ', error);
    }
}

io.on('connection', async (socket) => {
    console.clear();
    // await removeAllDocumments();
    const {user_id} = socket.handshake.query;
    const newSocketClientActive = {
        socket_id: socket.id,
        user_id: user_id,
        status: '1',
        created_at: await getCurrentDate(),
        updated_at: await getCurrentDate(),

    };

    await saveNewSocketClient(newSocketClientActive);

    // Listen for join user
    socket.on(JOIN_CHATROOM, async (data) => {
        try {
            socket.join(data.room_id);
            await joinOrCreateChatRoom(data);
            const result = await getMessagesOfGroup(data.bd_school, data.room_id);
            const resultIDs = await getMessagesOfGroupOnlyId(data.bd_school, data.room_id);
            const dataMessages = await arrayMessagesJson(result, resultIDs, data);
            io.in(data.room_id).emit(JOIN_CHATROOM, dataMessages);
        } catch (e) {
            console.error('error-> ', e)
        }
    })

    // Listen for leave chatroom
    socket.on(LEAVE_CHATROOM, async (data) => {
        await updateSocketClient(user_id, {room_id: null});
        socket.leave(data.room_id);
    });

    // Listen for new messages
    socket.on(NEW_MESSAGE_EVENT, async (data) => {
        try {
            io.in(data.room_id).emit(NEW_MESSAGE_EVENT, data);
            await sendMessageToGroupMessage(data.bd_school, data);
        } catch (e) {

        }
    });

    // user join to video group
    socket.on("join video", async (data) => {
        await updateSocketClient(user_id, {room_id: data.room_id, puesto: data.puesto});
        const listRoom = await getListClientsOfRoom(data.room_id);
        io.in(data.room_id).emit("users in video", listRoom);
    });

    // STRUCTURE FOR MASTER CLASS
    socket.on("start_broadcast", async (body) => {
        const peer = createPeer();
        peer.ontrack = (e) => {
            try{
                senderStream[body.roomId] = e.streams[0];
            }catch (error) {
                console.log('get ontrack 171', error)
            }
        };

        const desc = new webrtc.RTCSessionDescription(body.payload.sdp);
        await peer.setRemoteDescription(desc);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        const payload = {
            sdp: peer.localDescription
        }
        io.to(body.caller).emit('response_start', payload);
    })

    socket.on('start_watch', async (body) => {
       const peer = createPeer();
        const desc = new webrtc.RTCSessionDescription(body.payload.sdp);
        await peer.setRemoteDescription(desc);
        try {
            senderStream[body.roomId].getTracks().forEach(track => peer.addTrack(track, senderStream[body.roomId]));
        } catch(error) {
            console.log('get tracks 185', error)
        }
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        const payload = {
            sdp: peer.localDescription
        }
        io.to(socket.id).emit('response_watch', payload);
    })

    socket.on('new candidate', async(data)=>{
        io.in(data.roomId).emit('new candidate', data.candidate)
    });

    socket.on('new stream', async (roomId) => {
        io.in(roomId).emit('restart');
    })

    // Leave the app kolegia if the user closes the socket
    socket.on("disconnect", async () => {
        // socket.to(broadcaster).emit("disconnectPeer", socket.id);
        await updateSocketClient(user_id, {status: '0', updated_at: await getCurrentDate()})
    });

    socket.on('close room',(roomId)=>{
        delete(senderStream[roomId]);
        // socket.leave(roomId);
    });
});


http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

