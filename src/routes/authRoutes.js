const express = require('express');
const router = express.Router();

const { registerPaths, registerZodDto } = require('../config/swagger');
const validateDto = require('../middlewares/validationMiddleware');
const { register, login } = require('../controllers/authController');
const { RegisterUserDto, LoginUserDto } = require('../dtos/userDto');

registerZodDto(RegisterUserDto, 'RegisterUserDto');
registerZodDto(LoginUserDto, 'LoginUserDto');

const authPaths = [
    {
        method: 'post',
        path: '/auth/register',
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/RegisterUserDto' },
                },
            },
        },
        responses: {
            201: {
                description: 'User registered successfully',
            },
            409: {
                description: 'Email already exists',
            },
        },
    },
    {
        method: 'post',
        path: '/auth/login',
        summary: 'Authenticate a user',
        tags: ['Authentication'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/LoginUserDto' },
                },
            },
        },
        responses: {
            200: {
                description: 'Login successful',
            },
            401: {
                description: 'Invalid credentials',
            },
        },
    },
];

registerPaths(authPaths);

router.post('/register', validateDto(RegisterUserDto), register);
router.post('/login', validateDto(LoginUserDto), login);

module.exports = router;
