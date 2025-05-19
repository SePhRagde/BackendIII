import { Router } from 'express';
import { generateMockPets, generateMockUsers } from '../utils/mockGenerator.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/mockingpets', (req, res) => {
    try {
        const pets = generateMockPets(100);
        logger.info('Generated 100 mock pets');
        res.json({
            status: 'success',
            payload: pets
        });
    } catch (error) {
        logger.error('Error generating mock pets:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error generating mock pets'
        });
    }
});

router.get('/mockingusers', async (req, res) => {
    try {
        const users = generateMockUsers(50);
        // Hash passwords for all users
        const hashedUsers = await Promise.all(users.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        })));
        
        logger.info('Generated 50 mock users with hashed passwords');
        res.json({
            status: 'success',
            payload: hashedUsers
        });
    } catch (error) {
        logger.error('Error generating mock users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error generating mock users'
        });
    }
});

router.post('/generateData', async (req, res) => {
    try {
        const { usersCount = 50, petsCount = 100 } = req.body;
        
        // Generate users with hashed passwords
        const users = generateMockUsers(usersCount);
        const hashedUsers = await Promise.all(users.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        })));

        // Generate pets
        const pets = generateMockPets(petsCount);

        logger.info(`Generated ${usersCount} users and ${petsCount} pets`);
        res.json({
            status: 'success',
            payload: {
                users: hashedUsers,
                pets: pets
            }
        });
    } catch (error) {
        logger.error('Error generating data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error generating data'
        });
    }
});

export default router; 