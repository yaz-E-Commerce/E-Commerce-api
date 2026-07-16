const { z } = require('zod');
// تفعيل إمداد السواجر بالمعلومات من الـ Zod
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');
extendZodWithOpenApi(z);

const CreateProductDto = z.object({
    name: z.string({
        required_error: 'product.errors.NAME_REQUIRED',
        invalid_type_error: 'product.errors.NAME_REQUIRED'
    })
    .refine((val) => val.trim().length >= 3, {
        message: 'product.errors.NAME_TOO_SHORT'
    })
    .refine((val) => val.trim().length <= 120, {
        message: 'product.errors.NAME_TOO_LONG'
    }),

    // تعديل جذري لـ price لتفادي مشاكل الـ preprocess مع الـ undefined
    price: z.number({
        required_error: 'product.errors.PRICE_REQUIRED',
        invalid_type_error: 'product.errors.PRICE_REQUIRED'
    })
    .positive({ message: 'product.errors.PRICE_MUST_BE_POSITIVE' })
}).openapi('CreateProductDto');

module.exports = { CreateProductDto };