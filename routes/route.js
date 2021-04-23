'use-strict'

const {Router} = require('express');

const {createMessageGroup, getMessageGroup} = require('../controllers/messagescontroller');

const router = Router();
router.get('/', (req,res)=>{
    res.status(200).send("Ok");
})
router.post('/create/new/set', createMessageGroup)
router.get('/get/set/:name', getMessageGroup)