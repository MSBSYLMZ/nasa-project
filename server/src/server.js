const http = require('http');
require('dotenv').config();
const clog = require('./helpers/clog')
const app = require('./app.js')

const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model.js');
const { loadLaunchesData } = require('./models/launches.model')

const PORT = process.env.PORT || 8000

async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    const server = http.createServer(app)
    server.listen(PORT, ()=>{
        clog.success(`Listenin on port ${PORT}...`)
    })
}

startServer();

