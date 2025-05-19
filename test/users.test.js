import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import { setupTestDB, createTestUser, createTestAdmin, generateTestToken, getTestHeaders } from '../src/utils/test.helper.js';

describe('Users Router Tests', () => {
    setupTestDB();

    describe('GET /api/users', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/users');
            expect(res.status).to.equal(401);
        });

        it('should return users list for admin', async () => {
            const admin = await createTestAdmin(User);
            const token = generateTestToken(admin);
            
            const res = await request(app)
                .get('/api/users')
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array');
        });

        it('should return 403 for non-admin users', async () => {
            const user = await createTestUser(User);
            const token = generateTestToken(user);
            
            const res = await request(app)
                .get('/api/users')
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(403);
        });
    });

    describe('GET /api/users/:uid', () => {
        it('should return user details for admin', async () => {
            const admin = await createTestAdmin(User);
            const user = await createTestUser(User);
            const token = generateTestToken(admin);
            
            const res = await request(app)
                .get(`/api/users/${user._id}`)
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload.email).to.equal(user.email);
        });

        it('should return 403 if user tries to access other user details', async () => {
            const user1 = await createTestUser(User);
            const user2 = await createTestUser(User, {
                ...user1,
                email: 'other@example.com'
            });
            const token = generateTestToken(user1);
            
            const res = await request(app)
                .get(`/api/users/${user2._id}`)
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(403);
        });
    });

    describe('PUT /api/users/:uid', () => {
        it('should update user details for admin', async () => {
            const admin = await createTestAdmin(User);
            const user = await createTestUser(User);
            const token = generateTestToken(admin);
            const updateData = { first_name: 'Updated' };
            
            const res = await request(app)
                .put(`/api/users/${user._id}`)
                .set(getTestHeaders(token))
                .send(updateData);
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload.first_name).to.equal(updateData.first_name);
        });

        it('should allow users to update their own details', async () => {
            const user = await createTestUser(User);
            const token = generateTestToken(user);
            const updateData = { first_name: 'Self-Updated' };
            
            const res = await request(app)
                .put(`/api/users/${user._id}`)
                .set(getTestHeaders(token))
                .send(updateData);
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload.first_name).to.equal(updateData.first_name);
        });
    });

    describe('DELETE /api/users/:uid', () => {
        it('should delete user for admin', async () => {
            const admin = await createTestAdmin(User);
            const user = await createTestUser(User);
            const token = generateTestToken(admin);
            
            const res = await request(app)
                .delete(`/api/users/${user._id}`)
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            
            const deletedUser = await User.findById(user._id);
            expect(deletedUser).to.be.null;
        });

        it('should return 403 if user tries to delete other user', async () => {
            const user1 = await createTestUser(User);
            const user2 = await createTestUser(User, {
                ...user1,
                email: 'other@example.com'
            });
            const token = generateTestToken(user1);
            
            const res = await request(app)
                .delete(`/api/users/${user2._id}`)
                .set(getTestHeaders(token));
            
            expect(res.status).to.equal(403);
        });
    });
}); 