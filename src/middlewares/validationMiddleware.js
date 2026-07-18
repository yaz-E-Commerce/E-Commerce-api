// src/middlewares/validationMiddleware.js
const i18n = require('i18n')

const validateDto = (schema, fallbackPrefix = 'common.errors') => {
    return (req, res, next) => {
        // 1. تحديد اللغة
        const acceptLanguage =
            req.headers['accept-language']?.split(',')[0]?.trim() || 'ar'
        const lang = acceptLanguage.startsWith('en') ? 'en' : 'ar'

        // 2. التحقق من البيانات
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const translatedDetails = result.error.issues.map((issue) => {
                const fieldName = issue.path.join('.') || 'field'
                let errorKey = issue.message // يحمل المفتاح المكتوب بالـ DTO مثل 'auth.errors.EMAIL_INVALID'

                // حزام الأمان للرسائل الافتراضية
                const isSystemMessage =
                    errorKey.includes(' ') && !errorKey.includes('.')

                if (isSystemMessage) {
                    errorKey = `${fallbackPrefix}.${issue.path[0]?.toUpperCase()}_REQUIRED`
                }

                // 🎯 استخراج الـ errorCode الخاص بالحقل (مثلاً نأخذ 'EMAIL_INVALID' من 'auth.errors.EMAIL_INVALID')
                const keyParts = errorKey.split('.')
                const fieldErrorCode =
                    keyParts[keyParts.length - 1] || 'INVALID_FIELD'

                // 3. الترجمة
                let translatedMessage
                try {
                    translatedMessage = i18n.__({
                        phrase: errorKey,
                        locale: lang,
                    })

                    if (translatedMessage === errorKey) {
                        translatedMessage =
                            lang === 'en'
                                ? `The field "${fieldName}" is invalid.`
                                : `الحقل "${fieldName}" غير صالح.`
                    }
                } catch (e) {
                    translatedMessage =
                        lang === 'en' ? 'Invalid field' : 'حقل غير صالح'
                }

                // نرجع الـ field والـ message والـ code الجديد
                return {
                    field: fieldName,
                    code: fieldErrorCode, // 👈 الحقل الجديد هنا
                    message: translatedMessage,
                }
            })

            const error = new Error('common.errors.VALIDATION_FAILED')
            error.statusCode = 400
            error.details = translatedDetails

            return next(error)
        }

        req.body = result.data
        next()
    }
}

module.exports = validateDto
