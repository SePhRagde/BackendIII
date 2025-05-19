import mongoose from 'mongoose';
import User from '../../src/models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import { mkdirSync, rmSync, existsSync } from 'fs';

// Test database configuration
const TEST_DB_URI = process.env.MONGO_URI || 'mongodb+srv://sephragde:PE0UxxhjVGZZJ5Ie@finalbackendi.gujqk.mongodb.net/test?retryWrites=true&w=majority&appName=FinalBackendI';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test user data
export const testUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
};

export const testAdmin = {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
};

// Setup test database
export const setupTestDB = () => {
    before(async () => {
        try {
            console.log('Connecting to test database...');
            await mongoose.connect(TEST_DB_URI);
            console.log('Connected to test database successfully');
        } catch (error) {
            console.error('Error connecting to test database:', error);
            throw error;
        }
    });

    after(async () => {
        try {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            console.log('Test database cleaned and connection closed');
        } catch (error) {
            console.error('Error cleaning test database:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await User.deleteMany({});
            console.log('Test users cleaned');
        } catch (error) {
            console.error('Error cleaning test users:', error);
            throw error;
        }
    });
};

// Create test user
export const createTestUser = async (userData = testUser) => {
    console.log('Creating test user with data:', userData);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log('Hashed password:', hashedPassword);
    const user = await User.create({
        ...userData,
        password: hashedPassword
    });
    console.log('User created:', user);
    return user;
};

// Generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Generate test headers
export const getTestHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
});

// Setup test upload directories
export const setupTestUploadDirs = () => {
    const testUploadDir = join(process.cwd(), 'test-uploads');
    const dirs = ['documents', 'pets'];

    before(() => {
        // Clean up any existing test upload directory
        if (existsSync(testUploadDir)) {
            rmSync(testUploadDir, { recursive: true, force: true });
        }

        // Create fresh directories
        dirs.forEach(dir => {
            try {
                mkdirSync(join(testUploadDir, dir), { recursive: true });
            } catch (error) {
                console.error(`Error creating ${dir} directory:`, error);
                throw error;
            }
        });
    });

    afterEach(() => {
        // Clean up files after each test
        dirs.forEach(dir => {
            const dirPath = join(testUploadDir, dir);
            if (existsSync(dirPath)) {
                rmSync(dirPath, { recursive: true, force: true });
                mkdirSync(dirPath, { recursive: true });
            }
        });
    });

    after(() => {
        // Clean up the entire test upload directory
        if (existsSync(testUploadDir)) {
            rmSync(testUploadDir, { recursive: true, force: true });
        }
    });

    return testUploadDir;
};

// Create test pet
export const createTestPet = async (petData) => {
    console.log('Starting createTestPet with data:', petData);
    try {
        const Pet = (await import('../../src/dao/models/Pet.js')).default;
        console.log('Pet model imported successfully');
        const pet = await Pet.create(petData);
        console.log('Pet created successfully:', pet);
        return pet;
    } catch (error) {
        console.error('Error in createTestPet:', error);
        throw error;
    }
}; 