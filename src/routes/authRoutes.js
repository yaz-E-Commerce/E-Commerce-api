const express = require('express')
const router = express.Router()

const { registerPaths, registerZodDto } = require('../config/swagger')
const validateDto = require('../middlewares/validationMiddleware')
const { register, login } = require('../controllers/authController')
const {
    RegisterCustomerDto,
    RegisterMerchantDto,
    LoginUserDto,
} = require('../dtos/userDto')

// تسجيل الـ DTOs داخل نظام السواجر الاحترافي
registerZodDto(RegisterCustomerDto, 'RegisterCustomerDto')
registerZodDto(RegisterMerchantDto, 'RegisterMerchantDto')
registerZodDto(LoginUserDto, 'LoginUserDto')

const authPaths = [
    {
        method: 'post',
        path: '/auth/register/customer',
        summary: 'Register a new Customer',
        tags: ['Authentication'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/RegisterCustomerDto',
                    },
                },
            },
        },
        responses: {
            201: { description: 'Customer registered successfully' },
            409: { description: 'Email already exists' },
        },
    },
    {
        method: 'post',
        path: '/auth/register/merchant',
        summary: 'Register a new Merchant',
        tags: ['Authentication'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/RegisterMerchantDto',
                    },
                },
            },
        },
        responses: {
            201: { description: 'Merchant registered successfully' },
            409: { description: 'Email already exists' },
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
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
        },
    },
]

// حقن المسارات آلياً في لوحة تحكم السواجر
registerPaths(authPaths)

// ⚡ ربط المسارات الفعلية بالـ Middleware والـ Controller
router.post(
    '/register/customer',
    validateDto(RegisterCustomerDto, 'auth.errors'),
    register
)
router.post(
    '/register/merchant',
    validateDto(RegisterMerchantDto, 'auth.errors'),
    register
)
router.post('/login', validateDto(LoginUserDto, 'auth.errors'), login)

module.exports = router
