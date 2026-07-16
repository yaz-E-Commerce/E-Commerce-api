// src/middlewares/validationMiddleware.js
const i18n = require('i18n');

const validateDto = (schema) => {
    return (req, res, next) => {
        // 1. تحديد اللغة
        const acceptLanguage = req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
        const lang = acceptLanguage.startsWith('en') ? 'en' : 'ar';

        // 2. نقوم بالتحقق باستخدام الـ Schema الصافي دون فرض أي customErrorMap خارجي يخرب الـ DTOs الأخرى!
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            const translatedDetails = result.error.issues.map(issue => {
                const fieldName = issue.path[0] || 'field';
                let errorKey = issue.message; // هذا يحمل الـ required_error المكتوب في الـ DTO تلقائياً!

                // 🎯 حزام الأمان: إذا قام Zod لسبب ما بإرجاع رسالة نظام إنجليزية (تتضمن مسافات ولا تبدأ بمفتاح ترجمة)
                const isSystemMessage = errorKey.includes(' ') && !errorKey.includes('.');

                if (isSystemMessage) {
                    // نحدد البادئة ديناميكياً بناءً على مسار الـ API (إذا كان auth أو products أو غيره)
                    const isAuthRoute = req.originalUrl.includes('/auth');
                    const prefix = isAuthRoute ? 'auth.errors' : 'product.errors';
                    
                    errorKey = `${prefix}.${fieldName.toUpperCase()}_REQUIRED`;
                }

                // 3. الترجمة
                let translatedMessage;
                try {
                    translatedMessage = i18n.__({ phrase: errorKey, locale: lang });
                    
                    // إذا لم تتوفر ترجمة للمفتاح، نضع رسالة مفهومة
                    if (translatedMessage === errorKey) {
                        translatedMessage = lang === 'en' 
                            ? `The field "${fieldName}" is required or invalid.` 
                            : `الحقل "${fieldName}" مطلوب أو غير صالح.`;
                    }
                } catch (e) {
                    translatedMessage = lang === 'en' ? 'Invalid field' : 'حقل غير صالح';
                }

                return {
                    field: fieldName,
                    message: translatedMessage
                };
            });

            const error = new Error('common.errors.VALIDATION_FAILED');
            error.statusCode = 400; 
            error.details = translatedDetails; 
            
            return next(error);
        }
        
        req.body = result.data;
        next();
    };
};

module.exports = validateDto;