// src/controllers/authController.js
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync'); // استيراد موحد

const register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);
    return res.ok(201, 'auth.success.REGISTER', result);
});

const login = catchAsync(async (req, res) => {
    const result = await authService.login(req.body);
    return res.ok(200, 'auth.success.LOGIN', result);
});

module.exports = {
    register,
    login,
};