const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    path: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // 🎯 تسريع عملية الترتيب (Sort) من الأحدث للأقدم في الداتابيز
    },
  },
  {
    versionKey: false, // يزيل حقل __v التلقائي إذا كنت لا تحتاجه في سجلات الأخطاء لجعل السجل أنظف
  }
);

// 🚀 عمل فهرس مركب إذا كنت ستبحث مستقبلاً بالـ Method أو الـ Path مع الترتيب
errorLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ErrorLog', errorLogSchema);