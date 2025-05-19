import { expect } from 'chai';
import request from 'supertest';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import app from '../src/app.js';
import { setupTestDB, createTestUser, testUser, getTestHeaders, setupTestUploadDirs } from './helpers/test.helper.js';

describe('File Upload', function () {
    this.timeout(10000);
    setupTestDB();
    const testUploadDir = setupTestUploadDirs();

    let token;
    let userId;
    let testFiles = [];

    beforeEach(async () => {
        const user = await createTestUser();
        userId = user._id;
        const res = await request(app)
            .post('/api/sessions/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });
        token = res.body.token;
    });

    afterEach(() => {
        // Clean up test files
        testFiles.forEach(file => {
            try {
                unlinkSync(file);
            } catch (error) {
                console.error(`Error removing test file ${file}:`, error);
            }
        });
        testFiles = [];
    });

    describe('POST /api/users/:uid/documents', () => {
        it('should upload user documents', async () => {
            // Create a test PDF file
            const testFile = join(testUploadDir, 'documents', 'test.pdf');
            writeFileSync(testFile, 'Test PDF content');
            testFiles.push(testFile);

            const res = await request(app)
                .post(`/api/users/${userId}/documents`)
                .set('Authorization', `Bearer ${token}`)
                .attach('documents', testFile);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Documents uploaded successfully');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload[0]).to.have.property('name');
            expect(res.body.payload[0]).to.have.property('reference');
        });

        it('should not upload files without authentication', async () => {
            const testFile = join(testUploadDir, 'documents', 'test.pdf');
            writeFileSync(testFile, 'Test PDF content');
            testFiles.push(testFile);

            const res = await request(app)
                .post(`/api/users/${userId}/documents`)
                .attach('documents', testFile);

            expect(res.status).to.equal(401);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('UNAUTHORIZED');
        });

        it('should not upload invalid file types', async () => {
            // Create a test file with invalid extension
            const testFile = join(testUploadDir, 'documents', 'test.exe');
            writeFileSync(testFile, 'Test executable content');
            testFiles.push(testFile);

            const res = await request(app)
                .post(`/api/users/${userId}/documents`)
                .set('Authorization', `Bearer ${token}`)
                .attach('documents', testFile);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('INVALID_FILE_TYPE');
        });

        it('should not upload files for another user', async () => {
            // Create another user
            const otherUser = await createTestUser({
                ...testUser,
                email: 'other@example.com'
            });

            const testFile = join(testUploadDir, 'documents', 'test.pdf');
            writeFileSync(testFile, 'Test PDF content');
            testFiles.push(testFile);

            const res = await request(app)
                .post(`/api/users/${otherUser._id}/documents`)
                .set('Authorization', `Bearer ${token}`)
                .attach('documents', testFile);

            expect(res.status).to.equal(403);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('UNAUTHORIZED');
        });

        it('should not upload files larger than 5MB', async () => {
            // Create a large test file
            const testFile = join(testUploadDir, 'documents', 'large.pdf');
            const largeContent = Buffer.alloc(6 * 1024 * 1024); // 6MB
            writeFileSync(testFile, largeContent);
            testFiles.push(testFile);

            const res = await request(app)
                .post(`/api/users/${userId}/documents`)
                .set('Authorization', `Bearer ${token}`)
                .attach('documents', testFile);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.code).to.equal('FILE_SIZE_LIMIT_EXCEEDED');
        });
    });
}); 