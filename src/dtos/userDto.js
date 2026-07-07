const { z } = require('zod');
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');

// استيراد الـ Enums من المجلد المشترك
const RoleType = require('../common/enum/role-type.enum');
const PermissionType = require('../common/enum/permission.enum');

extendZodWithOpenApi(z);

// 🛠️ السكيما الأساسية (مخفي منها الـ role تماماً)
const BaseRegisterSchema = z.object({
    name: z.string({ required_error: 'auth.errors.NAME_REQUIRED' })
        .trim()
        .min(2, 'auth.errors.NAME_TOO_SHORT')
        .max(100, 'auth.errors.NAME_TOO_LONG')
        .openapi({ example: 'Ahmad Ali', description: 'Full name of the user' }),

    email: z.string({ required_error: 'auth.errors.EMAIL_REQUIRED' })
        .email('auth.errors.INVALID_EMAIL_FORMAT')
        .trim()
        .toLowerCase()
        .openapi({ example: 'ahmad@example.com', description: 'Unique email address' }),

    password: z.string({ required_error: 'auth.errors.PASSWORD_REQUIRED' })
        .min(6, 'auth.errors.PASSWORD_TOO_SHORT')
        .openapi({ example: 'StrongPass123', description: 'Password for account creation' }),

    gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'auth.errors.INVALID_GENDER' }) })
        .optional()
        .default('other')
        .openapi({ enum: ['male', 'female', 'other'], example: 'male', description: 'User gender' }),

    // permissions: z
    //     .array(z.nativeEnum(PermissionType, { errorMap: () => ({ message: 'auth.errors.INVALID_PERMISSION_VALUE' }) }), {
    //         invalid_type_error: 'auth.errors.INVALID_PERMISSIONS_ARRAY',
    //     })
    //     .optional()
    //     .default([])
    //     .openapi({
    //         description: 'Custom permissions granted directly',
    //         type: 'array',
    //         items: { type: 'string', enum: Object.values(PermissionType) },
    //         example: []
    //     }),

    // isActive: z.boolean({ invalid_type_error: 'auth.errors.INVALID_IS_ACTIVE_TYPE' })
    //     .optional()
    //     .default(true)
    //     .openapi({ example: true, description: 'Account status' })
});

// 1️⃣ DTO الخاص بتسجيل العميل: يحقن الـ role بالخلفية دون إظهاره في الـ Swagger
const RegisterCustomerDto = BaseRegisterSchema.transform((data) => ({
    ...data,
    role: RoleType.CUSTOMER // 👈 حقن خلفي تلقائي
})).openapi('RegisterCustomerDto');

// 2️⃣ DTO الخاص بتسجيل التاجر: يحقن الـ role بالخلفية دون إظهاره في الـ Swagger
const RegisterMerchantDto = BaseRegisterSchema.transform((data) => ({
    ...data,
    role: RoleType.MERCHANT // 👈 حقن خلفي تلقائي
})).openapi('RegisterMerchantDto');

// 3️⃣ DTO الخاص بتسجيل الدخول
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

module.exports = {
    RegisterCustomerDto,
    RegisterMerchantDto,
    LoginUserDto,
};