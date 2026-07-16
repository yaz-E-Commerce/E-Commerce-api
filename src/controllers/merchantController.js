const merchantService = require('../services/merchantService');

class MerchantController {
  /**
   * إنشاء متجر خاص بالتاجر الحالي
   */
  async createMyShop(req, res, next) {
    try {
      // 1. البيانات هنا جاهزة ومفحوصة بنسبة 100% قادمة من الـ validateDto Middleware
      const validatedData = req.body;

      // 2. سحب الـ ID الخاص بالتاجر من كائن الـ user المرفق بالطلب في الـ Protect Middleware
      const merchantId = req.user.id;

      // 3. تنفيذ البزنس لوجيك
      const shop = await merchantService.createShop(merchantId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'shop.messages.CREATED_SUCCESSFULLY',
        data: shop,
      });
    } catch (error) {
      next(error); // التمرير التلقائي لـ Global Error Middleware
    }
  }

  /**
   * تعديل بيانات المتجر الخاص بالتاجر الحالي
   */
  async updateMyShop(req, res, next) {
    try {
      // 1. البيانات جاهزة ومفحوصة عبر الـ UpdateShopDto الممرر بالـ Middleware
      const validatedData = req.body;
      const merchantId = req.user.id;

      // 2. تنفيذ الخدمة
      const shop = await merchantService.updateMyShop(merchantId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'shop.messages.UPDATED_SUCCESSFULLY',
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * جلب متجر للزوار عبر الـ Slug
   */
  async getShopBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const shop = await merchantService.getShopBySlug(slug);

      return res.status(200).json({
        success: true,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MerchantController();