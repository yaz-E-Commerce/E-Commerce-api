// src/services/userService.js
const userRepository = require('../repositories/userRepository');

class UserService {
  // دالة مركزية لإنشاء كائنات الأخطاء لتجنب تشتت وتكرار الـ throw يدوياً
  createError(messageKey, statusCode = 500) {
    const error = new Error(messageKey);
    error.statusCode = statusCode;
    return error;
  }

  async deleteUserAccount(userIdToDelete, requestedBy, reason) {
    const user = await userRepository.findById(userIdToDelete);
    if (!user || user.isDeleted) {
      throw this.createError('user.errors.NOT_FOUND', 404);
    }

    const isAdmin = requestedBy.role === 'admin';
    const isOwner = requestedBy.id === userIdToDelete.toString();

    if (!isAdmin && !isOwner) {
      throw this.createError('common.errors.FORBIDDEN', 403);
    }

let finalReason = reason;
if (!finalReason) {
  finalReason = isOwner 
    ? 'user.deleteReason.OWNER_REQUEST'     // في ملف الـ JSON العربي: "تم إغلاق الحساب بناءً على طلب المستخدم نفسه."
    : 'user.deleteReason.ADMIN_BAN';       // في ملف الـ JSON العربي: "تم حظر وإغلاق الحساب بواسطة إدارة المنصة."
}

    return await userRepository.softDelete(userIdToDelete, requestedBy.id, finalReason);
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted || !user.isActive) {
      throw this.createError('user.errors.NOT_FOUND', 404);
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted) {
      throw this.createError('user.errors.NOT_FOUND', 404);
    }

    const allowedUpdates = {
      name: updateData.name,
      gender: updateData.gender,
    };

    // تنظيف الحقول التي قيمتها undefined
    Object.keys(allowedUpdates).forEach(
      key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    return await userRepository.update(userId, allowedUpdates);
  }

  async toggleUserActiveStatus(userIdToToggle, status) {
    const user = await userRepository.findById(userIdToToggle);
    if (!user || user.isDeleted) {
      throw this.createError('user.errors.NOT_FOUND', 404);
    }

    return await userRepository.updateActiveStatus(userIdToToggle, status);
  }

  async restoreUserAccount(userIdToRestore) {
    const user = await userRepository.findByIdWithDeleted(userIdToRestore);
    if (!user) {
      throw this.createError('user.errors.NOT_FOUND', 404);
    }

    if (!user.isDeleted) {
      throw this.createError('user.errors.ALREADY_ACTIVE', 400);
    }

    const updateData = {
      isDeleted: false,
      deletedAt: null,
      deleteReason: null,
      deletedBy: null,
      isActive: true
    };

    return await userRepository.updateFieldsDirectly(userIdToRestore, updateData);
  }

  async getAllUsersForAdmin(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    if (query.role) {
      filters.role = query.role;
    }

    if (query.isDeleted !== undefined) {
      filters.isDeleted = query.isDeleted === 'true';
    } else {
      filters.isDeleted = false;
    }

    if (query.search) {
      filters.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } }
      ];
    }

    return await userRepository.findAllWithPagination(filters, skip, limit);
  }
}

module.exports = new UserService();