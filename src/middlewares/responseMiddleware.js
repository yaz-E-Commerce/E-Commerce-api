// src/middlewares/responseMiddleware.js
const i18n = require('i18n');

const responseMiddleware = (req, res, next) => {
  res.ok = (statusCode = 200, messageKey, data = null, extra = {}) => {
    // التقاط اللغة الممررة بالطلب بشكل موحد وآمن
    const acceptLanguage = req.headers['accept-language']?.split(',')[0]?.trim() || 'ar';
    const locale = acceptLanguage.startsWith('en') ? 'en' : 'ar';

    // ترجمة الرسالة في حال كانت مفتاح ترجمة (يحتوي على نقطة لتمثيل العمق بالـ JSON)
    const translatedMessage = typeof messageKey === 'string' && messageKey.includes('.')
      ? i18n.__({ phrase: messageKey, locale })
      : messageKey;

    const payload = {
      success: true,
      statusCode,
      timestamp: new Date().toISOString(),
      message: translatedMessage,
      ...(data !== null ? { data } : {}),
      ...(Object.keys(extra || {}).length ? extra : {}),
    };

    return res.status(statusCode).json(payload);
  };

  next();
};

module.exports = responseMiddleware;