import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import app from '../../app.js';
import User from '../../dao/models/User.js';
import Pet from '../../dao/models/Pet.js';
import Adoption from '../../dao/models/Adoption.js';
import { setupTestDB, createTestUser, createTestPet } from '../../../test/helpers/test.helper.js';

describe('Adoption Router', function() {
  this.timeout(10000); // 10 seconds timeout

  setupTestDB();

  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let petId: string;
  let adoptionId: string;

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Adoption.deleteMany({});

    // Create admin user
    const admin = await createTestUser({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin'
    });
    adminId = admin._id.toString();

    // Create regular user
    const user = await createTestUser({
      first_name: 'Regular',
      last_name: 'User',
      email: 'user@test.com',
      password: 'User123!',
      role: 'user'
    });
    userId = user._id.toString();

    // Create test pet
    const pet = await createTestPet({
      name: 'Test Pet',
      specie: 'Dog',
      breed: 'Labrador',
      age: 2,
      adopted: false
    });
    petId = pet._id.toString();

    // Get tokens
    const adminLogin = await request(app as Express)
      .post('/api/sessions/login')
      .send({ email: 'admin@test.com', password: 'Admin123!' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app as Express)
      .post('/api/sessions/login')
      .send({ email: 'user@test.com', password: 'User123!' });
    userToken = userLogin.body.token;
  });

  describe('POST /api/adoptions/:uid/:pid', () => {
    it('should create a new adoption request', async () => {
      const response = await request(app as Express)
        .post(`/api/adoptions/${userId}/${petId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.equal('Pet adopted');
    });

    it('should return 400 if pet is already adopted', async () => {
      // First adopt the pet
      await request(app as Express)
        .post(`/api/adoptions/${userId}/${petId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Try to adopt again
      const response = await request(app as Express)
        .post(`/api/adoptions/${userId}/${petId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Pet is already adopted');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app as Express)
        .post(`/api/adoptions/${userId}/${petId}`);

      expect(response.status).to.equal(401);
    });

    it('should return 404 if user not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const response = await request(app as Express)
        .post(`/api/adoptions/${fakeUserId}/${petId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('user Not found');
    });

    it('should return 404 if pet not found', async () => {
      const fakePetId = new mongoose.Types.ObjectId().toString();
      const response = await request(app as Express)
        .post(`/api/adoptions/${userId}/${fakePetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Pet not found');
    });
  });

  describe('GET /api/adoptions', () => {
    beforeEach(async () => {
      // Create multiple adoption requests
      await Adoption.create([
        {
          pet: petId,
          owner: userId,
          status: 'pending'
        },
        {
          pet: petId,
          owner: userId,
          status: 'approved'
        }
      ]);
    });

    it('should get all adoptions for admin', async () => {
      const response = await request(app as Express)
        .get('/api/adoptions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload.length).to.be.greaterThan(0);
    });

    it('should get only user\'s adoptions for regular user', async () => {
      const response = await request(app as Express)
        .get('/api/adoptions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload.every((adoption: any) => 
        adoption.owner.toString() === userId
      )).to.be.true;
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app as Express)
        .get('/api/adoptions');

      expect(response.status).to.equal(401);
    });
  });

  describe('PUT /api/adoptions/:aid', () => {
    beforeEach(async () => {
      const adoption = await Adoption.create({
        pet: petId,
        owner: userId,
        status: 'pending'
      });
      adoptionId = adoption._id.toString();
    });

    it('should update adoption status for admin', async () => {
      const response = await request(app as Express)
        .put(`/api/adoptions/${adoptionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.equal('Adoption status updated');
    });

    it('should return 403 if user tries to update status', async () => {
      const response = await request(app as Express)
        .put(`/api/adoptions/${adoptionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'approved' });

      expect(response.status).to.equal(403);
      expect(response.body.status).to.equal('error');
      expect(response.body.message).to.equal('Not authorized');
    });

    it('should return 404 for non-existent adoption', async () => {
      const response = await request(app as Express)
        .put(`/api/adoptions/${new mongoose.Types.ObjectId().toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.message).to.equal('Adoption not found');
    });
  });
}); 