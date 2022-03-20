const mongoose = require('mongoose');
const clog = require('../helpers/clog');
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;


mongoose.connection.once('open', ()=>{
    clog.success('MongoDB connection ready!');
})

mongoose.connection.on('error', (err)=>{
    clog.error(err)
})

async function mongoConnect(){
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}