// تفكيك موديل Merchant من الملف لمنع خطأ undefined findOne
const { Merchant } = require('../models/merchantModel'); 

class MerchantRepository {
  async findByMerchantId(merchantUserId) {
    return await Merchant.findOne({ merchantUserId });
  }

  async findBySlug(slug) {
    return await Merchant.findOne({ slug });
  }

  async create(merchantData) {
    return await Merchant.create(merchantData);
  }

  async updateByMerchantId(merchantUserId, updateData) {
    return await Merchant.findOneAndUpdate(
      { merchantUserId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new MerchantRepository();