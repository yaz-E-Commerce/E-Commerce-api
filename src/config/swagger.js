const path = require('path'); // 👈 السطر المفقود الذي كان يسبب الكراش
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API Documentation',
            version: '1.0.0',
            description: 'تبسيط وتوثيق مسارات مشروع المتجر الإلكتروني بأسلوب احترافي',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: [path.join(__dirname, '../routes/*.js')],
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};