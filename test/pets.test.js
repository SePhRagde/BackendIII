import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import Pet from '../src/models/pet.model.js';
import User from '../src/models/user.model.js';
import { setupTestDB, createTestUser, createTestAdmin, createTestPet, generateTestToken, getTestHeaders } from '../src/utils/test.helper.js';

describe('Pets Router Tests', () => {
    setupTestDB();

    describe('GET /api/pets', () => {
        it('should return all pets', async () => {
            const pet1 = await createTestPet(Pet);
            const pet2 = await createTestPet(Pet, {
                ...pet1,
                name: 'Another Pet'
            });
            
            const res = await request(app).get('/api/pets');
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload).to.have.lengthOf(2);
        });

        it('should filter pets by species', async () => {
            const dog = await createTestPet(Pet, { species: 'dog' });
            const cat = await createTestPet(Pet, { species: 'cat' });
            
            const res = await request(app)
                .get('/api/pets')
                .query({ species: 'dog' });
            
            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(1);
            expect(res.body.payload[0].species).to.equal('dog');
        });
    });

    describe('POST /api/pets', () => {
        it('should create pet for admin', async () => {
            const admin = await createTestAdmin(User);
            const token = generateTestToken(admin);
            const petData = {
                name: 'New Pet',
                species: 'dog',
                breed: 'Labrador',
                age: 2,
                description: 'A new pet'
            };
            
            const res = await request(app)
                .post('/api/pets')
                .set(getTestHeaders(token))
                .send(petData);
            
            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload.name).to.equal(petData.name);
        });

        it('should return 403 for non-admin users', async () => {
            const user = await createTestUser(User);
            const token = generateTestToken(user);
            const petData = {
                name: 'New Pet',
                species: 'dog',
                breed: 'Labrador',
                age: 2
            };
            
            const res = await request(app)
                .post('/api/pets')
                .set(getTestHeaders(token))
                .send(petData);
            
            expect(res.status).to.equal(403);
        });
    });

    describe('PUT /api/pets/:pid', () => {
        it('should update pet for admin', async () => {
            const admin = await createTestAdmin(User);
            const pet = await createTestPet(Pet);
            const token = generateTestToken(admin);
            const updateData = { name: 'Updated Pet' };
            
            const res = await request(app)
                .put(`/api/pets/${pet._id}`)
                .set(getTestHeaders(token))
                .send(updateData);
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload.name).to.equal(updateData.name);
        });

        it('should return 403 for non-admin users', async () => {
            const user = await createTestUser(User);
            const pet = await createTestPet(Pet);
            const token = generateTestToken(user);
            
            const res = await request(app)
                .put(`/api/pets/${pet._id}`)
                .set(getTestHeaders(token))
                .send({ name: 'Updated Pet' });
            
            expect(res.status).to.equal(403);
        });
    });

    describe('DELETE /api/pets/:pid', () => {
        it('should delete pet for admin', async () => {
            const admin = await createTestAdmin(User);
            const pet = await createTestPet(Pet);
            const token = generateTestToken(admin);
            
            const res = await request(app)
                .delete(`/api/pets/${pet._id}`)
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            
            const deletedPet = await Pet.findById(pet._id);
            expect(deletedPet).to.be.null;
        });

        it('should return 403 for non-admin users', async () => {
            const user = await createTestUser(User);
            const pet = await createTestPet(Pet);
            const token = generateTestToken(user);
            
            const res = await request(app)
                .delete(`/api/pets/${pet._id}`)
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(403);
        });
    });
}); 