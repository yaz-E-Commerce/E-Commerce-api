const { Merchant } = require('../models/merchantModel')

class MerchantRepository {
    async findByMerchantId(merchantUserId) {
        return await Merchant.findOne({ merchantUserId })
    }

    async findBySlug(slug) {
        return await Merchant.findOne({ slug }).select([
            'slug',
            'approvalStatus', // نحتاجه للتحقق في الـ Service ولكن يمكننا حذفه لاحقاً أو تركه لأنه عام
            'profile',
            'contact',
            'branding',
            'location',
            'settings.rating', // نسحب فقط التقييم من الـ settings ونحجب الباقي مثل الـ subscription والـ documents
        ])
    }
    async create(merchantData) {
        return await Merchant.create(merchantData)
    }

    async updateByMerchantId(merchantUserId, updateData) {
        return await Merchant.findOneAndUpdate(
            { merchantUserId },
            { $set: updateData },
            { new: true, runValidators: true }
        )
    }
}

module.exports = new MerchantRepository()
