const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const RoleType = require('../common/enum/role-type.enum'); 

class AuthService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            // 🎯 تعديل: تحويل النص العادي إلى مفتاح ترجمة يحتوي على نقطة
            const error = new Error('auth.errors.EMAIL_ALREADY_EXISTS');
            error.statusCode = 409; // Conflict
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
            // نترك كائن البيانات نظيفاً لأن الـ Controller يقوم بحقن الـ message المترجمة تلقائياً
            user: userPayload
        };
    }

    async login(credentials) {
        const user = await userRepository.findByEmail(credentials.email);
        if (!user) {
            // 🎯 تعديل: تحويل النص إلى مفتاح ترجمة
            const error = new Error('auth.errors.INVALID_CREDENTIALS');
            error.statusCode = 401; // Unauthorized
            throw error;
        }

        if (!user.isActive) {
            // 🎯 تعديل: تحويل النص إلى مفتاح ترجمة
            const error = new Error('auth.errors.ACCOUNT_INACTIVE');
            error.statusCode = 403; // Forbidden
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
            // 🎯 تعديل: استخدام نفس مفتاح بيانات الدخول الخاطئة لحماية الأمان
            const error = new Error('auth.errors.INVALID_CREDENTIALS');
            error.statusCode = 401;
            throw error;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            const error = new Error('common.errors.UNEXPECTED');
            error.statusCode = 500;
            throw error;
        }
        await userRepository.updateLastLogin(user._id);
        const token = jwt.sign({
            id: user._id,
            role: user.role,
            active: user.isActive,
        }, secret, { expiresIn: '7d' });

        const safeUser = user.toObject ? user.toObject() : { ...user };
        delete safeUser.password;

        return {
            token,
            user: safeUser
        };
    }
}

module.exports = new AuthService();