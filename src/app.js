const express = require('express');
const app = express();
const morgan = require('morgan');
const i18n = require('i18n'); // <-- استيراد مكتبة الترجمة
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { swaggerUi, specs } = require('./config/swagger'); 
const errorMiddleware = require('./middlewares/errorMiddleware'); // <-- استيراد نظام الأخطاء والترجمة الذكي

const apiUrl = process.env.API_URL || '/api/v1';
const PORT = process.env.PORT || 3000;

// 1. الاتصال بقاعدة البيانات (MongoDB)
connectDB();

// 2. إعدادات محرك الترجمة i18n العام
i18n.configure({
    locales: ['en', 'ar'],
    directory: path.join(__dirname, './locales'),
    defaultLocale: 'ar',
    objectNotation: true // للسماح بالقراءة بنظام النقاط مثل common.errors
});

// 3. الـ Global Middlewares
app.use(express.json());
app.use(morgan('tiny'));
app.use(i18n.init); // <-- تفعيل محرك الترجمة في دورة الطلب (Request Lifecycle)

// 4. Swagger UI (توثيق الـ API التفاعلي)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 5. مسارات المشروع (Routes)
app.use(`${apiUrl}/products`, productRoutes);

// 6. تمليح ذكي: التقاط أي مسار غير موجود وتحويله كـ 404 مترجم للـ Frontend
app.use((req, res, next) => {
    const error = new Error('common.errors.NOT_FOUND');
    error.statusCode = 404;
    next(error); // تمرير الخطأ فوراً إلى الـ errorMiddleware
});

// 7. الـ Error Middleware المركزي (يجب أن يكون دائماً آخر Middleware تفعله)
app.use(errorMiddleware);

// 8. تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server is flying high on: http://localhost:${PORT}`);
    console.log(`📖 Swagger UI is available at: http://localhost:${PORT}/api-docs`);
});