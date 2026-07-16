// src/dtos/userDto.js
const { z } = require('zod');
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');

const RoleType = require('../common/enum/role-type.enum');

extendZodWithOpenApi(z);

// السكيما الأساسية
const BaseRegisterSchema = z.object({
    name: z.string({
        required_error: 'auth.errors.NAME_REQUIRED',
        invalid_type_error: 'auth.errors.NAME_REQUIRED'
    })
        .trim()
        .min(2, 'auth.errors.NAME_TOO_SHORT')
        .max(100, 'auth.errors.NAME_TOO_LONG')
        .openapi({ example: 'Ahmad Ali', description: 'Full name of the user' }),

    email: z.string({
        required_error: 'auth.errors.EMAIL_REQUIRED',
        invalid_type_error: 'auth.errors.EMAIL_REQUIRED'
    })
        .email('auth.errors.INVALID_EMAIL_FORMAT')
        .trim()
        .toLowerCase()
        .openapi({ example: 'ahmad@example.com', description: 'Unique email address' }),

    password: z.string({
        required_error: 'auth.errors.PASSWORD_REQUIRED',
        invalid_type_error: 'auth.errors.PASSWORD_REQUIRED'
    })
        .min(6, 'auth.errors.PASSWORD_TOO_SHORT')
        .openapi({ example: 'StrongPass123', description: 'Password for account creation' }),


    gender: z.preprocess(
        (val) => (typeof val === 'string' ? val.toLowerCase() : val),
        z
            .string({ required_error: 'auth.errors.GENDER_REQUIRED' })
            .refine((v) => ['male', 'female', 'other'].includes(v), {
                message: 'auth.errors.INVALID_GENDER',
            })
            
    )
    .openapi({ enum: ['male', 'female', 'other'], example: 'male', description: 'User gender' }),

});

// حقن الـ role بالخلفية (بدون التأثير على رسائل required_error للحقول)
const RegisterCustomerDto = BaseRegisterSchema.transform((data) => ({
    ...data,
    role: RoleType.CUSTOMER
})).openapi('RegisterCustomerDto');

const RegisterMerchantDto = BaseRegisterSchema.transform((data) => ({
    ...data,
    role: RoleType.MERCHANT
})).openapi('RegisterMerchantDto');

const LoginUserDto = z.object({
    email: z.string({ required_error: 'auth.errors.EMAIL_REQUIRED' })
        .email('auth.errors.INVALID_EMAIL_FORMAT')
        .trim()
        .toLowerCase()
        .openapi({ example: 'ahmad@example.com', description: 'Registered email address' }),

    password: z.string({ required_error: 'auth.errors.PASSWORD_REQUIRED' })
        .min(6, 'auth.errors.PASSWORD_TOO_SHORT')
        .openapi({ example: 'StrongPass123', description: 'Password for login' }),
}).openapi('LoginUserDto');

// تم استبدال النصوص العربية بمفاتيح ترجمة هنا لتطبيق اللغتين
const DeleteUserDto = z.object({
    reason: z.string().max(500, 'user.errors.DELETE_REASON_TOO_LONG').optional(),
});

const UpdateProfileDto = z.object({
    name: z.string().min(2, 'user.errors.NAME_TOO_SHORT').max(100, 'user.errors.NAME_TOO_LONG').optional(),
    gender: z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'user.errors.INVALID_GENDER' })
    }).optional(),
});

const ToggleStatusDto = z.object({
    isActive: z.boolean({
        required_error: 'user.errors.ACTIVE_STATUS_REQUIRED',
        invalid_type_error: 'user.errors.ACTIVE_STATUS_INVALID'
    })
});

module.exports = {
    RegisterCustomerDto,
    RegisterMerchantDto,
    LoginUserDto,
    DeleteUserDto,
    UpdateProfileDto,
    ToggleStatusDto
};