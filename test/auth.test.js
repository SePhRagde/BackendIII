import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, createTestUser, testUser, testAdmin } from './helpers/test.helper.js';

describe('Authentication', function () {
    this.timeout(10000);
    setupTestDB();

    describe('POST /api/sessions/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/sessions/register')
                .send(testUser);

            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('User registered successfully');
        });

        it('should not register a user with existing email', async () => {
            await createTestUser();

            const res = await request(app)
                .post('/api/sessions/register')
                .send(testUser);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('USER_ALREADY_EXISTS');
        });
    });

    describe('POST /api/sessions/login', () => {
        beforeEach(async () => {
            await createTestUser();
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.token).to.be.a('string');
        });

        it('should not login with invalid password', async () => {
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.status).to.equal(401);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('INVALID_CREDENTIALS');
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                });

            expect(res.status).to.equal(401);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('INVALID_CREDENTIALS');
        });
    });

    describe('GET /api/sessions/current', () => {
        let token;

        beforeEach(async () => {
            const user = await createTestUser();
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            token = res.body.token;
        });

        it('should get current user info with valid token', async () => {
            const res = await request(app)
                .get('/api/sessions/current')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('email', testUser.email);
            expect(res.body.payload).to.not.have.property('password');
        });

        it('should not get current user info without token', async () => {
            const res = await request(app)
                .get('/api/sessions/current');

            expect(res.status).to.equal(401);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('UNAUTHORIZED');
        });

        it('should not get current user info with invalid token', async () => {
            const res = await request(app)
                .get('/api/sessions/current')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).to.equal(401);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('INVALID_TOKEN');
        });
    });

    describe('POST /api/sessions/logout', () => {
        let token;

        beforeEach(async () => {
            const user = await createTestUser();
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            token = res.body.token;
        });

        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/sessions/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Logout successful');
        });

        it('should not logout without token', async () => {
            const res = await request(app)
                .post('/api/sessions/logout');

            expect(res.status).to.equal(401);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('UNAUTHORIZED');
        });
    });
}); 