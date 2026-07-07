const i18n = require('i18n'); // استدعاء المكتبة مباشرة لاستخدام الـ API العالمي الخاص بها
const ErrorLog = require('../models/errorLogModel');

const errorMiddleware = async (err, req, res, next) => {
    let status = err.statusCode || 500;
    let messageKey = err.message || 'common.errors.UNEXPECTED';
    let errorCode = 'UNEXPECTED';
    let finalMessage = messageKey;

    // 1. استخراج الـ errorCode ديناميكياً من آخر كلمة بالنص (مثال: VALIDATION_FAILED)
    if (typeof messageKey === 'string' && messageKey.includes('.')) {
        errorCode = messageKey.split('.').pop().toUpperCase();
    }

    // 2. 🎯 لقط اللغة الحالية للطلب بدقة (سواء قادمة من الـ Header أو المثبتة بالـ req)
    const currentLocale = i18n.getLocale(req) || req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
    const lang = currentLocale.startsWith('ar') ? 'ar' : 'en';

    // 3. 🎯 محرك الترجمة المباشر (تجاوز مشاكل الـ res Context)
    if (typeof messageKey === 'string' && messageKey.includes('.')) {
        try {
            // نمرر الـ phrase والـ locale يدوياً لضمان قراءة ملف الـ JSON الصحيح
            finalMessage = i18n.__({ phrase: messageKey, locale: lang });
            
            // في حال لم يجد المفتاح في ملفات الـ JSON (أو أعاد المفتاح نفسه) وكان الخطأ 500
            if (finalMessage === messageKey && status === 500) {
                finalMessage = i18n.__({ phrase: 'common.errors.UNEXPECTED', locale: lang });
            }
        } catch (e) {
            console.warn('⚠️ Translation fallback active for:', messageKey);
        }
    }

    // 4. 🚀 تدوين الخطأ تلقائياً في السحاب (MongoDB)
    try {
        await ErrorLog.create({
            message: finalMessage,
            stack: err.stack || undefined,
            path: req.originalUrl,
            method: req.method,
            statusCode: status,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (logError) {
        console.error('❌ Failed to save error log to DB:', logError);
    }

    // 5. تشكيل الرد النهائي الـ Clean للـ Frontend
    return res.status(status).json({
        success: false,
        statusCode: status,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        errorCode: errorCode,
        message: finalMessage,
        // إذا كان هناك تفاصيل حقول مخصصة (أخطاء التحقق القادمة من validationMiddleware)
        ...(err.details ? { errors: err.details } : {})
    });
};

module.exports = errorMiddleware;