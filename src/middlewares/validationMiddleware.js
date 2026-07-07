const i18n = require('i18n');

const validateDto = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            // تحديد اللغة الحالية الممررة بالطلب لترجمة التفاصيل فوراً
            const acceptLanguage = req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
            const lang = acceptLanguage.startsWith('ar') ? 'ar' : 'en';

            // 🎯 ترجمة كل حقل بداخل المصفوفة بناءً على مفتاحه الخاص المكتوب بالـ DTO
            const translatedDetails = result.error.issues.map(issue => ({
                field: issue.path[0],
                message: i18n.__({ phrase: issue.message, locale: lang })
            }));

            // إنشاء خطأ التحقق العام وتحويله للـ Error Middleware
            const error = new Error('common.errors.VALIDATION_FAILED');
            error.statusCode = 400; 
            error.details = translatedDetails; // المصفوفة المترجمة الجاهزة للـ Frontend
            
            return next(error);
        }
        
        // إذا كانت البيانات صحيحة، نخزن الداتا المفحوصة (بما فيها الـ role المحقون عبر الـ transform)
        req.body = result.data;
        next();
    };
};

module.exports = validateDto;