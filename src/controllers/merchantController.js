const merchantService = require('../services/merchantService')
const catchAsync = require('../utils/catchAsync') // استيراد موحد

class MerchantController {
    /**
     * إنشاء متجر خاص بالتاجر الحالي
     */
    createMyShop = catchAsync(async (req, res) => {
        // 1. البيانات تم فحصها وحقن القيم الافتراضية لها بنسبة 100% عبر الـ Validation Layer (Zod)
        const validatedData = req.body
        const merchantId = req.user.id

        // 2. تنفيذ البزنس لوجيك
        const shop = await merchantService.createShop(merchantId, validatedData)

        // 3. إرجاع الرد الموحد والمترجم آلياً عبر الـ Response Middleware
        return res.ok(201, 'shop.messages.CREATED_SUCCESSFULLY', shop)
    })

    /**
     * تعديل بيانات المتجر الخاص بالتاجر الحالي
     */
    updateMyShop = catchAsync(async (req, res) => {
        const validatedData = req.body
        const merchantId = req.user.id

        const shop = await merchantService.updateMyShop(
            merchantId,
            validatedData
        )

        return res.ok(200, 'shop.messages.UPDATED_SUCCESSFULLY', shop)
    })

    /**
     * جلب متجر للزوار عبر الـ Slug
     */
    getShopBySlug = catchAsync(async (req, res) => {
        const { slug } = req.params
        const shop = await merchantService.getShopBySlug(slug)

        return res.ok(200, 'shop.messages.RETRIEVED_SUCCESSFULLY', shop)
    })
}

// تصدير نسخة واحدة (Singleton Pattern)
module.exports = new MerchantController()
