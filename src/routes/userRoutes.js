// src/routes/userRoutes.js

const express = require('express');

const router = express.Router();



const { registerPaths, registerZodDto } = require('../config/swagger');

const validateDto = require('../middlewares/validationMiddleware');

const { protect, requireRoles } = require('../middlewares/authMiddleware'); // restrictTo('admin') لفحص الـ Role



const userController = require('../controllers/userController');

const { DeleteUserDto, UpdateProfileDto, ToggleStatusDto } = require('../dtos/userDto');



// 1. تسجيل الـ DTOs داخل نظام السواجر

registerZodDto(DeleteUserDto, 'DeleteUserDto');

registerZodDto(UpdateProfileDto, 'UpdateProfileDto');

registerZodDto(ToggleStatusDto, 'ToggleStatusDto');



// 2. توثيق المسارات للسواجر

const userPaths = [

    {

        method: 'get',

        path: '/users/profile/me',

        summary: 'Get current user profile',

        tags: ['Users'],

        security: [{ bearerAuth: [] }],

        responses: {

            200: { description: 'Profile retrieved successfully' },

            401: { description: 'Unauthorized' }

        }

    },

    {

        method: 'put',

        path: '/users/profile/update',

        summary: 'Update current user profile',

        tags: ['Users'],

        security: [{ bearerAuth: [] }],

        requestBody: {

            required: true,

            content: {

                'application/json': {

                    schema: { $ref: '#/components/schemas/UpdateProfileDto' }

                }

            }

        },

        responses: {

            200: { description: 'Profile updated successfully' },

            401: { description: 'Unauthorized' }

        }

    },

    {

        method: 'delete',

        path: '/users/{id}',

        summary: 'Soft delete a user account',

        tags: ['Users'],

        security: [{ bearerAuth: [] }],

        parameters: [

            {

                name: 'id',

                in: 'path',

                required: true,

                schema: { type: 'string' }

            }

        ],

        requestBody: {

            required: false,

            content: {

                'application/json': {

                    schema: { $ref: '#/components/schemas/DeleteUserDto' }

                }

            }

        },

        responses: {

            200: { description: 'Account deleted successfully' },

            403: { description: 'Forbidden' },

            404: { description: 'User not found' }

        }

    },

    {

        method: 'patch',

        path: '/users/{id}/toggle-active',

        summary: 'Toggle active status (Admin Only)',

        tags: ['Users (Admin)'],

        security: [{ bearerAuth: [] }],

        parameters: [

            {

                name: 'id',

                in: 'path',

                required: true,

                schema: { type: 'string' }

            }

        ],

        requestBody: {

            required: true,

            content: {

                'application/json': {

                    schema: { $ref: '#/components/schemas/ToggleStatusDto' }

                }

            }

        },

        responses: {

            200: { description: 'Status updated successfully' },

            403: { description: 'Forbidden - Admins only' }

        }

    },

    {

        method: 'post',

        path: '/users/{id}/restore',

        summary: 'Restore soft-deleted user (Admin Only)',

        tags: ['Users (Admin)'],

        security: [{ bearerAuth: [] }],

        parameters: [

            {

                name: 'id',

                in: 'path',

                required: true,

                schema: { type: 'string' }

            }

        ],

        responses: {

            200: { description: 'User restored successfully' },

            403: { description: 'Forbidden' }

        }

    },

    {

        method: 'get',

        path: '/users/admin/all',

        summary: 'Get all users with pagination & filters (Admin Only)',

        tags: ['Users (Admin)'],

        security: [{ bearerAuth: [] }],

        parameters: [

            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },

            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },

            { name: 'role', in: 'query', schema: { type: 'string', enum: ['customer', 'merchant'] } },

            { name: 'isDeleted', in: 'query', schema: { type: 'string', enum: ['true', 'false'], default: 'false' } },

            { name: 'search', in: 'query', schema: { type: 'string' } }

        ],

        responses: {

            200: { description: 'List of users retrieved successfully' }

        }

    }

];



// حقن المسارات آلياً في السواجر

registerPaths(userPaths);



// 3. ⚡ ربط المسارات الفعلية بالـ Middlewares والـ Controllers

// مسارات المستخدم العادي لحسابه الشخصي

router.get('/profile/me', protect, userController.getMyProfile);

router.put('/profile/update', protect, validateDto(UpdateProfileDto), userController.updateMyProfile);

router.delete('/:id', protect, validateDto(DeleteUserDto), userController.softDeleteUser);



// مسارات الآدمن الخاصة بإدارة كيانات المستخدمين (مغلقة بـ requireRoles)

router.patch('/:id/toggle-active', protect, requireRoles('admin'), validateDto(ToggleStatusDto), userController.toggleUserActiveStatus);

router.post('/:id/restore', protect, requireRoles('admin'), userController.restoreUserAccount);

router.get('/admin/all', protect, requireRoles('admin'), userController.getAllUsers);



module.exports = router;