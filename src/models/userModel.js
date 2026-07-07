const mongoose = require('mongoose');
const RoleType = require('../common/enum/role-type.enum');
const PermissionType = require('../common/enum/permission.enum');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true, // تمنع تكرار الإيميل نهائياً وتنشئ دليلاً (Index) تلقائياً
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: Object.values(RoleType),
        default: RoleType.CUSTOMER,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other', // حذفت optional: true لأنها غير مدعومة في Mongoose
    },
  permissions: {
        type: [String],
        enum: Object.values(PermissionType), // صمام أمان يمنع تخزين أي سترينج عشوائي في الـ DB
        default: [],
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true, // ⚡ تحسين الأداء: الفلترة بناءً على الحسابات المحذوفة ستصبح بلمح البصر
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    deleteReason: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true, // ⚡ تحسين الأداء: لتسريع عمليات فحص الحسابات النشطة في النظام
    },
}, {
    timestamps: true,
});

// 🎯 دليل مركب (Compound Index) للأداء الخارق عند تسجيل الدخول
// يسّرع البحث المشترك عن الإيميل والحسابات غير المحذوفة معاً
userSchema.index({ email: 1, isDeleted: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;