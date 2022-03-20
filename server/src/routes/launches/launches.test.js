const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => { 
    beforeAll( async () => {
        await mongoConnect()
    });

    afterAll(async()=>{
        await mongoDisconnect(); 
    });

    describe('Test Get /launches', () => {
        test('It should respond with 200 success',async ()=>{
            // const response = await request(app).get('/launches').expect(200);
            const response = await request(app).get('/v1/launches').expect('Content-Type',/json/).expect(200);
            // expect(response.statusCode).toBe(200);
        })
    });
    
    describe('Test POST /launch', () => {
        const completeLaunchData = {
            mission:'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 4, 2028'
        }
    
        const launcDataWithoutDate = {
            mission:'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f'
        }
    
        const launchDataWithInvalidDate= {
                ...completeLaunchData,
                launchDate: 'Not a date'
        }
        
    
        test('It should respond with 201 created', async()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type',/json/)
            .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
    
            expect(requestDate).toBe(responseDate);
            expect(response.body).toMatchObject(launcDataWithoutDate)
        })
    
        test('should catch missing required properties', async() => { 
            const response = await request(app)
                .post('/v1/launches')
                .send(launcDataWithoutDate)
                .expect('Content-Type',/json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            });
            
         })
        test('should catch invalid dates', async() => { 
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type',/json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            });
         })
    });
 })



