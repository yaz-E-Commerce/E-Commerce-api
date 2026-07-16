const productService = require('../services/productService' ); 

const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();
        return res.ok(200, 'products.success.FETCHED', products);
    } catch (error) {
        next(error); // يمرر الخطأ للـ errorMiddleware الخاص بك
    }
};

const createProduct = async (req, res, next) => {
    try {
        // req.body تم التحقق منه مسبقاً في الـ validationMiddleware
        const newProduct = await productService.createProduct(req.body);
        return res.ok(201, 'products.success.CREATED', newProduct);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts,
    createProduct
};