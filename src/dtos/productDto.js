const { z } = require('zod');
// تفعيل إمداد السواجر بالمعلومات من الـ Zod
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');
extendZodWithOpenApi(z);

const CreateProductDto = z.object({
    name: z.string({
        required_error: "common.errors.VALIDATION_FAILED" // مفتاح الترجمة الموحد عندك
    }).min(3).openapi({ 
        description: 'اسم المنتج الإلكتروني', 
        example: 'قهوة أردنية فاخرة' 
    }),
    
    price: z.number({
        required_error: "common.errors.VALIDATION_FAILED"
    }).positive().openapi({ 
        description: 'سعر المنتج بالدينار', 
        example: 12.50 
    })
}).openapi('CreateProductDto'); // 👈 هذا الإسم اللي رح يظهر بالسواجر تحت في الـ Schemas

module.exports = { CreateProductDto };