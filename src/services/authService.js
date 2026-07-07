const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { RoleType } = require('../config/rolePermissions');

class AuthService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            const error = new Error('Email already exists');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const createdUser = await userRepository.create({
            ...userData,
            password: hashedPassword,
            role: userData.role || RoleType.CUSTOMER,
            isActive: userData.isActive !== false,
        });

        const userPayload = createdUser.toObject ? createdUser.toObject() : createdUser;
        delete userPayload.password;

        return {
            user: userPayload,
            message: 'User registered successfully',
        };
    }

    async login(credentials) {
        const user = await userRepository.findByEmail(credentials.email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        if (!user.isActive) {
            const error = new Error('Account is inactive');
            error.statusCode = 403;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            const error = new Error('Server misconfiguration: JWT_SECRET is missing');
            error.statusCode = 500;
            throw error;
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role,
            active: user.isActive,
        }, secret, { expiresIn: '7d' });

        const safeUser = { ...user };
        delete safeUser.password;

        return {
            token,
            user: safeUser,
            message: 'Login successful',
        };
    }
}

module.exports = new AuthService();
