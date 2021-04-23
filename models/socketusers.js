const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SocketClient = new Schema ({
    socket_id: { type: String },
    user_id: { type: String },
    status: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date },
})

module.exports = mongoose.model('SocketClient', SocketClient)