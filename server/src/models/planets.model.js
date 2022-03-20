const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const clog = require('../helpers/clog');

const planets = require('./planets.mongo');

const exceptDataFromPlanets = {
    '_id':0,
    '__v':0
}

function isHabitablePlanet(planet){
    return planet['koi_disposition'] === 'CONFIRMED' 
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
   return new Promise((resolve, reject)=>{
    fs.createReadStream(path.join(__dirname,'../../data/kepler_data.csv'))
    .pipe(parse({
        comment: '#',
        columns: true,
    }))
    .on('data', async (data)=>{
        if(isHabitablePlanet(data)){
            savePlanet(data);
    }})
    .on('error',(err)=>{
        console.log('Ooops! ')
        reject(err);
    })
    .on('end',async()=>{
        const countPlanetsFound = (await getAllPlanets()).length
        console.log(countPlanetsFound,' planets are habitable');
    })
    resolve()
   }) 
}

async function getAllPlanets(){
    return await planets.find({},exceptDataFromPlanets);
}

async function savePlanet(planet){
    try {
        await planets.updateOne({
            keplerName:planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch (error) {
        clog.error(`Could not save planet ${error}`);
    }
}

module.exports ={
    loadPlanetsData,
    getAllPlanets
}
    