const i18n = require('i18n');
const path = require('path');
const ErrorLog = require('../models/errorLogModel');

// إعداد مكتبة i18n
i18n.configure({
    locales: ['en', 'ar'],
    directory: path.join(__dirname, '../locales'),
    defaultLocale: 'ar',
    objectNotation: true // لتفعيل القراءة بالنقطة مثل common.errors.UNEXPECTED
});

const errorMiddleware = async (err, req, res, next) => {
    // 1. تحديد لغة الطلب من الـ Header
    const acceptLanguage = req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
    const lang = acceptLanguage.startsWith('ar') ? 'ar' : 'en';
    
    // تعيين اللغة الحالية للطلب
    i18n.setLocale(req, lang);

    let status = err.statusCode || 500;
    let message = err.message || 'common.errors.UNEXPECTED';
    let errorCode = 'UNEXPECTED';
    let details = err.stack || undefined;

    // استخراج الـ errorCode من آخر كلمة بالنص إذا كان مقسماً بنقاط
    if (typeof message === 'string' && message.includes('.')) {
        errorCode = message.split('.').pop().toUpperCase();
    }

    // 2. محرك الترجمة الذكي
    if (typeof message === 'string' && message.startsWith('common.')) {
        try {
            // الترجمة التلقائية بناءً على مفتاح الـ JSON والنقاط
            message = i18n.__({ phrase: message, locale: lang });
        } catch (e) {
            console.warn('⚠️ Translation fallback active for:', message);
        }
    }

    // 3. 🚀 تدوين الخطأ تلقائياً في السحاب (MongoDB)
    try {
        await ErrorLog.create({
            message: message,
            stack: details,
            path: req.originalUrl,
            method: req.method,
            statusCode: status,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (logError) {
        console.error('❌ Failed to save error log to DB:', logError);
    }

    // 4. تشكيل الرد النهائي الـ Clean للـ Frontend بنفس أسلوب مشروعك السابق
    res.status(status).json({
        success: false,
        statusCode: status,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        errorCode: errorCode,
        message: message
    });
};

module.exports = errorMiddleware;