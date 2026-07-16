const express = require('express');
const app = express();
const morgan = require('morgan');
const i18n = require('i18n'); 
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
// ⚠️ خطوة 1: استيراد الـ Routes أولاً لضمان تنفيذ الأسطر داخلها وتسجيل الـ DTOs
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const merchantRoutes = require('./routes/merchantRoutes');

// ⚠️ خطوة 2: استيراد السواجر بعد الـ Routes لضمان امتلاء الـ Registry
const { swaggerUi, getSwaggerSpecs } = require('./config/swagger');
const errorMiddleware = require('./middlewares/errorMiddleware'); 

const apiUrl = process.env.API_URL || '/api/v1';
const PORT = process.env.PORT || 3000;

// 1. الاتصال بقاعدة البيانات
connectDB();

// 2. إعدادات i18n
i18n.configure({
    locales: ['en', 'ar'],
    directory: path.join(__dirname, './locales'),
    defaultLocale: 'ar',
    objectNotation: true 
});

// 3. الـ Global Middlewares
app.use(express.json());
app.use(morgan('tiny'));
app.use(i18n.init); 

// 4. مسارات المشروع (تنفذ وتسجل نفسها في الـ registry)
app.use(`${apiUrl}/products`, productRoutes);
app.use(`${apiUrl}/auth`, authRoutes);
app.use(`${apiUrl}/shops`, merchantRoutes);
// 5. Swagger JSON Endpoint (يستدعي الدالة ديناميكياً عند الطلب لتقرأ المصفوفات الممتلئة)
app.get('/swagger.json', (req, res) => {
    res.json(getSwaggerSpecs());
});

// 6. تفعيل الـ Swagger UI (نمرر ()getSwaggerSpecs مباشرة هنا بدلاً من الرابط الداخلي لضمان الاستقرار)
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
    swaggerUi.setup(getSwaggerSpecs())(req, res, next);
});

// 7. معالجة الـ 404
app.use((req, res, next) => {
    const error = new Error('common.errors.NOT_FOUND');
    error.statusCode = 404;
    next(error); 
});

// 8. الـ Error Middleware المركزي
app.use(errorMiddleware);

// 9. تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server is flying high on: http://localhost:${PORT}`);
    console.log(`📖 Swagger UI is available at: http://localhost:${PORT}/api-docs`);
});