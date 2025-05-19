import mongoose from 'mongoose';
import { TEST_CONFIG } from '../config/test.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const setupTestDB = () => {
    // Connect to test database before all tests
    beforeAll(async () => {
        await mongoose.connect(TEST_CONFIG.TEST_DB_URL);
    });

    // Clear all test data after each test
    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    });

    // Disconnect from test database after all tests
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });
};

export const createTestUser = async (User, userData = TEST_CONFIG.TEST_USER) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
        ...userData,
        password: hashedPassword
    });
    return user;
};

export const createTestAdmin = async (User) => {
    return createTestUser(User, TEST_CONFIG.TEST_ADMIN);
};

export const createTestPet = async (Pet, petData = TEST_CONFIG.TEST_PET) => {
    return await Pet.create(petData);
};

export const generateTestToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
};

export const getTestHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
}); 