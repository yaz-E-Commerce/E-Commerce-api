// src/middlewares/validationMiddleware.js
const i18n = require('i18n');

const validateDto = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            // التقاط اللغة الممررة بالطلب
            const acceptLanguage = req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
            const lang = acceptLanguage.startsWith('en') ? 'en' : 'ar';

            // ترجمة رسائل أخطاء الحقول بناءً على المفاتيح المعرفة في الـ DTO
            const translatedDetails = result.error.issues.map(issue => ({
                field: issue.path[0],
                message: i18n.__({ phrase: issue.message, locale: lang })
            }));

            // بناء كائن الخطأ العام وتمريره للـ Error Middleware
            const error = new Error('common.errors.VALIDATION_FAILED');
            error.statusCode = 400; 
            error.details = translatedDetails; 
            
            return next(error);
        }
        
        // إرفاق البيانات التي تم التحقق منها بجسم الطلب
        req.body = result.data;
        next();
    };
};

module.exports = validateDto;