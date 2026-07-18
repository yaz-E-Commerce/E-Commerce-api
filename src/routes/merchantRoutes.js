const express = require('express')
const router = express.Router()

const { registerPaths, registerZodDto } = require('../config/swagger')
const validateDto = require('../middlewares/validationMiddleware')

const merchantController = require('../controllers/merchantController')
const { CreateShopDto, UpdateShopDto } = require('../dtos/merchantDto')
const { protect, requireRoles } = require('../middlewares/authMiddleware')
const RoleType = require('../common/enum/role-type.enum')

// تسجيل المخططات لتوثيق Swagger آلياً
registerZodDto(CreateShopDto, 'CreateShopDto')
registerZodDto(UpdateShopDto, 'UpdateShopDto')

const merchantPaths = [
    {
        method: 'get',
        path: '/shops/{slug}',
        summary: 'Get shop details by its slug (Public)',
        tags: ['Merchants'],
        parameters: [
            {
                name: 'slug',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'The unique SEO-friendly URL slug of the shop',
            },
        ],
        responses: {
            200: { description: 'Shop retrieved successfully' },
            404: { description: 'Shop not found' },
        },
    },
    {
        method: 'post',
        path: '/shops/my-shop',
        summary: 'Create a new shop for the logged-in merchant',
        tags: ['Merchants'],
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/CreateShopDto' },
                },
            },
        },
        responses: {
            201: { description: 'Shop created successfully' },
            400: {
                description: 'Validation error or merchant already has a shop',
            },
            401: { description: 'Unauthorized' },
            403: {
                description:
                    'Forbidden: only merchants can perform this action',
            },
        },
    },
    {
        method: 'patch',
        path: '/shops/my-shop',
        summary: 'Update the shop details of the logged-in merchant',
        tags: ['Merchants'],
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/UpdateShopDto' },
                },
            },
        },
        responses: {
            200: { description: 'Shop updated successfully' },
            400: { description: 'Validation error or invalid update values' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Shop not found' },
        },
    },
]

registerPaths(merchantPaths)

// ==========================================
// ⚡ ربط المسارات الفعلية بالـ Middlewares والـ Controller
// ==========================================

// مسار عام (Public)
router.get('/:slug', merchantController.getShopBySlug)

// مسارات محمية (Private) للتاجر الحالي
router.post(
    '/my-shop',
    protect,
    requireRoles(RoleType.MERCHANT),
    validateDto(CreateShopDto, 'merchant.errors'),
    merchantController.createMyShop
)

router.patch(
    '/my-shop',
    protect,
    requireRoles(RoleType.MERCHANT),
    validateDto(UpdateShopDto, 'merchant.errors'),
    merchantController.updateMyShop
)

module.exports = router
