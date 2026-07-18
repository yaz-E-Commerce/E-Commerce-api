const merchantRepository = require('../repositories/merchantRepository')

class MerchantService {
    /**
     * إنشاء متجر جديد للتاجر
     */
    async createShop(merchantId, createDto) {
        // 1. التأكد أن هذا التاجر لا يمتلك متجراً بالفعل (مسؤولية التحقق والـ Business Rules)
        const existingShop =
            await merchantRepository.findByMerchantId(merchantId)
        if (existingShop) {
            const error = new Error('shop.errors.SHOP_ALREADY_EXISTS')
            error.statusCode = 400
            throw error
        }

        // 2. التأكد من عدم تكرار الـ Slug
        const slugExists = await merchantRepository.findBySlug(createDto.slug)
        if (slugExists) {
            const error = new Error('shop.errors.SLUG_ALREADY_EXISTS')
            error.statusCode = 400
            throw error
        }

        // 3. تحضير البيانات والإنشاء الفعلي
        const shopData = {
            merchantUserId: merchantId,
            ...createDto,
        }

        return await merchantRepository.create(shopData)
    }

    /**
     * جلب بيانات متجر معين عن طريق الـ Slug للزوار
     */
    async getShopBySlug(slug) {
        const shop = await merchantRepository.findBySlug(slug)

        // حماية النظام: تصفية المتجر بحيث لا يظهر للعامة إلا إذا كان APPROVED
        if (!shop || shop.approvalStatus !== 'APPROVED') {
            const error = new Error('shop.errors.SHOP_NOT_FOUND')
            error.statusCode = 404
            throw error
        }

        // تحويل الـ Mongoose Document إلى Object عادي لتعديله بحرية
        const shopObj = shop.toObject()

        // البناء النظيف للـ Public Payload
        return {
            id: shopObj._id,
            slug: shopObj.slug,
            profile: shopObj.profile,
            contact: shopObj.contact,
            branding: shopObj.branding,
            location: shopObj.location,
            rating: shopObj.settings?.rating || { average: 0, count: 0 },
        }
    }

    /**
     * تعديل بيانات متجر التاجر الحالي
     */
    async updateMyShop(merchantId, updateDto) {
        // 1. التحقق من وجود المتجر أولاً
        const shop = await merchantRepository.findByMerchantId(merchantId)
        if (!shop) {
            const error = new Error('shop.errors.SHOP_NOT_FOUND')
            error.statusCode = 404
            throw error
        }

        // 2. إذا شمل التعديل الـ slug، نتحقق من عدم حجزه لمتجر آخر
        if (updateDto.slug && updateDto.slug !== shop.slug) {
            const slugExists = await merchantRepository.findBySlug(
                updateDto.slug
            )
            if (slugExists) {
                const error = new Error('shop.errors.SLUG_ALREADY_EXISTS')
                error.statusCode = 400
                throw error
            }
        }

        // 3. التحديث الفعلي عبر الـ Repository
        return await merchantRepository.updateByMerchantId(
            merchantId,
            updateDto
        )
    }
}

module.exports = new MerchantService()
