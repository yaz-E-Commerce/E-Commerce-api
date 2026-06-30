const express = require('express');
const app = express();
const morgan = require('morgan');
const i18n = require('i18n'); 
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
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

// 5. Swagger JSON Endpoint
app.get('/swagger.json', (req, res) => {
    res.json(getSwaggerSpecs());
});

// 6. تفعيل الـ Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
    swaggerOptions: {
        url: '/swagger.json'
    }
}));

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