const Product = require('../models/productModel'); // نقطتين للخلف ثم دخول مجلد models
class ProductRepository {
    async findAll() {
        return await Product.find({});
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async create(productData) {
        return await Product.create(productData);
    }
}

// نصدّر نسخة (Instance) واحدة كـ Singleton تماماً مثل الـ Providers في NestJS
module.exports = new ProductRepository();