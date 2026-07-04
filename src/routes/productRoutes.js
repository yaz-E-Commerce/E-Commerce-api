const express = require('express');
const router = express.Router();

// 1. استيراد المتحكمات والـ Middlewares
const { getAllProducts, createProduct } = require('../controllers/productController');
const { registerPaths, registerZodDto } = require('../config/swagger'); 
const validateDto = require('../middlewares/validationMiddleware');

// 2. استيراد الـ DTO (تأكد أنه في سطر منفصل تماماً)
const { CreateProductDto } = require('../dtos/productDto');

// 3. تسجيل الـ DTO في السواجر بأمان بعد تعريفه
registerZodDto(CreateProductDto, 'CreateProductDto');

// 4. توثيق المسارات
const productPaths = [
    {
        method: 'get',
        path: '/products',
        summary: 'Get all products',
        tags: ['Products'],
        responses: {
            200: {
                description: 'Products retrieved successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CreateProductDto' },
                        },
                        example: [
                            {
                                name: 'قهوة أردنية فاخرة',
                                price: 12.5,
                            },
                        ],
                    },
                },
            },
        },
    },
    {
        method: 'post',
        path: '/products',
        summary: 'Create a new product',
        tags: ['Products'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/CreateProductDto' },
                    example: {
                        name: 'قهوة أردنية فاخرة',
                        price: 12.5,
                    },
                },
            },
        },
        responses: {
            201: {
                description: 'Product created successfully',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateProductDto' },
                        example: {
                            name: 'قهوة أردنية فاخرة',
                            price: 12.5,
                        },
                    },
                },
            },
        },
    },
];

registerPaths(productPaths);

// 5. تعريف مسارات Express الفعلية
router.get('/', getAllProducts);
router.post('/', validateDto(CreateProductDto), createProduct);

module.exports = router;