const express = require('express');
const router = express.Router();
const { getAllProducts, createProduct } = require('../controllers/productController');

/**
 * @swagger
 * tags:
 * name: Products
 * description: إدارة المنتجات في المتجر
 */

/**
 * @swagger
 * /api/v1/products:
 * get:
 * summary: جلب جميع المنتجات
 * tags: [Products]
 * parameters:
 * - in: header
 * name: accept-language
 * schema:
 * type: string
 * required: false
 * example: ar
 * responses:
 * 200:
 * description: تم جلب المنتجات بنجاح.
 * 500:
 * description: خطأ داخلي.
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/v1/products:
 * post:
 * summary: إنشاء منتج جديد
 * tags: [Products]
 * parameters:
 * - in: header
 * name: accept-language
 * schema:
 * type: string
 * required: false
 * example: ar
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * example: "قهوة أردنية"
 * price:
 * type: number
 * example: 10.5
 * responses:
 * 201:
 * description: تم الإنشاء بنجاح.
 * 500:
 * description: خطأ داخلي.
 */
router.post('/', createProduct);

module.exports = router;