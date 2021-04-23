const mongoose = require('mongoose')
const socketusers = require('../models/socketusers')
const SocketClient = mongoose.model('SocketClient')

const deleteAllSocketUsers=async()=>{
    try {
        return await SocketClient.remove({});
    }catch (e) {
        
    }
}