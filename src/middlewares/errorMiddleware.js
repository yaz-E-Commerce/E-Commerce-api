// src/middlewares/errorMiddleware.js
const i18n = require('i18n');
const ErrorLog = require('../models/errorLogModel');

const errorMiddleware = async (err, req, res, next) => {
    let status = err.statusCode || 500;
    let messageKey = err.message || 'common.errors.UNEXPECTED';
    let errorCode = 'UNEXPECTED';
    let finalMessage = messageKey;

    // 1. استخراج الـ Code الخاص بالخطأ للـ Frontend (مثال: VALIDATION_FAILED)
    if (typeof messageKey === 'string' && messageKey.includes('.')) {
        errorCode = messageKey.split('.').pop().toUpperCase();
    }

    // 2. التقاط اللغة بأمان بدون الاعتماد على i18n.getLocale(req) لحمايته من الانهيار المبكر
    const acceptLanguage = req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
    const lang = acceptLanguage.startsWith('en') ? 'en' : 'ar';

    // 3. محرك الترجمة المباشر مع Fallback آمن للـ 500 Errors
    if (typeof messageKey === 'string' && messageKey.includes('.')) {
        try {
            finalMessage = i18n.__({ phrase: messageKey, locale: lang });
            
            // حماية إضافية: إذا لم يتم العثور على المفتاح في الـ JSON وعاد المفتاح نفسه وكان الخطأ Server Error
            if (finalMessage === messageKey && status === 500) {
                finalMessage = i18n.__({ phrase: 'common.errors.UNEXPECTED', locale: lang });
            }
        } catch (e) {
            console.warn('⚠️ Translation fallback active for:', messageKey);
            finalMessage = lang === 'en' ? 'An unexpected error occurred' : 'حدث خطأ غير متوقع';
        }
    }

    // 4. كتابة اللوج في الـ DB داخل try-catch معزول تماماً لمنع تعليق أو فشل الـ HTTP Response
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
        console.error('❌ Failed to save error log to DB:', logError.message);
    }

    // 5. الرد النهائي الموحد والـ Clean للـ Frontend
    return res.status(status).json({
        success: false,
        statusCode: status,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        errorCode: errorCode,
        message: finalMessage,
        ...(err.details ? { errors: err.details } : {})
    });
};

module.exports = errorMiddleware;