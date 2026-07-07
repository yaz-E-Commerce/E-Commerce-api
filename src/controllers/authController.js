const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        
        return res.status(201).json({
            ...result,
            // 🎯 جلب نص النجاح مترجماً تلقائياً بناءً على الـ Header الحالي
            message: res.__('auth.success.REGISTERED') 
        });
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        
        return res.status(200).json({
            ...result,
            // 🎯 جلب نص نجاح الدخول مترجماً
            message: res.__('auth.success.LOGIN')
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    register,
    login,
};