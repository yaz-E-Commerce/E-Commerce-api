const merchantRepository = require('../repositories/merchantRepository'); // استدعاء الـ Repository الخاص بالمتاجر

class MerchantService {
  /**
   * إنشاء متجر جديد للتاجر
   */
  async createShop(merchantId, createDto) {
    // 1. التأكد أن هذا التاجر لا يمتلك متجراً بالفعل
    const existingShop = await merchantRepository.findByMerchantId(merchantId);
    if (existingShop) {
const error = new Error('shop.errors.SHOP_ALREADY_EXISTS');
      error.statusCode = 400;
      throw error;
    }

    // 2. التأكد من عدم تكرار الـ Slug
    const slugExists = await merchantRepository.findBySlug(createDto.slug);
    if (slugExists) {
      const error = new Error('shop.errors.SLUG_ALREADY_EXISTS');
      error.statusCode = 400;
      throw error;
    }

    // 3. الإنشاء عبر الـ Repository
    const shopData = {
      merchantUserId: merchantId,
      ...createDto,
    };

    return await merchantRepository.create(shopData);
  }

  /**
   * جلب بيانات متجر معين عن طريق الـ Slug للزوار
   */
  async getShopBySlug(slug) {
    const shop = await merchantRepository.findBySlug(slug);
    // تصفية المتجر بحيث يظهر للعامة فقط إذا كان مقبولاً APPROVED
    if (!shop || shop.approvalStatus !== 'APPROVED') {
      const error = new Error('shop.errors.SHOP_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }
    return shop;
  }

  /**
   * تعديل بيانات متجر التاجر الحالي
   */
  async updateMyShop(merchantId, updateDto) {
    // 1. البحث للتأكد من وجود متجر مرتبط بهذا التاجر
    const shop = await merchantRepository.findByMerchantId(merchantId);
    if (!shop) {
      const error = new Error('shop.errors.SHOP_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    // 2. إذا تم طلب تعديل الـ slug، نتحقق أنه ليس محجوزاً لمتجر آخر
    if (updateDto.slug && updateDto.slug !== shop.slug) {
      const slugExists = await merchantRepository.findBySlug(updateDto.slug);
      if (slugExists) {
        const error = new Error('shop.errors.SLUG_ALREADY_EXISTS');
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. التحديث الفعلي عبر الـ Repository
    return await merchantRepository.updateByMerchantId(merchantId, updateDto);
  }
}

// تصدير نسخة واحدة (Singleton Pattern)
module.exports = new MerchantService();