// src/repositories/userRepository.js
const User = require('../models/userModel'); 

class UserRepository {
  // 🎯 تم الدمج: جلب الحساب غير المحذوف بشكل افتراضي مع إمكانية استثناء الباسورد عند الحاجة
  async findById(userId, excludePassword = true) {
    let query = User.findOne({ _id: userId, isDeleted: false });
    if (excludePassword) {
      query = query.select('-password');
    }
    return await query.lean();
  }

  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).lean();
  }

  // البحث عن المستخدم حتى لو كان محذوفاً (خاص بالاسترجاع)
  async findByIdWithDeleted(userId) {
    return await User.findById(userId);
  }

  // 🎯 تم إضافة الدالة الناقصة هنا لحل المشكلة
  async updateLastLogin(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { lastLogin: new Date() } },
      { new: true }
    );
  }

  async softDelete(userId, deletedById, reason) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deleteReason: reason,
          deletedBy: deletedById,
          isActive: false
        }
      },
      { new: true }
    );
  }

  // تحديث الحقول المسموح بتعديلها للملف الشخصي
  async update(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  // تفعيل أو تعطيل الحساب (الحظر والالغاء)
  async updateActiveStatus(userId, status) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: status } },
      { new: true }
    );
  }

  // تحديث مباشر لكافة الحقول (يستخدم للاسترجاع وإلغاء الحذف)
  async updateFieldsDirectly(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
  }

  // جلب كافة المستخدمين مع الفلترة والتقسيم لصفحات
  async findAllWithPagination(filters, skip, limit) {
    const total = await User.countDocuments(filters);
    const users = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      total,
      users,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    };
  }
}

module.exports = new UserRepository();