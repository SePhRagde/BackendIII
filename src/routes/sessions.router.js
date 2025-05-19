import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.config.js';
import logger from '../utils/logger.js';

const router = Router();

const { register, login, logout, current, unprotectedLogin } = sessionsController;

/**
 * @swagger
 * /api/sessions/register:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register', register);

/**
 * @swagger
 * /api/sessions/login:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/sessions/logout:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authMiddleware, logout);

/**
 * @swagger
 * /api/sessions/current:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get current user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 payload:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/current', authMiddleware, current);

/**
 * @swagger
 * /api/sessions/unprotected-login:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Login without authentication (for testing)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 */
router.post('/unprotected-login', unprotectedLogin);

router.get('/unprotectedLogin',sessionsController.unprotectedLogin);
router.get('/unprotectedCurrent',sessionsController.unprotectedCurrent);

export default router;