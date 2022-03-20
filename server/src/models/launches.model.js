const axios = require('axios')
const clog = require('../helpers/clog');
const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER  = 100;
const exceptDataFromLaunches = {
    '_id':0,
    '__v':0
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches(){
    clog.info('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL,{
        query:{},
        options:{
            pagination:false,
            populate:[
                {
                    path:"rocket",
                    select:{
                        name:1
                    }
                },
                {
                    path: "payloads",
                    select:{
                        customers:1
                    }
                }
            ]
        }
    });

    if(response.status !== 200){
        clog.error('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload)=>{
            return payload['customers'];
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }

        clog.info(`${launch.flightNumber} ${launch.mission} `) 
        await saveLaunch(launch)
    }

}

async function loadLaunchesData(){
    const firstLaunch = await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission: 'FalconSat'
    })

    if(firstLaunch){
        clog.info('Launch data already loaded');
    }else{
        await populateLaunches()
    }
}

async function findLaunch(filter){
    return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId){
    return await findLaunch({flightNumber:launchId});
}

async function getLatestFlightNumber(){
    const latestLaunch = await launches
    .findOne()
    .sort('-flightNumber');

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip,limit){
    return await launches.find({},exceptDataFromLaunches)
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch){
    await launches.findOneAndUpdate({
        flightNumber:launch.flightNumber     
    },
    launch,
    {
        upsert:true
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    if(!planet){
        throw new Error('There is no matching planet')
    }
    const newFlightNumber =await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber:newFlightNumber,
        customer: ['Zero To Mastery, NASA'],
        upcoming:true,
        success: true
    })

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId){
    const aborted = await  launches.updateOne({
        flightNumber:launchId
    },{
        upcoming: false,
        success: false
    });

    return aborted.acknowledged ===  true && aborted.modifiedCount === 1 ;
}



module.exports = {
    loadLaunchesData,
    scheduleNewLaunch,
    abortLaunchById,
    existsLaunchWithId,
    getAllLaunches
}
