const productRepository = require('../repositories/productRepository'); // نقطتين للخلف ثم دخول مجلد repositories
class ProductService {
    async getAllProducts() {
        // هنا يمكنك إضافة بزنس لوجيك مستقبلاً (مثل عمل الكاش أو الفلترة)
        return await productRepository.findAll();
    }

    async createProduct(productData) {
        // مثال على بزنس لوجيك: منع إنشاء منتج بنفس الاسم إذا كان ذلك مطلوباً
        // أو إضافة حسابات إضافية مثل نسبة الضريبة على السعر
        return await productRepository.create(productData);
    }
}

module.exports = new ProductService();