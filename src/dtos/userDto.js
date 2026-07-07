const { z } = require('zod');
const { RoleType } = require('../config/rolePermissions');

const RegisterUserDto = z.object({
    name: z.string({ required_error: 'Name is required' })
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .openapi({
            example: 'Ahmad Ali',
            description: 'Full name of the user',
        }),
    email: z.string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .trim()
        .toLowerCase()
        .openapi({
            example: 'ahmad@example.com',
            description: 'Unique email address',
        }),
    password: z.string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .openapi({
            example: 'StrongPass123',
            description: 'Password for account creation',
        }),
    role: z.enum(Object.values(RoleType)).optional().default(RoleType.CUSTOMER).openapi({
        example: RoleType.CUSTOMER,
        description: 'User role assigned at registration',
    }),
    isActive: z.boolean().optional().default(true).openapi({
        example: true,
        description: 'Whether the account is active',
    }),
}).openapi('RegisterUserDto');

const LoginUserDto = z.object({
    email: z.string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .trim()
        .toLowerCase()
        .openapi({
            example: 'ahmad@example.com',
            description: 'Registered email address',
        }),
    password: z.string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .openapi({
            example: 'StrongPass123',
            description: 'Password for login',
        }),
}).openapi('LoginUserDto');

module.exports = {
    RegisterUserDto,
    LoginUserDto,
};
