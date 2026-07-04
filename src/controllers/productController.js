const productService = require('../services/productService' ); 

const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json(products);
    } catch (error) {
        next(error); // يمرر الخطأ للـ errorMiddleware الخاص بك
    }
};

const createProduct = async (req, res, next) => {
    try {
        // req.body تم التحقق منه مسبقاً في الـ validationMiddleware
        const newProduct = await productService.createProduct(req.body);
        return res.status(201).json(newProduct);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts,
    createProduct
};