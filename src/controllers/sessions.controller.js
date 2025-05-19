import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError, ErrorCodes } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import UserDTO from '../dto/User.dto.js';

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomError(
                ErrorCodes.USER_ALREADY_EXISTS,
                'User already exists',
                400
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            last_connection: new Date()
        });

        logger.info(`New user registered: ${email}`);
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError(
                ErrorCodes.INVALID_CREDENTIALS,
                'Invalid email or password',
                401
            );
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new CustomError(
                ErrorCodes.INVALID_CREDENTIALS,
                'Invalid email or password',
                401
            );
        }

        // Update last connection
        user.last_connection = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        logger.info(`User logged in: ${email}`);
        res.json({
            status: 'success',
            token
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.last_connection = new Date();
            await user.save();
        }

        logger.info(`User logged out: ${req.user.email}`);
        res.json({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
};

const current = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            status: 'success',
            payload: user
        });
    } catch (error) {
        next(error);
    }
};

const unprotectedLogin  = async(req,res) =>{
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    if(!user) return res.status(404).send({status:"error",error:"User doesn't exist"});
    const isValidPassword = await passwordValidation(user,password);
    if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
    const token = jwt.sign(user,'tokenSecretJWT',{expiresIn:"1h"});
    res.cookie('unprotectedCookie',token,{maxAge:3600000}).send({status:"success",message:"Unprotected Logged in"})
}
const unprotectedCurrent = async(req,res)=>{
    const cookie = req.cookies['unprotectedCookie']
    const user = jwt.verify(cookie,'tokenSecretJWT');
    if(user)
        return res.send({status:"success",payload:user})
}

export default {
    register,
    login,
    logout,
    current,
    unprotectedLogin,
    unprotectedCurrent
}