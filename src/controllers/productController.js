const Product = require('../models/productModel');

// 1. جلب جميع المنتجات
const getAllProducts = async (req, res, next) => { // 👈 ضفنا الـ next هون
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        // بدلاً من الرد الثابت القديم، بنصنع خطأ وبنمرره للـ Middleware المركزي
        const error = new Error('common.errors.UNEXPECTED'); 
        error.statusCode = 500;
        next(error); // 🚀 يذهب فوراً للترجمة والـ Logging في المونجو
    }
};

// 2. إنشاء منتج جديد
const createProduct = async (req, res, next) => { // 👈 ضفنا الـ next هون
    try {
        // تلميح سينيور: إذا بدك تضيف خطأ مخصص لو البيانات ناقصة (Validation) قبل الـ DB
        if (!req.body.name || !req.body.price) {
            const validationError = new Error('common.errors.VALIDATION_FAILED'); // ستحتاج لإضافتها في ملفات الـ JSON
            validationError.statusCode = 400;
            return next(validationError);
        }

        const product = new Product({
            name: req.body.name,
            price: req.body.price,
        });
        
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (err) {
        const error = new Error('common.errors.UNEXPECTED');
        error.statusCode = 500;
        next(error);
    }
};

module.exports = {
    getAllProducts,
    createProduct
};