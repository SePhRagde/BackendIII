import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { createTestUser, createTestPet, setupTestDB } from './helpers/test.helper.js';
import User from '../src/models/user.model.js';
import Pet from '../src/dao/models/Pet.js';
import Adoption from '../src/dao/models/Adoption.js';

describe('Adoption Router Tests', function () {
    this.timeout(10000); // 10 seconds

    // Setup test database
    setupTestDB();

    let adminToken;
    let userToken;
    let adminId;
    let userId;
    let petId;

    beforeEach(async () => {
        // Create admin user
        const admin = await createTestUser({
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin'
        });
        adminId = admin._id;

        // Create regular user
        const user = await createTestUser({
            first_name: 'Regular',
            last_name: 'User',
            email: 'user@test.com',
            password: 'user123',
            role: 'user'
        });
        userId = user._id;

        // Create test pet
        const pet = await createTestPet({
            name: 'Test Pet',
            specie: 'dog',
            breed: 'Labrador',
            age: 2,
            adopted: false
        });
        petId = pet._id;

        // Get tokens
        const adminLogin = await request(app)
            .post('/api/sessions/login')
            .send({ email: 'admin@test.com', password: 'admin123' });
        adminToken = adminLogin.body.token;

        const userLogin = await request(app)
            .post('/api/sessions/login')
            .send({ email: 'user@test.com', password: 'user123' });
        userToken = userLogin.body.token;
    });

    afterEach(async () => {
        // Clean up test data
        await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
        await Pet.deleteMany({ name: 'Test Pet' });
        await Adoption.deleteMany({});
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        it('should create an adoption request', async () => {
            const res = await request(app)
                .post(`/api/adoptions/${userId}/${petId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Pet adopted');
        });

        it('should not allow adoption of already adopted pet', async () => {
            // Set the pet as adopted before the test
            await Pet.findByIdAndUpdate(petId, { adopted: true });

            const res = await request(app)
                .post(`/api/adoptions/${userId}/${petId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Pet is already adopted');
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post(`/api/adoptions/${userId}/${petId}`);

            expect(res.status).to.equal(401);
        });

        it('should validate user exists', async () => {
            const fakeUserId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/adoptions/${fakeUserId}/${petId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('user Not found');
        });

        it('should validate pet exists', async () => {
            const fakePetId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/adoptions/${userId}/${fakePetId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Pet not found');
        });
    });

    describe('GET /api/adoptions', () => {
        it('should get all adoptions for admin', async () => {
            const res = await request(app)
                .get('/api/adoptions')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array');
        });

        it('should get user adoptions for regular user', async () => {
            const res = await request(app)
                .get('/api/adoptions')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload.every(adoption => 
                adoption.user.toString() === userId.toString()
            )).to.be.true;
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/adoptions');

            expect(res.status).to.equal(401);
        });
    });

    describe('PUT /api/adoptions/:aid', () => {
        it('should allow admin to update adoption status', async () => {
            // First create an adoption
            const adoption = await Adoption.create({
                pet: petId,
                user: userId,
                status: 'pending'
            });

            const res = await request(app)
                .put(`/api/adoptions/${adoption._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved' });

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Adoption status updated');
        });

        it('should not allow regular users to update adoption status', async () => {
            const adoption = await Adoption.create({
                pet: petId,
                user: userId,
                status: 'pending'
            });

            const res = await request(app)
                .put(`/api/adoptions/${adoption._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'approved' });

            expect(res.status).to.equal(403);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Not authorized');
        });

        it('should validate adoption exists', async () => {
            const fakeAdoptionId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/adoptions/${fakeAdoptionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved' });

            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Adoption not found');
        });
    });
}); 